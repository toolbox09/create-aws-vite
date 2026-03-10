use actix_web::{web, HttpResponse};
use chrono::{Duration, Utc};
use rand::Rng;
use serde::Deserialize;
use sha2::{Digest, Sha256};

use crate::errors::AppError;
use crate::middleware::auth::create_access_token;
use crate::models::user::User;
use crate::AppState;

// ── Naver OAuth types ──

#[derive(Deserialize)]
pub struct OAuthCallbackQuery {
    pub code: String,
    #[allow(dead_code)]
    pub state: Option<String>,
}

#[derive(Debug, Deserialize)]
struct NaverTokenResponse {
    access_token: String,
    #[allow(dead_code)]
    refresh_token: Option<String>,
    #[allow(dead_code)]
    token_type: Option<String>,
}

#[derive(Debug, Deserialize)]
struct NaverProfileResponse {
    #[allow(dead_code)]
    resultcode: String,
    #[allow(dead_code)]
    message: String,
    response: NaverProfile,
}

#[derive(Debug, Deserialize)]
struct NaverProfile {
    id: String,
    name: Option<String>,
    email: Option<String>,
    #[allow(dead_code)]
    profile_image: Option<String>,
    #[allow(dead_code)]
    mobile: Option<String>,
}

// ── Kakao OAuth types ──

#[derive(Debug, Deserialize)]
struct KakaoTokenResponse {
    access_token: String,
    #[allow(dead_code)]
    token_type: Option<String>,
    #[allow(dead_code)]
    refresh_token: Option<String>,
}

#[derive(Debug, Deserialize)]
struct KakaoProfileResponse {
    id: i64,
    kakao_account: Option<KakaoAccount>,
}

#[derive(Debug, Deserialize)]
struct KakaoAccount {
    email: Option<String>,
    profile: Option<KakaoProfile>,
}

#[derive(Debug, Deserialize)]
struct KakaoProfile {
    nickname: Option<String>,
    #[allow(dead_code)]
    profile_image_url: Option<String>,
}

// ── Helpers ──

fn generate_random_token() -> String {
    let mut rng = rand::thread_rng();
    let bytes: Vec<u8> = (0..32).map(|_| rng.gen()).collect();
    hex::encode(bytes)
}

fn hash_token(token: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(token.as_bytes());
    hex::encode(hasher.finalize())
}

/// Build the HTML page that posts tokens back to the frontend via window.opener or localStorage
fn build_redirect_html(
    access_token: &str,
    refresh_token: &str,
    is_new_user: bool,
    provider: &str,
    name: &str,
    email: &str,
) -> String {
    // For new users, redirect to signup page with social params
    // For existing users, store tokens and redirect to /map
    // Use location.replace() to avoid leaving callback URL in browser history
    if is_new_user {
        format!(
            r#"<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>소셜 로그인</title></head>
<body><script>
  sessionStorage.setItem('social_provider', '{}');
  sessionStorage.setItem('social_name', '{}');
  sessionStorage.setItem('social_email', '{}');
  window.location.replace('/auth/signup?social={}');
</script></body></html>"#,
            provider,
            name.replace('\'', "\\'"),
            email.replace('\'', "\\'"),
            provider,
        )
    } else {
        format!(
            r#"<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>소셜 로그인</title></head>
<body><script>
  localStorage.setItem('access_token', '{}');
  localStorage.setItem('refresh_token', '{}');
  window.location.replace('/map');
</script></body></html>"#,
            access_token, refresh_token,
        )
    }
}

