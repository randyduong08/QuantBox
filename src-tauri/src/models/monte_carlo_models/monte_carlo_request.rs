use crate::models::black_scholes_models::OptionType;
use chrono::NaiveDate;
use serde::Deserialize;

fn default_num_simulations() -> usize {
    100000
}

#[derive(Debug, Deserialize, Clone)]
pub struct MonteCarloRequest {
    pub spot_price: f64,
    pub strike_price: f64,
    pub time_to_expiry: f64,
    pub risk_free_rate: f64,
    pub volatility: f64,
    #[serde(default = "default_num_simulations")]
    pub num_simulations: usize,
}

#[derive(Debug, Deserialize)]
pub struct MonteCarloValidationRequest {
    pub symbol: String,
    pub strike_price: f64,
    pub expiry_date: NaiveDate,
    pub option_type: OptionType,
    pub num_simulations: Option<usize>,
}
