use reqwest::Client;
use serde_json::Value;

pub struct GinPlusService {
    client: Client,
    base_url: String,
    api_key: String,
    company_name: String,
}

impl GinPlusService {
    pub fn new(base_url: String, api_key: String, company_name: String) -> Self {
        Self {
            client: Client::builder()
                .timeout(std::time::Duration::from_secs(15))
                .build()
                .unwrap(),
            base_url,
            api_key,
            company_name,
        }
    }

    /// Generic GET request — appends key/companyNm and forwards all query params
    pub async fn get(
        &self,
        path: &str,
        extra_params: &[(String, String)],
    ) -> Result<Value, reqwest::Error> {
        let url = format!(
            "{}/{}",
            self.base_url.trim_end_matches('/'),
            path.trim_start_matches('/')
        );

        let mut params = vec![
            ("key".to_string(), self.api_key.clone()),
            ("companyNm".to_string(), self.company_name.clone()),
        ];
        params.extend(extra_params.iter().cloned());

        let resp = self.client.get(&url).query(&params).send().await?;
        resp.json::<Value>().await
    }

    /// Generic POST request — appends key/companyNm as query params, body as JSON
    pub async fn post(
        &self,
        path: &str,
        body: &Value,
    ) -> Result<Value, reqwest::Error> {
        let url = format!(
            "{}/{}",
            self.base_url.trim_end_matches('/'),
            path.trim_start_matches('/')
        );

        let params = [
            ("key", self.api_key.as_str()),
            ("companyNm", self.company_name.as_str()),
        ];

        let resp = self
            .client
            .post(&url)
            .query(&params)
            .json(body)
            .send()
            .await?;
        resp.json::<Value>().await
    }
}
