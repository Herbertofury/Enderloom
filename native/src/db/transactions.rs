//! Typed transaction receipts in the existing canonical library.
//! Domain journals remain responsible for safe filesystem recovery.
use super::Db;
use crate::error::Result;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum FileChangeKind {
    Add,
    Replace,
    Remove,
    CreateDirectory,
    RemoveDirectory,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileChange {
    pub path: String,
    pub action: FileChangeKind,
    pub before_sha256: Option<String>,
    pub after_sha256: Option<String>,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransactionPlan {
    pub schema_version: u32,
    pub id: String,
    pub operation: String,
    pub target_kind: String,
    pub target_id: String,
    pub target_revision_id: String,
    pub source_path: String,
    pub source_state_sha256: String,
    pub target_state_sha256: String,
    pub changes: Vec<FileChange>,
    pub unchanged_files: usize,
    pub preserved_paths: Vec<String>,
    pub metadata_changes: bool,
}
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum TransactionState {
    Planned,
    Staging,
    Applying,
    Committed,
    RolledBack,
    RecoveryRequired,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransactionEvent {
    pub at: i64,
    pub state: TransactionState,
    pub note: String,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransactionArea {
    pub role: String,
    pub path: String,
    pub removed: bool,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransactionReceipt {
    pub schema_version: u32,
    pub id: String,
    pub task_id: Option<String>,
    pub plan: TransactionPlan,
    pub state: TransactionState,
    pub pre_change_snapshot: Option<String>,
    pub owned_areas: Vec<TransactionArea>,
    pub audit: Vec<TransactionEvent>,
    pub error: Option<String>,
}
impl TransactionReceipt {
    pub fn advance(
        &mut self,
        db: &Db,
        state: TransactionState,
        note: impl Into<String>,
    ) -> Result<()> {
        self.state = state;
        self.audit.push(TransactionEvent {
            at: chrono::Utc::now().timestamp_millis(),
            state,
            note: note.into(),
        });
        db.library_put(
            &format!("transaction:{}", self.id),
            &serde_json::to_value(&self)?,
        )
    }
}
impl Db {
    pub fn transaction_receipt(&self, id: &str) -> Result<Option<TransactionReceipt>> {
        self.library_get(&format!("transaction:{id}"))?
            .map(serde_json::from_value)
            .transpose()
            .map_err(Into::into)
    }
}
