use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct BlackScholesRequest {
    pub spot_price: f64,
    pub strike_price: f64,
    pub risk_free_rate: f64,
    pub volatility: f64,
    pub time_to_maturity: f64,
}

