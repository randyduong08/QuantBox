use axum::{
    Json,
    response::IntoResponse,
};

pub async fn get_monte_carlo_price() -> impl IntoResponse {
    println!("monte carlo pricing endpoint hit");
    Json({})
}

pub async fn get_monte_carlo_comparison() -> impl IntoResponse {
    println!("monte carlo comparison endpoint hit");
    Json({})
}

pub async fn get_monte_carlo_convergence_analysis() -> impl IntoResponse {
    println!("monte carlo convergence endpoint hit");
    Json({})
}


