use actix_web::{web, HttpRequest, HttpResponse};
use serde::Deserialize;
use std::collections::HashMap;

use crate::errors::AppError;
use crate::middleware::auth::AuthUser;
use crate::models::partner::*;
use crate::AppState;

// ── Helper: extract optional auth user from request ──

fn try_auth_user(req: &HttpRequest) -> Option<AuthUser> {
    use actix_web::FromRequest;
    let mut payload = actix_web::dev::Payload::None;
    AuthUser::from_request(req, &mut payload)
        .into_inner()
        .ok()
}

// ── Helper: resolve code labels from cached codes ──

fn resolve_code_label(codes: &[CommonCode], group: &str, code: &str) -> CodeLabel {
    codes
        .iter()
        .find(|c| c.group_code == group && c.code == code)
        .map(|c| CodeLabel {
            code: c.code.clone(),
            label: c.label.clone(),
        })
        .unwrap_or_else(|| CodeLabel {
            code: code.to_string(),
            label: code.to_string(),
        })
}

fn current_year() -> i32 {
    chrono::Utc::now().format("%Y").to_string().parse().unwrap_or(2026)
}

// ── GET /api/codes ──

pub async fn get_codes(
    state: web::Data<AppState>,
    query: web::Query<CodesQuery>,
) -> Result<HttpResponse, AppError> {
    let groups: Vec<String> = query
        .groups
        .as_deref()
        .unwrap_or("SIDO,CERT,USAGE,REGION_GROUP")
        .split(',')
        .map(|s| s.trim().to_string())
        .collect();

    let codes = sqlx::query_as::<_, CommonCode>(
        "SELECT * FROM common_codes WHERE group_code = ANY($1) AND is_active = TRUE ORDER BY sort_order",
    )
    .bind(&groups)
    .fetch_all(&state.db)
    .await?;

    let mut result: HashMap<String, Vec<CodeItem>> = HashMap::new();
    for code in codes {
        result
            .entry(code.group_code.clone())
            .or_default()
            .push(CodeItem {
                code: code.code,
                label: code.label,
                metadata: code.metadata,
            });
    }

    Ok(HttpResponse::Ok().json(result))
}

// ── GET /api/partners ──

