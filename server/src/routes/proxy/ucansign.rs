use actix_web::{web, HttpRequest, HttpResponse};
use bytes::Bytes;
use std::collections::HashMap;

use crate::AppState;
use crate::services::http_proxy;

const UPSTREAM: &str = "https://app.ucansign.com/openapi";

pub async fn proxy_ucansign(
    req: HttpRequest,
    state: web::Data<AppState>,
    body: Bytes,
    path: web::Path<String>,
) -> HttpResponse {
    let remaining_path = path.into_inner();
    let remaining = format!("/{}", remaining_path);

    let mut extra = HashMap::new();

    // POST /user/token → inject apiKey into JSON body
    let final_body = if remaining_path == "user/token"
        && req.method() == actix_web::http::Method::POST
    {
        if let Some(api_key) = &state.config.ucansign_api_key {
            match serde_json::from_slice::<serde_json::Value>(&body) {
                Ok(mut json) => {
                    json["apiKey"] = serde_json::Value::String(api_key.clone());
                    let new_body = serde_json::to_vec(&json).unwrap_or_else(|_| body.to_vec());
                    extra.insert("Content-Type".to_string(), "application/json".to_string());
                    Bytes::from(new_body)
                }
                Err(_) => {
                    let json = serde_json::json!({"apiKey": api_key});
                    let new_body = serde_json::to_vec(&json).unwrap_or_else(|_| body.to_vec());
                    extra.insert("Content-Type".to_string(), "application/json".to_string());
                    Bytes::from(new_body)
                }
            }
        } else {
            body
        }
    } else {
        body
    };

    // X-UcanSign-Authorization → Authorization header transform
    if let Some(auth) = req.headers().get("X-UcanSign-Authorization") {
        if let Ok(v) = auth.to_str() {
            extra.insert("Authorization".to_string(), v.to_string());
        }
    }

    // Pass through test flag
    if let Some(test) = req.headers().get("x-ucansign-test") {
        if let Ok(v) = test.to_str() {
            extra.insert("x-ucansign-test".to_string(), v.to_string());
        }
    }

    let client = reqwest::Client::new();
    match http_proxy::forward_request(&client, UPSTREAM, &remaining, &req, final_body, extra).await
    {
        Ok(resp) => http_proxy::to_actix_response(resp).await,
        Err(e) => {
            tracing::error!("UcanSign proxy error: {}", e);
            HttpResponse::BadGateway().json(serde_json::json!({"error": "Upstream unavailable"}))
        }
    }
}
