use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

// ── DB row structs ──

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct Partner {
    pub id: i64,
    pub user_id: Option<Uuid>,
    pub name: String,
    pub sido_code: String,
    pub sigungu_code: Option<String>,
    pub address: String,
    pub profile_image_url: Option<String>,
    pub cover_image_url: Option<String>,
    pub certs: Vec<String>,
    pub usages: Vec<String>,
    pub founded_year: i16,
    pub ceo_name: String,
    pub employee_count: Option<i16>,
    pub phone: Option<String>,
    pub website_url: Option<String>,
    pub intro: String,
    pub brand_story_content: Option<String>,
    pub rating: Option<f64>,
    pub review_count: i32,
    pub portfolio_count: i32,
    pub top_review_tags: Vec<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct Portfolio {
    pub id: i64,
    pub partner_id: i64,
    pub title: String,
    pub intro: Option<String>,
    pub hero_image_url: Option<String>,
    pub thumbnail_url: Option<String>,
    pub usage_code: String,
    pub location: String,
    pub completion_year: i16,
    pub land_area: Option<f64>,
    pub building_area: Option<f64>,
    pub total_floor_area: Option<f64>,
    pub floors_above: Option<i16>,
    pub floors_below: Option<i16>,
    pub constructor_name: Option<String>,
    pub construction_period_months: Option<i16>,
    pub design_period_months: Option<i16>,
    pub display_order: i16,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct PortfolioImage {
    pub id: i64,
    pub portfolio_id: i64,
    pub image_url: String,
    pub caption: Option<String>,
    pub display_order: i16,
}

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct Qualification {
    pub id: i64,
    pub partner_id: i64,
    pub cert_code: String,
    pub label: String,
    pub description: Option<String>,
    pub status: String,
    pub requested_at: DateTime<Utc>,
    pub reviewed_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct Review {
    pub id: i64,
    pub partner_id: i64,
    pub portfolio_id: Option<i64>,
    pub user_id: Uuid,
    pub rating: i16,
    pub text: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct ReviewTag {
    pub id: i64,
    pub label: String,
    pub display_order: i16,
    pub is_active: bool,
}

#[derive(Debug, Clone, sqlx::FromRow, Serialize)]
pub struct ReviewTagCount {
    pub id: i64,
    pub label: String,
    pub count: i64,
}

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct ReviewWithAuthor {
    pub id: i64,
    pub partner_id: i64,
    pub portfolio_id: Option<i64>,
    pub user_id: Uuid,
    pub rating: i16,
    pub text: String,
    pub created_at: DateTime<Utc>,
    pub author_name: String,
    pub portfolio_title: Option<String>,
}

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct ReviewTagLabel {
    pub review_id: i64,
    pub label: String,
}

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct CommonCode {
    pub id: i64,
    pub group_code: String,
    pub code: String,
    pub label: String,
    pub sort_order: i16,
    pub parent_code: Option<String>,
    pub metadata: Option<serde_json::Value>,
    pub is_active: bool,
}

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct FavoriteRow {
    pub id: i64,
    pub user_id: Uuid,
    pub partner_id: i64,
    pub created_at: DateTime<Utc>,
}

// ── Response DTOs ──

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CodeItem {
    pub code: String,
    pub label: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CodeLabel {
    pub code: String,
    pub label: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PartnerListItem {
    pub id: i64,
    pub name: String,
    pub sido: CodeLabel,
    pub sigungu_code: Option<String>,
    pub address: String,
    pub profile_image: Option<String>,
    pub cover_image: Option<String>,
    pub certs: Vec<CodeLabel>,
    pub usages: Vec<CodeLabel>,
    pub portfolio_count: i32,
    pub review_count: i32,
    pub rating: f64,
    pub founded_year: i16,
    pub years: i32,
    pub top_review_tags: Vec<String>,
    pub is_favorited: Option<bool>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PartnerListResponse {
    pub data: Vec<PartnerListItem>,
    pub total: i64,
    pub page: i64,
    pub size: i64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PartnerDetailResponse {
    pub partner: PartnerDetail,
    pub brand_story_content: Option<String>,
    pub portfolios: Vec<PortfolioSummary>,
    pub qualifications: Vec<QualificationItem>,
    pub review_tag_summary: Vec<ReviewTagCount>,
    pub reviews: Vec<ReviewItem>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PartnerDetail {
    pub id: i64,
    pub name: String,
    pub sido: CodeLabel,
    pub sigungu_code: Option<String>,
    pub address: String,
    pub profile_image: Option<String>,
    pub cover_image: Option<String>,
    pub certs: Vec<CodeLabel>,
    pub usages: Vec<CodeLabel>,
    pub founded_year: i16,
    pub years: i32,
    pub ceo_name: String,
    pub employee_count: Option<i16>,
    pub phone: Option<String>,
    pub website_url: Option<String>,
    pub intro: String,
    pub rating: f64,
    pub review_count: i32,
    pub portfolio_count: i32,
    pub is_favorited: Option<bool>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PortfolioSummary {
    pub id: i64,
    pub title: String,
    pub thumbnail: Option<String>,
    pub usage: CodeLabel,
    pub land_area: Option<f64>,
    pub year: i16,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct QualificationItem {
    pub id: i64,
    pub label: String,
    pub description: Option<String>,
    pub status: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReviewItem {
    pub id: i64,
    pub author: String,
    pub date: String,
    pub rating: i16,
    pub portfolio_id: Option<i64>,
    pub portfolio_title: Option<String>,
    pub tags: Vec<CodeLabel>,
    pub text: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PortfolioDetailResponse {
    pub id: i64,
    pub partner_id: i64,
    pub partner_name: String,
    pub title: String,
    pub intro: Option<String>,
    pub hero_image: Option<String>,
    pub usage: CodeLabel,
    pub location: String,
    pub completion_year: i16,
    pub land_area: Option<f64>,
    pub building_area: Option<f64>,
    pub total_floor_area: Option<f64>,
    pub floors_above: Option<i16>,
    pub floors_below: Option<i16>,
    pub constructor_name: Option<String>,
    pub construction_period_months: Option<i16>,
    pub design_period_months: Option<i16>,
    pub images: Vec<PortfolioImageItem>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PortfolioImageItem {
    pub id: i64,
    pub url: String,
    pub caption: Option<String>,
}

// ── Request DTOs ──

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PartnerListQuery {
    pub q: Option<String>,
    pub certs: Option<String>,
    pub sido_codes: Option<String>,
    pub usages: Option<String>,
    pub min_years: Option<i32>,
    pub max_years: Option<i32>,
    pub min_portfolio: Option<i32>,
    pub sort: Option<String>,
    pub page: Option<i64>,
    pub size: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct ReviewListQuery {
    pub page: Option<i64>,
    pub size: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct CodesQuery {
    pub groups: Option<String>,
}
