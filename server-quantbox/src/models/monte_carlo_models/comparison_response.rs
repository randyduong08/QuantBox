use serde::Serialize;
use crate::models::monte_carlo_models::{MonteCarloResponse, PriceDifferences};
use crate::models::black_scholes_models::{BlackScholesResult};

#[derive(Debug, Serialize)]
pub struct ComparisonResponse {
    pub monte_carlo: MonteCarloResponse,
    pub black_scholes: BlackScholesResult,
    pub differences: PriceDifferences,
}