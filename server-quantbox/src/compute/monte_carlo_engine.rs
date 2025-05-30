// TODO -- 2025-05-27 WORK ON THIS
use rand::rng;
use rand::rngs::ThreadRng;
use rand_distr::{Distribution, Normal};
use crate::compute::black_scholes::{calculate_options_prices};
use crate::models::monte_carlo_models::{ComparisonResult, MonteCarloRequest, MonteCarloResult};
use crate::models::black_scholes_models::{BlackScholesResult};

pub struct MonteCarloEngine;

impl MonteCarloEngine {
    // basic monte carlo pricing for european options
    pub fn price_european_option(params: &MonteCarloRequest) -> MonteCarloResult {
        let mut rng: ThreadRng = rng();
        let normal: Normal<f64> = Normal::new(0.0, 1.0).unwrap();

        let mut call_payoffs: Vec<f64> = Vec::with_capacity(params.num_simulations);
        let mut put_payoffs: Vec<f64> = Vec::with_capacity(params.num_simulations);

        // calculate drift (deterministic part) and diffusion (scaled randomness) terms
        let drift: f64 = (params.risk_free_rate - 0.5 * params.volatility.powi(2)) * params.time_to_expiry;
        let diffusion: f64 = params.volatility * params.time_to_expiry.sqrt();

        // run simulations
        for _ in 0..params.num_simulations {
            // generate random normal variable
            let z: f64 = normal.sample(&mut rng);

            // simulate final stock price -- geometric brownian motion
            // S_T = S_0 * exp((r - σ²/2)T + σ√T * Z)
            let final_price: f64 = params.spot_price * (drift + diffusion * z).exp();

            // calculate payoffs
            let call_payoff: f64 = (final_price - params.strike_price).max(0.0);
            let put_payoff: f64 = (params.strike_price - final_price).max(0.0);

            call_payoffs.push(call_payoff);
            put_payoffs.push(put_payoff)
        }

        // calculate present value of average payoffs
        let discount_factor: f64 = (-params.risk_free_rate * params.time_to_expiry).exp();

        let call_price: f64 = call_payoffs.iter().sum::<f64>() / params.num_simulations as f64 * discount_factor;
        let put_price: f64 = put_payoffs.iter().sum::<f64>() / params.num_simulations as f64 * discount_factor;

        // calculate standard error for confidence intervals
        let call_variance: f64 = call_payoffs.iter()
            .map(|&payoff: &f64| {
                let discounted_payoff: f64 = payoff * discount_factor;
                (discounted_payoff - call_price).powi(2)
            })
            .sum::<f64>() / (params.num_simulations - 1) as f64;

        let standard_error: f64 = (call_variance / params.num_simulations as f64).sqrt();

        // 95% confidence interval (±1.96 standard errors)
        let margin_of_error: f64 = 1.96 * standard_error;
        let confidence_interval_95: (f64, f64) = (
            call_price - margin_of_error,
            call_price + margin_of_error
        );

        MonteCarloResult {
            call_price,
            put_price,
            standard_error,
            confidence_interval_95,
        }
    }

    // compare MC results with BS
    pub fn compare_with_black_scholes(params: &MonteCarloRequest) -> ComparisonResult {
        let mc_result: MonteCarloResult = Self::price_european_option(params);

        let bs_result: BlackScholesResult = calculate_options_prices(
            params.spot_price,
            params.strike_price,
            params.risk_free_rate,
            params.volatility,
            params.time_to_expiry,
        );

        ComparisonResult {
            call_price_diff: (mc_result.call_price - bs_result.call_price).abs(),
            put_price_diff: (mc_result.put_price - bs_result.put_price).abs(),
            monte_carlo: mc_result,
            black_scholes: bs_result,
        }
    }
}