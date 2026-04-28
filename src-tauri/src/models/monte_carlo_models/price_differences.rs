use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct PriceDifferences {
    pub call_price_diff: f64,
    pub put_price_diff: f64,
    pub call_price_diff_percent: f64,
    pub put_price_diff_percent: f64,
}
