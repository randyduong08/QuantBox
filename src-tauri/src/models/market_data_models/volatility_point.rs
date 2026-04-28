use crate::models::black_scholes_models::OptionType;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct VolatilityPoint {
    pub strike: f64,
    pub expiry_days: i32,
    pub implied_volatility: f64,
    pub option_type: OptionType,
}
