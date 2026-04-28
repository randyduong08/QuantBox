use crate::models::polygon_models::PolygonOption;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct PolygonOptionsResponse {
    pub(crate) results: Option<Vec<PolygonOption>>,
    pub(crate) status: String,
}
