use actix_web::{web, HttpResponse};
use serde_json::json;

use crate::AppState;

pub async fn health_check(state: web::Data<AppState>) -> HttpResponse {
    let db_healthy = sqlx::query_scalar::<_, i32>("SELECT 1")
        .fetch_one(&state.db)
        .await
        .is_ok();

    if db_healthy {
        HttpResponse::Ok().json(json!({
            "status": "healthy",
            "database": "connected"
        }))
    } else {
        HttpResponse::ServiceUnavailable().json(json!({
            "status": "unhealthy",
            "database": "disconnected"
        }))
    }
}
