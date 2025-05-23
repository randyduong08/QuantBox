use axum::{
    Json,
    http::StatusCode,
    response::IntoResponse,
};
use crate::models::{BlackScholesRequest, Greeks, HeatmapData, GreekRequest};
use crate::compute::black_scholes::*;

pub async fn calculate_option_prices() -> impl IntoResponse {
    "Testing endpoint!!!"
}

pub async fn health_check() -> impl IntoResponse {
    println!("health check endpoint hit!!");
    StatusCode::OK
}

pub async fn get_options_prices(Json(req): Json<BlackScholesRequest>) -> impl IntoResponse {
    let call: f64 = calculate_call_price(req.spot_price, req.strike_price, req.risk_free_rate, req.volatility, req.time_to_maturity);
    let put: f64 = calculate_put_price(req.spot_price, req.strike_price, req.risk_free_rate, req.volatility, req.time_to_maturity);

    Json(serde_json::json!({
        "callPrice": call,
        "putPrice": put
    }))
}

pub async fn get_greeks_prices(Json(req): Json<GreekRequest>) -> impl IntoResponse {
    let greeks: Greeks = calculate_greeks(
        req.scholes.spot_price,
        req.scholes.strike_price,
        req.scholes.risk_free_rate,
        req.scholes.volatility,
        req.scholes.time_to_maturity,
        req.option_type,
    );

    Json(greeks)
}

pub async fn get_heatmap_prices(Json(req): Json<BlackScholesRequest>) -> impl IntoResponse {
    let heatmap: HeatmapData = generate_heatmap_data(
        req.spot_price,
        req.strike_price,
        req.risk_free_rate,
        req.volatility,
        req.time_to_maturity,
    );

    Json(heatmap)
}