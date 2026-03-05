use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "file_status", rename_all = "lowercase")]
pub enum FileStatus {
    Pending,
    Completed,
    Deleted,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct FileRecord {
    pub id: Uuid,
    pub filename: String,
    pub original_name: String,
    pub content_type: String,
    pub size: i64,
    pub s3_key: String,
    pub status: FileStatus,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct PresignedUploadResponse {
    pub file: FileRecord,
    pub upload_url: String,
}

#[derive(Debug, Deserialize)]
pub struct InitUploadRequest {
    pub filename: String,
    pub content_type: Option<String>,
    pub size: i64,
}

#[derive(Debug, Serialize)]
pub struct PresignedDownloadResponse {
    pub download_url: String,
}
