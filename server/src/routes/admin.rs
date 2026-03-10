use actix_web::{web, HttpResponse};
use serde::Deserialize;
use uuid::Uuid;

use crate::errors::AppError;
use crate::middleware::auth::AdminUser;
use crate::models::user::{
    MemberDetailResponse, PaginatedResponse, PartnerLicense, User, UserInterests, UserResponse,
    UserRole, UserStatus,
};
use crate::AppState;

// ── Request / Query DTOs ──

#[derive(Debug, Deserialize)]
pub struct ListMembersQuery {
    pub page: Option<i64>,
    pub per_page: Option<i64>,
    pub role: Option<String>,
    pub status: Option<String>,
    pub search: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateStatusRequest {
    pub status: UserStatus,
}

// ── Handlers ──

pub async fn list_members(
    state: web::Data<AppState>,
    _admin: AdminUser,
    query: web::Query<ListMembersQuery>,
) -> Result<HttpResponse, AppError> {
    let page = query.page.unwrap_or(1).max(1);
    let per_page = query.per_page.unwrap_or(20).clamp(1, 100);
    let offset = (page - 1) * per_page;

    // Build WHERE clauses
    let mut conditions: Vec<String> = vec![];
    let mut param_idx = 1u32;

    // We'll build the query dynamically
    if query.role.is_some() {
        conditions.push(format!("u.role = ${}", param_idx));
        param_idx += 1;
    }
    if query.status.is_some() {
        conditions.push(format!("u.status = ${}", param_idx));
        param_idx += 1;
    }
    if query.search.is_some() {
        conditions.push(format!(
            "(u.name ILIKE ${p} OR u.email ILIKE ${p})",
            p = param_idx
        ));
        param_idx += 1;
    }

    let where_clause = if conditions.is_empty() {
        String::new()
    } else {
        format!("WHERE {}", conditions.join(" AND "))
    };

    let _count_sql = format!("SELECT COUNT(*) as count FROM users u {}", where_clause);
    let _select_sql = format!(
        "SELECT u.* FROM users u {} ORDER BY u.created_at DESC LIMIT ${} OFFSET ${}",
        where_clause, param_idx, param_idx + 1
    );

    // Since we need dynamic parameter binding, let's use a simpler approach
    // with sqlx::query_as and conditional binding. We'll use a fixed query with
    // optional parameter handling via COALESCE/OR patterns.

    // Simpler approach: use a single parameterized query
    let search_pattern = query
        .search
        .as_ref()
        .map(|s| format!("%{}%", s));

    let role_filter: Option<UserRole> = query.role.as_ref().and_then(|r| match r.as_str() {
        "CL-P" => Some(UserRole::ClientPersonal),
        "CL-C" => Some(UserRole::ClientCorporate),
        "PT" => Some(UserRole::Partner),
        "ADMIN" => Some(UserRole::Admin),
        _ => None,
    });

    let status_filter: Option<UserStatus> =
        query.status.as_ref().and_then(|s| match s.as_str() {
            "active" => Some(UserStatus::Active),
            "suspended" => Some(UserStatus::Suspended),
            "withdrawn" => Some(UserStatus::Withdrawn),
            _ => None,
        });

    let total: (i64,) = sqlx::query_as(
        "SELECT COUNT(*)::bigint FROM users u
         WHERE ($1::user_role IS NULL OR u.role = $1)
           AND ($2::user_status IS NULL OR u.status = $2)
           AND ($3::text IS NULL OR u.name ILIKE $3 OR u.email ILIKE $3)",
    )
    .bind(&role_filter)
    .bind(&status_filter)
    .bind(&search_pattern)
    .fetch_one(&state.db)
    .await?;

    let users = sqlx::query_as::<_, User>(
        "SELECT u.* FROM users u
         WHERE ($1::user_role IS NULL OR u.role = $1)
           AND ($2::user_status IS NULL OR u.status = $2)
           AND ($3::text IS NULL OR u.name ILIKE $3 OR u.email ILIKE $3)
         ORDER BY u.created_at DESC
         LIMIT $4 OFFSET $5",
    )
    .bind(&role_filter)
    .bind(&status_filter)
    .bind(&search_pattern)
    .bind(per_page)
    .bind(offset)
    .fetch_all(&state.db)
    .await?;

    let items: Vec<UserResponse> = users.into_iter().map(UserResponse::from).collect();

    Ok(HttpResponse::Ok().json(PaginatedResponse {
        items,
        total: total.0,
        page,
        per_page,
    }))
}

pub async fn get_member(
    state: web::Data<AppState>,
    _admin: AdminUser,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, AppError> {
    let member_id = path.into_inner();

    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
        .bind(member_id)
        .fetch_optional(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound("Member not found".to_string()))?;

    let interests = sqlx::query_as::<_, UserInterests>(
        "SELECT * FROM user_interests WHERE user_id = $1",
    )
    .bind(member_id)
    .fetch_optional(&state.db)
    .await?;

    let licenses = sqlx::query_as::<_, PartnerLicense>(
        "SELECT * FROM partner_licenses WHERE user_id = $1 ORDER BY created_at DESC",
    )
    .bind(member_id)
    .fetch_all(&state.db)
    .await?;

    Ok(HttpResponse::Ok().json(MemberDetailResponse {
        user: UserResponse::from(user),
        interests,
        licenses,
    }))
}

pub async fn update_member_status(
    state: web::Data<AppState>,
    _admin: AdminUser,
    path: web::Path<Uuid>,
    body: web::Json<UpdateStatusRequest>,
) -> Result<HttpResponse, AppError> {
    let member_id = path.into_inner();

    let user = sqlx::query_as::<_, User>(
        "UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
    )
    .bind(&body.status)
    .bind(member_id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound("Member not found".to_string()))?;

    Ok(HttpResponse::Ok().json(UserResponse::from(user)))
}
