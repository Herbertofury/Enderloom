use std::sync::{Arc, Mutex};

use rusqlite::Connection;

#[derive(Clone)]
pub struct Db(Arc<Mutex<Connection>>);

mod accounts;
mod banners;
mod cache;
mod content;
mod core;
mod datapacks;
mod groups;
mod graph;
mod instances;
mod library;
mod migrations;
mod models;
mod operations;
mod runs;
mod server_content;
mod servers;
mod settings;
mod skins;
mod stats;
mod transactions;
pub use transactions::{FileChange, FileChangeKind, TransactionPlan, TransactionState, TransactionArea, TransactionReceipt};

pub use datapacks::DatapackRecord;
pub use graph::{ArtifactIdentity, FileHash, ProjectGraph, ProviderProjectIdentity};
pub use models::{
    ActiveRun, ActiveServerRun, BannerRecord, CachedResponse, ContentFile, ContentUpdate,
    DayBucket, ExternalInstanceLink, InstanceGroup, InstanceOrganization, InstancePlacement,
    InstancePlayStat, InstanceTag, InstanceTagging, LoaderPlayStat, PendingOperation, PlaySession,
    PlayStats, SkinRecord,
};

use migrations::{migrate, SCHEMA_VERSION};
