//! Instance configuration, custom content and declared provenance. Never infer AI authorship.
use crate::{
    commands::find_instance,
    error::{Error, Result},
    files::FileManager,
    state::AppState,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use std::{
    collections::BTreeMap,
    io::{Read, Seek},
    path::{Path, PathBuf},
    sync::Mutex,
};

static TRANSACTION: Mutex<()> = Mutex::new(());
const STORE: &str = ".enderloom-workbench";
const MAX_TEXT: u64 = 2 * 1024 * 1024;
const MAX_ARCHIVE: u64 = 1024 * 1024 * 1024;

#[derive(Clone, Default, Serialize, Deserialize)]
#[serde(default)]
struct Revision {
    hash: String,
    at: i64,
    note: String,
    origin: String,
}

#[derive(Clone, Default, Serialize, Deserialize)]
#[serde(default)]
struct Record {
    path: String,
    title: String,
    origin: String,
    notes: String,
    source_url: String,
    provider: String,
    project_id: String,
    version_id: String,
    recipe: String,
    game_version: String,
    loader_version: String,
    original_hash: String,
    revisions: Vec<Revision>,
    update: Value,
    global_hash: String,
    provider_sha1: String,
    owner_mod_id: String,
    owner_mod_version: String,
}

#[derive(Default, Serialize, Deserialize)]
#[serde(default)]
struct Library {
    records: BTreeMap<String, Record>,
}

#[derive(Clone, Default, Serialize, Deserialize)]
#[serde(default)]
struct Preset {
    id: String,
    name: String,
    path: String,
    text: String,
    hash: String,
    game_version: String,
    updated_at: i64,
}

fn now() -> i64 {
    chrono::Utc::now().timestamp()
}
fn digest(bytes: &[u8]) -> String {
    format!("{:x}", Sha256::digest(bytes))
}
fn string<'a>(args: &'a Value, key: &str) -> &'a str {
    args.get(key).and_then(Value::as_str).unwrap_or("")
}
fn base(state: &AppState, id: &str) -> Result<PathBuf> {
    Ok(PathBuf::from(find_instance(state, id)?.dir))
}

// Reject aliases, traversal, alternate streams, junctions and symlinks, including inside a managed root.
fn resolve(root: &Path, relative: &str) -> Result<PathBuf> {
    if relative.is_empty() || relative.contains('\\') || relative.starts_with('/') {
        return Err(Error::other("Use a relative path inside this instance."));
    }
    let mut target = root.to_path_buf();
    for part in relative.split('/') {
        if part.is_empty()
            || part == "."
            || part == ".."
            || part.contains([':', '\0'])
            || part.ends_with(['.', ' '])
        {
            return Err(Error::other("This path is not a valid instance file."));
        }
        target.push(part);
        if let Ok(meta) = std::fs::symlink_metadata(&target) {
            #[cfg(windows)]
            {
                use std::os::windows::fs::MetadataExt;
                if meta.file_attributes() & 0x400 != 0 {
                    return Err(Error::other("Linked folders cannot be edited by Config."));
                }
            }
            if meta.file_type().is_symlink() {
                return Err(Error::other("Linked files cannot be edited by Config."));
            }
        }
    }
    Ok(target)
}

fn extension(path: &str) -> String {
    Path::new(path.trim_end_matches(".disabled"))
        .extension()
        .unwrap_or_default()
        .to_string_lossy()
        .to_lowercase()
}
fn editable(path: &str) -> bool {
    matches!(
        extension(path).as_str(),
        "json"
            | "json5"
            | "jsonc"
            | "toml"
            | "yaml"
            | "yml"
            | "properties"
            | "cfg"
            | "conf"
            | "ini"
            | "txt"
            | "mcmeta"
    )
}
fn allowed_file(path: &str) -> bool {
    let top = path.split('/').next().unwrap_or("");
    if top == "saves" {
        return path.split('/').nth(2) == Some("serverconfig")
            && path.split('/').count() >= 4
            && editable(path);
    }
    !top.starts_with('.')
        && !matches!(
            top.to_lowercase().as_str(),
            "saves" | "libraries" | "versions" | "natives" | "assets" | "logs"
        )
        && (path.contains('/')
            || matches!(path, "options.txt" | "optionsof.txt" | "optionsshaders.txt"))
        && (editable(path)
            || matches!(
                extension(path).as_str(),
                "zip" | "jar" | "js" | "zs" | "lua"
            ))
}
fn target(root: &Path, path: &str) -> Result<PathBuf> {
    if !allowed_file(path) {
        return Err(Error::other(
            "Choose a config, addon, script or mod file in an instance content folder.",
        ));
    }
    resolve(root, path)
}
fn storage(root: &Path, name: &str) -> Result<PathBuf> {
    resolve(root, &format!("{STORE}/{name}"))
}
fn load(files: &FileManager, root: &Path) -> Result<Library> {
    let path = storage(root, "library.json")?;
    if !files.exists(&path)? {
        return Ok(Library::default());
    }
    serde_json::from_slice(&files.read(path)?).map_err(|e| {
        Error::other(format!(
            "The tracking library is damaged; it has been preserved: {e}"
        ))
    })
}

