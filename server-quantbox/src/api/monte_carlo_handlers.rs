use axum::{
    Json,
    http::StatusCode,
    response::IntoResponse,
};
use crate::compute::monte_carlo_engine::MonteCarloEngine;
use crate::models::{MonteCarloRequest, MonteCarloResponse, MonteCarloResult};

pub async fn get_monte_carlo_price(Json(req): Json<MonteCarloRequest>) -> impl IntoResponse {
    println!("monte carlo pricing endpoint hit");

    let start_time: std::time::Instant = std::time::Instant::now();

    // validate inputs
    if req.spot_price <= 0.0 || req.strike_price <= 0.0 || req.time_to_expiry <= 0.0 || req.volatility <= 0.0 {
        return Err(StatusCode::BAD_REQUEST);
    }

    let result: MonteCarloResult = MonteCarloEngine::price_european_option(&req);
    let computation_time: std::time::Duration = start_time.elapsed();

    let response: MonteCarloResponse = MonteCarloResponse {
        call_price: result.call_price,
        put_price: result.put_price,
        standard_error: result.standard_error,
        confidence_interval_95: result.confidence_interval_95,
        num_simulations: req.num_simulations,
        computation_time_ms: computation_time.as_millis(),
    };

    Ok(Json(response))
}

pub async fn get_monte_carlo_comparison() -> impl IntoResponse {
    println!("monte carlo comparison endpoint hit");
    Json({})
}

pub async fn get_monte_carlo_convergence_analysis() -> impl IntoResponse {
    println!("monte carlo convergence endpoint hit");
    Json({})
}


