use actix_web::HttpRequest;
use bytes::Bytes;
use reqwest::{Client, Method, Response};
use std::collections::HashMap;

/// Forward an incoming actix-web request to an upstream URL.
/// Strips hop-by-hop headers and injects extra headers.
pub async fn forward_request(
    client: &Client,
    upstream_base: &str,
    remaining_path: &str,
    req: &HttpRequest,
    body: Bytes,
    extra_headers: HashMap<String, String>,
) -> Result<Response, reqwest::Error> {
    let method = match req.method().as_str() {
        "GET" => Method::GET,
        "POST" => Method::POST,
        "PUT" => Method::PUT,
        "PATCH" => Method::PATCH,
        "DELETE" => Method::DELETE,
        "HEAD" => Method::HEAD,
        "OPTIONS" => Method::OPTIONS,
        _ => Method::GET,
    };

    let query_string = req.query_string();
    let url = if query_string.is_empty() {
        format!("{}{}", upstream_base.trim_end_matches('/'), remaining_path)
    } else {
        format!(
            "{}{}?{}",
            upstream_base.trim_end_matches('/'),
            remaining_path,
            query_string
        )
    };

    let mut builder = client.request(method, &url);

    // Forward relevant headers (skip hop-by-hop)
    let skip_headers = [
        "host",
        "connection",
        "transfer-encoding",
        "keep-alive",
        "te",
        "trailer",
        "upgrade",
        "proxy-authorization",
        "proxy-authenticate",
    ];

    for (name, value) in req.headers() {
        let name_lower = name.as_str().to_lowercase();
        if !skip_headers.contains(&name_lower.as_str()) {
            if let Ok(v) = value.to_str() {
                builder = builder.header(name.as_str(), v);
            }
        }
    }

    // Inject extra headers
    for (k, v) in &extra_headers {
        builder = builder.header(k.as_str(), v.as_str());
    }

    // Forward body
    if !body.is_empty() {
        builder = builder.body(body);
    }

    builder.send().await
}

/// Convert a reqwest Response into an actix-web HttpResponse
pub async fn to_actix_response(
    upstream_resp: Response,
) -> actix_web::HttpResponse {
    let status = actix_web::http::StatusCode::from_u16(upstream_resp.status().as_u16())
        .unwrap_or(actix_web::http::StatusCode::INTERNAL_SERVER_ERROR);

    let mut builder = actix_web::HttpResponse::build(status);

    // Forward response headers
    let skip_resp = ["transfer-encoding", "connection"];
    for (name, value) in upstream_resp.headers() {
        let name_lower = name.as_str().to_lowercase();
        if !skip_resp.contains(&name_lower.as_str()) {
            if let Ok(v) = value.to_str() {
                builder.insert_header((name.as_str(), v));
            }
        }
    }

    match upstream_resp.bytes().await {
        Ok(bytes) => builder.body(bytes),
        Err(e) => {
            tracing::error!("Failed to read upstream response body: {}", e);
            actix_web::HttpResponse::BadGateway().json(serde_json::json!({
                "error": "Failed to read upstream response"
            }))
        }
    }
}
