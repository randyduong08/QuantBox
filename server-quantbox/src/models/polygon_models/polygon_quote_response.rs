use crate::models::polygon_models::PolygonOption;
use crate::models::polygon_models::PolygonQuote;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct PolygonQuoteResponse {
    pub(crate) ticker: String,
    #[serde(rename = "queryCount")]
    pub(crate) query_count: i32,
    #[serde(rename = "resultsCount")]
    pub results_count: i32,
    pub(crate) adjusted: bool,
    pub(crate) results: Vec<PolygonQuote>,
    pub(crate) status: String,
    pub(crate) request_id: String,
    pub count: i32,
}

#[derive(Deserialize)]
struct PolygonOptionsResponse {
    results: Option<Vec<PolygonOption>>,
    status: String,
}
