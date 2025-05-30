#[derive(Debug)]
pub struct MonteCarloResult {
    pub call_price: f64,
    pub put_price: f64,
    pub standard_error: f64,
    pub confidence_interval_95: (f64, f64),
}