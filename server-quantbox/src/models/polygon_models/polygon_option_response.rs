use crate::models::polygon_models::PolygonOption;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct PolygonOptionsResponse {
    pub(crate) results: Option<Vec<PolygonOption>>,
    status: String,
}
