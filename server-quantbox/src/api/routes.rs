use axum::{
    routing::{get, post},
    Router,
};
use tower_http::cors::{CorsLayer, Any};

use crate::api::black_scholes_handlers::{get_greeks_prices, get_heatmap_prices, get_options_prices, health_check};
use crate::api::monte_carlo_handlers::{get_monte_carlo_price, get_monte_carlo_comparison, get_monte_carlo_convergence_analysis, get_monte_carlo_price_parallel};

pub fn create_router() -> Router {

    // define CORS layer
    // all origins, methods, and headers for now (ONLY FOR DEV)
    let cors_layer: CorsLayer = CorsLayer::new()
        .allow_origin([
            "http://localhost:3000".parse().unwrap()
        ])
        .allow_methods(Any)
        .allow_headers(Any);

    // set up and return the router
    Router::new()
        .route("/api/health", get(health_check))
        .route("/api/black-scholes/get-greeks-prices", post(get_greeks_prices))
        .route("/api/black-scholes/get-options-prices", post(get_options_prices))
        .route("/api/black-scholes/get-heatmap-prices", post(get_heatmap_prices))
        .route("/api/monte-carlo/get-price", post(get_monte_carlo_price))
        .route("/api/monte-carlo/get-price-parallel", post(get_monte_carlo_price_parallel))
        .route("/api/monte-carlo/get-comparison", post(get_monte_carlo_comparison))
        .route("/api/monte-carlo/get-convergence", post(get_monte_carlo_convergence_analysis))
        .layer(cors_layer)
}