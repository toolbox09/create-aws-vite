use std::env;

#[derive(Debug, Clone)]
pub struct AppConfig {
    pub database_url: String,
    pub s3_endpoint: Option<String>,
    pub s3_bucket: String,
    pub s3_region: String,
    pub server_host: String,
    pub server_port: u16,
    // Proxy configs
    pub valuemap_auth: Option<String>,
    pub ucansign_api_key: Option<String>,
    pub sendbird_token: Option<String>,
    pub sendbird_base_url: Option<String>,
    pub buildit_auth: Option<String>,
    pub buildit_base_url: Option<String>,
    // GinPlus config
    pub ginplus_base_url: String,
    pub ginplus_api_key: String,
    pub ginplus_company_name: String,
    // Prom config
    pub prom_base_url: String,
    // JWT config
    pub jwt_secret: String,
    pub jwt_access_expires_secs: i64,
    pub jwt_refresh_expires_secs: i64,
    // OAuth config
    pub naver_client_id: String,
    pub naver_client_secret: String,
    pub kakao_client_id: String,
    pub kakao_client_secret: String,
    pub oauth_redirect_base: String,
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
            // Proxy configs
            valuemap_auth: env::var("VALUEMAP_AUTH").ok(),
            ucansign_api_key: env::var("UCANSIGN_API_KEY").ok(),
            sendbird_token: env::var("SENDBIRD_TOKEN").ok(),
            sendbird_base_url: env::var("SENDBIRD_BASE_URL").ok(),
            buildit_auth: env::var("BUILDIT_AUTH").ok(),
            buildit_base_url: env::var("BUILDIT_BASE_URL").ok(),
            // GinPlus
            ginplus_base_url: env::var("GINPLUS_BASE_URL")
                .unwrap_or_else(|_| "https://aptgin.com/ginapi".to_string()),
            ginplus_api_key: env::var("GINPLUS_API_KEY")
                .unwrap_or_else(|_| "0f0c0b5d32bb7f2d1011d58ac254b57eba8be3997430fde3891175c1a3194ede".to_string()),
            ginplus_company_name: env::var("GINPLUS_COMPANY_NAME")
                .unwrap_or_else(|_| "ConMarket".to_string()),
            // Prom
            prom_base_url: env::var("PROM_BASE_URL")
                .unwrap_or_else(|_| "https://www.prom.space/api".to_string()),
            // JWT
            jwt_secret: env::var("JWT_SECRET")
                .unwrap_or_else(|_| "dev-secret-change-in-production".to_string()),
            jwt_access_expires_secs: env::var("JWT_ACCESS_EXPIRES")
                .unwrap_or_else(|_| "900".to_string())
                .parse()
                .unwrap_or(900),
            jwt_refresh_expires_secs: env::var("JWT_REFRESH_EXPIRES")
                .unwrap_or_else(|_| "604800".to_string())
                .parse()
                .unwrap_or(604800),
            // OAuth
            naver_client_id: env::var("NAVER_CLIENT_ID")
                .unwrap_or_else(|_| "rILllSdCxTC5Dq8EgO9Q".to_string()),
            naver_client_secret: env::var("NAVER_CLIENT_SECRET")
                .unwrap_or_else(|_| "EmYbLZFiNN".to_string()),
            kakao_client_id: env::var("KAKAO_CLIENT_ID")
                .unwrap_or_else(|_| "40a4bb737719671939c786ad4375e91a".to_string()),
            kakao_client_secret: env::var("KAKAO_CLIENT_SECRET")
                .unwrap_or_else(|_| "uOzQfyBvsx6F1YlYz9U9lGizOKrZVnpu".to_string()),
            oauth_redirect_base: env::var("OAUTH_REDIRECT_BASE")
                .unwrap_or_else(|_| "http://localhost:5173".to_string()),
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
