use actix_web::{web, HttpRequest, HttpResponse};
use bytes::Bytes;
use std::collections::HashMap;

use crate::AppState;
use crate::services::http_proxy;

const DEFAULT_UPSTREAM: &str = "https://api.buildit.co.kr/api";

pub async fn proxy_buildit(
    req: HttpRequest,
    state: web::Data<AppState>,
    body: Bytes,
    path: web::Path<String>,
) -> HttpResponse {
    let remaining = format!("/{}", path.into_inner());

    let upstream = state
        .config
        .buildit_base_url
        .as_deref()
        .unwrap_or(DEFAULT_UPSTREAM);

    let mut extra = HashMap::new();
    if let Some(auth) = &state.config.buildit_auth {
        extra.insert("Authorization".to_string(), auth.clone());
    }

    let client = reqwest::Client::new();
    match http_proxy::forward_request(&client, upstream, &remaining, &req, body, extra).await {
        Ok(resp) => http_proxy::to_actix_response(resp).await,
        Err(e) => {
            tracing::error!("Buildit proxy error: {}", e);
            HttpResponse::BadGateway().json(serde_json::json!({"error": "Upstream unavailable"}))
        }
    }
}
