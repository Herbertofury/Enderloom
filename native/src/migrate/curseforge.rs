use std::path::{Path, PathBuf};

use serde_json::Value;

use crate::{
    config::Instance,
    db::{ContentFile, Db},
    error::{Error, Result},
    files::FileManager,
    tasks::TaskHandle,
};

use super::{
    candidate_roots, relative_within, ConnectionOutcome, ExternalInstanceState, LauncherKind,
    LauncherSource, MigrationCandidate, MigrationOutcome, MigrationScan,
};

const MAX_MANIFEST_BYTES: u64 = 8 * 1024 * 1024;

fn instances_dir(root: &Path) -> PathBuf {
    if root
        .file_name()
        .is_some_and(|name| name.to_string_lossy().eq_ignore_ascii_case("Instances"))
    {
        root.to_path_buf()
    } else {
        root.join("Instances")
    }
}

fn manifests(files: &FileManager, root: &Path) -> Vec<PathBuf> {
    files
        .read_external_dir(instances_dir(root))
        .unwrap_or_default()
        .into_iter()
        .filter_map(|dir| {
            let manifest = dir.join("minecraftinstance.json");
            let metadata = files.external_symlink_metadata(&manifest).ok()?;
            (metadata.is_file() && metadata.len() <= MAX_MANIFEST_BYTES).then_some(manifest)
        })
        .collect()
}

fn read_manifest(files: &FileManager, path: &Path) -> Result<Value> {
    let metadata = files.external_symlink_metadata(path)?;
    if !metadata.is_file() || metadata.len() > MAX_MANIFEST_BYTES {
        return Err(Error::other(
            "CurseForge instance metadata is missing or too large",
        ));
    }
    Ok(serde_json::from_slice(&files.read_external(path)?)?)
}

fn loader_from_manifest(raw: &Value) -> (Option<String>, Option<String>) {
    let name = raw
        .get("baseModLoader")
        .and_then(|loader| loader.get("name"))
        .and_then(Value::as_str)
        .or_else(|| raw.get("baseModLoaderName").and_then(Value::as_str))
        .unwrap_or_default();
    let lower = name.to_ascii_lowercase();
    let kind = ["neoforge", "forge", "fabric", "quilt"]
        .into_iter()
        .find(|candidate| lower.contains(candidate))
        .map(str::to_string);
    let version = name
        .split_once('-')
        .map(|(_, version)| version.trim().to_string())
        .filter(|version| !version.is_empty());
    (kind, version)
}

fn string_id(value: Option<&Value>) -> Option<String> {
    match value {
        Some(Value::String(value)) if !value.trim().is_empty() => Some(value.clone()),
        Some(Value::Number(value)) => Some(value.to_string()),
        _ => None,
    }
}

fn pack_ids(raw: &Value) -> (Option<String>, Option<String>) {
    let pack = raw.get("installedModpack");
    let project = pack.and_then(|value| {
        string_id(value.get("projectId"))
            .or_else(|| string_id(value.get("addonID")))
            .or_else(|| string_id(value.get("id")))
    });
    let version = pack.and_then(|value| {
        string_id(value.get("fileId"))
            .or_else(|| string_id(value.get("installedFileId")))
            .or_else(|| string_id(value.get("latestFileId")))
    });
    (project, version)
}

