use axum::{
    Json,
    http::StatusCode,
    response::IntoResponse,
};
use crate::compute::black_scholes::{calculate_options_prices};
use crate::compute::monte_carlo_engine::MonteCarloEngine;
use crate::compute::parallel_monte_carlo_engine::ParallelMonteCarloEngine;
pub use crate::models::black_scholes_models::{BlackScholesResult};
pub use crate::models::monte_carlo_models::{ComparisonResponse, ComparisonResult,
                                            ConvergencePoint, ConvergenceRequest,
                                            ConvergenceResponse, MonteCarloRequest,
                                            MonteCarloResponse, MonteCarloResult, PriceDifferences};

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

pub async fn get_monte_carlo_price_parallel(Json(req): Json<MonteCarloRequest>) -> impl IntoResponse {
    println!("monte carlo pricing (parallel) endpoint hit");

    let start_time: std::time::Instant = std::time::Instant::now();

    // validate inputs
    if req.spot_price <= 0.0 || req.strike_price <= 0.0 || req.time_to_expiry <= 0.0 || req.volatility <= 0.0 {
        return Err(StatusCode::BAD_REQUEST);
    }

    let result: MonteCarloResult = ParallelMonteCarloEngine::price_european_option(&req);
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

pub async fn get_monte_carlo_comparison(Json(req): Json<MonteCarloRequest>) -> impl IntoResponse {
    println!("monte carlo comparison endpoint hit");

    let start_time: std::time::Instant = std::time::Instant::now();

    if req.spot_price <= 0.0 || req.strike_price <= 0.0 || req.time_to_expiry <= 0.0 || req.volatility <= 0.0 {
        return Err(StatusCode::BAD_REQUEST);
    }

    let comparison: ComparisonResult = MonteCarloEngine::compare_with_black_scholes(&req);
    let computation_time: std::time::Duration = start_time.elapsed();

    let response = ComparisonResponse {
        monte_carlo: MonteCarloResponse {
            call_price: comparison.monte_carlo.call_price,
            put_price: comparison.monte_carlo.put_price,
            standard_error: comparison.monte_carlo.standard_error,
            confidence_interval_95: comparison.monte_carlo.confidence_interval_95,
            num_simulations: req.num_simulations,
            computation_time_ms: computation_time.as_millis(),
        },
        black_scholes: BlackScholesResult {
            call_price: comparison.black_scholes.call_price,
            put_price: comparison.black_scholes.put_price,
        },
        differences: PriceDifferences {
            call_price_diff: comparison.call_price_diff,
            put_price_diff: comparison.put_price_diff,
            call_price_diff_percent: if comparison.black_scholes.call_price != 0.0 {
                (comparison.call_price_diff / comparison.black_scholes.call_price) * 100.0
            } else { 0.0 },
            put_price_diff_percent: if comparison.black_scholes.put_price != 0.0 {
                (comparison.put_price_diff / comparison.black_scholes.put_price) * 100.0
            } else { 0.0 },
        },
    };

    Ok(Json(response))
}

pub async fn get_monte_carlo_convergence_analysis(Json(req): Json<ConvergenceRequest>) -> impl IntoResponse {
    println!("convergence analysis endpoint hit");

    if req.spot_price <= 0.0 || req.strike_price <= 0.0 ||
        req.time_to_expiry <= 0.0 || req.volatility <= 0.0 {
        return Err(StatusCode::BAD_REQUEST);
    }

    let mut convergence_data: Vec<ConvergencePoint> = Vec::new();

    // get BS reference price
    let bs_result: BlackScholesResult = calculate_options_prices(
        req.spot_price,
        req.strike_price,
        req.risk_free_rate,
        req.volatility,
        req.time_to_expiry,
    );

    // test convergence at different simulation counts
    for num_sims in (req.step_size..=req.max_simulations).step_by(req.step_size) {
        let start_time: std::time::Instant = std::time::Instant::now();

        let params = MonteCarloRequest {
            spot_price: req.spot_price,
            strike_price: req.strike_price,
            time_to_expiry: req.time_to_expiry,
            risk_free_rate: req.risk_free_rate,
            volatility: req.volatility,
            num_simulations: num_sims,
        };

        let mc_result: MonteCarloResult = MonteCarloEngine::price_european_option(&params);
        let computation_time: std::time::Duration = start_time.elapsed();

        convergence_data.push(ConvergencePoint {
            num_simulations: num_sims,
            call_price: mc_result.call_price,
            standard_error: mc_result.standard_error,
            time_ms: computation_time.as_millis(),
        });
    }

    let final_difference: f64 = if let Some(last_point) = convergence_data.last() {
        (last_point.call_price - bs_result.call_price).abs()
    } else {
        0.0
    };

    let response: ConvergenceResponse = ConvergenceResponse {
        convergence_data,
        black_scholes_reference: bs_result.call_price,
        final_difference,
    };

    Ok(Json(response))
}


