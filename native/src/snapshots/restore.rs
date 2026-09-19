use std::{
    io::{Read, Write},
    path::{Path, PathBuf},
    sync::Arc,
};

use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use tauri::AppHandle;

use crate::{
    config::Instance,
    db::{TransactionArea, TransactionReceipt, TransactionState},
    error::{Error, Result},
    files::FileManager,
    instance_ops::instance_busy,
    paths::Paths,
    state::AppState,
    tasks::{TaskHandle, TaskKind, TaskSpec},
};

use super::{
    check_cancelled, clean_name, collect_entries, create_snapshot_sync, garbage_collect,
    hex_digest, maintain_snapshot_storage, progress_for_entries, read_manifest, store_guard,
    SnapshotFile, SnapshotKind, SnapshotManifest, SnapshotStore, SnapshotSummary, SourceEntry,
    BUFFER_SIZE, EXCLUDED_TOP_LEVEL,
};

#[derive(Debug, Serialize, Deserialize)]
pub(super) struct RestoreJournal {
    pub(super) schema_version: u32,
    pub(super) instance_id: String,
    pub(super) target_snapshot_id: String,
    pub(super) safety_snapshot_id: String,
    pub(super) nonce: String,
    #[serde(default)]
    pub(super) transaction_id: Option<String>,
}

pub(super) fn restore_paths(
    paths: &Paths,
    instance_id: &str,
    nonce: &str,
) -> (PathBuf, PathBuf, PathBuf) {
    (
        paths.instance_dir(instance_id),
        paths
            .instances()
            .join(format!(".restore-{instance_id}-{nonce}")),
        paths
            .instances()
            .join(format!(".restore-backup-{instance_id}-{nonce}")),
    )
}

fn collect_volatile_entries(
    files: &FileManager,
    root: &Path,
    output: &mut Vec<SourceEntry>,
    also_preserve: &[String],
) -> Result<()> {
    let names: Vec<&str> = EXCLUDED_TOP_LEVEL
        .iter()
        .copied()
        .chain(also_preserve.iter().map(|value| value.as_str()))
        .collect();
    for name in names {
        let path = root.join(name);
        if !files.exists(&path)? {
            continue;
        }
        let metadata = files.symlink_metadata(&path)?;
        if metadata.file_type().is_symlink() {
            return Err(Error::other(format!(
                "Cannot preserve a symbolic link during restore: {}",
                path.display()
            )));
        }
        let relative = PathBuf::from(name);
        if metadata.is_dir() {
            output.push(SourceEntry::Directory(relative));
            collect_entries(files, root, &path, output, false)?;
        } else if metadata.is_file() {
            output.push(SourceEntry::File {
                relative,
                size: metadata.len(),
            });
        }
    }
    Ok(())
}

fn copy_plain_file(
    files: &FileManager,
    source: &Path,
    destination: &Path,
    progress: &super::workers::Progress,
    task: Option<&TaskHandle>,
) -> Result<()> {
    let mut reader = files.open(source)?;
    let mut writer = files.create(destination)?;
    let mut buffer = vec![0_u8; BUFFER_SIZE];
    loop {
        check_cancelled(task)?;
        let read = reader.read(&mut buffer)?;
        if read == 0 {
            break;
        }
        writer.write_all(&buffer[..read])?;
        progress.bytes(read, task);
    }
    writer.sync_all()?;
    progress.file(task);
    Ok(())
}

