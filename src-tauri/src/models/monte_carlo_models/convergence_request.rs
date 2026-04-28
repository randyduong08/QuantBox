use serde::Deserialize;

fn default_max_simulations() -> usize { 10_000_000 }

fn default_step_size() -> usize { 500_000 }

#[derive(Debug, Deserialize)]
pub struct ConvergenceRequest {
    pub spot_price: f64,
    pub strike_price: f64,
    pub time_to_expiry: f64,
    pub risk_free_rate: f64,
    pub volatility: f64,
    #[serde(default = "default_max_simulations")]
    pub max_simulations: usize,
    #[serde(default = "default_step_size")]
    pub step_size: usize,
}