pub async fn list_partners(
    state: web::Data<AppState>,
    query: web::Query<PartnerListQuery>,
    req: HttpRequest,
) -> Result<HttpResponse, AppError> {
    let auth = try_auth_user(&req);
    let page = query.page.unwrap_or(1).max(1);
    let size = query.size.unwrap_or(20).clamp(1, 100);
    let offset = (page - 1) * size;
    let year = current_year();

    let search_pattern = query.q.as_ref().map(|s| format!("%{}%", s));

    let certs_filter: Option<Vec<String>> = query
        .certs
        .as_deref()
        .map(|s| s.split(',').map(|c| c.trim().to_string()).collect());

    let sido_filter: Option<Vec<String>> = query
        .sido_codes
        .as_deref()
        .map(|s| s.split(',').map(|c| c.trim().to_string()).collect());

    let usages_filter: Option<Vec<String>> = query
        .usages
        .as_deref()
        .map(|s| s.split(',').map(|c| c.trim().to_string()).collect());

    let min_founded = query.min_years.map(|y| (year - y) as i16);
    let max_founded = query.max_years.map(|y| (year - y) as i16);

    let sort_clause = match query.sort.as_deref() {
        Some("portfolio") => "ORDER BY p.portfolio_count DESC",
        Some("years") => "ORDER BY p.founded_year ASC",
        _ => "ORDER BY p.rating DESC NULLS LAST, p.review_count DESC",
    };

    let count_sql = format!(
        "SELECT COUNT(*)::bigint FROM partners p
         WHERE ($1::text IS NULL OR p.name ILIKE $1)
           AND ($2::text[] IS NULL OR p.certs @> $2)
           AND ($3::text[] IS NULL OR p.sido_code = ANY($3))
           AND ($4::text[] IS NULL OR p.usages && $4)
           AND ($5::smallint IS NULL OR p.founded_year <= $5)
           AND ($6::smallint IS NULL OR p.founded_year >= $6)
           AND ($7::int IS NULL OR p.portfolio_count >= $7)"
    );

    let select_sql = format!(
        "SELECT p.* FROM partners p
         WHERE ($1::text IS NULL OR p.name ILIKE $1)
           AND ($2::text[] IS NULL OR p.certs @> $2)
           AND ($3::text[] IS NULL OR p.sido_code = ANY($3))
           AND ($4::text[] IS NULL OR p.usages && $4)
           AND ($5::smallint IS NULL OR p.founded_year <= $5)
           AND ($6::smallint IS NULL OR p.founded_year >= $6)
           AND ($7::int IS NULL OR p.portfolio_count >= $7)
         {}
         LIMIT $8 OFFSET $9",
        sort_clause
    );

    let total: (i64,) = sqlx::query_as(&count_sql)
        .bind(&search_pattern)
        .bind(&certs_filter)
        .bind(&sido_filter)
        .bind(&usages_filter)
        .bind(&min_founded)
        .bind(&max_founded)
        .bind(&query.min_portfolio)
        .fetch_one(&state.db)
        .await?;

    let partners = sqlx::query_as::<_, Partner>(&select_sql)
        .bind(&search_pattern)
        .bind(&certs_filter)
        .bind(&sido_filter)
        .bind(&usages_filter)
        .bind(&min_founded)
        .bind(&max_founded)
        .bind(&query.min_portfolio)
        .bind(size)
        .bind(offset)
        .fetch_all(&state.db)
        .await?;

    // Load codes for label resolution
    let codes = sqlx::query_as::<_, CommonCode>(
        "SELECT * FROM common_codes WHERE group_code IN ('SIDO','CERT','USAGE') AND is_active = TRUE",
    )
    .fetch_all(&state.db)
    .await?;

    // Check favorites if authenticated
    let partner_ids: Vec<i64> = partners.iter().map(|p| p.id).collect();
    let favorited_ids: Vec<i64> = if let Some(ref auth) = auth {
        sqlx::query_as::<_, (i64,)>(
            "SELECT partner_id FROM favorites WHERE user_id = $1 AND partner_id = ANY($2)",
        )
        .bind(auth.user_id)
        .bind(&partner_ids)
        .fetch_all(&state.db)
        .await?
        .into_iter()
        .map(|r| r.0)
        .collect()
    } else {
        vec![]
    };

    let data: Vec<PartnerListItem> = partners
        .into_iter()
        .map(|p| {
            let rating_f64 = p.rating.unwrap_or(0.0);

            PartnerListItem {
                id: p.id,
                name: p.name,
                sido: resolve_code_label(&codes, "SIDO", p.sido_code.trim()),
                sigungu_code: p.sigungu_code,
                address: p.address,
                profile_image: p.profile_image_url,
                cover_image: p.cover_image_url,
                certs: p
                    .certs
                    .iter()
                    .map(|c| resolve_code_label(&codes, "CERT", c))
                    .collect(),
                usages: p
                    .usages
                    .iter()
                    .map(|u| resolve_code_label(&codes, "USAGE", u))
                    .collect(),
                portfolio_count: p.portfolio_count,
                review_count: p.review_count,
                rating: rating_f64,
                founded_year: p.founded_year,
                years: year - p.founded_year as i32,
                top_review_tags: p.top_review_tags,
                is_favorited: if auth.is_some() {
                    Some(favorited_ids.contains(&p.id))
                } else {
                    None
                },
            }
        })
        .collect();

    Ok(HttpResponse::Ok().json(PartnerListResponse {
        data,
        total: total.0,
        page,
        size,
    }))
}

// ── GET /api/partners/{id} ──

