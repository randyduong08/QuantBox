use axum::{
    routing::{get, post},
    http::StatusCode,
    Router,
};
use tokio::net::TcpListener;
use tower_http::cors::{CorsLayer, Any};

#[tokio::main]
async fn main() {
    // define CORS layer
    // all origins, methods, and headers for now (ONLY FOR DEV)
    let cors_layer: CorsLayer = CorsLayer::new()
        .allow_origin([
            "http://localhost:3000".parse().unwrap()
        ])
        .allow_methods(Any)
        .allow_headers(Any);

    // set up the router
    let app: Router = Router::new()
        .route("/api/calculate", post(calculate_option_prices))
        .route("/api/health", get(health_check))
        .layer(cors_layer);

    // run the server with hyper, listening globally on port 8080
    let listener: TcpListener = TcpListener::bind("0.0.0.0:8080")
        .await.unwrap();
    println!("Listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}

async fn calculate_option_prices() -> &'static str {
    "Testing endpoint!!!"
}

async fn health_check() -> StatusCode {
    println!("health check endpoint hit!!");
    StatusCode::OK
}
