use axum::{
    http::StatusCode,
    response::IntoResponse,
};

pub async fn calculate_option_prices() -> impl IntoResponse {
    "Testing endpoint!!!"
}

pub async fn health_check() -> impl IntoResponse {
    println!("health check endpoint hit!!");
    StatusCode::OK
}