fn candidate(files: &FileManager, manifest: &Path) -> Result<MigrationCandidate> {
    let raw = read_manifest(files, manifest)?;
    let dir = manifest
        .parent()
        .ok_or_else(|| Error::other("CurseForge instance metadata has no parent folder"))?;
    let folder_id = dir
        .file_name()
        .unwrap_or_default()
        .to_string_lossy()
        .into_owned();
    let id = raw
        .get("guid")
        .and_then(Value::as_str)
        .or_else(|| raw.get("instanceID").and_then(Value::as_str))
        .filter(|value| !value.trim().is_empty())
        .unwrap_or(&folder_id)
        .to_string();
    let name = raw
        .get("name")
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
        .unwrap_or(&folder_id)
        .to_string();
    let version_id = raw
        .get("gameVersion")
        .and_then(Value::as_str)
        .or_else(|| raw.get("minecraftVersion").and_then(Value::as_str))
        .unwrap_or_default()
        .to_string();
    let (loader, loader_version) = loader_from_manifest(&raw);
    let present = files
        .external_metadata(dir)
        .is_ok_and(|metadata| metadata.is_dir());
    let mut warnings = Vec::new();
    if !present {
        warnings.push("The instance target is unavailable.".to_string());
    }
    if version_id.is_empty() {
        warnings.push("No Minecraft version is recorded.".to_string());
    }
    let entries = if present {
        super::walk_files(files, dir, &|_| false).unwrap_or_default()
    } else {
        Vec::new()
    };
    let mod_count = entries
        .iter()
        .filter(|(path, _)| {
            path.strip_prefix(dir)
                .ok()
                .and_then(|relative| relative.components().next())
                .is_some_and(|part| {
                    part.as_os_str()
                        .to_string_lossy()
                        .eq_ignore_ascii_case("mods")
                })
        })
        .count();
    let (pack_project, _) = pack_ids(&raw);
    Ok(MigrationCandidate {
        id,
        name,
        version_id,
        loader,
        loader_version,
        icon_data_url: None,
        pack: pack_project.map(|_| "curseforge".to_string()),
        mod_count,
        file_count: entries.len(),
        total_bytes: entries.iter().map(|(_, size)| size).sum(),
        last_played_ms: raw.get("lastPlayed").and_then(Value::as_i64),
        warnings,
        importable: present,
        imported: false,
    })
}

pub fn detect(files: &FileManager) -> Vec<LauncherSource> {
    let mut candidates = candidate_roots(&["curseforge/minecraft", "Curse/Minecraft"]);
    if let Some(configured) = std::env::var_os("ENDERLOOM_CURSEFORGE_ROOT") {
        candidates.insert(0, PathBuf::from(configured));
    }
    #[cfg(target_os = "windows")]
    for letter in b'C'..=b'Z' {
        candidates.push(
            PathBuf::from(format!("{}:\\", letter as char))
                .join("Minecraft")
                .join("Curseforge"),
        );
    }

    let mut output = Vec::new();
    let mut seen = std::collections::HashSet::new();
    for root in candidates {
        let count = manifests(files, &root).len();
        if count == 0 {
            continue;
        }
        let identity = files
            .canonicalize_external(&root)
            .unwrap_or_else(|_| root.clone());
        if !seen.insert(identity) {
            continue;
        }
        output.push(LauncherSource {
            kind: LauncherKind::Curseforge,
            label: "CurseForge".to_string(),
            root: root.display().to_string(),
            instance_count: count,
        });
    }
    output
}

pub fn scan(files: &FileManager, root: &Path) -> Result<MigrationScan> {
    let mut candidates = manifests(files, root)
        .into_iter()
        .filter_map(|manifest| candidate(files, &manifest).ok())
        .collect::<Vec<_>>();
    candidates.sort_by(|left, right| {
        left.name
            .to_ascii_lowercase()
            .cmp(&right.name.to_ascii_lowercase())
    });
    Ok(MigrationScan {
        kind: LauncherKind::Curseforge,
        root: root.display().to_string(),
        candidates,
    })
}

pub fn external_path(files: &FileManager, root: &Path, id: &str) -> Result<PathBuf> {
    manifests(files, root)
        .into_iter()
        .find(|manifest| candidate(files, manifest).is_ok_and(|candidate| candidate.id == id))
        .and_then(|manifest| manifest.parent().map(Path::to_path_buf))
        .ok_or_else(|| Error::other(format!("unknown CurseForge instance {id}")))
}

