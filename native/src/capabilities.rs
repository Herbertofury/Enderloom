//! Reviewed transport metadata. Operations still execute in the shared service/domain layer.
use serde::{Deserialize, Serialize};
use std::sync::OnceLock;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize, Serialize, clap::ValueEnum)]
#[serde(rename_all = "snake_case")]
#[value(rename_all = "snake_case")]
pub(crate) enum OperationDomain {
    Accounts, Application, Catalog, Config, Content, Conversion, Diagnostics,
    Evidence, Instances, Integration, Java, Library, Logs, Media, Organization,
    Packs, Performance, Projects, Runtime, Servers, Skins, Snapshots, Storage,
    Tasks, Testing, Transactions, Versions, Worlds,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize, Serialize, clap::ValueEnum)]
#[serde(rename_all = "snake_case")]
#[value(rename_all = "snake_case")]
pub(crate) enum OperationClassification { Read, Write, Destructive }

#[derive(Debug, Deserialize, Serialize)]
pub(crate) struct Capability {
    pub id: String,
    pub domain: OperationDomain,
    pub service_command: Option<String>,
    pub cli_route: Option<String>,
    pub aliases: Vec<String>,
    pub gui_routes: Vec<String>,
    pub classification: OperationClassification,
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
        let entries: Vec<Capability> = serde_json::from_str(include_str!("capabilities.json"))
            .expect("typed capability registry");
        let mut ids = std::collections::HashSet::new();
        for entry in &entries {
            assert!(!entry.id.is_empty() && entry.id.bytes().all(|b| b.is_ascii_lowercase() || b.is_ascii_digit() || b == b'_'), "Invalid operation identity");
            assert!(ids.insert(&entry.id), "Duplicate operation identity: {}", entry.id);
            if let Some(plan) = &entry.plan_command {
                assert!(entries.iter().any(|e| &e.id == plan && e.classification == OperationClassification::Read), "Plan route must be a registered read operation: {}", entry.id);
            }
        }
        entries
    })
}

pub(crate) fn select(domain: Option<OperationDomain>, classification: Option<OperationClassification>) -> Vec<&'static Capability> {
    all().iter().filter(|entry| domain.is_none_or(|d| entry.domain == d) && classification.is_none_or(|c| entry.classification == c)).collect()
}

pub(crate) fn find(id: &str) -> Option<&'static Capability> {
    all().iter().find(|entry| entry.id == id)
}