pub(super) fn restore_blob(
    state: &SnapshotStore,
    entry: &SnapshotFile,
    destination: &Path,
    progress: &super::workers::Progress,
    task: Option<&TaskHandle>,
) -> Result<()> {
    let blob = state
        .paths
        .snapshot_blob(&entry.sha256)
        .ok_or_else(|| Error::other("snapshot contains an invalid blob hash"))?;
    if !state.files.is_file(&blob)? {
        return Err(Error::other(format!(
            "Snapshot data is missing for {}.",
            entry.path.display()
        )));
    }
    if state
        .files
        .symlink_metadata(&blob)?
        .file_type()
        .is_symlink()
    {
        return Err(Error::other(format!(
            "Snapshot blob is an unsafe symbolic link for {}.",
            entry.path.display()
        )));
    }
    let reader = state.files.open(blob)?;
    let mut decoder = zstd::stream::read::Decoder::new(reader)?;
    let mut writer = state.files.create(destination)?;
    let mut hasher = Sha256::new();
    let mut restored = 0_u64;
    let mut buffer = vec![0_u8; BUFFER_SIZE];
    loop {
        check_cancelled(task)?;
        let read = decoder.read(&mut buffer)?;
        if read == 0 {
            break;
        }
        restored = restored.saturating_add(read as u64);
        if restored > entry.size {
            return Err(Error::other(format!(
                "Snapshot data expanded beyond its expected size for {}.",
                entry.path.display()
            )));
        }
        hasher.update(&buffer[..read]);
        writer.write_all(&buffer[..read])?;
        progress.bytes(read, task);
    }
    writer.sync_all()?;
    if restored != entry.size || hex_digest(&hasher.finalize()) != entry.sha256 {
        return Err(Error::other(format!(
            "Snapshot integrity check failed for {}.",
            entry.path.display()
        )));
    }
    progress.file(task);
    Ok(())
}

pub(super) fn stage_restore(
    state: &SnapshotStore,
    manifest: &SnapshotManifest,
    live: &Path,
    staging: &Path,
    task: Option<&TaskHandle>,
) -> Result<()> {
    let mut volatile = Vec::new();
    collect_volatile_entries(&state.files, live, &mut volatile, &manifest.excluded)?;
    let mut totals = manifest
        .files
        .iter()
        .map(|file| SourceEntry::File {
            relative: file.path.clone(),
            size: file.size,
        })
        .collect::<Vec<_>>();
    totals.extend(volatile.iter().map(|entry| match entry {
        SourceEntry::Directory(path) => SourceEntry::Directory(path.clone()),
        SourceEntry::File { relative, size } => SourceEntry::File {
            relative: relative.clone(),
            size: *size,
        },
    }));
    let progress = progress_for_entries(&totals, task);
    state.files.ensure_dir(staging)?;
    for directory in &manifest.directories {
        state.files.ensure_dir(staging.join(directory))?;
    }
    for entry in &manifest.files {
        restore_blob(state, entry, &staging.join(&entry.path), &progress, task)?;
    }
    for entry in volatile {
        match entry {
            SourceEntry::Directory(relative) => state.files.ensure_dir(staging.join(relative))?,
            SourceEntry::File { relative, .. } => copy_plain_file(
                &state.files,
                &live.join(&relative),
                &staging.join(relative),
                &progress,
                task,
            )?,
        }
    }
    Ok(())
}

fn restore_database_from_manifest(
    state: &SnapshotStore,
    instance_id: &str,
    manifest: &SnapshotManifest,
) -> Result<()> {
    state
        .db
        .restore_instance_snapshot(instance_id, &manifest.instance, &manifest.content)
}

