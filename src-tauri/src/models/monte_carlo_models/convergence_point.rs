use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct ConvergencePoint {
    pub num_simulations: usize,
    pub call_price: f64,
    pub standard_error: f64,
    pub time_ms: u128,
}