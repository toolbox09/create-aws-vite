use std::env;

#[derive(Debug, Clone)]
pub struct AppConfig {
    pub database_url: String,
    pub s3_endpoint: Option<String>,
    pub s3_bucket: String,
    pub s3_region: String,
    pub server_host: String,
    pub server_port: u16,
}

impl AppConfig {
    pub async fn from_env() -> anyhow::Result<Self> {
        let database_url = if let Ok(url) = env::var("DATABASE_URL") {
            url
        } else {
            // AWS environment: build URL from individual vars + Secrets Manager
            let host = env::var("DATABASE_HOST")?;
            let port = env::var("DATABASE_PORT").unwrap_or_else(|_| "5432".to_string());
            let name = env::var("DATABASE_NAME")?;
            let secret_arn = env::var("DATABASE_SECRET_ARN")?;

            let (username, password) = get_db_credentials(&secret_arn).await?;
            format!("postgres://{}:{}@{}:{}/{}", username, password, host, port, name)
        };

        Ok(Self {
            database_url,
            s3_endpoint: env::var("S3_ENDPOINT").ok(),
            s3_bucket: env::var("S3_BUCKET")?,
            s3_region: env::var("S3_REGION").unwrap_or_else(|_| "ap-northeast-1".to_string()),
            server_host: env::var("SERVER_HOST").unwrap_or_else(|_| "127.0.0.1".to_string()),
            server_port: env::var("SERVER_PORT")
                .unwrap_or_else(|_| "3000".to_string())
                .parse()?,
        })
    }
}

async fn get_db_credentials(secret_arn: &str) -> anyhow::Result<(String, String)> {
    let config = aws_config::load_defaults(aws_config::BehaviorVersion::latest()).await;
    let client = aws_sdk_secretsmanager::Client::new(&config);

    let resp = client
        .get_secret_value()
        .secret_id(secret_arn)
        .send()
        .await?;

    let secret_string = resp.secret_string().ok_or_else(|| {
        anyhow::anyhow!("No secret string found")
    })?;

    let secret: serde_json::Value = serde_json::from_str(secret_string)?;
    let username = secret["username"]
        .as_str()
        .unwrap_or("postgres")
        .to_string();
    let password = secret["password"]
        .as_str()
        .ok_or_else(|| anyhow::anyhow!("No password in secret"))?
        .to_string();

    Ok((username, password))
}
