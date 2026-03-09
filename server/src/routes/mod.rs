mod files;
mod health;

use actix_web::web;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api")
            .route("/health", web::get().to(health::health_check))
            // Files
            .route("/files", web::get().to(files::list_files))
            .route("/files", web::post().to(files::init_upload))
            .route("/files/cleanup", web::post().to(files::cleanup_stale))
            .route("/files/{id}", web::get().to(files::download_file))
            .route("/files/{id}", web::delete().to(files::delete_file))
            .route("/files/{id}/confirm", web::patch().to(files::confirm_upload)),
    );
}