pub(super) fn recover_journal(state: &SnapshotStore, path: &Path) -> Result<()> {
    if state.files.symlink_metadata(path)?.file_type().is_symlink() {
        return Err(Error::other(format!(
            "Restore journal is an unsafe symbolic link: {}",
            path.display()
        )));
    }
    let journal: RestoreJournal = serde_json::from_slice(&state.files.read(path)?)?;
    if journal.schema_version != 1
        || state
            .paths
            .snapshot_restore_journal_checked(&journal.instance_id)
            .as_deref()
            != Some(path)
        || state
            .paths
            .snapshot_dir_checked(&journal.instance_id, &journal.target_snapshot_id)
            .is_none()
        || state
            .paths
            .snapshot_dir_checked(&journal.instance_id, &journal.safety_snapshot_id)
            .is_none()
        || uuid::Uuid::parse_str(&journal.nonce).is_err()
    {
        return Err(Error::other(format!(
            "Restore journal is invalid: {}",
            path.display()
        )));
    }
    let target_path = state
        .paths
        .snapshot_dir(&journal.instance_id, &journal.target_snapshot_id);
    let safety_path = state
        .paths
        .snapshot_dir(&journal.instance_id, &journal.safety_snapshot_id);
    let target = read_manifest(&state.files, &target_path)?;
    let safety = read_manifest(&state.files, &safety_path)?;
    if target.instance.id != journal.instance_id || safety.instance.id != journal.instance_id {
        return Err(Error::other("Restore journal references another instance."));
    }
    let (live, staging, backup) = restore_paths(&state.paths, &journal.instance_id, &journal.nonce);
    let live_exists = state.files.exists(&live)?;
    let staging_exists = state.files.exists(&staging)?;
    let backup_exists = state.files.exists(&backup)?;
    let mut receipt = match &journal.transaction_id {
        Some(id) => Some(state.db.transaction_receipt(id)?.ok_or_else(|| {
            Error::other("Restore journal's transaction receipt is missing; all files preserved")
        })?),
        None => None,
    };
    if let Some(receipt) = &receipt {
        if receipt.id != journal.nonce
            || receipt.plan.target_id != journal.instance_id
            || receipt.plan.target_revision_id != journal.target_snapshot_id
            || Path::new(&receipt.plan.source_path) != live
            || receipt.pre_change_snapshot.as_deref() != Some(&journal.safety_snapshot_id)
        {
            return Err(Error::other(
                "Restore receipt does not match journal ownership",
            ));
        }
        if receipt.owned_areas.len() != 2
            || !receipt.owned_areas.iter().any(|a| a.role == "staging")
            || !receipt.owned_areas.iter().any(|a| a.role == "backup")
        {
            return Err(Error::other(
                "Restore receipt has incomplete area ownership",
            ));
        }
        for area in &receipt.owned_areas {
            let expected = match area.role.as_str() {
                "staging" => &staging,
                "backup" => &backup,
                _ => return Err(Error::other("Unknown restore area")),
            };
            if Path::new(&area.path) != expected {
                return Err(Error::other(
                    "Restore area ownership does not match its journal",
                ));
            }
        }
    }
    let already_committed = receipt.as_ref().is_some_and(|r| {
        r.audit
            .iter()
            .any(|event| event.state == TransactionState::Committed)
    });
    let already_rolled_back = !already_committed
        && receipt.as_ref().is_some_and(|r| {
            r.audit
                .iter()
                .any(|event| event.state == TransactionState::RolledBack)
        });
    let recovery = (|| {
        for area in [&live, &staging, &backup] {
            if state.files.exists(area)?
                && state.files.symlink_metadata(area)?.file_type().is_symlink()
            {
                return Err(Error::other(
                    "Restore area became a symbolic link; all files preserved.",
                ));
            }
        }
        if live_exists && staging_exists && backup_exists {
            return Err(Error::other("Ambiguous restore activation state; live, staged, and backup files were all preserved for review."));
        }
        let target_hash = format!("{:x}", Sha256::digest(serde_json::to_vec(&target)?));
        if !already_committed
            && !already_rolled_back
            && receipt
                .as_ref()
                .is_some_and(|r| target_hash != r.plan.target_state_sha256)
        {
            return Err(Error::other(
                "Target snapshot changed after restore was staged; all files preserved for review.",
            ));
        }
        let mut restored_safety = already_rolled_back;
        if live_exists && !staging_exists && !already_committed && !already_rolled_back {
            let current = state
                .db
                .list_instances(&state.files)?
                .into_iter()
                .find(|i| i.id == journal.instance_id)
                .unwrap_or_else(|| safety.instance.clone());
            if !super::plan::restore_plan(state, &current, &target, None)?
                .changes
                .is_empty()
            {
                if super::plan::restore_plan(state, &current, &safety, None)?
                    .changes
                    .is_empty()
                {
                    restored_safety = true;
                } else {
                    return Err(Error::other("Recovered live files differ from the verified target and safety snapshots. Live files and backup were preserved for review."));
                }
            }
        }
        let mut recovered_state = if restored_safety {
            TransactionState::RolledBack
        } else {
            TransactionState::Committed
        };
        let recovered_manifest = if restored_safety { &safety } else { &target };

        if backup_exists && live_exists {
            if let Err(error) = if already_committed || already_rolled_back {
                Ok(())
            } else {
                restore_database_from_manifest(state, &journal.instance_id, recovered_manifest)
            } {
                let failed = state.paths.instances().join(format!(
                    ".restore-failed-{}-{}",
                    journal.instance_id, journal.nonce
                ));
                state.files.rename(&live, &failed)?;
                if let Err(rollback) = state.files.rename(&backup, &live) {
                    let _ = state.files.rename(&failed, &live);
                    return Err(Error::other(format!(
                    "could not finish recovered snapshot metadata: {error}; filesystem rollback failed: {rollback}"
                )));
                }
                restore_database_from_manifest(state, &journal.instance_id, &safety)?;
                recovered_state = TransactionState::RolledBack;
                state.files.remove_managed_dir_all_if_exists(failed)?;
            } else {
                state.files.remove_managed_dir_all_if_exists(&backup)?;
            }
            state.files.remove_managed_dir_all_if_exists(&staging)?;
        } else if backup_exists {
            recovered_state = TransactionState::RolledBack;
            state.files.rename(&backup, &live)?;
            restore_database_from_manifest(state, &journal.instance_id, &safety)?;
            state.files.remove_managed_dir_all_if_exists(&staging)?;
        } else if live_exists && staging_exists {
            recovered_state = TransactionState::RolledBack;
            state.files.remove_managed_dir_all_if_exists(&staging)?;
            restore_database_from_manifest(state, &journal.instance_id, &safety)?;
        } else if live_exists {
            if !already_committed && !already_rolled_back {
                restore_database_from_manifest(state, &journal.instance_id, recovered_manifest)?;
            }
        } else {
            return Err(Error::other(format!(
            "Cannot recover restore for {} because both the live instance and backup are missing.",
            journal.instance_id
        )));
        }
        Ok(recovered_state)
    })();
    if let Err(error) = &recovery {
        if let Some(receipt) = &mut receipt {
            receipt.error = Some(error.to_string());
            receipt.advance(
                &state.db,
                TransactionState::RecoveryRequired,
                "Recovery stopped before discarding retained files; review the recorded blocker.",
            )?;
        }
    }
    let recovered_state = recovery?;
    if let Some(receipt) = &mut receipt {
        for area in &mut receipt.owned_areas {
            area.removed = !state.files.exists(&area.path)?;
        }
        receipt.error = None;
        receipt.advance(
            &state.db,
            recovered_state,
            "Recovered from the owned snapshot journal; filesystem and metadata reconciled.",
        )?;
    }
    state.files.remove_file_if_exists(path)?;
    tracing::info!(instance_id = %journal.instance_id, "recovered interrupted snapshot restore");
    Ok(())
}

