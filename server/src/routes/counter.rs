use actix_web::{web, HttpResponse};
use crate::errors::AppError;
use crate::models::counter::{Counter, UpdateCounterRequest};
use crate::AppState;

pub async fn get_counter(
    state: web::Data<AppState>,
    path: web::Path<String>,
) -> Result<HttpResponse, AppError> {
    let name = path.into_inner();
    let counter = sqlx::query_as::<_, Counter>(
        "SELECT * FROM counters WHERE name = $1"
    )
    .bind(&name)
    .fetch_one(&state.db)
    .await?;

    Ok(HttpResponse::Ok().json(counter))
}

pub async fn list_counters(
    state: web::Data<AppState>,
) -> Result<HttpResponse, AppError> {
    let counters = sqlx::query_as::<_, Counter>(
        "SELECT * FROM counters ORDER BY name"
    )
    .fetch_all(&state.db)
    .await?;

    Ok(HttpResponse::Ok().json(counters))
}

pub async fn update_counter(
    state: web::Data<AppState>,
    path: web::Path<String>,
    body: web::Json<UpdateCounterRequest>,
) -> Result<HttpResponse, AppError> {
    let name = path.into_inner();
    let counter = sqlx::query_as::<_, Counter>(
        "UPDATE counters SET value = value + $1, updated_at = NOW() WHERE name = $2 RETURNING *"
    )
    .bind(body.delta)
    .bind(&name)
    .fetch_one(&state.db)
    .await?;

    Ok(HttpResponse::Ok().json(counter))
}

pub async fn create_counter(
    state: web::Data<AppState>,
    body: web::Json<serde_json::Value>,
) -> Result<HttpResponse, AppError> {
    let name = body.get("name")
        .and_then(|v| v.as_str())
        .ok_or_else(|| AppError::BadRequest("name is required".to_string()))?;

    let counter = sqlx::query_as::<_, Counter>(
        "INSERT INTO counters (name, value) VALUES ($1, 0) RETURNING *"
    )
    .bind(name)
    .fetch_one(&state.db)
    .await
    .map_err(|e| match e {
        sqlx::Error::Database(ref db_err) if db_err.is_unique_violation() => {
            AppError::BadRequest(format!("Counter '{}' already exists", name))
        }
        _ => AppError::from(e),
    })?;

    Ok(HttpResponse::Created().json(counter))
}

pub async fn delete_counter(
    state: web::Data<AppState>,
    path: web::Path<String>,
) -> Result<HttpResponse, AppError> {
    let name = path.into_inner();
    let result = sqlx::query("DELETE FROM counters WHERE name = $1")
        .bind(&name)
        .execute(&state.db)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound(format!("Counter '{}' not found", name)));
    }

    Ok(HttpResponse::NoContent().finish())
}
