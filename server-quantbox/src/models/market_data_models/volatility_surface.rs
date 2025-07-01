use crate::models::market_data_models::VolatilityPoint;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct VolatilitySurface {
    pub underlying_symbol: String,
    pub spot_price: f64,
    pub risk_free_rate: f64,
    pub dividend_yield: f64,
    pub surface_date: DateTime<Utc>,
    pub points: Vec<VolatilityPoint>,
}
