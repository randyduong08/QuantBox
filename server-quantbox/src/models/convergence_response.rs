use serde::Serialize;
use crate::models::ConvergencePoint;

#[derive(Debug, Serialize)]
pub struct ConvergenceResponse {
    pub convergence_data: Vec<ConvergencePoint>,
    pub black_scholes_reference: f64,
    pub final_difference: f64,
}