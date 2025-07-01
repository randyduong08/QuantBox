mod api;
mod compute;
mod market_integration;
mod models;
mod services;

use api::routes::create_router;
use axum::Router;
use tokio::net::TcpListener;

#[tokio::main]
async fn main() {
    let app: Router = create_router();

    // run the server with hyper, listening globally on port 8080
    let listener: TcpListener = TcpListener::bind("0.0.0.0:8080").await.unwrap();

    println!("Listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}
