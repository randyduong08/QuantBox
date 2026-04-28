use serde::Deserialize;

#[derive(Deserialize, Debug)]
pub struct PolygonQuote {
    #[serde(rename = "T")]
    pub symbol: String,
    #[serde(rename = "c")]
    pub close: f64,
    #[serde(rename = "h")]
    pub high: f64,
    #[serde(rename = "l")]
    pub low: f64,
    #[serde(rename = "o")]
    pub open: f64,
    #[serde(rename = "v")]
    pub volume: f64,
    #[serde(rename = "vw")]
    pub volume_weighted: f64,
    #[serde(rename = "t")]
    pub timestamp: i64,
    #[serde(rename = "n")]
    pub transactions: i32,
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