fn reconcile_toggles(files: &FileManager, root: &Path, library: &mut Library) -> Result<()> {
    for old in library.records.keys().cloned().collect::<Vec<_>>() {
        let next = if old.ends_with(".disabled") {
            old.trim_end_matches(".disabled").to_string()
        } else {
            format!("{old}.disabled")
        };
        if library.records.contains_key(&next) {
            continue;
        }
        let (Ok(previous), Ok(current)) = (target(root, &old), target(root, &next)) else {
            continue;
        };
        if !files.exists(previous)? && files.is_file(current)? {
            if let Some(mut record) = library.records.remove(&old) {
                record.path = next.clone();
                library.records.insert(next, record);
            }
        }
    }
    Ok(())
}
fn save(files: &FileManager, root: &Path, library: &Library) -> Result<()> {
    files.write_atomic(
        storage(root, "library.json")?,
        &serde_json::to_vec_pretty(library)?,
    )
}
fn read_bytes(files: &FileManager, path: &Path, limit: u64) -> Result<Vec<u8>> {
    let mut reader = files.open(path)?.take(limit + 1);
    let mut bytes = Vec::new();
    reader.read_to_end(&mut bytes)?;
    if bytes.len() as u64 > limit {
        return Err(Error::other(
            "File exceeds the supported size for this operation.",
        ));
    }
    Ok(bytes)
}
fn hash_file(files: &FileManager, path: &Path) -> Result<String> {
    let mut reader = files.open(path)?;
    let mut hash = Sha256::new();
    let mut buffer = [0u8; 65536];
    loop {
        let count = reader.read(&mut buffer)?;
        if count == 0 {
            break;
        }
        hash.update(&buffer[..count]);
    }
    Ok(format!("{:x}", hash.finalize()))
}

fn sha1_file(files: &FileManager, path: &Path) -> Result<String> {
    let mut reader = files.open(path)?;
    let mut sha = sha1_smol::Sha1::new();
    let mut buffer = [0; 65536];
    loop {
        let count = reader.read(&mut buffer)?;
        if count == 0 {
            break;
        }
        sha.update(&buffer[..count]);
    }
    Ok(sha.digest().to_string())
}
fn archive_check<R: Read + Seek>(reader: R) -> Result<()> {
    let mut archive = zip::ZipArchive::new(reader)
        .map_err(|e| Error::other(format!("Damaged ZIP archive: {e}")))?;
    if archive.is_empty() {
        return Err(Error::other("This archive is empty."));
    }
    let mut total = 0u64;
    for i in 0..archive.len() {
        let mut file = archive
            .by_index(i)
            .map_err(|e| Error::other(format!("Damaged archive entry: {e}")))?;
        if file.enclosed_name().is_none() || file.name().contains('\\') || file.name().contains(':')
        {
            return Err(Error::other("Archive contains an unsafe path."));
        }
        total = total.saturating_add(file.size());
        if total > MAX_ARCHIVE {
            return Err(Error::other(
                "Archive expands beyond the 1 GiB validation limit.",
            ));
        }
        std::io::copy(&mut file, &mut std::io::sink())
            .map_err(|e| Error::other(format!("Archive checksum failed: {e}")))?;
    }
    Ok(())
}
fn text_problem(path: &str, text: &str) -> Option<String> {
    if text.contains('\0') {
        return Some("Contains binary data; expected a text config.".into());
    }
    crate::servers::files::validate(crate::servers::files::FileKind::of(path), text)
        .map(|p| format!("Line {}, column {}: {}", p.line, p.column, p.message))
}
fn validate_bytes(path: &str, bytes: &[u8]) -> Result<()> {
    if matches!(extension(path).as_str(), "zip" | "jar") {
        return archive_check(std::io::Cursor::new(bytes));
    }
    if editable(path) {
        let text =
            std::str::from_utf8(bytes).map_err(|_| Error::other("Config is not valid UTF-8."))?;
        if let Some(problem) = text_problem(path, text) {
            return Err(Error::other(problem));
        }
    }
    Ok(())
}
fn snapshot(files: &FileManager, root: &Path, path: &Path) -> Result<String> {
    // Copy, never hardlink: edits made by Minecraft must not mutate the preserved original.
    let hash = hash_file(files, path)?;
    let blob = storage(root, &format!("blobs/{hash}"))?;
    if !files.exists(&blob)? {
        files.copy_reader_into_sync(&mut files.open(path)?, &blob)?;
    }
    if hash_file(files, &blob)? != hash {
        return Err(Error::other(
            "The file changed during backup. Retry after it finishes writing.",
        ));
    }
    Ok(hash)
}
fn observe(files: &FileManager, root: &Path, record: &mut Record, note: &str) -> Result<()> {
    let hash = snapshot(files, root, &target(root, &record.path)?)?;
    if record.original_hash.is_empty() {
        record.original_hash = hash.clone();
    }
    if record.revisions.last().is_none_or(|r| r.hash != hash) {
        record.revisions.push(Revision {
            hash,
            at: now(),
            note: note.into(),
            origin: record.origin.clone(),
        });
    }
    Ok(())
}
fn assert_hash(files: &FileManager, path: &Path, expected: &str) -> Result<()> {
    if expected.is_empty() || hash_file(files, path)? != expected {
        return Err(Error::other("This file changed since it was opened. Refresh before saving; your edits have been kept in the editor."));
    }
    Ok(())
}
fn walk(
    files: &FileManager,
    root: &Path,
    folder: &str,
    found: &mut Vec<String>,
    warnings: &mut Vec<String>,
) -> Result<()> {
    let dir = resolve(root, folder)?;
    if !files.exists(&dir)? {
        return Ok(());
    }
    for child in files.read_dir(dir)? {
        let name = child.file_name().unwrap_or_default().to_string_lossy();
        let relative = format!("{folder}/{name}");
        let safe = match resolve(root, &relative) {
            Ok(p) => p,
            Err(e) => {
                warnings.push(format!("{relative}: {e}"));
                continue;
            }
        };
        let meta = files.symlink_metadata(safe)?;
        if meta.is_dir() {
            walk(files, root, &relative, found, warnings)?;
        } else if allowed_file(&relative) {
            found.push(relative);
        }
    }
    Ok(())
}
fn mod_version(state: &AppState, id: &str, marker: &str) -> Result<Option<String>> {
    let indexed = state
        .db
        .content_files(id, "mods")?
        .iter()
        .find(|m| {
            m.mod_id
                .as_deref()
                .is_some_and(|v| v.to_lowercase().contains(marker))
                || m.file_name.to_lowercase().contains(marker)
        })
        .filter(|m| {
            state
                .files
                .is_file(state.paths.instance_dir(id).join("mods").join(&m.file_name))
                .unwrap_or(false)
        })
        .and_then(|m| m.mod_version.clone());
    let root = base(state, id)?;
    let dir = resolve(&root, "mods")?;
    if state.files.exists(&dir)? {
        for path in state.files.read_dir(&dir)? {
            let name = path.file_name().unwrap_or_default().to_string_lossy();
            if !name.ends_with(".jar") {
                continue;
            }
            let safe = match target(&root, &format!("mods/{name}")) {
                Ok(p) => p,
                Err(_) => continue,
            };
            if let Some((Some(mod_id), Some(version), _)) =
                crate::search::identify::read_metadata(&state.files, &safe)
            {
                if mod_id.to_lowercase().contains(marker) {
                    return Ok(Some(version));
                }
            }
        }
    }
    Ok(indexed)
}
fn tacz_folder(version: Option<&str>) -> Option<&'static str> {
    let v = semver::Version::parse(version?.trim_start_matches('v')).ok()?;
    Some(if v >= semver::Version::new(1, 1, 4) {
        "tacz"
    } else {
        "config/tacz/custom"
    })
}
fn recipe_info(state: &AppState, id: &str) -> Result<Value> {
    let version = mod_version(state, id, "tacz")?;
    Ok(json!([
        {"id":"pointblank", "title":"Point Blank · Doom", "folder":"pointblank", "dependency":"Vic’s Point Blank", "project_id":"1004200", "source_url":"https://www.curseforge.com/minecraft/customization/point-blank-official-extension-doom-pack", "instructions":"Keep the ZIP intact in pointblank/. Doom 1.3.5 requires Point Blank 1.6.7 or newer. Clients and servers need matching packs."},
        {"id":"tacz", "title":"TaCZ · Helldivers", "folder":tacz_folder(version.as_deref()), "detected_version":version, "dependency":"Timeless and Classics Zero", "project_id":"1091118", "source_url":"https://www.curseforge.com/minecraft/customization/tacz-helldivers-escalation-of-freedom", "instructions":"Keep the ZIP intact. TaCZ 1.1.4+ uses tacz/. Older releases use config/tacz/custom/. Choose the installed TaCZ generation when its version cannot be detected."}
    ]))
}
fn globals_path(state: &AppState) -> PathBuf {
    state.paths.root.join("workbench/global-presets.json")
}
fn globals(state: &AppState) -> Result<Vec<Preset>> {
    let path = globals_path(state);
    if !state.files.exists(&path)? {
        return Ok(vec![]);
    }
    Ok(serde_json::from_slice(&state.files.read(path)?)?)
}

