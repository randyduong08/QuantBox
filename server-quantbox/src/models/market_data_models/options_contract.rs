use crate::models::black_scholes_models::OptionType;
use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OptionsContract {
    pub symbol: String,
    pub underlying_symbol: String,
    pub strike_price: f64,
    pub expiration_date: NaiveDate,
    pub option_type: OptionType,
    pub bid: Option<f64>,
    pub ask: Option<f64>,
    pub last_price: Option<f64>,
    pub volume: Option<i64>,
    pub open_interest: Option<i64>,
    pub implied_volatility: Option<f64>,
    pub delta: Option<f64>,
    pub gamma: Option<f64>,
    pub theta: Option<f64>,
    pub vega: Option<f64>,
    pub updated_at: DateTime<Utc>,
}
