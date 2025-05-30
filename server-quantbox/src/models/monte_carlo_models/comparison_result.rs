use crate::models::black_scholes_models::{BlackScholesResult};
use crate::models::monte_carlo_models::{MonteCarloResult};

#[derive(Debug)]
pub struct ComparisonResult {
    pub monte_carlo: MonteCarloResult,
    pub black_scholes: BlackScholesResult,
    pub call_price_diff: f64,
    pub put_price_diff: f64,
}