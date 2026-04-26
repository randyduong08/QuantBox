use crate::models::market_data_models::MarketDataError;
use reqwest::Client;
use serde::Deserialize;

pub struct PolygonProvider {
    client: Client,
    api_key: String,
    base_url: String,
}

impl PolygonProvider {
    pub fn new(api_key: String) -> Self {
        Self {
            client: Client::new(),
            api_key,
            base_url: "https://api.polygon.io".to_string(),
        }
    }

    // generic must be deserializable
    pub(crate) async fn make_request<T>(
        &self,
        endpoint: &str,
        params: &[(&str, String)],
    ) -> Result<T, MarketDataError>
    where
        T: for<'de> Deserialize<'de>,
    {
        let url: String = format!("{}{}", self.base_url, endpoint);
        self.make_request_url(&url, params).await
    }

    pub(crate) async fn make_request_url<T>(
        &self,
        url: &str,
        params: &[(&str, String)],
    ) -> Result<T, MarketDataError>
    where
        T: for<'de> Deserialize<'de>,
    {
        let mut query_params = Vec::new();
        if !url.to_ascii_lowercase().contains("apikey=") {
            query_params.push(("apikey", self.api_key.clone()));
        }
        query_params.extend_from_slice(params);

        let response = self.client.get(url).query(&query_params).send().await?;

        if response.status() == 429 {
            return Err(MarketDataError::RateLimited);
        }

        if response.status() == 403 {
            return Err(MarketDataError::Forbidden);
        }

        if !response.status().is_success() {
            return Err(MarketDataError::ApiError(format!(
                "API returned status: {}",
                response.status()
            )));
        }

        let json: T = response.json().await.map_err(|e| {
            println!("failed to parse JSON response: {:?}", e);
            MarketDataError::ParseError(e.to_string())
        })?;

        Ok(json)
    }
}
