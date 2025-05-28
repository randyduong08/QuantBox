use axum::{
    Json,
    http::StatusCode,
    response::IntoResponse,
};
use crate::models::{BlackScholesRequest, Greeks, HeatmapData, GreekRequest};
use crate::compute::black_scholes::*;
use rust_decimal::Decimal;
use rust_decimal::prelude::*;

pub async fn health_check() -> impl IntoResponse {
    println!("health check endpoint hit!!");
    StatusCode::OK
}

pub async fn get_options_prices(Json(req): Json<BlackScholesRequest>) -> impl IntoResponse {
    println!("options endpoint hit");
    let call: f64 = calculate_call_price(req.spot_price, req.strike_price, req.risk_free_rate, req.volatility, req.time_to_maturity);
    let put: f64 = calculate_put_price(req.spot_price, req.strike_price, req.risk_free_rate, req.volatility, req.time_to_maturity);

    let call_rounded: Decimal = Decimal::from_f64(call).unwrap().round_dp(2);
    let put_rounded: Decimal = Decimal::from_f64(put).unwrap().round_dp(2);

    Json(serde_json::json!({
        "callPrice": call_rounded,
        "putPrice": put_rounded
    }))
}

pub async fn get_greeks_prices(Json(req): Json<GreekRequest>) -> impl IntoResponse {
    println!("greeks endpoint hit");
    let greeks: Greeks = calculate_greeks(
        req.scholes.spot_price,
        req.scholes.strike_price,
        req.scholes.risk_free_rate,
        req.scholes.volatility,
        req.scholes.time_to_maturity,
        req.option_type,
    );

    Json(serde_json::json!({
        "delta": Decimal::from_f64(greeks.delta).unwrap().round_dp(2),
        "gamma": Decimal::from_f64(greeks.gamma).unwrap().round_dp(2),
        "theta": Decimal::from_f64(greeks.theta).unwrap().round_dp(2),
        "vega": Decimal::from_f64(greeks.vega).unwrap().round_dp(2),
        "rho": Decimal::from_f64(greeks.rho).unwrap().round_dp(2)
    }))
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