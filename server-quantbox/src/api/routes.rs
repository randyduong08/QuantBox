use axum::{
    routing::{get, post},
    Router,
};
use tower_http::cors::{CorsLayer, Any};

use crate::api::handlers::{calculate_option_prices, health_check};

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
        .route("/api/calculate", post(calculate_option_prices))
        .route("/api/health", get(health_check))
        .layer(cors_layer)
}