fn reconcile_transaction_receipts(state: &AppState, store: &SnapshotStore) -> Result<()> {
    for value in state.db.library_list("transaction:")? {
        let Ok(mut receipt) = serde_json::from_value::<TransactionReceipt>(value) else {
            continue;
        };
        if receipt.plan.operation != "restore_instance_snapshot" {
            continue;
        }
        uuid::Uuid::parse_str(&receipt.id)
            .map_err(|_| Error::other("Invalid restore transaction identity"))?;
        uuid::Uuid::parse_str(&receipt.plan.target_id)
            .map_err(|_| Error::other("Invalid restore transaction instance"))?;
        let (live, staging, backup) =
            restore_paths(&store.paths, &receipt.plan.target_id, &receipt.id);
        let journal = store
            .paths
            .snapshot_restore_journal_checked(&receipt.plan.target_id)
            .ok_or_else(|| Error::other("Invalid restore journal target"))?;
        if store.files.exists(&journal)? || instance_busy(state, &receipt.plan.target_id) {
            continue;
        }
        for area in &receipt.owned_areas {
            let expected = match area.role.as_str() {
                "staging" => &staging,
                "backup" => &backup,
                _ => return Err(Error::other("Unknown restore transaction area")),
            };
            if Path::new(&area.path) != expected {
                return Err(Error::other(
                    "Restore area does not match its transaction identity",
                ));
            }
        }
        if matches!(
            receipt.state,
            TransactionState::Planned | TransactionState::Staging | TransactionState::RolledBack
        ) && receipt.owned_areas.iter().any(|a| !a.removed)
        {
            if store.files.exists(&backup)? || !store.files.exists(&live)? {
                receipt.advance(
                    &store.db,
                    TransactionState::RecoveryRequired,
                    "Unexpected activation state; all remaining files preserved for recovery.",
                )?;
                continue;
            }
            // No activation journal exists and this receipt never entered Applying.
            // Only the exact staging path reserved by this transaction may be removed.
            if store.files.exists(&staging)?
                && store
                    .files
                    .symlink_metadata(&staging)?
                    .file_type()
                    .is_symlink()
            {
                return Err(Error::other(
                    "Restore staging became a link; it was preserved",
                ));
            }
            store.files.remove_managed_dir_all_if_exists(&staging)?;
            receipt.error = Some(
                "Worker interrupted before activation; original instance remains active.".into(),
            );
            for area in &mut receipt.owned_areas {
                area.removed = !store.files.exists(&area.path)?;
            }
            receipt.advance(&store.db,TransactionState::RolledBack,"Discarded verified owned staging after interruption before activation. Original instance was not replaced.")?;
        }
        if let Some(task_id) = &receipt.task_id {
            if let Ok(detail) = state.tasks.detail(task_id) {
                for area in &receipt.owned_areas {
                    let resource_id = format!("{}:{}", receipt.id, area.role);
                    let already = detail["task"]["details"]["cleanup"]
                        .as_array()
                        .into_iter()
                        .flatten()
                        .any(|r| {
                            r["id"] == resource_id
                                && r["state"] == if area.removed { "removed" } else { "retained" }
                        });
                    if !already {
                        state.tasks.cleanup_result(
                            task_id,
                            &resource_id,
                            area.removed,
                            "Snapshot recovery reconciled this owned transaction area.",
                        )?;
                    }
                }
            }
        }
    }
    Ok(())
}

