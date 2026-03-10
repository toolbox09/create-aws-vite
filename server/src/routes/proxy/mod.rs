pub mod valuemap;
pub mod sendbird;
pub mod buildit;
pub mod ucansign;

use actix_web::web;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/proxy")
            .route("/valuemap/{path:.*}", web::to(valuemap::proxy_valuemap))
            .route("/sendbird/{path:.*}", web::to(sendbird::proxy_sendbird))
            .route("/buildit/{path:.*}", web::to(buildit::proxy_buildit))
            .route("/ucansign/{path:.*}", web::to(ucansign::proxy_ucansign)),
    );
}
