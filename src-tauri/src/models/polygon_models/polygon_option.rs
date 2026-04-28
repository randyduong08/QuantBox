use serde::Deserialize;

#[derive(Debug, Deserialize)]
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
}
