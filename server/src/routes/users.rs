use actix_web::{web, HttpResponse};
use argon2::password_hash::SaltString;
use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier};
use serde::Deserialize;

use crate::errors::AppError;
use crate::middleware::auth::AuthUser;
use crate::models::user::{
    User, UserInterests, UserNotificationSettings, UserPreferences, UserProfileResponse,
    UserResponse, UserStatus,
};
use crate::AppState;

// ── Request DTOs ──

#[derive(Debug, Deserialize)]
pub struct UpdateProfileRequest {
    pub name: Option<String>,
    pub phone: Option<String>,
    pub company: Option<String>,
    pub avatar_url: Option<String>,
    pub agreed_marketing: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct ChangePasswordRequest {
    pub current_password: String,
    pub new_password: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateInterestsRequest {
    pub cert_types: Option<Vec<String>>,
    pub building_usages: Option<Vec<String>>,
    pub regions: Option<Vec<String>>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateNotificationsRequest {
    pub bid_email: Option<bool>,
    pub bid_push: Option<bool>,
    pub proposal_email: Option<bool>,
    pub proposal_push: Option<bool>,
    pub contract_email: Option<bool>,
    pub contract_push: Option<bool>,
    pub chat_email: Option<bool>,
    pub chat_push: Option<bool>,
    pub marketing_email: Option<bool>,
    pub marketing_push: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct UpdatePreferencesRequest {
    pub language: Option<String>,
    pub region: Option<String>,
    pub currency: Option<String>,
    pub area_unit: Option<String>,
    pub theme: Option<String>,
}

// ── Handlers ──

pub async fn get_me(
    state: web::Data<AppState>,
    auth: AuthUser,
) -> Result<HttpResponse, AppError> {
    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
        .bind(auth.user_id)
        .fetch_one(&state.db)
        .await?;

    let interests = sqlx::query_as::<_, UserInterests>(
        "SELECT * FROM user_interests WHERE user_id = $1",
    )
    .bind(auth.user_id)
    .fetch_optional(&state.db)
    .await?;

    Ok(HttpResponse::Ok().json(UserProfileResponse {
        user: UserResponse::from(user),
        interests,
    }))
}

pub async fn update_me(
    state: web::Data<AppState>,
    auth: AuthUser,
    body: web::Json<UpdateProfileRequest>,
) -> Result<HttpResponse, AppError> {
    let user = sqlx::query_as::<_, User>(
        "UPDATE users SET
            name = COALESCE($1, name),
            phone = COALESCE($2, phone),
            company = COALESCE($3, company),
            avatar_url = COALESCE($4, avatar_url),
            agreed_marketing = COALESCE($5, agreed_marketing),
            updated_at = NOW()
         WHERE id = $6
         RETURNING *",
    )
    .bind(&body.name)
    .bind(&body.phone)
    .bind(&body.company)
    .bind(&body.avatar_url)
    .bind(body.agreed_marketing)
    .bind(auth.user_id)
    .fetch_one(&state.db)
    .await?;

    Ok(HttpResponse::Ok().json(UserResponse::from(user)))
}

pub async fn change_password(
    state: web::Data<AppState>,
    auth: AuthUser,
    body: web::Json<ChangePasswordRequest>,
) -> Result<HttpResponse, AppError> {
    if body.new_password.is_empty() {
        return Err(AppError::BadRequest(
            "New password is required".to_string(),
        ));
    }

    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
        .bind(auth.user_id)
        .fetch_one(&state.db)
        .await?;

    let current_hash = user.password_hash.as_deref().ok_or_else(|| {
        AppError::BadRequest("This account uses social login and has no password".to_string())
    })?;

    // Verify current password
    let parsed_hash = PasswordHash::new(current_hash)
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Invalid password hash: {}", e)))?;

    let valid = Argon2::default()
        .verify_password(body.current_password.as_bytes(), &parsed_hash)
        .is_ok();

    if !valid {
        return Err(AppError::BadRequest(
            "Current password is incorrect".to_string(),
        ));
    }

    // Hash new password
    let salt_string = SaltString::generate(&mut argon2::password_hash::rand_core::OsRng);
    let new_hash = Argon2::default()
        .hash_password(body.new_password.as_bytes(), &salt_string)
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Password hash error: {}", e)))?
        .to_string();

    sqlx::query("UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2")
        .bind(&new_hash)
        .bind(auth.user_id)
        .execute(&state.db)
        .await?;

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "message": "Password changed successfully"
    })))
}

pub async fn withdraw(
    state: web::Data<AppState>,
    auth: AuthUser,
) -> Result<HttpResponse, AppError> {
    sqlx::query(
        "UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2",
    )
    .bind(UserStatus::Withdrawn)
    .bind(auth.user_id)
    .execute(&state.db)
    .await?;

    // Revoke all refresh tokens
    sqlx::query("DELETE FROM refresh_tokens WHERE user_id = $1")
        .bind(auth.user_id)
        .execute(&state.db)
        .await?;

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "message": "Account withdrawn"
    })))
}

pub async fn get_interests(
    state: web::Data<AppState>,
    auth: AuthUser,
) -> Result<HttpResponse, AppError> {
    let interests = sqlx::query_as::<_, UserInterests>(
        "SELECT * FROM user_interests WHERE user_id = $1",
    )
    .bind(auth.user_id)
    .fetch_optional(&state.db)
    .await?;

    Ok(HttpResponse::Ok().json(interests))
}

