use actix_web::{web, HttpRequest, HttpResponse};
use argon2::{
    password_hash::{rand_core::OsRng, SaltString},
    Argon2, PasswordHash, PasswordHasher, PasswordVerifier,
};
use chrono::{Duration, Utc};
use rand::Rng;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use uuid::Uuid;

use crate::errors::AppError;
use crate::middleware::auth::{create_access_token, AuthUser};
use crate::models::user::{AuthResponse, AuthTokens, User, UserResponse, UserRole};
use crate::AppState;

// ── Request DTOs ──

#[derive(Debug, Deserialize)]
pub struct SignupRequest {
    pub email: String,
    pub password: String,
    pub name: String,
    pub phone: Option<String>,
    pub company: Option<String>,
    pub role: Option<UserRole>,
    pub agreed_marketing: Option<bool>,
    // interests
    pub cert_types: Option<Vec<String>>,
    pub building_usages: Option<Vec<String>>,
    pub regions: Option<Vec<String>>,
}

#[derive(Debug, Deserialize)]
pub struct SocialSignupRequest {
    pub email: String,
    pub name: String,
    pub provider: String,
    pub provider_id: String,
    pub phone: Option<String>,
    pub company: Option<String>,
    pub role: Option<UserRole>,
    pub agreed_marketing: Option<bool>,
    pub cert_types: Option<Vec<String>>,
    pub building_usages: Option<Vec<String>>,
    pub regions: Option<Vec<String>>,
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
    pub remember_me: Option<bool>,
    pub device_name: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct LogoutRequest {
    pub refresh_token: String,
}

#[derive(Debug, Deserialize)]
pub struct RefreshRequest {
    pub refresh_token: String,
}

#[derive(Debug, Deserialize)]
pub struct PasswordFindRequest {
    pub email: String,
}

#[derive(Debug, Deserialize)]
pub struct PasswordResetRequest {
    pub token: String,
    pub new_password: String,
}

#[derive(Debug, Deserialize)]
pub struct CheckEmailQuery {
    pub email: String,
}

#[derive(Debug, Serialize)]
pub struct MessageResponse {
    pub message: String,
}

#[derive(Debug, Serialize)]
pub struct CheckEmailResponse {
    pub available: bool,
}

// ── Helpers ──

fn hash_password(password: &str) -> Result<String, AppError> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let hash = argon2
        .hash_password(password.as_bytes(), &salt)
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Password hash error: {}", e)))?;
    Ok(hash.to_string())
}

fn verify_password(password: &str, hash: &str) -> Result<bool, AppError> {
    let parsed_hash = PasswordHash::new(hash)
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Invalid password hash: {}", e)))?;
    Ok(Argon2::default()
        .verify_password(password.as_bytes(), &parsed_hash)
        .is_ok())
}

fn generate_refresh_token() -> String {
    let mut rng = rand::thread_rng();
    let bytes: Vec<u8> = (0..32).map(|_| rng.gen()).collect();
    hex::encode(bytes)
}

fn hash_token(token: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(token.as_bytes());
    hex::encode(hasher.finalize())
}

#[allow(dead_code)]
fn generate_tokens(
    user: &User,
    state: &AppState,
    remember_me: bool,
) -> Result<(AuthTokens, String), AppError> {
    let access_token = create_access_token(
        user.id,
        &user.role,
        &state.config.jwt_secret,
        state.config.jwt_access_expires_secs,
    )?;

    let refresh_raw = generate_refresh_token();
    let refresh_hash = hash_token(&refresh_raw);

    let refresh_expires = if remember_me {
        state.config.jwt_refresh_expires_secs * 4 // 30 days when remember_me (4 * 7 = 28 days ≈ 30)
    } else {
        state.config.jwt_refresh_expires_secs
    };

    let tokens = AuthTokens {
        access_token,
        refresh_token: refresh_raw,
        token_type: "Bearer".to_string(),
        expires_in: state.config.jwt_access_expires_secs,
    };

    // We return the hash separately so the caller can store it, along with the actual expiry
    // The caller needs refresh_expires to set the DB row
    // We'll encode it in the hash string with a separator — actually let's just return a tuple
    // and handle expiry in the caller.
    let _ = refresh_expires; // used by caller via remember_me param
    Ok((tokens, refresh_hash))
}

fn get_client_ip(req: &HttpRequest) -> Option<String> {
    req.headers()
        .get("X-Forwarded-For")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.split(',').next().unwrap_or("").trim().to_string())
        .or_else(|| req.peer_addr().map(|a| a.ip().to_string()))
}

// ── Handlers ──

