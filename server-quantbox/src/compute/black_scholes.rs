use std::f64::consts::PI;

use crate::models::black_scholes_models::{BlackScholesResult, Greeks, HeatmapData, OptionType};

fn normal_pdf(x: f64) -> f64 {
    (-0.5 * x * x).exp() / (2.0 * PI).sqrt()
}

fn normal_cdf(x: f64) -> f64 {
    let t: f64 = 1.0 / (1.0 + 0.2316419 * x.abs());
    let d: f64 = 0.3989423 * (-x * x / 2.0).exp();
    let p: f64 = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    if x > 0.0 {
        1.0 - p
    } else {
        p
    }
}

fn calculate_d1(s: f64, k: f64, r: f64, v: f64, t: f64) -> f64 {
    (f64::ln(s / k) + (r + 0.5 * v * v) * t) / (v * t.sqrt())
}

fn calculate_d2(d1: f64, v: f64, t: f64) -> f64 {
    d1 - v * t.sqrt()
}

pub fn calculate_call_price(s: f64, k: f64, r: f64, v: f64, t: f64) -> f64 {
    if t <= 0.0 {
        return (s - k).max(0.0);
    }
    if v <= 0.0 {
        return (s - k * (-r * t).exp()).max(0.0);
    }

    let d1: f64 = calculate_d1(s, k, r, v, t);
    let d2: f64 = calculate_d2(d1, v, t);

    normal_cdf(d1) * s - normal_cdf(d2) * k * (-r * t).exp()
}

pub fn calculate_put_price(s: f64, k: f64, r: f64, v: f64, t: f64) -> f64 {
    if t <= 0.0 {
        return (k - s).max(0.0);
    }
    if v <= 0.0 {
        return (k * (-r * t).exp() - s).max(0.0);
    }

    let d1 = calculate_d1(s, k, r, v, t);
    let d2 = calculate_d2(d1, v, t);

    k * (-r * t).exp() * normal_cdf(-d2) - s * normal_cdf(-d1)
}

pub fn calculate_options_prices(s: f64, k: f64, r: f64, v: f64, t: f64) -> BlackScholesResult {
    BlackScholesResult {
        call_price: calculate_call_price(s, k, r, v, t),
        put_price: calculate_put_price(s, k, r, v, t),
    }
}

pub fn calculate_greeks(s: f64, k: f64, r: f64, v: f64, t: f64, option_type: OptionType) -> Greeks {
    if t <= 0.0 || v <= 0.0 {
        return Greeks {
            delta: 0.0,
            gamma: 0.0,
            theta: 0.0,
            vega: 0.0,
            rho: 0.0,
        };
    }

    let d1: f64 = calculate_d1(s, k, r, v, t);
    let d2: f64 = calculate_d2(d1, v, t);
    let pdf: f64 = normal_pdf(d1);

    let delta: f64 = match option_type {
        OptionType::Call => 1.0 - normal_cdf(-d1),
        OptionType::Put => normal_cdf(-d1) - 1.0,
    };

    let gamma: f64 = pdf / (s * v * t.sqrt());

    let theta: f64 = match option_type {
        OptionType::Call => (-s * pdf * v / (2.0 * t.sqrt()) - r * k * (-r * t).exp() * (1.0 - normal_cdf(-d2))) / 365.0,
        OptionType::Put => (-s * pdf * v / (2.0 * t.sqrt()) + r * k * (-r * t).exp() * normal_cdf(-d2)) / 365.0,
    };

    let vega: f64 = s * t.sqrt() * pdf / 100.0;

    let rho: f64 = match option_type {
        OptionType::Call => k * t * (-r * t).exp() * (1.0 - normal_cdf(-d2)) / 100.0,
        OptionType::Put => -k * t * (-r * t).exp() * normal_cdf(-d2) / 100.0,
    };

    Greeks {
        delta,
        gamma,
        theta,
        vega,
        rho,
    }
}

pub fn generate_heatmap_data(base_s: f64, base_k: f64, base_v: f64, r: f64, t: f64) -> HeatmapData {
    let spot_steps: i32 = 10;
    let vol_steps: i32 = 10;

    let spot_range: f64 = 0.4;
    let vol_range: f64 = 0.8;

    let min_s: f64 = base_s * (1.0 - spot_range);
    let max_s: f64 = base_s * (1.0 + spot_range);
    let spot_step: f64 = (max_s - min_s) / (spot_steps as f64 - 1.0);

    let min_v: f64 = (base_v * (1.0 - vol_range)).max(0.05);
    let max_v: f64 = base_v * (1.0 + vol_range);
    let vol_step: f64 = (max_v - min_v) / (vol_steps as f64 - 1.0);

    let mut spot_prices: Vec<String> = Vec::new();
    let mut volatilities: Vec<String> = Vec::new();
    let mut call_data: Vec<Vec<String>> = Vec::new();
    let mut put_data: Vec<Vec<String>> = Vec::new();

    for i in 0..spot_steps {
        let s: f64 = min_s + i as f64 * spot_step;
        spot_prices.push(format!("{:.2}", s));

        let mut call_row: Vec<String> = Vec::new();
        let mut put_row: Vec<String> = Vec::new();

        for k in 0..vol_steps {
            let v: f64 = min_v + k as f64 * vol_step;
            if i == 0 {
                volatilities.push(format!("{:.2}", v));
            }

            let call: f64 = calculate_call_price(s, base_k, r, v, t);
            let put: f64 = calculate_put_price(s, base_k, r, v, t);

            call_row.push(format!("{:.2}", call));
            put_row.push(format!("{:.2}", put));
        }

        call_data.push(call_row);
        put_data.push(put_row);
    }

    HeatmapData {
        spot_prices,
        volatilities,
        call_data,
        put_data,
    }
}