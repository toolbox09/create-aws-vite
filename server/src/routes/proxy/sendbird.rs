use actix_web::{web, HttpRequest, HttpResponse};
use bytes::Bytes;
use std::collections::HashMap;

use crate::AppState;
use crate::services::http_proxy;

const DEFAULT_UPSTREAM: &str =
    "https://api-8EFBDAF2-444E-4D17-B77B-E7F59FBB588F.sendbird.com/v3";

pub async fn proxy_sendbird(
    req: HttpRequest,
    state: web::Data<AppState>,
    body: Bytes,
    path: web::Path<String>,
) -> HttpResponse {
    let remaining = format!("/{}", path.into_inner());

    let upstream = state
        .config
        .sendbird_base_url
        .as_deref()
        .unwrap_or(DEFAULT_UPSTREAM);

    let mut extra = HashMap::new();
    if let Some(token) = &state.config.sendbird_token {
        extra.insert("Api-Token".to_string(), token.clone());
    }

    let client = reqwest::Client::new();
    match http_proxy::forward_request(&client, upstream, &remaining, &req, body, extra).await {
        Ok(resp) => http_proxy::to_actix_response(resp).await,
        Err(e) => {
            tracing::error!("Sendbird proxy error: {}", e);
            HttpResponse::BadGateway().json(serde_json::json!({"error": "Upstream unavailable"}))
        }
    }
}