pub async fn signup(
    state: web::Data<AppState>,
    body: web::Json<SignupRequest>,
) -> Result<HttpResponse, AppError> {
    if body.email.is_empty() || body.password.is_empty() || body.name.is_empty() {
        return Err(AppError::BadRequest(
            "Email, password, and name are required".to_string(),
        ));
    }

    // Check if email already exists
    let existing: Option<(Uuid,)> =
        sqlx::query_as("SELECT id FROM users WHERE email = $1")
            .bind(&body.email)
            .fetch_optional(&state.db)
            .await?;

    if existing.is_some() {
        return Err(AppError::BadRequest("Email already registered".to_string()));
    }

    let password_hash = hash_password(&body.password)?;
    let role = body.role.clone().unwrap_or(UserRole::ClientPersonal);
    let agreed_marketing = body.agreed_marketing.unwrap_or(false);

    let user = sqlx::query_as::<_, User>(
        "INSERT INTO users (email, password_hash, name, phone, company, role, agreed_marketing)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *",
    )
    .bind(&body.email)
    .bind(&password_hash)
    .bind(&body.name)
    .bind(&body.phone)
    .bind(&body.company)
    .bind(&role)
    .bind(agreed_marketing)
    .fetch_one(&state.db)
    .await?;

    // Insert interests
    let cert_types = body.cert_types.clone().unwrap_or_default();
    let building_usages = body.building_usages.clone().unwrap_or_default();
    let regions = body.regions.clone().unwrap_or_default();

    sqlx::query(
        "INSERT INTO user_interests (user_id, cert_types, building_usages, regions)
         VALUES ($1, $2, $3, $4)",
    )
    .bind(user.id)
    .bind(&cert_types)
    .bind(&building_usages)
    .bind(&regions)
    .execute(&state.db)
    .await?;

    // Generate tokens
    let access_token = create_access_token(
        user.id,
        &user.role,
        &state.config.jwt_secret,
        state.config.jwt_access_expires_secs,
    )?;

    let refresh_raw = generate_refresh_token();
    let refresh_hash = hash_token(&refresh_raw);
    let refresh_expires = Utc::now() + Duration::seconds(state.config.jwt_refresh_expires_secs);

    sqlx::query(
        "INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
         VALUES ($1, $2, $3)",
    )
    .bind(user.id)
    .bind(&refresh_hash)
    .bind(refresh_expires)
    .execute(&state.db)
    .await?;

    Ok(HttpResponse::Created().json(AuthResponse {
        user: UserResponse::from(user),
        tokens: AuthTokens {
            access_token,
            refresh_token: refresh_raw,
            token_type: "Bearer".to_string(),
            expires_in: state.config.jwt_access_expires_secs,
        },
    }))
}

pub async fn signup_social(
    state: web::Data<AppState>,
    body: web::Json<SocialSignupRequest>,
) -> Result<HttpResponse, AppError> {
    if body.email.is_empty() || body.name.is_empty() {
        return Err(AppError::BadRequest(
            "Email and name are required".to_string(),
        ));
    }

    // Check existing email
    let existing: Option<(Uuid,)> =
        sqlx::query_as("SELECT id FROM users WHERE email = $1")
            .bind(&body.email)
            .fetch_optional(&state.db)
            .await?;

    if existing.is_some() {
        return Err(AppError::BadRequest("Email already registered".to_string()));
    }

    let role = body.role.clone().unwrap_or(UserRole::ClientPersonal);
    let agreed_marketing = body.agreed_marketing.unwrap_or(false);

    let user = sqlx::query_as::<_, User>(
        "INSERT INTO users (email, name, phone, company, role, agreed_marketing)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *",
    )
    .bind(&body.email)
    .bind(&body.name)
    .bind(&body.phone)
    .bind(&body.company)
    .bind(&role)
    .bind(agreed_marketing)
    .fetch_one(&state.db)
    .await?;

    // Insert oauth record
    sqlx::query(
        "INSERT INTO user_oauth (user_id, provider, provider_id)
         VALUES ($1, $2, $3)",
    )
    .bind(user.id)
    .bind(&body.provider)
    .bind(&body.provider_id)
    .execute(&state.db)
    .await?;

    // Insert interests
    let cert_types = body.cert_types.clone().unwrap_or_default();
    let building_usages = body.building_usages.clone().unwrap_or_default();
    let regions = body.regions.clone().unwrap_or_default();

    sqlx::query(
        "INSERT INTO user_interests (user_id, cert_types, building_usages, regions)
         VALUES ($1, $2, $3, $4)",
    )
    .bind(user.id)
    .bind(&cert_types)
    .bind(&building_usages)
    .bind(&regions)
    .execute(&state.db)
    .await?;

    // Generate tokens
    let access_token = create_access_token(
        user.id,
        &user.role,
        &state.config.jwt_secret,
        state.config.jwt_access_expires_secs,
    )?;

    let refresh_raw = generate_refresh_token();
    let refresh_hash = hash_token(&refresh_raw);
    let refresh_expires = Utc::now() + Duration::seconds(state.config.jwt_refresh_expires_secs);

    sqlx::query(
        "INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
         VALUES ($1, $2, $3)",
    )
    .bind(user.id)
    .bind(&refresh_hash)
    .bind(refresh_expires)
    .execute(&state.db)
    .await?;

    Ok(HttpResponse::Created().json(AuthResponse {
        user: UserResponse::from(user),
        tokens: AuthTokens {
            access_token,
            refresh_token: refresh_raw,
            token_type: "Bearer".to_string(),
            expires_in: state.config.jwt_access_expires_secs,
        },
    }))
}

