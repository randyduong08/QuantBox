use serde::{Serialize};

#[derive(Debug, Serialize)]
pub struct MonteCarloResponse {
    pub call_price: f64,
    pub put_price: f64,
    pub standard_error: f64,
    pub confidence_interval_95: (f64, f64),
    pub num_simulations: usize,
    pub computation_time_ms: u128,
}