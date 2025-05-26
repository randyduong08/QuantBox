use serde::{Serialize, Deserialize};


#[derive(Debug, Serialize, Deserialize)]
pub struct HeatmapData {
    pub spot_prices: Vec<String>,
    pub volatilities: Vec<String>,
    pub call_data: Vec<Vec<String>>,
    pub put_data: Vec<Vec<String>>,
}