use reqwest::Client;
use serde_json::Value;

pub struct PromService {
    client: Client,
    base_url: String,
}

impl PromService {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::builder()
                .timeout(std::time::Duration::from_secs(15))
                .build()
                .unwrap(),
            base_url,
        }
    }

    /// Generic POST request (most Prom endpoints use POST)
    pub async fn post(&self, path: &str, body: &Value) -> Result<Value, reqwest::Error> {
        let url = format!(
            "{}/{}",
            self.base_url.trim_end_matches('/'),
            path.trim_start_matches('/')
        );

        let resp = self.client.post(&url).json(body).send().await?;
        resp.json::<Value>().await
    }

    /// Generic GET request
    pub async fn get(
        &self,
        path: &str,
        params: &[(String, String)],
    ) -> Result<Value, reqwest::Error> {
        let url = format!(
            "{}/{}",
            self.base_url.trim_end_matches('/'),
            path.trim_start_matches('/')
        );

        let resp = self.client.get(&url).query(params).send().await?;
        resp.json::<Value>().await
    }
}
