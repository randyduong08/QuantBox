use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct BlackScholesResult {
    pub call_price: f64,
    pub put_price: f64,
}