pub(crate) fn scan(state: &AppState, id: &str) -> Result<Value> {
    let _guard = TRANSACTION
        .lock()
        .map_err(|_| Error::other("Config library is busy."))?;
    scan_inner(state, id)
}
fn scan_inner(state: &AppState, id: &str) -> Result<Value> {
    let instance = find_instance(state, id)?;
    let root = PathBuf::from(&instance.dir);
    let mut library = load(&state.files, &root)?;
    reconcile_toggles(&state.files, &root, &mut library)?;
    let mut paths = vec![];
    let mut warnings = vec![];
    for folder in [
        "config",
        "defaultconfigs",
        "pointblank",
        "tacz",
        "kubejs",
        "scripts",
        "mods",
    ] {
        if let Err(e) = walk(&state.files, &root, folder, &mut paths, &mut warnings) {
            warnings.push(format!("{folder}: {e}"));
        }
    }
    for path in ["options.txt", "optionsof.txt", "optionsshaders.txt"] {
        if state.files.is_file(root.join(path))? {
            paths.push(path.into());
        }
    }
    let saves = resolve(&root, "saves")?;
    if state.files.exists(&saves)? {
        for world in state.files.read_dir(saves)? {
            let name = world.file_name().unwrap_or_default().to_string_lossy();
            if let Err(e) = walk(
                &state.files,
                &root,
                &format!("saves/{name}/serverconfig"),
                &mut paths,
                &mut warnings,
            ) {
                warnings.push(e.to_string());
            }
        }
    }
    paths.extend(library.records.keys().cloned());
    paths.sort();
    paths.dedup();
    let sources = state.db.content_files(id, "mods")?;
    let mut entries = vec![];
    let tacz = mod_version(state, id, "tacz")?;
    for path in paths {
        let mut issues: Vec<Value> = vec![];
        let resolved = match target(&root, &path) {
            Ok(p) => p,
            Err(e) => {
                warnings.push(format!("{path}: {e}"));
                continue;
            }
        };
        let exists = state.files.is_file(&resolved)?;
        let is_mod = path.starts_with("mods/");
        let config_mod = is_mod
            && [
                "configured",
                "catalogue",
                "cloth-config",
                "cloth_config",
                "yet-another-config",
                "yacl",
                "modmenu",
                "defaultoptions",
            ]
            .iter()
            .any(|m| path.to_lowercase().contains(m));
        let is_config = path.starts_with("config/")
            || path.starts_with("defaultconfigs/")
            || editable(&path)
            || config_mod;
        let record = library
            .records
            .entry(path.clone())
            .or_insert_with(|| Record {
                path: path.clone(),
                title: Path::new(path.trim_end_matches(".disabled"))
                    .file_name()
                    .unwrap_or_default()
                    .to_string_lossy()
                    .into(),
                origin: "unknown".into(),
                game_version: instance.version_id.clone(),
                loader_version: instance.loader_version.clone().unwrap_or_default(),
                ..Record::default()
            });
        if is_config && !is_mod {
            let stem = Path::new(&path)
                .file_stem()
                .unwrap_or_default()
                .to_string_lossy()
                .to_lowercase();
            if record.owner_mod_id.is_empty() {
                if let Some(owner) = sources.iter().find(|s| {
                    s.mod_id.as_deref().is_some_and(|m| {
                        stem == m
                            || stem.starts_with(&format!("{m}-"))
                            || path.starts_with(&format!("config/{m}/"))
                    })
                }) {
                    record.owner_mod_id = owner.mod_id.clone().unwrap_or_default();
                    record.owner_mod_version = owner.mod_version.clone().unwrap_or_default();
                }
            }
            if !record.owner_mod_id.is_empty() {
                match sources.iter().find(|s|s.mod_id.as_deref()==Some(&record.owner_mod_id)) {
                    Some(owner) if !record.owner_mod_version.is_empty() && owner.mod_version.as_deref()!=Some(&record.owner_mod_version)=>issues.push(json!({"severity":"warning","message":format!("{} changed version since this config was first seen ({}). Review the author’s config migration notes.",record.owner_mod_id,record.owner_mod_version)})),
                    None=>issues.push(json!({"severity":"warning","message":format!("The previously associated mod {} is no longer indexed in this instance.",record.owner_mod_id)})),
                    _=>{}
                }
            }
        }
        if is_mod && record.project_id.is_empty() {
            if let Some(source) = sources
                .iter()
                .find(|s| path.trim_end_matches(".disabled") == format!("mods/{}", s.file_name))
            {
                if record.original_hash.is_empty() && record.title == source.file_name {
                    record.title = source.title.clone().unwrap_or_else(|| record.title.clone());
                }
                record.provider = source.provider.clone().unwrap_or_default();
                record.project_id = source.project_id.clone().unwrap_or_default();
                record.version_id = source.version_id.clone().unwrap_or_default();
                if source.provider.is_some() && source.project_id.is_some() {
                    record.provider_sha1 = source.sha1.clone().unwrap_or_default();
                }
            }
        }
        let mut hash = String::new();
        let mut size = 0;
        let mut provider_modified = false;
        if exists {
            size = state.files.metadata(&resolved)?.len();
            match hash_file(&state.files, &resolved) {
                Ok(h) => hash = h,
                Err(e) => issues.push(json!({"severity":"error","message":e.to_string()})),
            }
            if is_mod && !record.provider_sha1.is_empty() {
                let mut sha = sha1_smol::Sha1::new();
                let mut file = state.files.open(&resolved)?;
                let mut buffer = [0; 65536];
                loop {
                    let count = file.read(&mut buffer)?;
                    if count == 0 {
                        break;
                    }
                    sha.update(&buffer[..count]);
                }
                provider_modified = sha.digest().to_string() != record.provider_sha1;
                if provider_modified {
                    issues.push(json!({"severity":"warning","message":"File differs from its recorded provider checksum. It may be edited or damaged; this does not establish AI authorship."}));
                }
            }
            if !record.original_hash.is_empty()
                && record.revisions.last().is_none_or(|r| r.hash != hash)
            {
                observe(&state.files, &root, record, "External edit detected")?;
            }
            if editable(&path) {
                match read_bytes(&state.files, &resolved, MAX_TEXT)
                    .and_then(|b| String::from_utf8(b).map_err(|_| Error::other("Not valid UTF-8")))
                {
                    Ok(text) => {
                        if let Some(problem) = text_problem(&path, &text) {
                            issues.push(json!({"severity":"error","message":problem}));
                        } else if !matches!(
                            extension(&path).as_str(),
                            "json" | "toml" | "yaml" | "yml" | "properties" | "mcmeta"
                        ) {
                            issues.push(json!({"severity":"info","message":"Text readable; this format has no syntax validator. Mod-specific settings are not schema-validated."}));
                        }
                    }
                    Err(e) => issues.push(json!({"severity":"error","message":e.to_string()})),
                }
            } else if !is_mod && extension(&path) == "zip" {
                if let Err(e) = archive_check(state.files.open(&resolved)?) {
                    issues.push(json!({"severity":"error","message":e.to_string()}));
                }
            }
        } else {
            issues.push(
                json!({"severity":"error","message":"Tracked file is missing from this instance."}),
            );
        }
        if record.game_version != instance.version_id
            || record.loader_version != instance.loader_version.clone().unwrap_or_default()
        {
            issues.push(json!({"severity":"warning","message":"Minecraft or loader version changed since tracking began. Review compatibility before using this configuration."}));
        }
        let is_tacz = path.starts_with("tacz/")
            || path.starts_with("config/tacz/custom/")
            || record.recipe == "tacz";
        let is_pb = path.starts_with("pointblank/") || record.recipe == "pointblank";
        if is_tacz {
            if let Some(folder) = tacz_folder(tacz.as_deref()) {
                if !path.starts_with(&format!("{folder}/")) {
                    issues.push(json!({"severity":"warning","message":format!("This TaCZ version expects packs in {folder}/. Reinstall using the matching recipe.")}));
                }
            } else {
                issues.push(json!({"severity":"warning","message":"TaCZ version is unverified. Check that the required mod is enabled and the pack folder matches its version."}));
            }
        }
        if is_pb {
            match mod_version(state,id,"pointblank")?.as_deref().and_then(|v|semver::Version::parse(v.trim_start_matches('v')).ok()) {
                None=>issues.push(json!({"severity":"warning","message":"Point Blank dependency/version is unverified. Doom 1.3.5 requires Point Blank 1.6.7+."})),
                Some(version) if path.contains("1.3.5") && version<semver::Version::new(1,6,7)=>issues.push(json!({"severity":"warning","message":format!("Doom 1.3.5 requires Point Blank 1.6.7 or newer; this instance has {version}.")})),
                _=>{}
            }
        }
        let addon = !is_mod && (!editable(&path) || is_tacz || is_pb || !record.recipe.is_empty());
        let modified =
            (!record.original_hash.is_empty() && record.original_hash != hash) || provider_modified;
        entries.push(json!({"path":path,"title":record.title,"config":is_config,"addon":addon,"mod":is_mod,"exists":exists,"enabled":!path.ends_with(".disabled"),"editable":editable(&path),"size":size,"hash":hash,"modified":modified,"tracked":!record.original_hash.is_empty(),"issues":issues,"record":record}));
    }
    save(&state.files, &root, &library)?;
    Ok(
        json!({"entries":entries,"warnings":warnings,"recipes":recipe_info(state,id)?,"presets":globals(state)?,"scanned_at":now(),"premium":{"mode":"preview","features":["custom_installs","provenance"]}}),
    )
}

