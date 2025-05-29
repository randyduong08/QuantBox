use serde::Serialize;
use crate::models::{BlackScholesResult, MonteCarloResponse, PriceDifferences};

#[derive(Debug, Serialize)]
pub struct ComparisonResponse {
    pub monte_carlo: MonteCarloResponse,
    pub black_scholes: BlackScholesResult,
    pub differences: PriceDifferences,
}