pub fn external_state(files: &FileManager, root: &Path, id: &str) -> Result<ExternalInstanceState> {
    let source_dir = external_path(files, root, id)?;
    let raw = read_manifest(files, &source_dir.join("minecraftinstance.json"))?;
    let summary = candidate(files, &source_dir.join("minecraftinstance.json"))?;
    let real_dir = files.canonicalize_external(&source_dir)?;
    let (pack_project_id, pack_version_id) = pack_ids(&raw);
    Ok(ExternalInstanceState {
        source_dir,
        real_dir,
        version_id: summary.version_id,
        loader: summary.loader,
        loader_version: summary.loader_version,
        pack_provider: pack_project_id.as_ref().map(|_| "curseforge".to_string()),
        pack_project_id,
        pack_version_id,
        last_played_at: summary.last_played_ms.map(|value| value / 1000),
    })
}

fn record_content(files: &FileManager, db: &Db, instance_id: &str, dir: &Path) -> Result<()> {
    let installed_at = chrono::Utc::now().timestamp();
    for (folder, kind) in [
        ("mods", "mods"),
        ("resourcepacks", "resourcepacks"),
        ("shaderpacks", "shaderpacks"),
    ] {
        for path in files
            .read_external_dir(dir.join(folder))
            .unwrap_or_default()
        {
            let Ok(metadata) = files.external_symlink_metadata(&path) else {
                continue;
            };
            if !metadata.is_file() {
                continue;
            }
            let raw = path.file_name().unwrap_or_default().to_string_lossy();
            let file_name = raw.trim_end_matches(".disabled").to_string();
            db.record_content_file(
                instance_id,
                kind,
                &ContentFile {
                    file_name,
                    sha1: None,
                    sha512: None,
                    murmur2: None,
                    provider: None,
                    project_id: None,
                    version_id: None,
                    title: None,
                    icon_url: None,
                    mod_id: None,
                    mod_version: None,
                    dependencies: None,
                    origin: "user".to_string(),
                    pack_version_id: None,
                    installed_at,
                },
            )?;
        }
    }
    Ok(())
}

fn same_path(left: &Path, right: &Path) -> bool {
    if cfg!(windows) {
        left.to_string_lossy()
            .eq_ignore_ascii_case(&right.to_string_lossy())
    } else {
        left == right
    }
}

pub fn connect(
    files: &FileManager,
    db: &Db,
    root: &Path,
    ids: &[String],
) -> Result<ConnectionOutcome> {
    let mut known = db.external_instance_real_dirs()?;
    let mut outcome = ConnectionOutcome {
        connected: Vec::new(),
        failed: Vec::new(),
    };
    for source_id in ids {
        let result = (|| -> Result<String> {
            let source = external_path(files, root, source_id)?;
            let real = files.canonicalize_external(&source)?;
            if known.iter().any(|path| same_path(path, &real)) {
                return Err(Error::other(
                    "That physical instance is already connected, possibly through another launcher link.",
                ));
            }
            let raw = read_manifest(files, &source.join("minecraftinstance.json"))?;
            let candidate = candidate(files, &source.join("minecraftinstance.json"))?;
            if candidate.version_id.is_empty() {
                return Err(Error::other("instance has no Minecraft version"));
            }
            let (pack_project_id, pack_version_id) = pack_ids(&raw);
            let id = uuid::Uuid::new_v4().to_string();
            let instance = Instance {
                id: id.clone(),
                name: candidate.name,
                version_id: candidate.version_id,
                created_at: chrono::Utc::now(),
                min_memory_mb: None,
                max_memory_mb: None,
                java_path: None,
                last_played_at: candidate.last_played_ms.map(|value| value / 1000),
                playtime_secs: 0,
                dir: source.display().to_string(),
                logo: None,
                loader: candidate.loader,
                loader_version: candidate.loader_version,
                launch_version_id: None,
                pack_provider: pack_project_id.as_ref().map(|_| "curseforge".to_string()),
                pack_project_id,
                pack_version_id,
                jvm_args: None,
                jvm_args_mode: None,
                env_vars: None,
                env_vars_mode: None,
                import_source: Some("curseforge".to_string()),
                import_source_id: Some(source_id.clone()),
                banner_id: None,
                notes: None,
                wrapper_command: None,
                pre_launch_command: None,
                post_exit_command: None,
            };
            db.insert_external_instance(&instance, &source, &real, root)?;
            if let Err(error) = record_content(files, db, &id, &source) {
                let _ = db.delete_instance_content_files(&id);
                let _ = db.delete_instance(&id);
                return Err(error);
            }
            known.push(real);
            Ok(id)
        })();
        match result {
            Ok(id) => outcome.connected.push(id),
            Err(error) => outcome.failed.push((source_id.clone(), error.to_string())),
        }
    }
    Ok(outcome)
}

