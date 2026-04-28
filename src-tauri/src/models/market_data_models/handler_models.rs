use crate::models::market_data_models::{OptionsContract, StockQuote, VolatilitySurface};
use serde::{Deserialize, Serialize};

// structs related to market_data_handlers
#[derive(Debug, Deserialize)]
pub struct QuoteRequest {
    pub symbol: String,
}

#[derive(Debug, Deserialize)]
pub struct OptionsChainRequest {
    pub symbol: String,
    pub expiry: Option<String>, // YYYY-MM-DD format
}

#[derive(Debug, Deserialize)]
pub struct HistoricalRequest {
    pub symbol: String,
    pub from: String, // YYYY-MM-DD
    pub to: String,   // YYYY-MM-DD
}

#[derive(Debug, Deserialize)]
pub struct VolatilityAnalysisRequest {
    pub symbols: Vec<String>,
    pub lookback_days: Option<i32>,
}

#[derive(Debug, Serialize)]
pub struct QuoteResponse {
    pub quote: StockQuote,
    pub market_status: MarketStatus,
}

#[derive(Debug, Serialize)]
pub struct OptionsChainResponse {
    pub underlying_quote: StockQuote,
    pub options: Vec<OptionsContract>,
    pub chain_summary: OptionChainSummary,
}

#[derive(Debug, Serialize)]
pub struct OptionChainSummary {
    pub total_contracts: usize,
    pub expiry_dates: Vec<String>,
    pub strike_range: (f64, f64),
    pub avg_implied_vol: Option<f64>,
}

#[derive(Debug, Serialize)]
pub struct VolatilityAnalysisResponse {
    pub surfaces: Vec<VolatilitySurface>,
    pub comparison: VolatilityComparison,
}

#[derive(Debug, Serialize)]
pub struct VolatilityComparison {
    pub realized_vs_implied: Vec<VolatilityComparison>,
    pub arbitrage_opportunities: Vec<ArbitrageOpportunity>,
}

#[derive(Debug, Serialize)]
pub struct ArbitrageOpportunity {
    pub symbol: String,
    pub option_symbol: String,
    pub strategy: String,
    pub expected_profit: f64,
    pub confidence: f64,
}

#[derive(Debug, Serialize)]
pub enum MarketStatus {
    Open,
    Closed,
    PreMarket,
    AfterHours,
}
