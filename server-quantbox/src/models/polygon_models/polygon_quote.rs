use serde::Deserialize;

#[derive(Deserialize)]
pub struct PolygonQuote {
    #[serde(rename = "T")]
    pub symbol: String,
    #[serde(rename = "c")]
    pub close: Option<f64>,
    #[serde(rename = "h")]
    pub high: Option<f64>,
    #[serde(rename = "l")]
    pub low: Option<f64>,
    #[serde(rename = "v")]
    pub volume: Option<f64>,
    #[serde(rename = "t")]
    pub timestamp: Option<i64>,
}

#[derive(Deserialize)]
pub struct PolygonOptionQuote {
    #[serde(rename = "bid")]
    pub bid: Option<f64>,
    #[serde(rename = "ask")]
    pub ask: Option<f64>,
    #[serde(rename = "last")]
    pub last: Option<f64>,
}
