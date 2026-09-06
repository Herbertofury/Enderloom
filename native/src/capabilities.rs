//! Reviewed transport metadata. Operations still execute in the shared service/domain layer.
use serde::{Deserialize, Serialize};
use std::sync::OnceLock;

#[derive(Debug, Deserialize, Serialize)]
pub(crate) struct Capability {
    pub id: String,
    pub service_command: Option<String>,
    pub cli_route: Option<String>,
    pub aliases: Vec<String>,
    pub gui_routes: Vec<String>,
    pub classification: String,
    pub state: String,
    pub schema_version: u32,
    pub plan_command: Option<String>,
    pub progress: bool,
    pub cancellation_command: Option<String>,
    pub visual_only_reason: Option<String>,
}

pub(crate) fn all() -> &'static [Capability] {
    static REGISTRY: OnceLock<Vec<Capability>> = OnceLock::new();
    REGISTRY.get_or_init(|| {
        serde_json::from_str(include_str!("capabilities.json"))
            .expect("validated capability registry")
    })
}

pub(crate) fn find(id: &str) -> Option<&'static Capability> {
    all().iter().find(|entry| entry.id == id)
}