pub async fn update_interests(
    state: web::Data<AppState>,
    auth: AuthUser,
    body: web::Json<UpdateInterestsRequest>,
) -> Result<HttpResponse, AppError> {
    let interests = sqlx::query_as::<_, UserInterests>(
        "INSERT INTO user_interests (user_id, cert_types, building_usages, regions)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id) DO UPDATE SET
            cert_types = COALESCE($2, user_interests.cert_types),
            building_usages = COALESCE($3, user_interests.building_usages),
            regions = COALESCE($4, user_interests.regions)
         RETURNING *",
    )
    .bind(auth.user_id)
    .bind(&body.cert_types.as_deref().unwrap_or(&[]))
    .bind(&body.building_usages.as_deref().unwrap_or(&[]))
    .bind(&body.regions.as_deref().unwrap_or(&[]))
    .fetch_one(&state.db)
    .await?;

    Ok(HttpResponse::Ok().json(interests))
}

pub async fn get_notifications(
    state: web::Data<AppState>,
    auth: AuthUser,
) -> Result<HttpResponse, AppError> {
    let settings = sqlx::query_as::<_, UserNotificationSettings>(
        "SELECT * FROM user_notification_settings WHERE user_id = $1",
    )
    .bind(auth.user_id)
    .fetch_optional(&state.db)
    .await?;

    Ok(HttpResponse::Ok().json(settings))
}

pub async fn update_notifications(
    state: web::Data<AppState>,
    auth: AuthUser,
    body: web::Json<UpdateNotificationsRequest>,
) -> Result<HttpResponse, AppError> {
    let settings = sqlx::query_as::<_, UserNotificationSettings>(
        "INSERT INTO user_notification_settings (user_id)
         VALUES ($1)
         ON CONFLICT (user_id) DO UPDATE SET user_id = $1
         RETURNING *",
    )
    .bind(auth.user_id)
    .fetch_one(&state.db)
    .await?;

    // Now update only provided fields
    let updated = sqlx::query_as::<_, UserNotificationSettings>(
        "UPDATE user_notification_settings SET
            bid_email = COALESCE($1, bid_email),
            bid_push = COALESCE($2, bid_push),
            proposal_email = COALESCE($3, proposal_email),
            proposal_push = COALESCE($4, proposal_push),
            contract_email = COALESCE($5, contract_email),
            contract_push = COALESCE($6, contract_push),
            chat_email = COALESCE($7, chat_email),
            chat_push = COALESCE($8, chat_push),
            marketing_email = COALESCE($9, marketing_email),
            marketing_push = COALESCE($10, marketing_push)
         WHERE user_id = $11
         RETURNING *",
    )
    .bind(body.bid_email.or(Some(settings.bid_email)))
    .bind(body.bid_push.or(Some(settings.bid_push)))
    .bind(body.proposal_email.or(Some(settings.proposal_email)))
    .bind(body.proposal_push.or(Some(settings.proposal_push)))
    .bind(body.contract_email.or(Some(settings.contract_email)))
    .bind(body.contract_push.or(Some(settings.contract_push)))
    .bind(body.chat_email.or(Some(settings.chat_email)))
    .bind(body.chat_push.or(Some(settings.chat_push)))
    .bind(body.marketing_email.or(Some(settings.marketing_email)))
    .bind(body.marketing_push.or(Some(settings.marketing_push)))
    .bind(auth.user_id)
    .fetch_one(&state.db)
    .await?;

    Ok(HttpResponse::Ok().json(updated))
}

pub async fn get_preferences(
    state: web::Data<AppState>,
    auth: AuthUser,
) -> Result<HttpResponse, AppError> {
    let prefs = sqlx::query_as::<_, UserPreferences>(
        "SELECT * FROM user_preferences WHERE user_id = $1",
    )
    .bind(auth.user_id)
    .fetch_optional(&state.db)
    .await?;

    Ok(HttpResponse::Ok().json(prefs))
}

pub async fn update_preferences(
    state: web::Data<AppState>,
    auth: AuthUser,
    body: web::Json<UpdatePreferencesRequest>,
) -> Result<HttpResponse, AppError> {
    let prefs = sqlx::query_as::<_, UserPreferences>(
        "INSERT INTO user_preferences (user_id)
         VALUES ($1)
         ON CONFLICT (user_id) DO UPDATE SET user_id = $1
         RETURNING *",
    )
    .bind(auth.user_id)
    .fetch_one(&state.db)
    .await?;

    let updated = sqlx::query_as::<_, UserPreferences>(
        "UPDATE user_preferences SET
            language = COALESCE($1, language),
            region = COALESCE($2, region),
            currency = COALESCE($3, currency),
            area_unit = COALESCE($4, area_unit),
            theme = COALESCE($5, theme)
         WHERE user_id = $6
         RETURNING *",
    )
    .bind(body.language.as_deref().or(Some(prefs.language.as_str())))
    .bind(body.region.as_deref().or(prefs.region.as_deref()))
    .bind(body.currency.as_deref().or(Some(prefs.currency.as_str())))
    .bind(body.area_unit.as_deref().or(Some(prefs.area_unit.as_str())))
    .bind(body.theme.as_deref().or(Some(prefs.theme.as_str())))
    .bind(auth.user_id)
    .fetch_one(&state.db)
    .await?;

    Ok(HttpResponse::Ok().json(updated))
}
