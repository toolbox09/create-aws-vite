use actix_web::{web, HttpResponse};
use aws_sdk_s3::presigning::PresigningConfig;
use sqlx::PgPool;
use std::time::Duration;
use uuid::Uuid;

use crate::errors::AppError;
use crate::models::file::{
    FileRecord, FileStatus, InitUploadRequest, PresignedDownloadResponse, PresignedUploadResponse,
};
use crate::AppState;

const PRESIGN_EXPIRY_SECS: u64 = 3600;

/// Background cleanup: remove stale pending records (best-effort)
async fn cleanup_stale_files(
    db: &PgPool,
    s3: &aws_sdk_s3::Client,
    bucket: &str,
) {
    let stale_files = sqlx::query_as::<_, FileRecord>(
        "SELECT * FROM files WHERE status = 'pending' AND created_at < NOW() - INTERVAL '30 minutes'",
    )
    .fetch_all(db)
    .await;

    let files = match stale_files {
        Ok(f) => f,
        Err(_) => return,
    };

    for file in &files {
        let _ = s3
            .delete_object()
            .bucket(bucket)
            .key(&file.s3_key)
            .send()
            .await;

        let _ = sqlx::query("DELETE FROM files WHERE id = $1")
            .bind(file.id)
            .execute(db)
            .await;
    }

    if !files.is_empty() {
        tracing::info!("Cleaned up {} stale pending file(s)", files.len());
    }
}

/// POST /api/files - Create pending record + return presigned upload URL
pub async fn init_upload(
    state: web::Data<AppState>,
    body: web::Json<InitUploadRequest>,
) -> Result<HttpResponse, AppError> {
    // Best-effort background cleanup of stale pending files
    let cleanup_state = state.clone();
    tokio::spawn(async move {
        cleanup_stale_files(
            &cleanup_state.db,
            &cleanup_state.s3,
            &cleanup_state.config.s3_bucket,
        )
        .await;
    });

    let file_id = Uuid::new_v4();
    let content_type = body
        .content_type
        .clone()
        .unwrap_or_else(|| "application/octet-stream".to_string());

    let extension = body
        .filename
        .rsplit('.')
        .next()
        .unwrap_or("");
    let filename = if extension.is_empty() {
        file_id.to_string()
    } else {
        format!("{}.{}", file_id, extension)
    };
    let s3_key = format!("uploads/{}", filename);

    // DB: insert pending record
    let record = sqlx::query_as::<_, FileRecord>(
        "INSERT INTO files (id, filename, original_name, content_type, size, s3_key, status) \
         VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING *",
    )
    .bind(file_id)
    .bind(&filename)
    .bind(&body.filename)
    .bind(&content_type)
    .bind(body.size)
    .bind(&s3_key)
    .fetch_one(&state.db)
    .await?;

    // S3: generate presigned PUT URL
    let presign_config = PresigningConfig::expires_in(Duration::from_secs(PRESIGN_EXPIRY_SECS))
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Presign config error: {}", e)))?;

    let upload_url = state
        .s3
        .put_object()
        .bucket(&state.config.s3_bucket)
        .key(&s3_key)
        .content_type(&content_type)
        .presigned(presign_config)
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Presign failed: {}", e)))?
        .uri()
        .to_string();

    Ok(HttpResponse::Created().json(PresignedUploadResponse {
        file: record,
        upload_url,
    }))
}

/// PATCH /api/files/:id/confirm - Verify S3 upload and mark completed
pub async fn confirm_upload(
    state: web::Data<AppState>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, AppError> {
    let file_id = path.into_inner();

    // Check record exists and is pending
    let record = sqlx::query_as::<_, FileRecord>("SELECT * FROM files WHERE id = $1")
        .bind(file_id)
        .fetch_one(&state.db)
        .await?;

    if !matches!(record.status, FileStatus::Pending) {
        return Err(AppError::BadRequest("File is not in pending state".to_string()));
    }

    // Verify file exists in S3
    state
        .s3
        .head_object()
        .bucket(&state.config.s3_bucket)
        .key(&record.s3_key)
        .send()
        .await
        .map_err(|_| AppError::BadRequest("File not found in storage. Upload may have failed.".to_string()))?;

    // Mark completed
    let updated = sqlx::query_as::<_, FileRecord>(
        "UPDATE files SET status = 'completed', updated_at = NOW() WHERE id = $1 RETURNING *",
    )
    .bind(file_id)
    .fetch_one(&state.db)
    .await?;

    Ok(HttpResponse::Ok().json(updated))
}

/// GET /api/files - List completed files
pub async fn list_files(state: web::Data<AppState>) -> Result<HttpResponse, AppError> {
    let files = sqlx::query_as::<_, FileRecord>(
        "SELECT * FROM files WHERE status = 'completed' ORDER BY created_at DESC",
    )
    .fetch_all(&state.db)
    .await?;

    Ok(HttpResponse::Ok().json(files))
}

/// GET /api/files/:id - Get presigned download URL
pub async fn download_file(
    state: web::Data<AppState>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, AppError> {
    let file_id = path.into_inner();

    let record = sqlx::query_as::<_, FileRecord>(
        "SELECT * FROM files WHERE id = $1 AND status = 'completed'",
    )
    .bind(file_id)
    .fetch_one(&state.db)
    .await?;

    let presign_config = PresigningConfig::expires_in(Duration::from_secs(PRESIGN_EXPIRY_SECS))
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Presign config error: {}", e)))?;

    let download_url = state
        .s3
        .get_object()
        .bucket(&state.config.s3_bucket)
        .key(&record.s3_key)
        .response_content_disposition(format!(
            "attachment; filename=\"{}\"",
            record.original_name
        ))
        .presigned(presign_config)
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Presign failed: {}", e)))?
        .uri()
        .to_string();

    Ok(HttpResponse::Ok().json(PresignedDownloadResponse { download_url }))
}

/// DELETE /api/files/:id - Soft delete, then remove from S3, then hard delete
pub async fn delete_file(
    state: web::Data<AppState>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, AppError> {
    let file_id = path.into_inner();

    // Soft delete
    let record = sqlx::query_as::<_, FileRecord>(
        "UPDATE files SET status = 'deleted', updated_at = NOW() WHERE id = $1 RETURNING *",
    )
    .bind(file_id)
    .fetch_one(&state.db)
    .await?;

    // Delete from S3 (best effort)
    let _ = state
        .s3
        .delete_object()
        .bucket(&state.config.s3_bucket)
        .key(&record.s3_key)
        .send()
        .await;

    // Hard delete from DB
    sqlx::query("DELETE FROM files WHERE id = $1")
        .bind(file_id)
        .execute(&state.db)
        .await?;

    Ok(HttpResponse::NoContent().finish())
}

/// POST /api/files/cleanup - Manual cleanup endpoint
pub async fn cleanup_stale(state: web::Data<AppState>) -> Result<HttpResponse, AppError> {
    let stale_files = sqlx::query_as::<_, FileRecord>(
        "SELECT * FROM files WHERE status = 'pending' AND created_at < NOW() - INTERVAL '30 minutes'",
    )
    .fetch_all(&state.db)
    .await?;

    let mut cleaned = 0u64;
    for file in &stale_files {
        let _ = state
            .s3
            .delete_object()
            .bucket(&state.config.s3_bucket)
            .key(&file.s3_key)
            .send()
            .await;

        sqlx::query("DELETE FROM files WHERE id = $1")
            .bind(file.id)
            .execute(&state.db)
            .await?;

        cleaned += 1;
    }

    Ok(HttpResponse::Ok().json(serde_json::json!({ "cleaned": cleaned })))
}