pub(crate) fn action(state: &AppState, id: &str, operation: &str, args: &Value) -> Result<Value> {
    let _guard = TRANSACTION
        .lock()
        .map_err(|_| Error::other("Config library is busy."))?;
    let root = base(state, id)?;
    let path = string(args, "path");
    if operation == "read" {
        if !editable(path) {
            return Err(Error::other("Choose an editable config file."));
        }
        let bytes = read_bytes(&state.files, &target(&root, path)?, MAX_TEXT)?;
        let text = String::from_utf8(bytes.clone())
            .map_err(|_| Error::other("Config is not valid UTF-8."))?;
        return Ok(
            json!({"path":path,"hash":digest(&bytes),"text":text,"problem":text_problem(path,&text)}),
        );
    }
    if crate::instance_ops::instance_busy(state, id)
        || state
            .running
            .lock()
            .unwrap()
            .values()
            .any(|run| run.instance_id == id && run.status.lock().unwrap().state == "stopping")
    {
        return Err(Error::other(
            "Stop Minecraft and wait for instance tasks to finish before changing content.",
        ));
    }
    let mut library = load(&state.files, &root)?;
    if operation == "install" {
        let source = PathBuf::from(string(args, "source"));
        let mut file = state.files.open_external(&source)?;
        if file.metadata()?.len() > MAX_ARCHIVE {
            return Err(Error::other("Custom installs support files up to 1 GiB."));
        }
        let name = source
            .file_name()
            .ok_or_else(|| Error::other("Choose a file."))?
            .to_string_lossy()
            .to_string();
        let recipe = string(args, "recipe");
        let folder = match recipe {
            "pointblank" => "pointblank".to_string(),
            "tacz" => tacz_folder(mod_version(state, id, "tacz")?.as_deref())
                .map(str::to_string)
                .unwrap_or_else(|| string(args, "folder").to_string()),
            "custom" | "config" => string(args, "folder").to_string(),
            _ => return Err(Error::other("Choose an install recipe.")),
        };
        if recipe == "tacz" && !matches!(folder.as_str(), "tacz" | "config/tacz/custom") {
            return Err(Error::other(
                "Choose the TaCZ generation to resolve its install folder.",
            ));
        }
        if matches!(recipe, "tacz" | "pointblank") && extension(&name) != "zip" {
            return Err(Error::other(
                "Gun packs must be ZIP files and are installed without extraction.",
            ));
        }
        let destination = format!("{folder}/{name}");
        let dest = target(&root, &destination)?;
        if state.files.exists(&dest)? {
            return Err(Error::other("A file already exists at this destination. Use Replace file from its details to preserve history."));
        }
        let mut bytes = Vec::new();
        file.by_ref()
            .take(MAX_ARCHIVE + 1)
            .read_to_end(&mut bytes)?;
        if bytes.len() as u64 > MAX_ARCHIVE {
            return Err(Error::other("File grew beyond the import limit."));
        }
        validate_bytes(&destination, &bytes)?;
        let mut record = new_record(state, id, &destination);
        apply_metadata(&mut record, args)?;
        record.recipe = recipe.into();
        if matches!(recipe, "pointblank" | "tacz") {
            record.provider = "curseforge".into();
            record.project_id = if recipe == "pointblank" {
                "1004200"
            } else {
                "1091118"
            }
            .into();
            record.source_url=if recipe=="pointblank" {"https://www.curseforge.com/minecraft/customization/point-blank-official-extension-doom-pack"} else {"https://www.curseforge.com/minecraft/customization/tacz-helldivers-escalation-of-freedom"}.into();
        }
        state.files.write_atomic(&dest, &bytes)?;
        observe(&state.files, &root, &mut record, "Installed original")?;
        library.records.insert(destination.clone(), record);
        save(&state.files, &root, &library)?;
        return Ok(json!({"path":destination}));
    }
    if operation == "delete_preset" {
        let mut presets = globals(state)?;
        presets.retain(|p| p.id != string(args, "presetId"));
        state
            .files
            .write_atomic(globals_path(state), &serde_json::to_vec_pretty(&presets)?)?;
        return Ok(Value::Null);
    }
    let dest = target(&root, path)?;
    let mut record = library
        .records
        .remove(path)
        .unwrap_or_else(|| new_record(state, id, path));
    match operation {
        "track" | "metadata" => {
            apply_metadata(&mut record, args)?;
            if operation == "track" {
                observe(&state.files, &root, &mut record, "Saved baseline")?;
            }
            if !string(args, "originalSource").is_empty() {
                let source = PathBuf::from(string(args, "originalSource"));
                if extension(&source.to_string_lossy()) != extension(path) {
                    return Err(Error::other("The original must have the same file format."));
                }
                let mut reader = state.files.open_external(source)?.take(MAX_ARCHIVE + 1);
                let mut bytes = Vec::new();
                reader.read_to_end(&mut bytes)?;
                if bytes.len() as u64 > MAX_ARCHIVE {
                    return Err(Error::other("Original exceeds 1 GiB."));
                }
                validate_bytes(path, &bytes)?;
                let hash = digest(&bytes);
                state
                    .files
                    .write_atomic(storage(&root, &format!("blobs/{hash}"))?, &bytes)?;
                record.original_hash = hash.clone();
                record.revisions.push(Revision {
                    hash,
                    at: now(),
                    note: "Linked upstream original".into(),
                    origin: "original".into(),
                });
                observe(&state.files, &root, &mut record, "Current working file")?;
            }
        }
        "save" | "replace" | "restore" | "apply_preset" => {
            let exists = state.files.is_file(&dest)?;
            if exists {
                assert_hash(&state.files, &dest, string(args, "expectedHash"))?;
            } else if operation != "restore" && operation != "apply_preset" {
                return Err(Error::other("The target file is missing."));
            }
            let bytes = match operation {
                "save" => {
                    if !editable(path) {
                        return Err(Error::other("This is not an editable config."));
                    }
                    let text = string(args, "text");
                    if text.len() as u64 > MAX_TEXT {
                        return Err(Error::other("Config exceeds 2 MiB."));
                    }
                    text.as_bytes().to_vec()
                }
                "restore" => {
                    let hash = string(args, "hash");
                    if !record.revisions.iter().any(|r| r.hash == hash) {
                        return Err(Error::other("Revision does not belong to this file."));
                    }
                    let b = read_bytes(
                        &state.files,
                        &storage(&root, &format!("blobs/{hash}"))?,
                        MAX_ARCHIVE,
                    )?;
                    if digest(&b) != hash {
                        return Err(Error::other("Backup checksum mismatch."));
                    }
                    b
                }
                "apply_preset" => {
                    let p = globals(state)?
                        .into_iter()
                        .find(|p| p.id == string(args, "presetId") && p.path == path)
                        .ok_or_else(|| Error::other("Preset does not match this config path."))?;
                    if p.game_version != find_instance(state, id)?.version_id {
                        return Err(Error::other("This preset targets another Minecraft version. Open it in a matching instance."));
                    }
                    record.global_hash = p.hash;
                    p.text.into_bytes()
                }
                _ => {
                    let source = PathBuf::from(string(args, "source"));
                    if extension(&source.to_string_lossy()) != extension(path) {
                        return Err(Error::other("Replacement must have the same file format."));
                    }
                    let mut reader = state.files.open_external(source)?.take(MAX_ARCHIVE + 1);
                    let mut b = Vec::new();
                    reader.read_to_end(&mut b)?;
                    if b.len() as u64 > MAX_ARCHIVE {
                        return Err(Error::other("Replacement exceeds 1 GiB."));
                    }
                    b
                }
            };
            // Exact backups remain restorable even if they contain a known-invalid config.
            if operation != "restore" {
                validate_bytes(path, &bytes)?;
            }
            if exists {
                observe(&state.files, &root, &mut record, "Before change")?;
            }
            // Persist recovery information before touching the installed file.
            library.records.insert(path.into(), record.clone());
            save(&state.files, &root, &library)?;
            if exists {
                assert_hash(&state.files, &dest, string(args, "expectedHash"))?;
            } else if state.files.exists(&dest)? {
                return Err(Error::other("The destination appeared while preparing this change. Refresh before applying."));
            }
            state.files.write_atomic(&dest, &bytes)?;
            if operation == "replace" || operation == "restore" {
                record.version_id = string(args, "versionId").into();
                record.update = Value::Null;
            }
            observe(
                &state.files,
                &root,
                &mut record,
                if string(args, "note").is_empty() {
                    operation
                } else {
                    string(args, "note")
                },
            )?;
        }
        "toggle" => {
            if editable(path) {
                return Err(Error::other(
                    "Configs cannot be disabled by renaming; Minecraft may regenerate them.",
                ));
            }
            assert_hash(&state.files, &dest, string(args, "expectedHash"))?;
            let next = if path.ends_with(".disabled") {
                path.trim_end_matches(".disabled").to_string()
            } else {
                format!("{path}.disabled")
            };
            let next_path = target(&root, &next)?;
            if state.files.exists(&next_path)? {
                return Err(Error::other("The opposite enabled state already exists."));
            }
            state.files.rename(dest, next_path)?;
            record.path = next.clone();
            library.records.insert(next.clone(), record);
            save(&state.files, &root, &library)?;
            return Ok(json!({"path":next}));
        }
        "review_compatibility" => {
            let instance = find_instance(state, id)?;
            record.game_version = instance.version_id;
            record.loader_version = instance.loader_version.unwrap_or_default();
            if !record.owner_mod_id.is_empty() {
                if let Some(owner) = state
                    .db
                    .content_files(id, "mods")?
                    .into_iter()
                    .find(|m| m.mod_id.as_deref() == Some(&record.owner_mod_id))
                {
                    record.owner_mod_version = owner.mod_version.unwrap_or_default();
                }
            }
        }
        "save_preset" => {
            if !editable(path) {
                return Err(Error::other("Only text configs can become global presets."));
            }
            assert_hash(&state.files, &dest, string(args, "expectedHash"))?;
            let bytes = read_bytes(&state.files, &dest, MAX_TEXT)?;
            validate_bytes(path, &bytes)?;
            let text = String::from_utf8(bytes.clone()).map_err(|_| Error::other("Not UTF-8"))?;
            let mut presets = globals(state)?;
            let version = find_instance(state, id)?.version_id;
            let preset_id = digest(format!("{path}:{version}").as_bytes());
            presets.retain(|p| p.id != preset_id);
            presets.push(Preset {
                id: preset_id,
                name: if string(args, "name").is_empty() {
                    record.title.clone()
                } else {
                    string(args, "name").into()
                },
                path: path.into(),
                text,
                hash: digest(&bytes),
                game_version: version,
                updated_at: now(),
            });
            state
                .files
                .write_atomic(globals_path(state), &serde_json::to_vec_pretty(&presets)?)?;
        }
        _ => return Err(Error::other("Unknown Config action.")),
    }
    library.records.insert(path.into(), record);
    save(&state.files, &root, &library)?;
    Ok(json!({"path":path}))
}
fn new_record(state: &AppState, id: &str, path: &str) -> Record {
    let instance = find_instance(state, id).ok();
    Record {
        path: path.into(),
        title: Path::new(path)
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .into(),
        origin: "unknown".into(),
        game_version: instance
            .as_ref()
            .map(|i| i.version_id.clone())
            .unwrap_or_default(),
        loader_version: instance.and_then(|i| i.loader_version).unwrap_or_default(),
        ..Record::default()
    }
}
fn apply_metadata(record: &mut Record, args: &Value) -> Result<()> {
    for (key, field) in [
        ("title", &mut record.title),
        ("notes", &mut record.notes),
        ("sourceUrl", &mut record.source_url),
        ("provider", &mut record.provider),
        ("projectId", &mut record.project_id),
        ("versionId", &mut record.version_id),
    ] {
        if let Some(value) = args.get(key).and_then(Value::as_str) {
            if value.len() > 10000 {
                return Err(Error::other("Metadata is too long."));
            }
            *field = value.into();
        }
    }
    if !record.provider.is_empty() {
        crate::search::Provider::parse(&record.provider)?;
    }
    if !record.source_url.is_empty()
        && !(record.source_url.starts_with("https://") || record.source_url.starts_with("http://"))
    {
        return Err(Error::other(
            "Source must be an HTTP or HTTPS project link.",
        ));
    }
    if let Some(origin) = args.get("origin").and_then(Value::as_str) {
        if !matches!(
            origin,
            "unknown" | "original" | "edited" | "ai_assisted" | "patch"
        ) {
            return Err(Error::other("Unknown origin label."));
        }
        record.origin = origin.into();
    }
    Ok(())
}