pub fn import(
    files: &FileManager,
    db: &Db,
    root: &Path,
    ids: &[String],
    task: &TaskHandle,
) -> Result<MigrationOutcome> {
    let mut planned = Vec::new();
    let mut total_bytes = 0u64;
    for source_id in ids {
        let source = external_path(files, root, source_id)?;
        let entries = super::walk_files(files, &source, &|_| false)?;
        total_bytes = total_bytes.saturating_add(entries.iter().map(|(_, size)| size).sum::<u64>());
        planned.push((source_id.clone(), source, entries));
    }

    task.stage("copying");
    let mut done = 0u64;
    let mut outcome = MigrationOutcome {
        imported: Vec::new(),
        failed: Vec::new(),
    };
    for (source_id, source, entries) in planned {
        if task.token().is_cancelled() {
            return Err(Error::Cancelled);
        }
        let instance_id = uuid::Uuid::new_v4().to_string();
        let destination = files.paths().instance_dir(&instance_id);
        let result = (|| -> Result<()> {
            let raw = read_manifest(files, &source.join("minecraftinstance.json"))?;
            let candidate = candidate(files, &source.join("minecraftinstance.json"))?;
            if candidate.version_id.is_empty() {
                return Err(Error::other("instance has no Minecraft version"));
            }
            files.ensure_dir(&destination)?;
            for (path, size) in &entries {
                if task.token().is_cancelled() {
                    return Err(Error::Cancelled);
                }
                let Some(relative) = relative_within(&source, path) else {
                    continue;
                };
                let target = destination.join(relative);
                if let Some(parent) = target.parent() {
                    files.ensure_dir(parent)?;
                }
                files.copy_external_into_sync(path, target)?;
                done = done.saturating_add(*size);
                task.progress(done, total_bytes, done, total_bytes);
            }
            let (pack_project_id, pack_version_id) = pack_ids(&raw);
            db.insert_instance(&Instance {
                id: instance_id.clone(),
                name: candidate.name,
                version_id: candidate.version_id,
                created_at: chrono::Utc::now(),
                min_memory_mb: None,
                max_memory_mb: None,
                java_path: None,
                last_played_at: candidate.last_played_ms.map(|value| value / 1000),
                playtime_secs: 0,
                dir: destination.display().to_string(),
                logo: None,
                loader: candidate.loader,
                loader_version: candidate.loader_version,
                launch_version_id: None,
                pack_provider: pack_project_id.as_ref().map(|_| "curseforge".to_string()),
                pack_project_id,
                pack_version_id,
                jvm_args: None,
                jvm_args_mode: None,
                env_vars: None,
                env_vars_mode: None,
                import_source: Some("curseforge".to_string()),
                import_source_id: Some(source_id.clone()),
                banner_id: None,
                notes: None,
                wrapper_command: None,
                pre_launch_command: None,
                post_exit_command: None,
            })?;
            record_content(files, db, &instance_id, &destination)?;
            Ok(())
        })();
        match result {
            Ok(()) => outcome.imported.push(instance_id),
            Err(error) => {
                let _ = db.delete_instance_content_files(&instance_id);
                let _ = db.delete_instance(&instance_id);
                let _ = files.remove_instance_dir(&instance_id);
                if matches!(error, Error::Cancelled) {
                    return Err(error);
                }
                outcome.failed.push((source_id, error.to_string()));
            }
        }
    }
    Ok(outcome)
}
