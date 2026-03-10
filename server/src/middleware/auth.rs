use actix_web::{dev::Payload, web, FromRequest, HttpRequest};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use std::future::{ready, Ready};
use uuid::Uuid;

use crate::errors::AppError;
use crate::models::user::UserRole;
use crate::AppState;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String, // user_id as string
    pub role: String,
    pub exp: usize,
    pub iat: usize,
}

#[derive(Debug, Clone)]
pub struct AuthUser {
    pub user_id: Uuid,
    pub role: UserRole,
}

impl FromRequest for AuthUser {
    type Error = AppError;
    type Future = Ready<Result<Self, Self::Error>>;

    fn from_request(req: &HttpRequest, _payload: &mut Payload) -> Self::Future {
        let result = extract_auth_user(req);
        ready(result)
    }
}

fn extract_auth_user(req: &HttpRequest) -> Result<AuthUser, AppError> {
    let state = req
        .app_data::<web::Data<AppState>>()
        .ok_or_else(|| AppError::Internal(anyhow::anyhow!("AppState not found")))?;

    let auth_header = req
        .headers()
        .get("Authorization")
        .ok_or_else(|| AppError::Unauthorized("Missing authorization header".to_string()))?
        .to_str()
        .map_err(|_| AppError::Unauthorized("Invalid authorization header".to_string()))?;

    let token = auth_header
        .strip_prefix("Bearer ")
        .ok_or_else(|| AppError::Unauthorized("Invalid authorization scheme".to_string()))?;

    let claims = decode_access_token(token, &state.config.jwt_secret)?;

    let user_id = Uuid::parse_str(&claims.sub)
        .map_err(|_| AppError::Unauthorized("Invalid token subject".to_string()))?;

    let role = parse_role(&claims.role)?;

    Ok(AuthUser { user_id, role })
}

pub fn create_access_token(
    user_id: Uuid,
    role: &UserRole,
    secret: &str,
    expires_secs: i64,
) -> Result<String, AppError> {
    let now = chrono::Utc::now().timestamp() as usize;
    let role_str = serde_json::to_value(role)
        .map_err(|e| AppError::Internal(e.into()))?
        .as_str()
        .unwrap_or("CL-P")
        .to_string();

    let claims = Claims {
        sub: user_id.to_string(),
        role: role_str,
        iat: now,
        exp: now + expires_secs as usize,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to create token: {}", e)))
}

pub fn decode_access_token(token: &str, secret: &str) -> Result<Claims, AppError> {
    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::default(),
    )
    .map_err(|e| AppError::Unauthorized(format!("Invalid token: {}", e)))?;

    Ok(token_data.claims)
}

fn parse_role(role_str: &str) -> Result<UserRole, AppError> {
    match role_str {
        "CL-P" => Ok(UserRole::ClientPersonal),
        "CL-C" => Ok(UserRole::ClientCorporate),
        "PT" => Ok(UserRole::Partner),
        "ADMIN" => Ok(UserRole::Admin),
        _ => Err(AppError::Unauthorized(format!(
            "Unknown role: {}",
            role_str
        ))),
    }
}

/// Extractor that requires the user to have ADMIN role
#[derive(Debug, Clone)]
#[allow(dead_code)]
pub struct AdminUser {
    pub user_id: Uuid,
    pub role: UserRole,
}

impl FromRequest for AdminUser {
    type Error = AppError;
    type Future = Ready<Result<Self, Self::Error>>;

    fn from_request(req: &HttpRequest, _payload: &mut Payload) -> Self::Future {
        let result = extract_auth_user(req).and_then(|auth| {
            if auth.role != UserRole::Admin {
                return Err(AppError::Unauthorized("Admin access required".to_string()));
            }
            Ok(AdminUser {
                user_id: auth.user_id,
                role: auth.role,
            })
        });
        ready(result)
    }
}