pub(crate) async fn check_updates(state: &AppState, id: &str) -> Result<Value> {
    let root = base(state, id)?;
    let records = {
        let _g = TRANSACTION
            .lock()
            .map_err(|_| Error::other("Library busy"))?;
        load(&state.files, &root)?.records
    };
    let instance = find_instance(state, id)?;
    let mut outcomes = vec![];
    for (path, record) in records
        .iter()
        .filter(|(_, r)| !r.project_id.is_empty() && !r.provider.is_empty())
    {
        let provider = crate::search::Provider::parse(&record.provider)?;
        let kind = if path.starts_with("mods/") {
            crate::search::ContentKind::Mod
        } else {
            crate::search::ContentKind::ResourcePack
        };
        let result = crate::search::project_versions(
            state,
            provider,
            &record.project_id,
            kind,
            &instance.version_id,
            if path.starts_with("mods/") {
                instance.loader.as_deref()
            } else {
                None
            },
        )
        .await;
        let outcome = match result {
            Ok(versions) => {
                let identity_path = if !record.original_hash.is_empty() {
                    storage(&root, &format!("blobs/{}", record.original_hash))?
                } else {
                    target(&root, path)?
                };
                let sha1 = sha1_file(&state.files, &target(&root, path)?).ok();
                let baseline_sha1 = sha1_file(&state.files, &identity_path).ok();
                let installed = versions
                    .iter()
                    .find(|v| {
                        v.files.iter().any(|f| {
                            f.sha1
                                .as_ref()
                                .zip(sha1.as_ref())
                                .is_some_and(|(a, b)| a == b)
                        })
                    })
                    .or_else(|| versions.iter().find(|v| v.id == record.version_id))
                    .or_else(|| {
                        versions.iter().find(|v| {
                            v.files.iter().any(|f| {
                                f.sha1
                                    .as_ref()
                                    .zip(baseline_sha1.as_ref())
                                    .is_some_and(|(a, b)| a == b)
                            })
                        })
                    });
                let installed_id = installed.map(|v| v.id.clone()).unwrap_or_default();
                let installed_date = installed.map(|v| v.date.clone());
                match crate::search::pick_best(
                    versions
                        .into_iter()
                        .filter(|v| v.channel == "release")
                        .collect(),
                ) {
                    Some(v) => {
                        json!({"status":if v.id==installed_id {"current"}else if installed_date.as_ref().is_some_and(|d|v.date>*d){"available"}else{"unverified"},"installed_version_id":installed_id,"version_id":v.id,"name":v.name,"checked_at":now(),"message":if installed_id.is_empty(){"No provider checksum match. Link the installed provider file/version ID to compare releases accurately."}else{"Review the author’s requirements before replacing locally edited content."}})
                    }
                    None => {
                        json!({"status":"incompatible","checked_at":now(),"message":"No compatible stable release was found for this Minecraft version."})
                    }
                }
            }
            Err(e) => json!({"status":"error","checked_at":now(),"message":e.to_string()}),
        };
        outcomes.push((
            path.clone(),
            record.provider.clone(),
            record.project_id.clone(),
            record.version_id.clone(),
            outcome,
        ));
    }
    let _g = TRANSACTION
        .lock()
        .map_err(|_| Error::other("Library busy"))?;
    let mut library = load(&state.files, &root)?;
    for (path, provider, project, version, outcome) in outcomes {
        if let Some(r) = library.records.get_mut(&path) {
            if r.provider == provider && r.project_id == project && r.version_id == version {
                if let Some(installed) = outcome
                    .get("installed_version_id")
                    .and_then(Value::as_str)
                    .filter(|id| !id.is_empty())
                {
                    r.version_id = installed.into();
                }
                r.update = outcome;
            }
        }
    }
    save(&state.files, &root, &library)?;
    scan_inner(state, id)
}

