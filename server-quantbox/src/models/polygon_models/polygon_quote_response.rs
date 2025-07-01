use crate::models::polygon_models::PolygonOption;
use crate::models::polygon_models::PolygonQuote;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct PolygonQuoteResponse {
    pub(crate) results: Option<PolygonQuote>,
    status: String,
}

#[derive(Deserialize)]
struct PolygonOptionsResponse {
    results: Option<Vec<PolygonOption>>,
    status: String,
}
