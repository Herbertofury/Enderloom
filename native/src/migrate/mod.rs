mod atlauncher;
mod curseforge;
mod modrinth;
mod prism;

use std::path::{Path, PathBuf};

use serde::Serialize;

use crate::{
    db::Db,
    error::{Error, Result},
    files::FileManager,
    tasks::TaskHandle,
};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum LauncherKind {
    Atlauncher,
    Prism,
    Modrinth,
    Curseforge,
}

impl LauncherKind {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Atlauncher => "atlauncher",
            Self::Prism => "prism",
            Self::Modrinth => "modrinth",
            Self::Curseforge => "curseforge",
        }
    }

    pub fn parse(value: &str) -> Result<Self> {
        match value {
            "atlauncher" => Ok(Self::Atlauncher),
            "prism" => Ok(Self::Prism),
            "modrinth" => Ok(Self::Modrinth),
            "curseforge" => Ok(Self::Curseforge),
            other => Err(Error::other(format!("unknown launcher {other}"))),
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct LauncherSource {
    pub kind: LauncherKind,
    pub label: String,
    pub root: String,
    pub instance_count: usize,
}

#[derive(Debug, Clone, Serialize)]
pub struct MigrationCandidate {
    pub id: String,
    pub name: String,
    pub version_id: String,
    pub loader: Option<String>,
    pub loader_version: Option<String>,
    pub icon_data_url: Option<String>,
    pub pack: Option<String>,
    pub mod_count: usize,
    pub file_count: usize,
    pub total_bytes: u64,
    pub last_played_ms: Option<i64>,
    pub warnings: Vec<String>,
    pub importable: bool,
    pub imported: bool,
}

#[derive(Debug, Clone, Serialize)]
pub struct MigrationScan {
    pub kind: LauncherKind,
    pub root: String,
    pub candidates: Vec<MigrationCandidate>,
}

#[derive(Debug, Clone, Serialize)]
pub struct MigrationOutcome {
    pub imported: Vec<String>,
    pub failed: Vec<(String, String)>,
}

#[derive(Debug, Clone, Serialize)]
pub struct ConnectionOutcome {
    pub connected: Vec<String>,
    pub failed: Vec<(String, String)>,
}

#[derive(Debug, Clone)]
pub struct ExternalInstanceState {
    pub source_dir: PathBuf,
    pub real_dir: PathBuf,
    pub version_id: String,
    pub loader: Option<String>,
    pub loader_version: Option<String>,
    pub pack_provider: Option<String>,
    pub pack_project_id: Option<String>,
    pub pack_version_id: Option<String>,
    pub last_played_at: Option<i64>,
}

#[derive(Debug, Clone, Serialize)]
pub struct ExternalInstanceChange {
    pub instance_id: String,
    pub fields: Vec<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct ExternalReconcileReport {
    pub checked: usize,
    pub refreshed: usize,
    pub unavailable: Vec<String>,
    pub conflicts: Vec<(String, String)>,
    pub changes: Vec<ExternalInstanceChange>,
}

pub fn detect(files: &FileManager) -> Vec<LauncherSource> {
    let mut sources = [
        atlauncher::detect(files),
        prism::detect(files),
        modrinth::detect(files),
    ]
    .into_iter()
    .flatten()
    .collect::<Vec<_>>();
    sources.extend(curseforge::detect(files));
    sources
}

pub fn scan(
    files: &FileManager,
    db: &Db,
    kind: LauncherKind,
    root: &Path,
) -> Result<MigrationScan> {
    let already: std::collections::HashSet<String> = db
        .imported_sources(kind.as_str())
        .unwrap_or_default()
        .into_iter()
        .collect();
    let connected_real_dirs = db.external_instance_real_dirs().unwrap_or_default();

    let mut scan = match kind {
        LauncherKind::Atlauncher => atlauncher::scan(files, root)?,
        LauncherKind::Prism => prism::scan(files, root)?,
        LauncherKind::Modrinth => modrinth::scan(files, root)?,
        LauncherKind::Curseforge => curseforge::scan(files, root)?,
    };

    for candidate in &mut scan.candidates {
        let external = match kind {
            LauncherKind::Modrinth => modrinth::external_path(files, root, &candidate.id).ok(),
            LauncherKind::Curseforge => curseforge::external_path(files, root, &candidate.id).ok(),
            LauncherKind::Atlauncher | LauncherKind::Prism => None,
        };
        let already_connected = external
            .and_then(|path| files.canonicalize_external(path).ok())
            .is_some_and(|real| {
                connected_real_dirs.iter().any(|known| {
                    if cfg!(windows) {
                        known
                            .to_string_lossy()
                            .eq_ignore_ascii_case(&real.to_string_lossy())
                    } else {
                        known == &real
                    }
                })
            });
        if already_connected {
            candidate.imported = true;
            candidate.importable = false;
            candidate
                .warnings
                .push("This physical instance is already connected in place.".to_string());
        } else if already.contains(&candidate.id) {
            candidate.imported = true;
            candidate.importable = false;
        }
    }
    Ok(scan)
}

pub fn connect(
    files: &FileManager,
    db: &Db,
    kind: LauncherKind,
    root: &Path,
    ids: &[String],
) -> Result<ConnectionOutcome> {
    match kind {
        LauncherKind::Modrinth => modrinth::connect(files, db, root, ids),
        LauncherKind::Curseforge => curseforge::connect(files, db, root, ids),
        LauncherKind::Atlauncher | LauncherKind::Prism => Err(Error::other(
            "In-place connection is currently available for Modrinth and CurseForge profiles; use Clone for this launcher.",
        )),
    }
}

pub fn external_state(
    files: &FileManager,
    kind: LauncherKind,
    root: &Path,
    source_id: &str,
) -> Result<ExternalInstanceState> {
    match kind {
        LauncherKind::Modrinth => modrinth::external_state(files, root, source_id),
        LauncherKind::Curseforge => curseforge::external_state(files, root, source_id),
        LauncherKind::Atlauncher | LauncherKind::Prism => Err(Error::other(
            "That launcher does not support in-place instance reconciliation.",
        )),
    }
}

pub fn reconcile_external_instances(
    state: &crate::state::AppState,
) -> Result<ExternalReconcileReport> {
    let links = state.db.external_instance_links()?;
    let current = state
        .db
        .list_instances(&state.files)?
        .into_iter()
        .map(|instance| (instance.id.clone(), instance))
        .collect::<std::collections::HashMap<_, _>>();
    let mut report = ExternalReconcileReport {
        checked: links.len(),
        refreshed: 0,
        unavailable: Vec::new(),
        conflicts: Vec::new(),
        changes: Vec::new(),
    };

    for link in links {
        let kind = match LauncherKind::parse(&link.source) {
            Ok(kind) => kind,
            Err(error) => {
                report
                    .conflicts
                    .push((link.instance_id.clone(), error.to_string()));
                continue;
            }
        };
        let observed = match external_state(&state.files, kind, &link.root, &link.source_id) {
            Ok(observed) if !observed.version_id.trim().is_empty() => observed,
            Ok(_) => {
                report.conflicts.push((
                    link.instance_id.clone(),
                    "The external launcher no longer records a Minecraft version.".to_string(),
                ));
                continue;
            }
            Err(_) => {
                report.unavailable.push(link.instance_id.clone());
                continue;
            }
        };
        let Some(existing) = current.get(&link.instance_id) else {
            report.conflicts.push((
                link.instance_id.clone(),
                "The Enderloom instance record is missing.".to_string(),
            ));
            continue;
        };
        let mut fields = Vec::new();
        if existing.version_id != observed.version_id {
            fields.push("version".to_string());
        }
        if existing.loader != observed.loader || existing.loader_version != observed.loader_version
        {
            fields.push("loader".to_string());
        }
        if existing.pack_provider != observed.pack_provider
            || existing.pack_project_id != observed.pack_project_id
            || existing.pack_version_id != observed.pack_version_id
        {
            fields.push("modpack".to_string());
        }
        if PathBuf::from(&existing.dir) != observed.source_dir {
            fields.push("location".to_string());
        }
        if let Err(error) = state.db.refresh_external_instance(
            &link.instance_id,
            &observed.version_id,
            observed.loader.as_deref(),
            observed.loader_version.as_deref(),
            observed.pack_provider.as_deref(),
            observed.pack_project_id.as_deref(),
            observed.pack_version_id.as_deref(),
            &observed.source_dir,
            &observed.real_dir,
            observed.last_played_at,
        ) {
            report
                .conflicts
                .push((link.instance_id.clone(), error.to_string()));
            continue;
        }
        if !fields.is_empty() {
            report.refreshed += 1;
            report.changes.push(ExternalInstanceChange {
                instance_id: link.instance_id,
                fields,
            });
        }
    }
    state.adopt_external_dirs()?;
    Ok(report)
}

pub fn import(
    files: &FileManager,
    db: &Db,
    kind: LauncherKind,
    root: &Path,
    ids: &[String],
    task: &TaskHandle,
) -> Result<MigrationOutcome> {
    match kind {
        LauncherKind::Atlauncher => atlauncher::import(files, db, root, ids, task),
        LauncherKind::Prism => prism::import(files, db, root, ids, task),
        LauncherKind::Modrinth => modrinth::import(files, db, root, ids, task),
        LauncherKind::Curseforge => curseforge::import(files, db, root, ids, task),
    }
}

pub(super) fn relative_within(root: &Path, path: &Path) -> Option<PathBuf> {
    let relative = path.strip_prefix(root).ok()?;
    if relative
        .components()
        .any(|part| !matches!(part, std::path::Component::Normal(_)))
    {
        return None;
    }
    Some(relative.to_path_buf())
}

pub(super) fn home_dir() -> Option<PathBuf> {
    std::env::var_os("HOME")
        .or_else(|| std::env::var_os("USERPROFILE"))
        .map(PathBuf::from)
}

pub(super) fn candidate_roots(segments: &[&str]) -> Vec<PathBuf> {
    let mut roots = Vec::new();

    if let Some(data) = std::env::var_os("XDG_DATA_HOME") {
        roots.push(PathBuf::from(data));
    }
    if let Some(appdata) = std::env::var_os("APPDATA") {
        roots.push(PathBuf::from(appdata));
    }
    if let Some(home) = home_dir() {
        roots.push(home.join(".local").join("share"));
        roots.push(home.join("Library").join("Application Support"));
        roots.push(home);
    }

    roots
        .into_iter()
        .flat_map(|root| segments.iter().map(move |name| root.join(name)))
        .collect()
}

/// Walks a directory tree, skipping symbolic links and special files rather than failing on
/// them, since a game folder legitimately holds whatever mods decided to write there.
pub(super) fn walk_files(
    files: &FileManager,
    root: &Path,
    skip: &dyn Fn(&Path) -> bool,
) -> Result<Vec<(PathBuf, u64)>> {
    let mut pending = vec![root.to_path_buf()];
    let mut output = Vec::new();

    while let Some(directory) = pending.pop() {
        let entries = match files.read_external_dir(&directory) {
            Ok(entries) => entries,
            Err(_) => continue,
        };
        for path in entries {
            if skip(&path) {
                continue;
            }
            let Ok(metadata) = files.external_symlink_metadata(&path) else {
                continue;
            };
            if metadata.file_type().is_symlink() {
                continue;
            }
            if metadata.is_dir() {
                pending.push(path);
            } else if metadata.is_file() {
                output.push((path, metadata.len()));
            }
        }
    }

    Ok(output)
}