/// The regular mod updater and repair pipeline must not erase a declared patch or a changed baseline.
pub(crate) fn guard_content_change(
    state: &AppState,
    id: &str,
    kind: &str,
    name: &str,
) -> Result<()> {
    let _guard = TRANSACTION
        .lock()
        .map_err(|_| Error::other("Config library is busy."))?;
    let root = base(state, id)?;
    let mut library = load(&state.files, &root)?;
    if library.records.is_empty() {
        return Ok(());
    }
    reconcile_toggles(&state.files, &root, &mut library)?;
    for path in [format!("{kind}/{name}"), format!("{kind}/{name}.disabled")] {
        if let Some(record) = library.records.get_mut(&path) {
            let destination = target(&root, &path)?;
            if !state.files.is_file(&destination)? {
                continue;
            }
            if matches!(record.origin.as_str(), "edited" | "ai_assisted" | "patch")
                || (!record.original_hash.is_empty()
                    && hash_file(&state.files, &destination)? != record.original_hash)
                || (!record.provider_sha1.is_empty()
                    && sha1_file(&state.files, &destination)? != record.provider_sha1)
            {
                return Err(Error::other(format!("{name} has protected local work. Review or replace it in Config → Mod lineage; its original and revisions will be preserved.")));
            }
            if !record.original_hash.is_empty() {
                observe(
                    &state.files,
                    &root,
                    record,
                    "Before provider update or repair",
                )?;
            }
        }
    }
    save(&state.files, &root, &library)
}

