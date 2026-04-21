use crate::compute::monte_carlo_engine::MonteCarloEngine;
use crate::models::black_scholes_models::OptionType;
use crate::models::market_data_models::{
    ArbitrageOpportunity, HistoricalBar, MarketDataError, MarketDataSnapshot, MarketStatus,
    OptionChainSummary, OptionsChainResponse, OptionsContract, QuoteResponse, StockQuote,
    VolatilityAnalysisRequest, VolatilityAnalysisResponse, VolatilityComparison, VolatilitySurface,
};
use crate::models::monte_carlo_models::{
    MonteCarloRequest, MonteCarloResult, MonteCarloValidationRequest, MonteCarloValidationResponse,
};
use crate::services::MarketDataService;
use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::Json,
};
use chrono::{DateTime, NaiveDate, Utc};
use std::collections::HashMap;
use std::option::Option;
use std::sync::Arc;
use tokio::sync::{Mutex, MutexGuard};

// app state
#[derive(Clone)]
pub struct AppState {
    pub market_data_service: Arc<Mutex<MarketDataService>>,
}

pub async fn get_quote(
    State(state): State<AppState>,
    Path(symbol): Path<String>,
) -> Result<Json<QuoteResponse>, StatusCode> {
    let mut service = state.market_data_service.lock().await;

    match service.get_quote_cached(&symbol.to_uppercase()).await {
        Ok(quote) => {
            let market_status: MarketStatus = determine_market_status();
            Ok(Json(QuoteResponse {
                quote,
                market_status,
            }))
        }
        Err(MarketDataError::InvalidSymbol) => Err(StatusCode::NOT_FOUND),
        Err(MarketDataError::RateLimited) => Err(StatusCode::TOO_MANY_REQUESTS),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

// TODO -- CHECK TO SEE IF THIS WORKS | ENDPOINT RETURNING STUFF, BUT GREEKS ARE NULL ATM -- CHECK POLYGON DOCUMENTATION
pub async fn get_options_chain(
    State(state): State<AppState>,
    Path(symbol): Path<String>,
    Query(params): Query<HashMap<String, String>>,
) -> Result<Json<OptionsChainResponse>, StatusCode> {
    let mut service = state.market_data_service.lock().await;

    let expiry_date = params
        .get("expiry")
        .and_then(|date_str| NaiveDate::parse_from_str(date_str, "%Y-%m-%d").ok());

    let quote_result: Result<StockQuote, MarketDataError> =
        service.get_quote_cached(&symbol.to_uppercase()).await;
    // TODO -- abstract away provider.get_options_chain, so we don't have to keep provider public
    let options_result: Result<Vec<OptionsContract>, MarketDataError> = service
        .provider
        .get_options_chain(&symbol.to_uppercase(), expiry_date)
        .await;

    match (quote_result, options_result) {
        (Ok(quote), Ok(options)) => {
            let chain_summary: OptionChainSummary = build_chain_summary(&options);
            Ok(Json(OptionsChainResponse {
                underlying_quote: quote,
                options,
                chain_summary,
            }))
        }
        (Err(MarketDataError::InvalidSymbol), _) | (_, Err(MarketDataError::InvalidSymbol)) => {
            Err(StatusCode::NOT_FOUND)
        }
        (Err(MarketDataError::RateLimited), _) | (_, Err(MarketDataError::RateLimited)) => {
            Err(StatusCode::TOO_MANY_REQUESTS)
        }
        _ => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

// TODO -- LOOKS GOOD FROM THE RESPONSE SO FAR...
pub async fn get_historical_data(
    State(state): State<AppState>,
    Path(symbol): Path<String>,
    Query(params): Query<HashMap<String, String>>,
) -> Result<Json<Vec<HistoricalBar>>, StatusCode> {
    let service: MutexGuard<MarketDataService> = state.market_data_service.lock().await;

    let from_date: NaiveDate = params
        .get("from")
        .and_then(|date_str| NaiveDate::parse_from_str(date_str, "%Y-%m-%d").ok())
        .unwrap_or_else(|| Utc::now().date_naive() - chrono::Duration::days(30));

    let to_date: NaiveDate = params
        .get("to")
        .and_then(|date_str| NaiveDate::parse_from_str(date_str, "%Y-%m-%d").ok())
        .unwrap_or_else(|| Utc::now().date_naive());

    match service
        .provider
        .get_historical_data(&symbol.to_uppercase(), from_date, to_date)
        .await
    {
        Ok(bars) => Ok(Json(bars)),
        Err(MarketDataError::InvalidSymbol) => Err(StatusCode::NOT_FOUND),
        Err(MarketDataError::RateLimited) => Err(StatusCode::TOO_MANY_REQUESTS),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

// TODO -- CHECK TO SEE IF THIS IS WORKING
pub async fn build_volatility_surface(
    State(state): State<AppState>,
    Path(symbol): Path<String>,
) -> Result<Json<VolatilitySurface>, StatusCode> {
    let mut service: MutexGuard<MarketDataService> = state.market_data_service.lock().await;

    match service
        .build_volatility_surface(&symbol.to_uppercase())
        .await
    {
        Ok(surface) => Ok(Json(surface)),
        Err(MarketDataError::InvalidSymbol) => Err(StatusCode::NOT_FOUND),
        Err(MarketDataError::RateLimited) => Err(StatusCode::TOO_MANY_REQUESTS),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

pub async fn analyze_volatility_arbitrage(
    State(state): State<AppState>,
    Json(request): Json<VolatilityAnalysisRequest>,
) -> Result<Json<VolatilityAnalysisResponse>, StatusCode> {
    let mut service: MutexGuard<MarketDataService> = state.market_data_service.lock().await;
    let mut surfaces: Vec<VolatilitySurface> = Vec::new();

    for symbol in &request.symbols {
        match service.build_volatility_surface(symbol).await {
            Ok(surface) => surfaces.push(surface),
            Err(_) => continue,
        }
    }

    let arbitrage_opportunities: Vec<ArbitrageOpportunity> =
        find_arbitrage_opportunities(&surfaces);

    let comparison = VolatilityComparison {
        realized_vs_implied: Vec::new(), // TODO -- implement realized vol comparison
        arbitrage_opportunities,
    };

    Ok(Json(VolatilityAnalysisResponse {
        surfaces,
        comparison,
    }))
}

pub async fn validate_monte_carlo_with_market_data(
    State(state): State<AppState>,
    Json(request): Json<MonteCarloValidationRequest>,
) -> Result<Json<MonteCarloValidationResponse>, StatusCode> {
    let service: MutexGuard<MarketDataService> = state.market_data_service.lock().await;

    let quote: StockQuote = service
        .provider
        .get_quote(&request.symbol)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let options: Vec<OptionsContract> = service
        .provider
        .get_options_chain(&request.symbol, None)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let target_option: Option<&OptionsContract> = options.iter().find(|opt| {
        (opt.strike_price - request.strike_price).abs() < 0.01
            && opt.option_type == request.option_type
            && opt.expiration_date == request.expiry_date
    });

    if let Some(option) = target_option {
        let mc_params = MonteCarloRequest {
            spot_price: quote.price,
            strike_price: request.strike_price,
            time_to_expiry: calculate_time_to_expiry(request.expiry_date),
            risk_free_rate: 0.05, // TODO -- FRED
            volatility: option.implied_volatility.unwrap_or(0.2),
            num_simulations: request.num_simulations.unwrap_or(100_000),
        };

        let mc_result: MonteCarloResult = MonteCarloEngine::price_european_option(&mc_params);

        let validation = MonteCarloValidationResponse {
            market_price: option.last_price,
            monte_carlo_price: mc_result.call_price,
            implied_volatility: option.implied_volatility,
            price_difference: option.last_price.map(|p| (p - mc_result.call_price).abs()),
            percentage_difference: option
                .last_price
                .map(|p| ((p - mc_result.call_price) / p * 100.0).abs()),
            monte_carlo_result: mc_result,
            market_data: MarketDataSnapshot {
                quote,
                option: option.clone(),
                timestamp: Utc::now(),
            },
        };

        Ok(Json(validation))
    } else {
        Err(StatusCode::NOT_FOUND)
    }
}

// helper funcs
fn determine_market_status() -> MarketStatus {
    use chrono::Timelike;
    let now = Utc::now();
    let hour = now.hour();

    match hour {
        14..=21 => MarketStatus::Open,
        12..=14 => MarketStatus::PreMarket,
        21..=24 | 0..=8 => MarketStatus::AfterHours,
        _ => MarketStatus::Closed,
    }
}

fn build_chain_summary(options: &[OptionsContract]) -> OptionChainSummary {
    let total_contracts: usize = options.len();

    let mut expiry_dates: Vec<String> = options
        .iter()
        .map(|opt| opt.expiration_date.format("%Y-%m-%d").to_string())
        .collect();
    expiry_dates.sort();
    expiry_dates.dedup();

    let strikes: Vec<f64> = options.iter().map(|opt| opt.strike_price).collect();
    let strike_range: (f64, f64) = if !strikes.is_empty() {
        (
            *strikes
                .iter()
                .min_by(|a, b| a.partial_cmp(b).unwrap())
                .unwrap(),
            *strikes
                .iter()
                .max_by(|a, b| a.partial_cmp(b).unwrap())
                .unwrap(),
        )
    } else {
        (0.0, 0.0)
    };

    let avg_implied_vol: Option<f64> = {
        let vols: Vec<f64> = options
            .iter()
            .filter_map(|opt| opt.implied_volatility)
            .collect();
        if !vols.is_empty() {
            Some(vols.iter().sum::<f64>() / vols.len() as f64)
        } else {
            None
        }
    };

    OptionChainSummary {
        total_contracts,
        expiry_dates,
        strike_range,
        avg_implied_vol,
    }
}

fn find_arbitrage_opportunities(surfaces: &[VolatilitySurface]) -> Vec<ArbitrageOpportunity> {
    let mut opportunities = Vec::new();

    for surface in surfaces {
        let atm_vol: f64 = surface
            .points
            .iter()
            .filter(|p| (p.strike - surface.spot_price).abs() < surface.spot_price * 0.05)
            .map(|p| p.implied_volatility)
            .next()
            .unwrap_or(0.2);

        for point in &surface.points {
            let vol_diff: f64 = (point.implied_volatility - atm_vol).abs();

            // significant vol difference
            if vol_diff > 0.1 && point.expiry_days < 60 {
                opportunities.push(ArbitrageOpportunity {
                    symbol: surface.underlying_symbol.clone(),
                    option_symbol: format!(
                        "{}_{}_{}_{:?}",
                        surface.underlying_symbol,
                        point.strike,
                        point.expiry_days,
                        point.option_type
                    ),
                    strategy: "Volatility Arbitrage".to_string(),
                    expected_profit: vol_diff * 100.0,
                    confidence: 0.7,
                });
            }
        }
    }
    opportunities
}

fn calculate_time_to_expiry(expiry_date: NaiveDate) -> f64 {
    let now: NaiveDate = Utc::now().date_naive();
    let days: i64 = (expiry_date - now).num_days();
    days as f64 / 365.0
}
