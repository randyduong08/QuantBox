use crate::models::market_data_models::MarketDataSnapshot;
use crate::models::monte_carlo_models::MonteCarloResult;
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct MonteCarloResponse {
    pub call_price: f64,
    pub put_price: f64,
    pub standard_error: f64,
    pub confidence_interval_95: (f64, f64),
    pub num_simulations: usize,
    pub computation_time_ms: u128,
}

#[derive(Debug, Serialize)]
pub struct MonteCarloValidationResponse {
    pub market_price: Option<f64>,
    pub monte_carlo_price: f64,
    pub implied_volatility: Option<f64>,
    pub price_difference: Option<f64>,
    pub percentage_difference: Option<f64>,
    pub monte_carlo_result: MonteCarloResult,
    pub market_data: MarketDataSnapshot,
}
