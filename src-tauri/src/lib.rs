pub mod commands;
pub mod compute;
pub mod market_integration;
pub mod models;
pub mod services;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::black_scholes::calculate_option_prices,
            commands::black_scholes::calculate_greeks_prices,
            commands::black_scholes::generate_heatmap_prices,
            commands::monte_carlo::run_monte_carlo,
            commands::monte_carlo::run_monte_carlo_parallel,
            commands::monte_carlo::run_monte_carlo_comparison,
            commands::monte_carlo::run_convergence_analysis,
            commands::market_data::get_market_quote,
            commands::market_data::get_options_chain,
            commands::market_data::get_volatility_surface,
        ])
        .run(tauri::generate_context!())
        .expect("error while running QuantBox");
}
