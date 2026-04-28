use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct PolygonOptionSnapshot {
    pub(crate) details: PolygonOptionDetails,
    pub(crate) day: Option<PolygonOptionDay>,
    pub(crate) greeks: Option<PolygonOptionGreeks>,
    pub(crate) implied_volatility: Option<f64>,
    pub(crate) last_quote: Option<PolygonSnapshotQuote>,
    pub(crate) last_trade: Option<PolygonSnapshotTrade>,
    pub(crate) open_interest: Option<i64>,
    pub(crate) underlying_asset: Option<PolygonUnderlyingAsset>,
}

#[derive(Debug, Deserialize)]
pub struct PolygonOptionDetails {
    pub(crate) contract_type: String,
    pub(crate) expiration_date: String,
    pub(crate) strike_price: f64,
    pub(crate) ticker: String,
}

#[derive(Debug, Deserialize)]
pub struct PolygonOptionDay {
    pub(crate) volume: Option<f64>,
}

#[derive(Debug, Deserialize)]
pub struct PolygonOptionGreeks {
    pub(crate) delta: Option<f64>,
    pub(crate) gamma: Option<f64>,
    pub(crate) theta: Option<f64>,
    pub(crate) vega: Option<f64>,
}

#[derive(Debug, Deserialize)]
pub struct PolygonSnapshotQuote {
    pub(crate) ask: Option<f64>,
    pub(crate) bid: Option<f64>,
}

#[derive(Debug, Deserialize)]
pub struct PolygonSnapshotTrade {
    pub(crate) price: Option<f64>,
}

#[derive(Debug, Deserialize)]
pub struct PolygonUnderlyingAsset {
    pub(crate) price: Option<f64>,
    pub(crate) ticker: Option<String>,
}