pub(crate) fn preserve_before_delete(
    state: &AppState,
    id: &str,
    kind: &str,
    name: &str,
) -> Result<()> {
    let _guard = TRANSACTION
        .lock()
        .map_err(|_| Error::other("Config library is busy."))?;
    let root = base(state, id)?;
    let mut library = load(&state.files, &root)?;
    if library.records.is_empty() {
        return Ok(());
    }
    reconcile_toggles(&state.files, &root, &mut library)?;
    for path in [format!("{kind}/{name}"), format!("{kind}/{name}.disabled")] {
        if let Some(record) = library.records.get_mut(&path) {
            if state.files.is_file(target(&root, &path)?)? {
                observe(&state.files, &root, record, "Before removal from Mods")?;
            }
        }
    }
    save(&state.files, &root, &library)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn rejects_path_escape_and_internal_files() {
        let root = std::env::temp_dir();
        for p in [
            "../secret",
            "/config/a",
            "config/../a",
            "config/a:stream",
            "config/a.",
            "config\\a",
        ] {
            assert!(resolve(&root, p).is_err(), "{p}");
        }
        for p in [
            ".enderloom-workbench/library.json",
            "saves/world/config.json",
            "options.exe",
        ] {
            assert!(!allowed_file(p));
        }
        assert!(allowed_file("config/tacz/custom/guns.zip"));
    }
    #[test]
    fn tacz_paths_are_version_aware() {
        assert_eq!(tacz_folder(Some("1.1.3")), Some("config/tacz/custom"));
        assert_eq!(tacz_folder(Some("1.1.4")), Some("tacz"));
        assert_eq!(tacz_folder(Some("1.2.0")), Some("tacz"));
        assert_eq!(tacz_folder(None), None);
    }
    #[test]
    fn corrupt_config_is_rejected() {
        assert!(validate_bytes("config/x.json", b"{broken").is_err());
        assert!(validate_bytes("config/x.toml", b"a = [").is_err());
        assert!(validate_bytes("config/x.json", b"{\"enabled\":true}").is_ok());
        assert!(validate_bytes("tacz/bad.zip", b"not a zip").is_err());
    }
    #[test]
    fn authorship_is_explicit() {
        let mut r = Record::default();
        apply_metadata(&mut r, &json!({"origin":"ai_assisted"})).unwrap();
        assert_eq!(r.origin, "ai_assisted");
        assert!(apply_metadata(&mut r, &json!({"origin":"ai_detected"})).is_err());
    }
}
