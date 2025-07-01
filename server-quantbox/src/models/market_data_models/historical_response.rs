use crate::models::market_data_models::HistoricalResult;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct HistoricalResponse {
    pub(crate) results: Option<Vec<HistoricalResult>>,
    pub(crate) status: String,
}
