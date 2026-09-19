use super::*;
use crate::db::{FileChange, FileChangeKind, TransactionPlan};
use std::collections::BTreeMap;

// Only these settings are restored by Db::restore_instance_snapshot. Display
// names, playtime, groups and other live presentation state are preserved.
fn restored_settings(instance: &Instance) -> serde_json::Value {
    serde_json::json!({
        "version_id": instance.version_id, "min_memory_mb": instance.min_memory_mb,
        "max_memory_mb": instance.max_memory_mb, "java_path": instance.java_path,
        "loader": instance.loader, "loader_version": instance.loader_version,
        "launch_version_id": instance.launch_version_id,
        "pack_provider": instance.pack_provider, "pack_project_id": instance.pack_project_id,
        "pack_version_id": instance.pack_version_id,
        "jvm_args": instance.jvm_args, "jvm_args_mode": instance.jvm_args_mode,
        "env_vars": instance.env_vars, "env_vars_mode": instance.env_vars_mode,
    })
}

pub(super) fn restore_plan(
    store: &SnapshotStore,
    instance: &Instance,
    manifest: &SnapshotManifest,
    task: Option<&TaskHandle>,
) -> Result<TransactionPlan> {
    let live = store.paths.instance_dir(&instance.id);
    let mut entries = Vec::new();
    collect_entries_excluding(
        &store.files,
        &live,
        &live,
        &mut entries,
        true,
        &manifest.excluded,
    )?;
    let progress = progress_for_entries(&entries, task);
    let mut files = BTreeMap::new();
    let mut directories = BTreeMap::new();
    for entry in entries {
        check_cancelled(task)?;
        match entry {
            SourceEntry::File { relative, size } => {
                let hash = hash_file(&store.files, &live.join(&relative), size, &progress, task)?;
                files.insert(relative.to_string_lossy().replace('\\', "/"), hash);
            }
            SourceEntry::Directory(relative) => {
                directories.insert(relative.to_string_lossy().replace('\\', "/"), ());
            }
        }
    }
    let target_files = manifest
        .files
        .iter()
        .map(|f| {
            (
                f.path.to_string_lossy().replace('\\', "/"),
                f.sha256.clone(),
            )
        })
        .collect::<BTreeMap<_, _>>();
    let target_directories = manifest
        .directories
        .iter()
        .map(|p| (p.to_string_lossy().replace('\\', "/"), ()))
        .collect::<BTreeMap<_, _>>();
    let mut changes = Vec::new();
    let mut unchanged = 0;
    for (path, hash) in &files {
        match target_files.get(path) {
            Some(target) if target == hash => unchanged += 1,
            target => changes.push(FileChange {
                path: path.clone(),
                action: if target.is_some() {
                    FileChangeKind::Replace
                } else {
                    FileChangeKind::Remove
                },
                before_sha256: Some(hash.clone()),
                after_sha256: target.cloned(),
            }),
        }
    }
    for (path, hash) in &target_files {
        if !files.contains_key(path) {
            changes.push(FileChange {
                path: path.clone(),
                action: FileChangeKind::Add,
                before_sha256: None,
                after_sha256: Some(hash.clone()),
            });
        }
    }
    for path in directories.keys() {
        if !target_directories.contains_key(path) {
            changes.push(FileChange {
                path: path.clone(),
                action: FileChangeKind::RemoveDirectory,
                before_sha256: None,
                after_sha256: None,
            });
        }
    }
    for path in target_directories.keys() {
        if !directories.contains_key(path) {
            changes.push(FileChange {
                path: path.clone(),
                action: FileChangeKind::CreateDirectory,
                before_sha256: None,
                after_sha256: None,
            });
        }
    }
    let current_content = store.db.all_content_files(&instance.id)?;
    let source_state_sha256 = format!(
        "{:x}",
        Sha256::digest(serde_json::to_vec(
            &serde_json::json!({"files":files,"directories":directories,"settings":restored_settings(instance),"content":current_content})
        )?)
    );
    let target_state_sha256 = format!("{:x}", Sha256::digest(serde_json::to_vec(manifest)?));
    let id = format!(
        "{:x}",
        Sha256::digest(serde_json::to_vec(&serde_json::json!([
            "restore-plan-1",
            instance.id,
            live,
            manifest.id,
            source_state_sha256,
            target_state_sha256
        ]))?)
    );
    Ok(TransactionPlan {
        schema_version: 1,
        id,
        operation: "restore_instance_snapshot".into(),
        target_kind: "instance".into(),
        target_id: instance.id.clone(),
        source_state_sha256,
        target_state_sha256,
        target_revision_id: manifest.id.clone(),
        source_path: live.display().to_string(),
        changes,
        unchanged_files: unchanged,
        preserved_paths: EXCLUDED_TOP_LEVEL
            .iter()
            .map(|s| s.to_string())
            .chain(manifest.excluded.iter().cloned())
            .collect(),
        metadata_changes: restored_settings(instance) != restored_settings(&manifest.instance)
            || serde_json::to_value(current_content)? != serde_json::to_value(&manifest.content)?,
    })
}
pub(crate) async fn plan_restore(
    state: &AppState,
    instance: Instance,
    snapshot_id: String,
) -> Result<TransactionPlan> {
    ensure_no_pending_restore(state, &instance.id)?;
    let store = SnapshotStore::from_state(state);
    tokio::task::spawn_blocking(move || {
        let _guard = store_guard()?;
        let path = store
            .paths
            .snapshot_dir_checked(&instance.id, &snapshot_id)
            .ok_or_else(|| Error::other("Invalid snapshot identity"))?;
        let manifest = read_manifest(&store.files, &path)?;
        if manifest.instance.id != instance.id || manifest.id != snapshot_id {
            return Err(Error::other(
                "Snapshot identity does not match its location.",
            ));
        }
        restore_plan(&store, &instance, &manifest, None)
    })
    .await
    .map_err(|e| Error::other(e.to_string()))?
}
