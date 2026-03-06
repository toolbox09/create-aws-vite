use actix_web::{web, App, HttpServer};
use tracing_actix_web::TracingLogger;

mod config;
mod db;
mod errors;
mod models;
mod routes;

use config::AppConfig;

pub struct AppState {
    pub db: sqlx::PgPool,
    pub s3: aws_sdk_s3::Client,
    pub config: AppConfig,
}

#[actix_web::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();

    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new("info")),
        )
        .init();

    let config = AppConfig::from_env().await?;

    let db_pool = db::create_pool(&config.database_url).await?;

    // Run migrations from ./migrations directory (if any exist)
    let migrator = sqlx::migrate::Migrator::new(std::path::Path::new("./migrations")).await?;
    migrator.run(&db_pool).await?;

    let s3_client = create_s3_client(&config).await;

    let bind_addr = format!("{}:{}", config.server_host, config.server_port);
    tracing::info!("Starting server at http://{}", bind_addr);

    let app_state = web::Data::new(AppState {
        db: db_pool,
        s3: s3_client,
        config,
    });

    HttpServer::new(move || {
        App::new()
            .wrap(TracingLogger::default())
            .app_data(app_state.clone())
            .configure(routes::configure)
    })
    .bind(&bind_addr)?
    .run()
    .await?;

    Ok(())
}

async fn create_s3_client(config: &AppConfig) -> aws_sdk_s3::Client {
    if let Some(endpoint) = &config.s3_endpoint {
        // Local (MinIO): use explicit credentials and endpoint
        let access_key = std::env::var("AWS_ACCESS_KEY_ID").unwrap_or_default();
        let secret_key = std::env::var("AWS_SECRET_ACCESS_KEY").unwrap_or_default();

        let credentials = aws_credential_types::Credentials::new(
            &access_key,
            &secret_key,
            None,
            None,
            "env",
        );

        let s3_config = aws_sdk_s3::config::Builder::new()
            .behavior_version_latest()
            .endpoint_url(endpoint)
            .region(aws_sdk_s3::config::Region::new(config.s3_region.clone()))
            .credentials_provider(credentials)
            .force_path_style(true)
            .build();

        aws_sdk_s3::Client::from_conf(s3_config)
    } else {
        // AWS: use IAM role credentials
        let aws_config = aws_config::load_defaults(aws_config::BehaviorVersion::latest()).await;
        let s3_config = aws_sdk_s3::config::Builder::from(&aws_config)
            .region(aws_sdk_s3::config::Region::new(config.s3_region.clone()))
            .build();

        aws_sdk_s3::Client::from_conf(s3_config)
    }
}