/// Handle social login/signup: find or flag new user
async fn handle_social_auth(
    state: &web::Data<AppState>,
    provider: &str,
    provider_id: &str,
    name: &str,
    email: &str,
) -> Result<HttpResponse, AppError> {
    // Check if user already linked with this OAuth
    let existing_oauth: Option<(uuid::Uuid,)> = sqlx::query_as(
        "SELECT user_id FROM user_oauth WHERE provider = $1 AND provider_id = $2",
    )
    .bind(provider)
    .bind(provider_id)
    .fetch_optional(&state.db)
    .await?;

    if let Some((user_id,)) = existing_oauth {
        // Existing user → generate tokens and login
        let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
            .bind(user_id)
            .fetch_one(&state.db)
            .await?;

        if user.status != crate::models::user::UserStatus::Active {
            return Err(AppError::Unauthorized("Account is not active".to_string()));
        }

        let access_token = create_access_token(
            user.id,
            &user.role,
            &state.config.jwt_secret,
            state.config.jwt_access_expires_secs,
        )?;

        let refresh_raw = generate_random_token();
        let refresh_hash = hash_token(&refresh_raw);
        let refresh_expires =
            Utc::now() + Duration::seconds(state.config.jwt_refresh_expires_secs);

        sqlx::query(
            "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)",
        )
        .bind(user.id)
        .bind(&refresh_hash)
        .bind(refresh_expires)
        .execute(&state.db)
        .await?;

        let html = build_redirect_html(&access_token, &refresh_raw, false, provider, name, email);
        Ok(HttpResponse::Ok()
            .content_type("text/html; charset=utf-8")
            .body(html))
    } else {
        // Also check if email exists (user might have signed up with email)
        let existing_email: Option<(uuid::Uuid,)> =
            sqlx::query_as("SELECT id FROM users WHERE email = $1")
                .bind(email)
                .fetch_optional(&state.db)
                .await?;

        if let Some((user_id,)) = existing_email {
            // Link OAuth to existing email user
            sqlx::query(
                "INSERT INTO user_oauth (user_id, provider, provider_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
            )
            .bind(user_id)
            .bind(provider)
            .bind(provider_id)
            .execute(&state.db)
            .await?;

            let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
                .bind(user_id)
                .fetch_one(&state.db)
                .await?;

            let access_token = create_access_token(
                user.id,
                &user.role,
                &state.config.jwt_secret,
                state.config.jwt_access_expires_secs,
            )?;

            let refresh_raw = generate_random_token();
            let refresh_hash = hash_token(&refresh_raw);
            let refresh_expires =
                Utc::now() + Duration::seconds(state.config.jwt_refresh_expires_secs);

            sqlx::query(
                "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)",
            )
            .bind(user.id)
            .bind(&refresh_hash)
            .bind(refresh_expires)
            .execute(&state.db)
            .await?;

            let html =
                build_redirect_html(&access_token, &refresh_raw, false, provider, name, email);
            Ok(HttpResponse::Ok()
                .content_type("text/html; charset=utf-8")
                .body(html))
        } else {
            // New user → redirect to signup
            let html = build_redirect_html("", "", true, provider, name, email);
            Ok(HttpResponse::Ok()
                .content_type("text/html; charset=utf-8")
                .body(html))
        }
    }
}

// ── Naver OAuth ──

pub async fn naver_start(state: web::Data<AppState>) -> HttpResponse {
    let redirect_uri = format!("{}/api/auth/oauth/naver/callback", state.config.oauth_redirect_base);
    let csrf_state = generate_random_token();

    let auth_url = format!(
        "https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id={}&redirect_uri={}&state={}",
        state.config.naver_client_id,
        urlencoding::encode(&redirect_uri),
        csrf_state,
    );

    HttpResponse::Found()
        .append_header(("Location", auth_url))
        .finish()
}

pub async fn naver_callback(
    state: web::Data<AppState>,
    query: web::Query<OAuthCallbackQuery>,
) -> Result<HttpResponse, AppError> {
    let redirect_uri = format!(
        "{}/api/auth/oauth/naver/callback",
        state.config.oauth_redirect_base
    );

    let http_client = reqwest::Client::new();

    // Exchange code for token
    tracing::info!("Naver OAuth: exchanging code for token, redirect_uri={}", redirect_uri);
    let token_res = http_client
        .post("https://nid.naver.com/oauth2.0/token")
        .form(&[
            ("grant_type", "authorization_code"),
            ("client_id", &state.config.naver_client_id),
            ("client_secret", &state.config.naver_client_secret),
            ("code", &query.code),
            ("redirect_uri", &redirect_uri),
        ])
        .send()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Naver token request failed: {}", e)))?;

    let token_status = token_res.status();
    let token_text = token_res.text().await.unwrap_or_default();
    tracing::info!("Naver token response: status={}, body={}", token_status, token_text);

    if !token_status.is_success() {
        return Err(AppError::Internal(anyhow::anyhow!(
            "Naver token error: status={}, body={}", token_status, token_text
        )));
    }

    let token_body: NaverTokenResponse = serde_json::from_str(&token_text)
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Naver token parse failed: {}, body={}", e, token_text)))?;

    // Fetch profile
    let profile_res = http_client
        .get("https://openapi.naver.com/v1/nid/me")
        .bearer_auth(&token_body.access_token)
        .send()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Naver profile request failed: {}", e)))?;

    let profile_status = profile_res.status();
    let profile_text = profile_res.text().await.unwrap_or_default();
    tracing::info!("Naver profile response: status={}, body={}", profile_status, profile_text);

    if !profile_status.is_success() {
        return Err(AppError::Internal(anyhow::anyhow!(
            "Naver profile error: status={}, body={}", profile_status, profile_text
        )));
    }

    let profile_body: NaverProfileResponse = serde_json::from_str(&profile_text)
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Naver profile parse failed: {}, body={}", e, profile_text)))?;

    let profile = profile_body.response;
    let name = profile.name.unwrap_or_default();
    let email = profile.email.unwrap_or_default();

    handle_social_auth(&state, "naver", &profile.id, &name, &email).await
}

