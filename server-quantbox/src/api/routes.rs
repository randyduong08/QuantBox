use axum::{
    routing::{get, post},
    Router,
};
use tower_http::cors::{CorsLayer, Any};

use crate::api::handlers::{get_greeks_prices, get_heatmap_prices, get_options_prices, health_check};

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
        .route("/api/get-greeks-prices", post(get_greeks_prices))
        .route("/api/get-options-prices", post(get_options_prices))
        .route("/api/get-heatmap-prices", post(get_heatmap_prices))
        .layer(cors_layer)
}