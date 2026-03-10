use actix_web::{web, HttpRequest, HttpResponse};

use crate::AppState;
use crate::errors::AppError;

/// GET /api/ginplus/{path}
/// Forwards to GinPlus API with key/companyNm injected.
/// Passes through all query parameters from the original request.
pub async fn ginplus_get(
    req: HttpRequest,
    state: web::Data<AppState>,
    path: web::Path<String>,
) -> Result<HttpResponse, AppError> {
    let api_path = path.into_inner();

    // Collect query params from original request
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

    match state.ginplus.get(&api_path, &params).await {
        Ok(data) => Ok(HttpResponse::Ok().json(data)),
        Err(e) => {
            tracing::error!("GinPlus API error: {}", e);
            Err(AppError::Internal(anyhow::anyhow!("GinPlus API error: {}", e)))
        }
    }
}

/// POST /api/ginplus/{path}
/// Forwards to GinPlus API with key/companyNm injected + JSON body.
pub async fn ginplus_post(
    state: web::Data<AppState>,
    path: web::Path<String>,
    body: web::Json<serde_json::Value>,
) -> Result<HttpResponse, AppError> {
    let api_path = path.into_inner();

    match state.ginplus.post(&api_path, &body).await {
        Ok(data) => Ok(HttpResponse::Ok().json(data)),
        Err(e) => {
            tracing::error!("GinPlus API error: {}", e);
            Err(AppError::Internal(anyhow::anyhow!("GinPlus API error: {}", e)))
        }
    }
}