pub async fn get_partner(
    state: web::Data<AppState>,
    path: web::Path<i64>,
    req: HttpRequest,
) -> Result<HttpResponse, AppError> {
    let partner_id = path.into_inner();
    let auth = try_auth_user(&req);
    let year = current_year();

    let partner = sqlx::query_as::<_, Partner>("SELECT * FROM partners WHERE id = $1")
        .bind(partner_id)
        .fetch_optional(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound("Partner not found".to_string()))?;

    let codes = sqlx::query_as::<_, CommonCode>(
        "SELECT * FROM common_codes WHERE group_code IN ('SIDO','CERT','USAGE') AND is_active = TRUE",
    )
    .fetch_all(&state.db)
    .await?;

    // Portfolios
    let portfolios = sqlx::query_as::<_, Portfolio>(
        "SELECT * FROM portfolios WHERE partner_id = $1 ORDER BY display_order, created_at DESC",
    )
    .bind(partner_id)
    .fetch_all(&state.db)
    .await?;

    // Qualifications (approved only for public)
    let qualifications = sqlx::query_as::<_, Qualification>(
        "SELECT * FROM qualifications WHERE partner_id = $1 AND status = 'approved' ORDER BY requested_at",
    )
    .bind(partner_id)
    .fetch_all(&state.db)
    .await?;

    // Review tag summary
    let tag_summary = sqlx::query_as::<_, ReviewTagCount>(
        "SELECT rt.id, rt.label, COUNT(rts.id)::bigint as count
         FROM review_tags rt
         JOIN review_tag_selections rts ON rts.review_tag_id = rt.id
         JOIN reviews r ON r.id = rts.review_id AND r.partner_id = $1
         GROUP BY rt.id, rt.label
         ORDER BY count DESC",
    )
    .bind(partner_id)
    .fetch_all(&state.db)
    .await?;

    // Reviews (latest 10)
    let reviews = sqlx::query_as::<_, ReviewWithAuthor>(
        "SELECT r.*,
                CONCAT(LEFT(u.name, 1), REPEAT('*', GREATEST(LENGTH(u.name) - 1, 1))) as author_name,
                pf.title as portfolio_title
         FROM reviews r
         JOIN users u ON u.id = r.user_id
         LEFT JOIN portfolios pf ON pf.id = r.portfolio_id
         WHERE r.partner_id = $1
         ORDER BY r.created_at DESC
         LIMIT 10",
    )
    .bind(partner_id)
    .fetch_all(&state.db)
    .await?;

    // Review tags for each review
    let review_ids: Vec<i64> = reviews.iter().map(|r| r.id).collect();
    let review_tags = if !review_ids.is_empty() {
        sqlx::query_as::<_, ReviewTagLabel>(
            "SELECT rts.review_id, rt.label
             FROM review_tag_selections rts
             JOIN review_tags rt ON rt.id = rts.review_tag_id
             WHERE rts.review_id = ANY($1)",
        )
        .bind(&review_ids)
        .fetch_all(&state.db)
        .await?
    } else {
        vec![]
    };

    // Check favorite
    let is_favorited = if let Some(ref auth) = auth {
        let fav = sqlx::query_as::<_, (i64,)>(
            "SELECT id FROM favorites WHERE user_id = $1 AND partner_id = $2",
        )
        .bind(auth.user_id)
        .bind(partner_id)
        .fetch_optional(&state.db)
        .await?;
        Some(fav.is_some())
    } else {
        None
    };

    let rating_f64 = partner.rating.unwrap_or(0.0);

    let response = PartnerDetailResponse {
        brand_story_content: partner.brand_story_content.clone(),
        partner: PartnerDetail {
            id: partner.id,
            name: partner.name,
            sido: resolve_code_label(&codes, "SIDO", partner.sido_code.trim()),
            sigungu_code: partner.sigungu_code,
            address: partner.address,
            profile_image: partner.profile_image_url,
            cover_image: partner.cover_image_url,
            certs: partner
                .certs
                .iter()
                .map(|c| resolve_code_label(&codes, "CERT", c))
                .collect(),
            usages: partner
                .usages
                .iter()
                .map(|u| resolve_code_label(&codes, "USAGE", u))
                .collect(),
            founded_year: partner.founded_year,
            years: year - partner.founded_year as i32,
            ceo_name: partner.ceo_name,
            employee_count: partner.employee_count,
            phone: partner.phone,
            website_url: partner.website_url,
            intro: partner.intro,
            rating: rating_f64,
            review_count: partner.review_count,
            portfolio_count: partner.portfolio_count,
            is_favorited,
        },
        portfolios: portfolios
            .into_iter()
            .map(|pf| PortfolioSummary {
                id: pf.id,
                title: pf.title,
                thumbnail: pf.thumbnail_url,
                usage: resolve_code_label(&codes, "USAGE", &pf.usage_code),
                land_area: pf.land_area.map(|a| a),
                year: pf.completion_year,
                description: pf.intro,
            })
            .collect(),
        qualifications: qualifications
            .into_iter()
            .map(|q| QualificationItem {
                id: q.id,
                label: q.label,
                description: q.description,
                status: q.status,
            })
            .collect(),
        review_tag_summary: tag_summary,
        reviews: reviews
            .into_iter()
            .map(|r| {
                let tags: Vec<CodeLabel> = review_tags
                    .iter()
                    .filter(|t| t.review_id == r.id)
                    .map(|t| CodeLabel {
                        code: t.label.clone(),
                        label: t.label.clone(),
                    })
                    .collect();
                ReviewItem {
                    id: r.id,
                    author: r.author_name,
                    date: r.created_at.format("%Y-%m").to_string(),
                    rating: r.rating,
                    portfolio_id: r.portfolio_id,
                    portfolio_title: r.portfolio_title,
                    tags,
                    text: r.text,
                }
            })
            .collect(),
    };

    Ok(HttpResponse::Ok().json(response))
}

