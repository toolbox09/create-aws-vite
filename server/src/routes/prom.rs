use actix_web::{web, HttpRequest, HttpResponse};

use crate::AppState;
use crate::errors::AppError;

/// POST /api/prom/{path}
/// Forwards to Prom Space API with JSON body.
pub async fn prom_post(
    state: web::Data<AppState>,
    path: web::Path<String>,
    body: web::Json<serde_json::Value>,
) -> Result<HttpResponse, AppError> {
    let api_path = path.into_inner();

    match state.prom.post(&api_path, &body).await {
        Ok(data) => Ok(HttpResponse::Ok().json(data)),
        Err(e) => {
            tracing::error!("Prom API error: {}", e);
            Err(AppError::Internal(anyhow::anyhow!("Prom API error: {}", e)))
        }
    }
}

/// GET /api/prom/{path}
/// Forwards to Prom Space API with query parameters.
pub async fn prom_get(
    req: HttpRequest,
    state: web::Data<AppState>,
    path: web::Path<String>,
) -> Result<HttpResponse, AppError> {
    let api_path = path.into_inner();

    let params: Vec<(String, String)> = req
        .query_string()
        .split('&')
        .filter(|s| !s.is_empty())
        .filter_map(|pair| {
            let mut parts = pair.splitn(2, '=');
            let key = parts.next()?;
            let value = parts.next().unwrap_or("");
            Some((
                urlencoding::decode(key).unwrap_or_default().into_owned(),
                urlencoding::decode(value).unwrap_or_default().into_owned(),
            ))
        })
        .collect();

    match state.prom.get(&api_path, &params).await {
        Ok(data) => Ok(HttpResponse::Ok().json(data)),
        Err(e) => {
            tracing::error!("Prom API error: {}", e);
            Err(AppError::Internal(anyhow::anyhow!("Prom API error: {}", e)))
        }
    }
}
