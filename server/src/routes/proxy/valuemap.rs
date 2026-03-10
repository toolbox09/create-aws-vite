use actix_web::{web, HttpRequest, HttpResponse};
use bytes::Bytes;
use std::collections::HashMap;

use crate::AppState;
use crate::services::http_proxy;

const UPSTREAM: &str = "https://api.partners.stg.valueupmap.com";

pub async fn proxy_valuemap(
    req: HttpRequest,
    state: web::Data<AppState>,
    body: Bytes,
    path: web::Path<String>,
) -> HttpResponse {
    let remaining = format!("/{}", path.into_inner());

    let mut extra = HashMap::new();
    extra.insert("Company-Type".to_string(), "soosung".to_string());
    extra.insert("Content-Type".to_string(), "application/json".to_string());

    if let Some(auth) = &state.config.valuemap_auth {
        extra.insert("Authorization".to_string(), auth.clone());
    }

    let client = reqwest::Client::new();
    match http_proxy::forward_request(&client, UPSTREAM, &remaining, &req, body, extra).await {
        Ok(resp) => http_proxy::to_actix_response(resp).await,
        Err(e) => {
            tracing::error!("Valuemap proxy error: {}", e);
            HttpResponse::BadGateway().json(serde_json::json!({"error": "Upstream unavailable"}))
        }
    }
}