pub async fn login(
    state: web::Data<AppState>,
    req: HttpRequest,
    body: web::Json<LoginRequest>,
) -> Result<HttpResponse, AppError> {
    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE email = $1")
        .bind(&body.email)
        .fetch_optional(&state.db)
        .await?
        .ok_or_else(|| AppError::Unauthorized("Invalid email or password".to_string()))?;

    // Check if account is locked
    if let Some(locked_until) = user.locked_until {
        if locked_until > Utc::now() {
            return Err(AppError::Unauthorized(
                "Account is temporarily locked. Please try again later.".to_string(),
            ));
        }
    }

    // Check if user is active
    if user.status != crate::models::user::UserStatus::Active {
        return Err(AppError::Unauthorized(
            "Account is not active".to_string(),
        ));
    }

    // Verify password
    let password_hash = user.password_hash.as_deref().ok_or_else(|| {
        AppError::Unauthorized("This account uses social login".to_string())
    })?;

    let valid = verify_password(&body.password, password_hash)?;
    if !valid {
        // Increment fail count
        let new_count = user.login_fail_count + 1;
        if new_count >= 5 {
            let lock_until = Utc::now() + Duration::minutes(30);
            sqlx::query(
                "UPDATE users SET login_fail_count = $1, locked_until = $2 WHERE id = $3",
            )
            .bind(new_count)
            .bind(lock_until)
            .bind(user.id)
            .execute(&state.db)
            .await?;
        } else {
            sqlx::query("UPDATE users SET login_fail_count = $1 WHERE id = $2")
                .bind(new_count)
                .bind(user.id)
                .execute(&state.db)
                .await?;
        }
        return Err(AppError::Unauthorized(
            "Invalid email or password".to_string(),
        ));
    }

    // Reset fail count on success
    sqlx::query("UPDATE users SET login_fail_count = 0, locked_until = NULL WHERE id = $1")
        .bind(user.id)
        .execute(&state.db)
        .await?;

    // Generate tokens
    let access_token = create_access_token(
        user.id,
        &user.role,
        &state.config.jwt_secret,
        state.config.jwt_access_expires_secs,
    )?;

    let refresh_raw = generate_refresh_token();
    let refresh_hash = hash_token(&refresh_raw);
    let remember_me = body.remember_me.unwrap_or(false);
    let refresh_secs = if remember_me {
        state.config.jwt_refresh_expires_secs * 4
    } else {
        state.config.jwt_refresh_expires_secs
    };
    let refresh_expires = Utc::now() + Duration::seconds(refresh_secs);
    let ip_address = get_client_ip(&req);

    sqlx::query(
        "INSERT INTO refresh_tokens (user_id, token_hash, device_name, ip_address, expires_at)
         VALUES ($1, $2, $3, $4, $5)",
    )
    .bind(user.id)
    .bind(&refresh_hash)
    .bind(&body.device_name)
    .bind(&ip_address)
    .bind(refresh_expires)
    .execute(&state.db)
    .await?;

    Ok(HttpResponse::Ok().json(AuthResponse {
        user: UserResponse::from(user),
        tokens: AuthTokens {
            access_token,
            refresh_token: refresh_raw,
            token_type: "Bearer".to_string(),
            expires_in: state.config.jwt_access_expires_secs,
        },
    }))
}

pub async fn logout(
    state: web::Data<AppState>,
    _auth: AuthUser,
    body: web::Json<LogoutRequest>,
) -> Result<HttpResponse, AppError> {
    let token_hash = hash_token(&body.refresh_token);

    sqlx::query("DELETE FROM refresh_tokens WHERE token_hash = $1")
        .bind(&token_hash)
        .execute(&state.db)
        .await?;

    Ok(HttpResponse::Ok().json(MessageResponse {
        message: "Logged out successfully".to_string(),
    }))
}

