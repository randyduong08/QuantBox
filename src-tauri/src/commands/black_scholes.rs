use crate::compute::black_scholes::{
    calculate_call_price, calculate_greeks, calculate_put_price, generate_heatmap_data,
};
use crate::models::black_scholes_models::{
    BlackScholesRequest, GreekRequest, Greeks, HeatmapData,
};
use serde::Serialize;

#[derive(Serialize)]
pub struct OptionPricesResponse {
    pub call_price: f64,
    pub put_price: f64,
}

#[tauri::command]
pub fn calculate_option_prices(req: BlackScholesRequest) -> Result<OptionPricesResponse, String> {
    let call_price = calculate_call_price(
        req.spot_price,
        req.strike_price,
        req.risk_free_rate,
        req.volatility,
        req.time_to_maturity,
    );
    let put_price = calculate_put_price(
        req.spot_price,
        req.strike_price,
        req.risk_free_rate,
        req.volatility,
        req.time_to_maturity,
    );

    Ok(OptionPricesResponse {
        call_price: round_to_two(call_price),
        put_price: round_to_two(put_price),
    })
}

#[tauri::command]
pub fn calculate_greeks_prices(req: GreekRequest) -> Result<Greeks, String> {
    Ok(calculate_greeks(
        req.scholes.spot_price,
        req.scholes.strike_price,
        req.scholes.risk_free_rate,
        req.scholes.volatility,
        req.scholes.time_to_maturity,
        req.option_type,
    ))
}

#[tauri::command]
pub fn generate_heatmap_prices(req: BlackScholesRequest) -> Result<HeatmapData, String> {
    Ok(generate_heatmap_data(
        req.spot_price,
        req.strike_price,
        req.risk_free_rate,
        req.volatility,
        req.time_to_maturity,
    ))
}

fn round_to_two(value: f64) -> f64 {
    (value * 100.0).round() / 100.0
}