// ── Kakao OAuth ──

pub async fn kakao_start(state: web::Data<AppState>) -> HttpResponse {
    let redirect_uri = format!(
        "{}/api/auth/oauth/kakao/callback",
        state.config.oauth_redirect_base
    );

    let auth_url = format!(
        "https://kauth.kakao.com/oauth/authorize?response_type=code&client_id={}&redirect_uri={}",
        state.config.kakao_client_id,
        urlencoding::encode(&redirect_uri),
    );

    HttpResponse::Found()
        .append_header(("Location", auth_url))
        .finish()
}

pub async fn kakao_callback(
    state: web::Data<AppState>,
    query: web::Query<OAuthCallbackQuery>,
) -> Result<HttpResponse, AppError> {
    let redirect_uri = format!(
        "{}/api/auth/oauth/kakao/callback",
        state.config.oauth_redirect_base
    );

    let http_client = reqwest::Client::new();

    // Exchange code for token
    tracing::info!("Kakao OAuth: exchanging code for token, redirect_uri={}", redirect_uri);
    let token_res = http_client
        .post("https://kauth.kakao.com/oauth/token")
        .form(&[
            ("grant_type", "authorization_code"),
            ("client_id", &state.config.kakao_client_id),
            ("client_secret", &state.config.kakao_client_secret),
            ("code", &query.code),
            ("redirect_uri", &redirect_uri),
        ])
        .send()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Kakao token request failed: {}", e)))?;

    let token_status = token_res.status();
    let token_text = token_res.text().await.unwrap_or_default();
    tracing::info!("Kakao token response: status={}, body={}", token_status, token_text);

    if !token_status.is_success() {
        return Err(AppError::Internal(anyhow::anyhow!(
            "Kakao token error: status={}, body={}", token_status, token_text
        )));
    }

    let token_body: KakaoTokenResponse = serde_json::from_str(&token_text)
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Kakao token parse failed: {}, body={}", e, token_text)))?;

    // Fetch profile
    let profile_res = http_client
        .get("https://kapi.kakao.com/v2/user/me")
        .bearer_auth(&token_body.access_token)
        .send()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Kakao profile request failed: {}", e)))?;

    let profile_status = profile_res.status();
    let profile_text = profile_res.text().await.unwrap_or_default();
    tracing::info!("Kakao profile response: status={}, body={}", profile_status, profile_text);

    if !profile_status.is_success() {
        return Err(AppError::Internal(anyhow::anyhow!(
            "Kakao profile error: status={}, body={}", profile_status, profile_text
        )));
    }

    let profile_body: KakaoProfileResponse = serde_json::from_str(&profile_text)
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Kakao profile parse failed: {}, body={}", e, profile_text)))?;

    let provider_id = profile_body.id.to_string();
    let account = profile_body.kakao_account.unwrap_or(KakaoAccount {
        email: None,
        profile: None,
    });
    let name = account
        .profile
        .and_then(|p| p.nickname)
        .unwrap_or_default();
    let email = account.email.unwrap_or_default();

    handle_social_auth(&state, "kakao", &provider_id, &name, &email).await
}