pub async fn refresh(
    state: web::Data<AppState>,
    body: web::Json<RefreshRequest>,
) -> Result<HttpResponse, AppError> {
    let token_hash = hash_token(&body.refresh_token);

    let row = sqlx::query_as::<_, (Uuid, chrono::DateTime<Utc>)>(
        "SELECT user_id, expires_at FROM refresh_tokens WHERE token_hash = $1",
    )
    .bind(&token_hash)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::Unauthorized("Invalid refresh token".to_string()))?;

    let (user_id, expires_at) = row;

    if expires_at < Utc::now() {
        // Delete expired token
        sqlx::query("DELETE FROM refresh_tokens WHERE token_hash = $1")
            .bind(&token_hash)
            .execute(&state.db)
            .await?;
        return Err(AppError::Unauthorized(
            "Refresh token expired".to_string(),
        ));
    }

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

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "access_token": access_token,
        "token_type": "Bearer",
        "expires_in": state.config.jwt_access_expires_secs
    })))
}

pub async fn me(
    state: web::Data<AppState>,
    auth: AuthUser,
) -> Result<HttpResponse, AppError> {
    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
        .bind(auth.user_id)
        .fetch_one(&state.db)
        .await?;

    Ok(HttpResponse::Ok().json(UserResponse::from(user)))
}

pub async fn password_find(
    state: web::Data<AppState>,
    body: web::Json<PasswordFindRequest>,
) -> Result<HttpResponse, AppError> {
    // Always return success for security (don't reveal if email exists)
    // In real implementation, send email with reset link
    let _user: Option<(Uuid,)> =
        sqlx::query_as("SELECT id FROM users WHERE email = $1")
            .bind(&body.email)
            .fetch_optional(&state.db)
            .await?;

    // If user exists, create a reset token (but don't reveal to caller)
    if let Some((user_id,)) = _user {
        let token = generate_refresh_token(); // reuse random string generator
        let expires_at = Utc::now() + Duration::hours(1);

        sqlx::query(
            "INSERT INTO password_reset_tokens (user_id, token, expires_at)
             VALUES ($1, $2, $3)",
        )
        .bind(user_id)
        .bind(&token)
        .bind(expires_at)
        .execute(&state.db)
        .await?;

        // TODO: Send email with reset link containing the token
        tracing::info!("Password reset token created for user {}", user_id);
    }

    Ok(HttpResponse::Ok().json(MessageResponse {
        message: "If an account with that email exists, a password reset link has been sent."
            .to_string(),
    }))
}

pub async fn password_reset(
    state: web::Data<AppState>,
    body: web::Json<PasswordResetRequest>,
) -> Result<HttpResponse, AppError> {
    if body.new_password.is_empty() {
        return Err(AppError::BadRequest(
            "New password is required".to_string(),
        ));
    }

    let reset_token = sqlx::query_as::<_, crate::models::user::PasswordResetToken>(
        "SELECT * FROM password_reset_tokens WHERE token = $1 AND used = FALSE",
    )
    .bind(&body.token)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::BadRequest("Invalid or expired reset token".to_string()))?;

    if reset_token.expires_at < Utc::now() {
        return Err(AppError::BadRequest("Reset token has expired".to_string()));
    }

    let password_hash = hash_password(&body.new_password)?;

    // Update password
    sqlx::query("UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2")
        .bind(&password_hash)
        .bind(reset_token.user_id)
        .execute(&state.db)
        .await?;

    // Mark token as used
    sqlx::query("UPDATE password_reset_tokens SET used = TRUE WHERE id = $1")
        .bind(reset_token.id)
        .execute(&state.db)
        .await?;

    // Revoke all refresh tokens for this user (force re-login)
    sqlx::query("DELETE FROM refresh_tokens WHERE user_id = $1")
        .bind(reset_token.user_id)
        .execute(&state.db)
        .await?;

    Ok(HttpResponse::Ok().json(MessageResponse {
        message: "Password has been reset successfully".to_string(),
    }))
}

pub async fn check_email(
    state: web::Data<AppState>,
    query: web::Query<CheckEmailQuery>,
) -> Result<HttpResponse, AppError> {
    let existing: Option<(Uuid,)> =
        sqlx::query_as("SELECT id FROM users WHERE email = $1")
            .bind(&query.email)
            .fetch_optional(&state.db)
            .await?;

    Ok(HttpResponse::Ok().json(CheckEmailResponse {
        available: existing.is_none(),
    }))
}
