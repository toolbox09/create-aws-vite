use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

// ── PostgreSQL enum types ──

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type, PartialEq)]
#[sqlx(type_name = "user_role")]
pub enum UserRole {
    #[sqlx(rename = "CL-P")]
    #[serde(rename = "CL-P")]
    ClientPersonal,
    #[sqlx(rename = "CL-C")]
    #[serde(rename = "CL-C")]
    ClientCorporate,
    #[sqlx(rename = "PT")]
    #[serde(rename = "PT")]
    Partner,
    #[sqlx(rename = "ADMIN")]
    #[serde(rename = "ADMIN")]
    Admin,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type, PartialEq)]
#[sqlx(type_name = "user_status")]
pub enum UserStatus {
    #[sqlx(rename = "active")]
    #[serde(rename = "active")]
    Active,
    #[sqlx(rename = "suspended")]
    #[serde(rename = "suspended")]
    Suspended,
    #[sqlx(rename = "withdrawn")]
    #[serde(rename = "withdrawn")]
    Withdrawn,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type, PartialEq)]
#[sqlx(type_name = "license_status")]
pub enum LicenseStatus {
    #[sqlx(rename = "pending")]
    #[serde(rename = "pending")]
    Pending,
    #[sqlx(rename = "approved")]
    #[serde(rename = "approved")]
    Approved,
    #[sqlx(rename = "rejected")]
    #[serde(rename = "rejected")]
    Rejected,
}

// ── DB row structs ──

#[derive(Debug, Clone, sqlx::FromRow)]
#[allow(dead_code)]
pub struct User {
    pub id: Uuid,
    pub email: String,
    pub password_hash: Option<String>,
    pub name: String,
    pub phone: Option<String>,
    pub company: Option<String>,
    pub role: UserRole,
    pub status: UserStatus,
    pub avatar_url: Option<String>,
    pub ci: Option<String>,
    pub di: Option<String>,
    pub identity_verified: bool,
    pub login_fail_count: i32,
    pub locked_until: Option<DateTime<Utc>>,
    pub agreed_marketing: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, sqlx::FromRow, Serialize)]
pub struct UserInterests {
    pub id: Uuid,
    pub user_id: Uuid,
    pub cert_types: Vec<String>,
    pub building_usages: Vec<String>,
    pub regions: Vec<String>,
}

#[derive(Debug, Clone, sqlx::FromRow, Serialize)]
pub struct UserPreferences {
    pub id: Uuid,
    pub user_id: Uuid,
    pub language: String,
    pub region: Option<String>,
    pub currency: String,
    pub area_unit: String,
    pub theme: String,
}

#[derive(Debug, Clone, sqlx::FromRow, Serialize)]
pub struct UserNotificationSettings {
    pub id: Uuid,
    pub user_id: Uuid,
    pub bid_email: bool,
    pub bid_push: bool,
    pub proposal_email: bool,
    pub proposal_push: bool,
    pub contract_email: bool,
    pub contract_push: bool,
    pub chat_email: bool,
    pub chat_push: bool,
    pub marketing_email: bool,
    pub marketing_push: bool,
}

#[derive(Debug, Clone, sqlx::FromRow, Serialize)]
#[allow(dead_code)]
pub struct RefreshToken {
    pub id: Uuid,
    pub user_id: Uuid,
    pub token_hash: String,
    pub device_name: Option<String>,
    pub ip_address: Option<String>,
    pub expires_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, sqlx::FromRow, Serialize)]
pub struct PasswordResetToken {
    pub id: Uuid,
    pub user_id: Uuid,
    pub token: String,
    pub expires_at: DateTime<Utc>,
    pub used: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, sqlx::FromRow, Serialize)]
pub struct PartnerLicense {
    pub id: Uuid,
    pub user_id: Uuid,
    pub license_type: String,
    pub file_url: String,
    pub status: LicenseStatus,
    pub reviewed_by: Option<Uuid>,
    pub reviewed_at: Option<DateTime<Utc>>,
    pub reject_reason: Option<String>,
    pub biz_company: Option<String>,
    pub biz_address: Option<String>,
    pub biz_owner: Option<String>,
    pub biz_reg_no: Option<String>,
    pub created_at: DateTime<Utc>,
}

// ── Response DTOs ──

#[derive(Debug, Serialize)]
pub struct UserResponse {
    pub id: Uuid,
    pub email: String,
    pub name: String,
    pub phone: Option<String>,
    pub company: Option<String>,
    pub role: UserRole,
    pub status: UserStatus,
    pub avatar_url: Option<String>,
    pub identity_verified: bool,
    pub agreed_marketing: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl From<User> for UserResponse {
    fn from(u: User) -> Self {
        Self {
            id: u.id,
            email: u.email,
            name: u.name,
            phone: u.phone,
            company: u.company,
            role: u.role,
            status: u.status,
            avatar_url: u.avatar_url,
            identity_verified: u.identity_verified,
            agreed_marketing: u.agreed_marketing,
            created_at: u.created_at,
            updated_at: u.updated_at,
        }
    }
}

#[derive(Debug, Serialize)]
pub struct AuthTokens {
    pub access_token: String,
    pub refresh_token: String,
    pub token_type: String,
    pub expires_in: i64,
}

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub user: UserResponse,
    pub tokens: AuthTokens,
}

#[derive(Debug, Serialize)]
pub struct UserProfileResponse {
    pub user: UserResponse,
    pub interests: Option<UserInterests>,
}

#[derive(Debug, Serialize)]
pub struct MemberDetailResponse {
    pub user: UserResponse,
    pub interests: Option<UserInterests>,
    pub licenses: Vec<PartnerLicense>,
}

#[derive(Debug, Serialize)]
pub struct PaginatedResponse<T: Serialize> {
    pub items: Vec<T>,
    pub total: i64,
    pub page: i64,
    pub per_page: i64,
}