pub(crate) fn recover_interrupted(state: &AppState) -> Result<()> {
    let _guard = store_guard()?;
    let store = SnapshotStore::from_state(state);
    let root = store.paths.snapshot_restore_journals();
    let mut first_error = None;
    if store.files.exists(&root)? {
        for path in store.files.read_dir(&root)? {
            if path.extension().and_then(|value| value.to_str()) == Some("json") {
                if let Ok(journal) =
                    serde_json::from_slice::<RestoreJournal>(&store.files.read(&path)?)
                {
                    if instance_busy(state, &journal.instance_id) {
                        first_error.get_or_insert_with(|| {
                            Error::other("A snapshot recovery is waiting for its instance to stop.")
                        });
                        continue;
                    }
                }
                if let Err(error) = recover_journal(&store, &path) {
                    tracing::error!(path = %path.display(), %error, "could not recover snapshot restore");
                    if first_error.is_none() {
                        first_error = Some(error);
                    }
                }
            }
        }
    }
    if let Err(error) = garbage_collect(&store) {
        tracing::warn!(%error, "could not collect snapshot blobs during startup recovery");
    }
    if let Err(error) = reconcile_transaction_receipts(state, &store) {
        first_error.get_or_insert(error);
    }
    match first_error {
        Some(error) => Err(error),
        None => Ok(()),
    }
}

pub(crate) async fn restore(
    app: &AppHandle,
    state: &AppState,
    instance: Instance,
    snapshot_id: &str,
) -> Result<SnapshotSummary> {
    restore_with_target(Some(app), state, instance, snapshot_id, None).await
}

pub(crate) async fn restore_ipc(
    state: &AppState,
    instance: Instance,
    snapshot_id: &str,
    expected_plan_id: Option<String>,
) -> Result<SnapshotSummary> {
    restore_with_target(None, state, instance, snapshot_id, expected_plan_id).await
}

