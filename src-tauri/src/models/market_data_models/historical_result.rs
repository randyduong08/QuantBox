use serde::Deserialize;

#[derive(Deserialize)]
pub struct HistoricalResult {
    #[serde(rename = "t")]
    pub(crate) timestamp: i64,
    #[serde(rename = "o")]
    pub(crate) open: f64,
    #[serde(rename = "h")]
    pub(crate) high: f64,
    #[serde(rename = "l")]
    pub(crate) low: f64,
    #[serde(rename = "c")]
    pub(crate) close: f64,
    #[serde(rename = "v")]
    pub(crate) volume: f64,
}
