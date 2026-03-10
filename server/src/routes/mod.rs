mod admin;
mod auth;
mod files;
mod ginplus;
mod health;
mod oauth;
mod partners;
mod prom;
mod proxy;
mod users;

use actix_web::web;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api")
            .route("/health", web::get().to(health::health_check))
            // Auth
            .route("/auth/signup", web::post().to(auth::signup))
            .route("/auth/signup/social", web::post().to(auth::signup_social))
            .route("/auth/login", web::post().to(auth::login))
            .route("/auth/logout", web::post().to(auth::logout))
            .route("/auth/refresh", web::post().to(auth::refresh))
            .route("/auth/me", web::get().to(auth::me))
            .route("/auth/password-find", web::post().to(auth::password_find))
            .route("/auth/password-reset", web::post().to(auth::password_reset))
            .route("/auth/check-email", web::get().to(auth::check_email))
            // OAuth
            .route("/auth/oauth/naver", web::get().to(oauth::naver_start))
            .route("/auth/oauth/naver/callback", web::get().to(oauth::naver_callback))
            .route("/auth/oauth/kakao", web::get().to(oauth::kakao_start))
            .route("/auth/oauth/kakao/callback", web::get().to(oauth::kakao_callback))
            // Users
            .route("/users/me", web::get().to(users::get_me))
            .route("/users/me", web::patch().to(users::update_me))
            .route("/users/me/password", web::patch().to(users::change_password))
            .route("/users/me", web::delete().to(users::withdraw))
            .route("/users/me/interests", web::get().to(users::get_interests))
            .route("/users/me/interests", web::patch().to(users::update_interests))
            .route("/users/me/notifications", web::get().to(users::get_notifications))
            .route("/users/me/notifications", web::patch().to(users::update_notifications))
            .route("/users/me/preferences", web::get().to(users::get_preferences))
            .route("/users/me/preferences", web::patch().to(users::update_preferences))
            // Admin
            .route("/admin/members", web::get().to(admin::list_members))
            .route("/admin/members/{id}", web::get().to(admin::get_member))
            .route("/admin/members/{id}/status", web::patch().to(admin::update_member_status))
            // Files
            .route("/files", web::get().to(files::list_files))
            .route("/files", web::post().to(files::init_upload))
            .route("/files/cleanup", web::post().to(files::cleanup_stale))
            .route("/files/{id}", web::get().to(files::download_file))
            .route("/files/{id}", web::delete().to(files::delete_file))
            .route("/files/{id}/confirm", web::patch().to(files::confirm_upload))
            // Codes
            .route("/codes", web::get().to(partners::get_codes))
            // Partners
            .route("/partners", web::get().to(partners::list_partners))
            .route("/partners/{id}", web::get().to(partners::get_partner))
            .route("/partners/{id}/favorite", web::post().to(partners::toggle_favorite))
            .route("/partners/{id}/reviews", web::get().to(partners::list_reviews))
            .route("/partners/{id}/portfolios/{portfolio_id}", web::get().to(partners::get_portfolio))
            // GinPlus (map data)
            .route("/ginplus/{path:.*}", web::get().to(ginplus::ginplus_get))
            .route("/ginplus/{path:.*}", web::post().to(ginplus::ginplus_post))
            // Prom (cadastral data)
            .route("/prom/{path:.*}", web::get().to(prom::prom_get))
            .route("/prom/{path:.*}", web::post().to(prom::prom_post))
            // Proxy (external service pass-through)
            .configure(proxy::configure),
    );
}
