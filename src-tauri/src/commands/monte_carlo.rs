use crate::compute::black_scholes::calculate_options_prices;
use crate::compute::monte_carlo_engine::MonteCarloEngine;
use crate::compute::parallel_monte_carlo_engine::ParallelMonteCarloEngine;
use crate::models::black_scholes_models::BlackScholesResult;
use crate::models::monte_carlo_models::{
    ComparisonResponse, ComparisonResult, ConvergencePoint, ConvergenceRequest,
    ConvergenceResponse, MonteCarloRequest, MonteCarloResponse, MonteCarloResult,
    PriceDifferences,
};

#[tauri::command]
pub fn run_monte_carlo(req: MonteCarloRequest) -> Result<MonteCarloResponse, String> {
    validate_monte_carlo_request(&req)?;

    let start_time = std::time::Instant::now();
    let result = MonteCarloEngine::price_european_option(&req);

    Ok(MonteCarloResponse {
        call_price: result.call_price,
        put_price: result.put_price,
        standard_error: result.standard_error,
        confidence_interval_95: result.confidence_interval_95,
        num_simulations: req.num_simulations,
        computation_time_ms: start_time.elapsed().as_millis(),
    })
}

#[tauri::command]
pub fn run_monte_carlo_parallel(req: MonteCarloRequest) -> Result<MonteCarloResponse, String> {
    validate_monte_carlo_request(&req)?;

    let start_time = std::time::Instant::now();
    let result = ParallelMonteCarloEngine::price_european_option(&req);

    Ok(MonteCarloResponse {
        call_price: result.call_price,
        put_price: result.put_price,
        standard_error: result.standard_error,
        confidence_interval_95: result.confidence_interval_95,
        num_simulations: req.num_simulations,
        computation_time_ms: start_time.elapsed().as_millis(),
    })
}

#[tauri::command]
pub fn run_monte_carlo_comparison(req: MonteCarloRequest) -> Result<ComparisonResponse, String> {
    validate_monte_carlo_request(&req)?;

    let start_time = std::time::Instant::now();
    let comparison: ComparisonResult = MonteCarloEngine::compare_with_black_scholes(&req);

    Ok(ComparisonResponse {
        monte_carlo: MonteCarloResponse {
            call_price: comparison.monte_carlo.call_price,
            put_price: comparison.monte_carlo.put_price,
            standard_error: comparison.monte_carlo.standard_error,
            confidence_interval_95: comparison.monte_carlo.confidence_interval_95,
            num_simulations: req.num_simulations,
            computation_time_ms: start_time.elapsed().as_millis(),
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
            } else {
                0.0
            },
            put_price_diff_percent: if comparison.black_scholes.put_price != 0.0 {
                (comparison.put_price_diff / comparison.black_scholes.put_price) * 100.0
            } else {
                0.0
            },
        },
    })
}

#[tauri::command]
pub fn run_convergence_analysis(req: ConvergenceRequest) -> Result<ConvergenceResponse, String> {
    if req.spot_price <= 0.0
        || req.strike_price <= 0.0
        || req.time_to_expiry <= 0.0
        || req.volatility <= 0.0
    {
        return Err("Spot price, strike price, time to expiry, and volatility must be positive.".to_string());
    }

    let bs_result = calculate_options_prices(
        req.spot_price,
        req.strike_price,
        req.risk_free_rate,
        req.volatility,
        req.time_to_expiry,
    );

    let mut convergence_data: Vec<ConvergencePoint> = Vec::new();
    for num_sims in (req.step_size..=req.max_simulations).step_by(req.step_size) {
        let start_time = std::time::Instant::now();
        let params = MonteCarloRequest {
            spot_price: req.spot_price,
            strike_price: req.strike_price,
            time_to_expiry: req.time_to_expiry,
            risk_free_rate: req.risk_free_rate,
            volatility: req.volatility,
            num_simulations: num_sims,
        };
        let mc_result: MonteCarloResult = MonteCarloEngine::price_european_option(&params);

        convergence_data.push(ConvergencePoint {
            num_simulations: num_sims,
            call_price: mc_result.call_price,
            standard_error: mc_result.standard_error,
            time_ms: start_time.elapsed().as_millis(),
        });
    }

    let final_difference = convergence_data
        .last()
        .map(|point| (point.call_price - bs_result.call_price).abs())
        .unwrap_or(0.0);

    Ok(ConvergenceResponse {
        convergence_data,
        black_scholes_reference: bs_result.call_price,
        final_difference,
    })
}

fn validate_monte_carlo_request(req: &MonteCarloRequest) -> Result<(), String> {
    if req.spot_price <= 0.0
        || req.strike_price <= 0.0
        || req.time_to_expiry <= 0.0
        || req.volatility <= 0.0
    {
        return Err("Spot price, strike price, time to expiry, and volatility must be positive.".to_string());
    }

    Ok(())
}
