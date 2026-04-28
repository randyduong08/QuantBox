use crate::market_integration::polygon_provider::PolygonProvider;
use crate::models::market_data_models::{
    MarketDataError, MarketStatus, OptionChainSummary, OptionsChainResponse, OptionsContract,
    QuoteResponse, StockQuote, VolatilitySurface,
};
use crate::services::MarketDataService;
use chrono::{NaiveDate, Timelike, Utc};

#[tauri::command]
pub async fn get_market_quote(symbol: String) -> Result<QuoteResponse, String> {
    let mut service = market_data_service()?;
    let quote = service
        .get_quote_cached(&symbol.to_uppercase())
        .await
        .map_err(format_market_data_error)?;

    Ok(QuoteResponse {
        quote,
        market_status: determine_market_status(),
    })
}

#[tauri::command]
pub async fn get_options_chain(
    symbol: String,
    expiry: Option<String>,
) -> Result<OptionsChainResponse, String> {
    let normalized_symbol = symbol.to_uppercase();
    let expiry_date = parse_expiry(expiry)?;
    let mut service = market_data_service()?;

    let quote: StockQuote = service
        .get_quote_cached(&normalized_symbol)
        .await
        .map_err(format_market_data_error)?;
    let options: Vec<OptionsContract> = service
        .get_options_chain(&normalized_symbol, expiry_date)
        .await
        .map_err(format_market_data_error)?;

    Ok(OptionsChainResponse {
        underlying_quote: quote,
        chain_summary: build_chain_summary(&options),
        options,
    })
}

#[tauri::command]
pub async fn get_volatility_surface(symbol: String) -> Result<VolatilitySurface, String> {
    let mut service = market_data_service()?;
    service
        .build_volatility_surface(&symbol.to_uppercase())
        .await
        .map_err(format_market_data_error)
}

fn market_data_service() -> Result<MarketDataService, String> {
    let api_key = std::env::var("POLYGON_API_KEY")
        .map_err(|_| "Polygon API key is not configured. Set POLYGON_API_KEY before launching QuantBox.".to_string())?;

    Ok(MarketDataService::new(Box::new(PolygonProvider::new(api_key))))
}

fn parse_expiry(expiry: Option<String>) -> Result<Option<NaiveDate>, String> {
    expiry
        .filter(|value| !value.trim().is_empty())
        .map(|value| {
            NaiveDate::parse_from_str(&value, "%Y-%m-%d")
                .map_err(|_| "Expiry must use YYYY-MM-DD format.".to_string())
        })
        .transpose()
}

fn determine_market_status() -> MarketStatus {
    let hour = Utc::now().hour();

    match hour {
        14..=20 => MarketStatus::Open,
        12..=13 => MarketStatus::PreMarket,
        21..=23 | 0..=8 => MarketStatus::AfterHours,
        _ => MarketStatus::Closed,
    }
}

fn build_chain_summary(options: &[OptionsContract]) -> OptionChainSummary {
    let total_contracts = options.len();
    let mut expiry_dates: Vec<String> = options
        .iter()
        .map(|opt| opt.expiration_date.format("%Y-%m-%d").to_string())
        .collect();
    expiry_dates.sort();
    expiry_dates.dedup();

    let strikes: Vec<f64> = options.iter().map(|opt| opt.strike_price).collect();
    let strike_range = if strikes.is_empty() {
        (0.0, 0.0)
    } else {
        let min = strikes
            .iter()
            .copied()
            .fold(f64::INFINITY, |current, value| current.min(value));
        let max = strikes
            .iter()
            .copied()
            .fold(f64::NEG_INFINITY, |current, value| current.max(value));
        (min, max)
    };

    let vols: Vec<f64> = options
        .iter()
        .filter_map(|opt| opt.implied_volatility)
        .collect();
    let avg_implied_vol = if vols.is_empty() {
        None
    } else {
        Some(vols.iter().sum::<f64>() / vols.len() as f64)
    };

    OptionChainSummary {
        total_contracts,
        expiry_dates,
        strike_range,
        avg_implied_vol,
    }
}

fn format_market_data_error(error: MarketDataError) -> String {
    match error {
        MarketDataError::ApiError(message) => message,
        MarketDataError::Forbidden => "Polygon API key does not have access to this endpoint.".to_string(),
        MarketDataError::RateLimited => "Polygon API rate limit exceeded.".to_string(),
        MarketDataError::InvalidSymbol => "Invalid or unsupported symbol.".to_string(),
        MarketDataError::NetworkError(error) => error.to_string(),
        MarketDataError::ParseError(message) => message,
    }
}
