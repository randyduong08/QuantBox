use serde::Deserialize;

#[derive(Deserialize)]
pub struct GreekRequest {
    #[serde(flatten)]
    pub scholes: BlackScholesRequest,
    pub option_type: OptionType,
}

use crate::models::black_scholes_models::{BlackScholesRequest, OptionType};