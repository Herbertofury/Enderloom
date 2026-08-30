use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
};

use crate::{
    config::LauncherSettings,
    credentials::CredentialStore,
    db::Db,
    files::FileManager,
    launch::process::RunningHandle,
    meta::media::{PatchNotes, VersionMedia},
    network::NetworkManager,
    paths::Paths,
    presence::Presence,
    servers::runtime::Registry,
    tasks::Tasks,
    update::UpdateCoordinator,
};

pub struct AppState {
    pub network: Arc<NetworkManager>,
    pub files: FileManager,
    pub paths: Paths,
    pub db: Db,
    pub credentials: CredentialStore,
    pub running: Arc<Mutex<HashMap<String, RunningHandle>>>,
    pub servers: Registry,
    pub patch_notes: Mutex<Option<PatchNotes>>,
    pub media_cache: Mutex<HashMap<String, Option<VersionMedia>>>,
    pub tasks: std::sync::Arc<Tasks>,
    pub updates: Arc<UpdateCoordinator>,
    pub presence: Arc<Presence>,
    service_logs: Mutex<Option<Arc<crate::logging::LogBuffer>>>,
}

impl AppState {
    pub fn new(files: FileManager, db: Db) -> Self {
        let paths = files.paths().clone();
        let credentials = CredentialStore::system();
        if !CredentialStore::available() {
            tracing::warn!("the operating system credential store is unavailable");
        }
        let tasks = std::sync::Arc::new(Tasks::new(db.clone()));
        let updates = Arc::new(UpdateCoordinator::new(db.clone()));
        let network = NetworkManager::new();
        if let Ok(settings) = db.load_runtime_settings(&credentials) {
            if let Err(error) = network.reconfigure(&settings) {
                tracing::warn!(error = %error, "could not apply the saved network settings");
            }
        }
        Self {
            network: Arc::new(network),
            files,
            paths,
            db,
            credentials,
            running: Arc::new(Mutex::new(HashMap::new())),
            servers: Arc::new(Mutex::new(HashMap::new())),
            patch_notes: Mutex::new(None),
            media_cache: Mutex::new(HashMap::new()),
            tasks,
            updates,
            presence: Arc::new(Presence::spawn()),
            service_logs: Mutex::new(None),
        }
    }

    pub fn attach_service_logs(&self, logs: &crate::logging::LogState) {
        *self.service_logs.lock().unwrap() = Some(logs.buffer.clone());
    }

    pub fn service_log_records(&self, limit: usize) -> Vec<crate::logging::LogRecord> {
        self.service_logs
            .lock()
            .unwrap()
            .as_ref()
            .map(|buffer| buffer.snapshot(limit))
            .unwrap_or_default()
    }

    pub fn clear_service_log_records(&self) {
        if let Some(buffer) = self.service_logs.lock().unwrap().as_ref() {
            buffer.clear();
        }
    }

    pub fn runtime_settings(&self) -> crate::error::Result<LauncherSettings> {
        self.db.load_runtime_settings(&self.credentials)
    }

    pub fn adopt_external_dirs(&self) -> crate::error::Result<()> {
        let instance_links = self.db.external_instance_dirs()?;
        self.paths.adopt_instance_links(instance_links.clone());
        let mut roots = self.db.imported_server_dirs()?;
        // Keep a capability on the launcher's profile container, not an open
        // handle to each profile directory. Windows otherwise prevents the
        // external launcher from renaming/moving a connected profile while
        // Enderloom is running. Instance path resolution remains constrained
        // by the separately maintained instance_links map.
        roots.extend(instance_links.into_iter().map(|(_, path)| {
            path.parent()
                .map(std::path::Path::to_path_buf)
                .unwrap_or(path)
        }));
        self.paths.adopt_extras(roots);
        self.files.reopen()
    }
}
