use serde::Deserialize;

#[derive(Deserialize)]
pub struct GreekRequest {
    #[serde(flatten)]
    pub scholes: BlackScholesRequest,
    pub option_type: OptionType,
}

use crate::models::{BlackScholesRequest, OptionType};