use crate::models::polygon_models::PolygonQuote;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct PolygonQuoteResponse {
    pub(crate) ticker: String,
    #[serde(rename = "queryCount")]
    pub(crate) query_count: Option<i32>,
    #[serde(rename = "resultsCount")]
    pub results_count: Option<i32>,
    pub(crate) adjusted: Option<bool>,
    #[serde(default)]
    pub(crate) results: Vec<PolygonQuote>,
    pub(crate) status: String,
    pub(crate) request_id: Option<String>,
    pub count: Option<i32>,
}