async fn restore_with_target(
    app: Option<&AppHandle>,
    state: &AppState,
    instance: Instance,
    snapshot_id: &str,
    expected_plan_id: Option<String>,
) -> Result<SnapshotSummary> {
    super::ensure_no_pending_restore(state, &instance.id)?;
    if instance_busy(state, &instance.id) {
        return Err(Error::other(
            "Stop the instance and wait for its current task before restoring a snapshot.",
        ));
    }
    let snapshot_path = state
        .paths
        .snapshot_dir_checked(&instance.id, snapshot_id)
        .ok_or_else(|| Error::other("invalid snapshot id"))?;
    let snapshot_id = snapshot_id.to_string();
    let spec = TaskSpec {
        title: format!("Restore {}", instance.name),
        instance_id: Some(instance.id.clone()),
        ..Default::default()
    };
    let task = Arc::new(match app {
        Some(app) => state.tasks.start(app, TaskKind::SnapshotRestore, spec)?,
        None => state.tasks.start_ipc(TaskKind::SnapshotRestore, spec)?,
    });
    let instance_id = instance.id.clone();
    let store = SnapshotStore::from_state(state);
    let tasks = state.tasks.clone();
    let result = match tokio::task::spawn_blocking({
        let task = Arc::clone(&task);
        move || {
            let _guard = store_guard()?;
            let manifest = read_manifest(&store.files, &snapshot_path)?;
            if manifest.instance.id != instance.id || manifest.id != snapshot_id {
                return Err(Error::other("Snapshot identity does not match its location."));
            }

            let journal_path = store
                .paths
                .snapshot_restore_journal_checked(&instance.id)
                .ok_or_else(|| Error::other("invalid instance id for restore journal"))?;
            if store.files.exists(&journal_path)? {
                return Err(Error::other(
                    "This instance has an interrupted restore that must be recovered first.",
                ));
            }
            task.stage("checking-restore-plan");
            let plan=super::plan::restore_plan(&store,&instance,&manifest,Some(&task))?;
            if expected_plan_id.as_ref().is_some_and(|id|id!=&plan.id){return Err(Error::other("Instance or snapshot changed since this restore was reviewed. Refresh the restore plan before applying it."));}
            let nonce = uuid::Uuid::new_v4().to_string();
            let (live, staging, backup) = restore_paths(&store.paths, &instance.id, &nonce);
            let mut receipt=TransactionReceipt{schema_version:1,id:nonce.clone(),task_id:Some(task.id().into()),plan,state:TransactionState::Planned,pre_change_snapshot:None,
                owned_areas:vec![TransactionArea{role:"staging".into(),path:staging.display().to_string(),removed:false},TransactionArea{role:"backup".into(),path:backup.display().to_string(),removed:false}],audit:Vec::new(),error:None};
            receipt.advance(&store.db,TransactionState::Planned,"Exact source bytes and target snapshot measured; original state is still active.")?;
            task.bind_run(&nonce)?;
            task.own_resource("snapshot_staging",&format!("{nonce}:staging"),&staging)?;
            task.own_resource("snapshot_backup",&format!("{nonce}:backup"),&backup)?;
            let work=(||{

            task.stage("safety-snapshot");
            let safety_name = format!("Before restoring {}", manifest.name)
                .chars()
                .take(80)
                .collect::<String>();
            let safety = match create_snapshot_sync(
                &store,
                &instance,
                clean_name(&safety_name)?,
                SnapshotKind::Automatic,
                &manifest.excluded,
                Some(&task),
            ) {
                Ok(safety) => safety,
                Err(error) => {
                    if let Err(cleanup_error) = garbage_collect(&store) {
                        tracing::warn!(%cleanup_error, "could not clean incomplete safety snapshot blobs");
                    }
                    return Err(error);
                }
            };
            receipt.pre_change_snapshot=Some(safety.id.clone());
            receipt.advance(&store.db,TransactionState::Staging,"Pre-change safety snapshot retained; preparing verified replacement files.")?;

            task.stage("verifying-and-staging");
            if let Err(error) = stage_restore(&store, &manifest, &live, &staging, Some(&task)) {
                let _ = store.files.remove_managed_dir_all_if_exists(&staging);
                return Err(error);
            }
            if let Err(error) = check_cancelled(Some(&task)) {
                let _ = store.files.remove_managed_dir_all_if_exists(&staging);
                return Err(error);
            }
            task.stage("rechecking-restore-inputs");
            let current_instance=store.db.list_instances(&store.files)?.into_iter().find(|i|i.id==instance.id).ok_or_else(||Error::other("Instance disappeared while preparing restore"))?;
            let current_manifest=read_manifest(&store.files,&snapshot_path)?;
            let current=super::plan::restore_plan(&store,&current_instance,&current_manifest,Some(&task))?;
            if current.id!=receipt.plan.id {
                store.files.remove_managed_dir_all_if_exists(&staging)?;
                return Err(Error::other("Instance or snapshot changed while restore was being staged. Original files were preserved; review a fresh plan."));
            }

            let journal = RestoreJournal {
                schema_version: 1,
                instance_id: instance.id.clone(),
                target_snapshot_id: manifest.id.clone(),
                safety_snapshot_id: safety.id,
                nonce:nonce.clone(),
                transaction_id:Some(nonce.clone()),
            };
            let journal_bytes = serde_json::to_vec_pretty(&journal)?;
            if let Err(error) = store.files.write_atomic(&journal_path, &journal_bytes) {
                let _ = store.files.remove_managed_dir_all_if_exists(&staging);
                return Err(error);
            }

            task.stage("activating-restore");
            receipt.advance(&store.db,TransactionState::Applying,"Verified staged files are ready; activation is protected by the durable recovery journal.")?;
            if let Err(error) = store.files.rename(&live, &backup) {
                let _ = store.files.remove_managed_dir_all_if_exists(&staging);
                let _ = store.files.remove_file_if_exists(&journal_path);
                return Err(error);
            }
            if let Err(error) = store.files.rename(&staging, &live) {
                let rollback = store.files.rename(&backup, &live);
                let _ = store.files.remove_managed_dir_all_if_exists(&staging);
                return match rollback {
                    Ok(()) => {
                        let _ = store.files.remove_file_if_exists(&journal_path);
                        Err(error)
                    }
                    Err(rollback) => Err(Error::other(format!(
                        "restore activation failed: {error}; restoring the original folder also failed: {rollback}"
                    ))),
                };
            }
            if let Err(error) = store.db.restore_instance_snapshot(
                &instance.id,
                &manifest.instance,
                &manifest.content,
            ) {
                let _ = store.files.remove_managed_dir_all_if_exists(&live);
                let rollback = store.files.rename(&backup, &live);
                return match rollback {
                    Ok(()) => {
                        let _ = store.files.remove_file_if_exists(&journal_path);
                        Err(error)
                    }
                    Err(rollback) => Err(Error::other(format!(
                        "snapshot metadata failed: {error}; restoring the original folder also failed: {rollback}"
                    ))),
                };
            }
            receipt.advance(&store.db,TransactionState::Committed,"Staged files and instance metadata committed; removing only owned temporary areas.")?;
            match store.files.remove_managed_dir_all_if_exists(&backup) {
                Ok(_) => {
                    store.files.remove_file_if_exists(&journal_path)?;
                    if let Err(error) = maintain_snapshot_storage(&store) {
                        tracing::warn!(%error, "could not collect unused snapshot blobs");
                    }
                }
                Err(error) => {
                    tracing::warn!(%error, "could not remove restore backup; startup recovery will retry");
                }
            }
            Ok(manifest.summary())
            })();
            // Any failure before journal creation must also discard our staging,
            // including errors while re-reading or hashing the current inputs.
            if work.is_err() && !store.files.exists(&journal_path)? && !store.files.exists(&backup)? && store.files.exists(&live)? {
                if let Err(error)=store.files.remove_managed_dir_all_if_exists(&staging){tracing::warn!(%error,"Owned restore staging retained for recovery");}
            }
            for area in &mut receipt.owned_areas {
                area.removed=store.files.exists(&area.path).is_ok_and(|exists|!exists);
                tasks.cleanup_result(task.id(),&format!("{nonce}:{}",area.role),area.removed,if area.removed{"Owned snapshot transaction area removed."}else{"Retained for journal recovery; original safety snapshot remains available."})?;
            }
            let final_state=if work.is_ok(){TransactionState::Committed}else if store.files.exists(&journal_path)?{TransactionState::RecoveryRequired}else{TransactionState::RolledBack};
            receipt.error=work.as_ref().err().map(ToString::to_string);
            receipt.advance(&store.db,final_state,if work.is_ok(){"Restore completed; audit receipt retained."}else{"Restore stopped; retained journal or original state determines recovery."})?;
            work
        }
    })
    .await
    {
        Ok(result) => result,
        Err(error) => Err(Error::other(format!("snapshot restore task failed: {error}"))),
    };
    task.finish(&result);
    if result.is_ok() {
        state.media_cache.lock().unwrap().remove(&instance_id);
    }
    result
}
