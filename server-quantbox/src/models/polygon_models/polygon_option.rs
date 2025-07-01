use crate::models::polygon_models::PolygonOptionQuote;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct PolygonOption {
    #[serde(rename = "ticker")]
    pub(crate) symbol: String,
    #[serde(rename = "underlying_ticker")]
    pub(crate) underlying_symbol: String,
    #[serde(rename = "strike_price")]
    pub(crate) strike_price: f64,
    #[serde(rename = "expiration_date")]
    pub(crate) expiration_date: String,
    #[serde(rename = "contract_type")]
    pub(crate) contract_type: String,
    #[serde(rename = "last_quote")]
    pub(crate) last_quote: Option<PolygonOptionQuote>,
    #[serde(rename = "implied_volatility")]
    pub(crate) implied_volatility: Option<f64>,
    #[serde(rename = "delta")]
    pub(crate) delta: Option<f64>,
    #[serde(rename = "gamma")]
    pub(crate) gamma: Option<f64>,
    #[serde(rename = "theta")]
    pub(crate) theta: Option<f64>,
    #[serde(rename = "vega")]
    pub(crate) vega: Option<f64>,
}