// ── GET /api/partners/{id}/portfolios/{portfolio_id} ──

#[derive(Deserialize)]
pub struct PortfolioPath {
    pub id: i64,
    pub portfolio_id: i64,
}

pub async fn get_portfolio(
    state: web::Data<AppState>,
    path: web::Path<PortfolioPath>,
) -> Result<HttpResponse, AppError> {
    let params = path.into_inner();

    let portfolio = sqlx::query_as::<_, Portfolio>(
        "SELECT * FROM portfolios WHERE id = $1 AND partner_id = $2",
    )
    .bind(params.portfolio_id)
    .bind(params.id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound("Portfolio not found".to_string()))?;

    let partner = sqlx::query_as::<_, (String,)>("SELECT name FROM partners WHERE id = $1")
        .bind(params.id)
        .fetch_one(&state.db)
        .await?;

    let images = sqlx::query_as::<_, PortfolioImage>(
        "SELECT * FROM portfolio_images WHERE portfolio_id = $1 ORDER BY display_order",
    )
    .bind(params.portfolio_id)
    .fetch_all(&state.db)
    .await?;

    let codes = sqlx::query_as::<_, CommonCode>(
        "SELECT * FROM common_codes WHERE group_code = 'USAGE' AND is_active = TRUE",
    )
    .fetch_all(&state.db)
    .await?;

    let response = PortfolioDetailResponse {
        id: portfolio.id,
        partner_id: portfolio.partner_id,
        partner_name: partner.0,
        title: portfolio.title,
        intro: portfolio.intro,
        hero_image: portfolio.hero_image_url,
        usage: resolve_code_label(&codes, "USAGE", &portfolio.usage_code),
        location: portfolio.location,
        completion_year: portfolio.completion_year,
        land_area: portfolio.land_area.map(|a| a),
        building_area: portfolio.building_area.map(|a| a),
        total_floor_area: portfolio.total_floor_area.map(|a| a),
        floors_above: portfolio.floors_above,
        floors_below: portfolio.floors_below,
        constructor_name: portfolio.constructor_name,
        construction_period_months: portfolio.construction_period_months,
        design_period_months: portfolio.design_period_months,
        images: images
            .into_iter()
            .map(|img| PortfolioImageItem {
                id: img.id,
                url: img.image_url,
                caption: img.caption,
            })
            .collect(),
    };

    Ok(HttpResponse::Ok().json(response))
}

