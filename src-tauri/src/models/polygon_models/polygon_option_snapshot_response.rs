use crate::models::polygon_models::PolygonOptionSnapshot;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct PolygonOptionSnapshotResponse {
    pub(crate) results: Option<Vec<PolygonOptionSnapshot>>,
    pub(crate) next_url: Option<String>,
    pub(crate) status: String,
}
