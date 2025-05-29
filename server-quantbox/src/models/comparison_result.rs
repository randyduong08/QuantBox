use crate::models::{BlackScholesResult, MonteCarloResult};

#[derive(Debug)]
pub struct ComparisonResult {
    pub monte_carlo: MonteCarloResult,
    pub black_scholes: BlackScholesResult,
    pub call_price_diff: f64,
    pub put_price_diff: f64,
}