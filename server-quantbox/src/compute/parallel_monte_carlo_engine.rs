use rand::prelude::*;
use rand::rng;
use rand_distr::{Distribution, Normal};
use crate::models::monte_carlo_models::{MonteCarloRequest, MonteCarloResult};
use rayon::prelude::*;

#[derive(Debug)]
struct ChunkResult {
    call_sum: f64,
    put_sum: f64,
    call_sum_squared: f64,
    put_sum_squared: f64,
    count: usize,
}

pub struct ParallelMonteCarloEngine;

impl ParallelMonteCarloEngine {
    pub fn price_european_option(params: &MonteCarloRequest) -> MonteCarloResult {
        let chunk_size: usize = 10_000;
        let num_chunks: usize = (params.num_simulations + chunk_size - 1) / chunk_size;

        // via parallel iterator
        let results: Vec<ChunkResult> = (0..num_chunks)
            .into_par_iter()
            .map(|chunk_idx| {
                let start_sim: usize = chunk_idx * chunk_size;
                let end_sim: usize = ((chunk_idx + 1) * chunk_size).min(params.num_simulations);
                let actual_chunk_size: usize = end_sim - start_sim;

                Self::process_chunk(params, actual_chunk_size)
            })
            .collect();

        Self::aggregate_chunk_results(&results)
    }

    fn process_chunk(params: &MonteCarloRequest, chunk_size: usize) -> ChunkResult {
        let mut rng: ThreadRng = rng();
        let normal: Normal<f64> = Normal::new(0.0, 1.0).unwrap();

        let mut call_sum: f64 = 0.0;
        let mut put_sum: f64 = 0.0;
        let mut call_sum_squared: f64 = 0.0;
        let mut put_sum_squared: f64 = 0.0;

        // constants
        let drift: f64 = (params.risk_free_rate - 0.5 * params.volatility.powi(2)) * params.time_to_expiry;
        let diffusion: f64 = params.volatility * params.time_to_expiry.sqrt();
        let discount_factor: f64 = (-params.risk_free_rate * params.time_to_expiry).exp();

        for _i in 0..chunk_size {
            let z: f64 = normal.sample(&mut rng);
            let final_price: f64 = params.spot_price * (drift + diffusion * z).exp();

            let call_payoff: f64 = (final_price - params.strike_price).max(0.0) * discount_factor;
            let put_payoff: f64 = (params.strike_price - final_price).max(0.0) * discount_factor;

            call_sum += call_payoff;
            put_sum += put_payoff;
            call_sum_squared += call_payoff * call_payoff;
            put_sum_squared += put_payoff * put_payoff;
        }

        ChunkResult {
            call_sum,
            put_sum,
            call_sum_squared,
            put_sum_squared,
            count: chunk_size,
        }
    }

    fn aggregate_chunk_results(results: &[ChunkResult]) -> MonteCarloResult {
        let (total_count, call_sum, put_sum, call_sum_squared) = results.iter().fold(
            (0usize, 0.0f64, 0.0f64, 0.0f64),
            |(acc_count, acc_call, acc_put, acc_sq), r| {
                (
                    acc_count + r.count,
                    acc_call + r.call_sum,
                    acc_put + r.put_sum,
                    acc_sq + r.call_sum_squared,
                )
            },
        );

        let call_price: f64 = call_sum / total_count as f64;
        let put_price: f64 = put_sum / total_count as f64;

        let call_variance: f64 = (call_sum_squared / total_count as f64) - call_price.powi(2);
        let standard_error: f64 = (call_variance / total_count as f64).sqrt();

        let margin_of_error: f64 = 1.96 * standard_error;
        let confidence_interval_95: (f64, f64) = (
            call_price - margin_of_error,
            call_price + margin_of_error,
        );

        MonteCarloResult {
            call_price,
            put_price,
            standard_error,
            confidence_interval_95,
        }
    }
}