// ── POST /api/partners/{id}/favorite ──

pub async fn toggle_favorite(
    state: web::Data<AppState>,
    path: web::Path<i64>,
    auth: AuthUser,
) -> Result<HttpResponse, AppError> {
    let partner_id = path.into_inner();

    // Check partner exists
    let _partner = sqlx::query_as::<_, (i64,)>("SELECT id FROM partners WHERE id = $1")
        .bind(partner_id)
        .fetch_optional(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound("Partner not found".to_string()))?;

    // Toggle
    let existing = sqlx::query_as::<_, (i64,)>(
        "SELECT id FROM favorites WHERE user_id = $1 AND partner_id = $2",
    )
    .bind(auth.user_id)
    .bind(partner_id)
    .fetch_optional(&state.db)
    .await?;

    let favorited = if let Some(fav) = existing {
        sqlx::query("DELETE FROM favorites WHERE id = $1")
            .bind(fav.0)
            .execute(&state.db)
            .await?;
        false
    } else {
        sqlx::query("INSERT INTO favorites (user_id, partner_id) VALUES ($1, $2)")
            .bind(auth.user_id)
            .bind(partner_id)
            .execute(&state.db)
            .await?;
        true
    };

    Ok(HttpResponse::Ok().json(serde_json::json!({ "favorited": favorited })))
}

// ── GET /api/partners/{id}/reviews ──

pub async fn list_reviews(
    state: web::Data<AppState>,
    path: web::Path<i64>,
    query: web::Query<ReviewListQuery>,
) -> Result<HttpResponse, AppError> {
    let partner_id = path.into_inner();
    let page = query.page.unwrap_or(1).max(1);
    let size = query.size.unwrap_or(10).clamp(1, 50);
    let offset = (page - 1) * size;

    let total: (i64,) = sqlx::query_as(
        "SELECT COUNT(*)::bigint FROM reviews WHERE partner_id = $1",
    )
    .bind(partner_id)
    .fetch_one(&state.db)
    .await?;

    let reviews = sqlx::query_as::<_, ReviewWithAuthor>(
        "SELECT r.*,
                CONCAT(LEFT(u.name, 1), REPEAT('*', GREATEST(LENGTH(u.name) - 1, 1))) as author_name,
                pf.title as portfolio_title
         FROM reviews r
         JOIN users u ON u.id = r.user_id
         LEFT JOIN portfolios pf ON pf.id = r.portfolio_id
         WHERE r.partner_id = $1
         ORDER BY r.created_at DESC
         LIMIT $2 OFFSET $3",
    )
    .bind(partner_id)
    .bind(size)
    .bind(offset)
    .fetch_all(&state.db)
    .await?;

    let review_ids: Vec<i64> = reviews.iter().map(|r| r.id).collect();
    let review_tags = if !review_ids.is_empty() {
        sqlx::query_as::<_, ReviewTagLabel>(
            "SELECT rts.review_id, rt.label
             FROM review_tag_selections rts
             JOIN review_tags rt ON rt.id = rts.review_tag_id
             WHERE rts.review_id = ANY($1)",
        )
        .bind(&review_ids)
        .fetch_all(&state.db)
        .await?
    } else {
        vec![]
    };

    let items: Vec<ReviewItem> = reviews
        .into_iter()
        .map(|r| {
            let tags: Vec<CodeLabel> = review_tags
                .iter()
                .filter(|t| t.review_id == r.id)
                .map(|t| CodeLabel {
                    code: t.label.clone(),
                    label: t.label.clone(),
                })
                .collect();
            ReviewItem {
                id: r.id,
                author: r.author_name,
                date: r.created_at.format("%Y-%m").to_string(),
                rating: r.rating,
                portfolio_id: r.portfolio_id,
                portfolio_title: r.portfolio_title,
                tags,
                text: r.text,
            }
        })
        .collect();

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "data": items,
        "total": total.0,
        "page": page,
        "size": size,
    })))
}
