mod api;
mod compute;
mod market_integration;
mod models;
mod services;

use crate::market_integration::polygon_provider::PolygonProvider;
use crate::services::MarketDataService;
use api::market_data_handlers::AppState;
use api::routes::create_router;
use axum::Router;
use dotenv::dotenv;
use std::sync::Arc;
use tokio::net::TcpListener;
use tokio::sync::Mutex;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();
    let api_key = std::env::var("POLYGON_API_KEY")?;

    let polygon_provider = PolygonProvider::new(api_key);
    let market_data_service: MarketDataService = MarketDataService::new(Box::new(polygon_provider));

    let app_state: AppState = AppState {
        market_data_service: Arc::new(Mutex::new(market_data_service)),
    };

    let app = create_router().with_state(app_state);

    // run the server with hyper, listening globally on port 8080
    let listener: TcpListener = TcpListener::bind("0.0.0.0:8080").await.unwrap();

    println!("Listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();

    Ok(())
}
