use crate::models::market_data_models::{OptionsContract, StockQuote};
use chrono::{DateTime, Utc};
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct MarketDataSnapshot {
    pub quote: StockQuote,
    pub option: OptionsContract,
    pub timestamp: DateTime<Utc>,
}
