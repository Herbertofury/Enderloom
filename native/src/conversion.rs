//! Immutable conversion intake. Uses the shared project graph, task history and
//! library; source packages are evidence, never executable instructions.
use crate::{
    db::{ArtifactIdentity, ContentFile, FileHash},
    error::{Error, Result},
    state::AppState,
    tasks::{TaskCheckpoint, TaskHandle, TaskKind, TaskSpec},
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use std::{
    collections::{BTreeMap, BTreeSet},
    io::Read,
    path::Path,
    sync::Arc,
};

const ADAPTER: &str = "package-inventory-1";

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Input {
    pub path: String,
    pub label: String,
    pub role: String,
    pub expected_sha256: Option<String>,
}
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Request {
    pub project_id: String,
    pub title: String,
    pub minecraft: String,
    pub loader: String,
    pub loader_version: String,
    pub java: u32,
    pub checkpoint: String,
    pub inputs: Vec<Input>,
}
#[derive(Clone, Deserialize, Serialize)]
struct Entry {
    path: String,
    key: String,
    family: String,
    sha256: String,
    bytes: u64,
}
#[derive(Clone, Deserialize, Serialize)]
struct Inventory {
    adapter: String,
    sha256: String,
    bytes: u64,
    retained_path: String,
    entries: Vec<Entry>,
    warnings: Vec<String>,
    measured_at: i64,
}
fn now() -> i64 {
    chrono::Utc::now().timestamp_millis()
}
fn check(task: &TaskHandle) -> Result<()> {
    if task.token().is_cancelled() {
        Err(Error::Cancelled)
    } else {
        Ok(())
    }
}
fn digest(mut reader: impl Read, task: &TaskHandle) -> Result<(String, u64)> {
    let mut hash = Sha256::new();
    let mut bytes = 0;
    let mut buf = [0u8; 65536];
    loop {
        check(task)?;
        let n = reader.read(&mut buf)?;
        if n == 0 {
            break;
        }
        hash.update(&buf[..n]);
        bytes += n as u64;
    }
    Ok((format!("{:x}", hash.finalize()), bytes))
}
fn valid_hash(hash: &str) -> bool {
    hash.len() == 64 && hash.bytes().all(|c| c.is_ascii_hexdigit())
}
fn validate(request: &Request) -> Result<()> {
    if request.project_id.is_empty()
        || request.project_id.len() > 160
        || !request
            .project_id
            .bytes()
            .all(|c| c.is_ascii_alphanumeric() || b"_-".contains(&c))
    {
        return Err(Error::other(
            "Choose a project ID using letters, numbers, underscores or hyphens",
        ));
    }
    if request.title.trim().is_empty()
        || request.inputs.is_empty()
        || request.minecraft.is_empty()
        || request.java == 0
    {
        return Err(Error::other(
            "A conversion needs a title, primary target and input packages",
        ));
    }
    let mut labels = BTreeSet::new();
    for input in &request.inputs {
        if input.label.trim().is_empty() || !labels.insert(&input.label) {
            return Err(Error::other("Input labels must be nonempty and unique"));
        }
        if !matches!(
            input.role.as_str(),
            "authority" | "checkpoint" | "reference" | "candidate" | "toolkit"
        ) {
            return Err(Error::other("Unknown input role"));
        }
        if input
            .expected_sha256
            .as_deref()
            .is_some_and(|h| !valid_hash(h))
        {
            return Err(Error::other(
                "Expected SHA-256 must contain 64 hexadecimal characters",
            ));
        }
    }
    Ok(())
}

// A normalized resource path is a correspondence candidate, not a claim of
// semantic equivalence. Wrapper folders and Gradle resource roots are accounted for.
fn classify(path: &str) -> (String, String) {
    let parts: Vec<_> = path.split('/').collect();
    for (i, part) in parts.iter().enumerate() {
        if matches!(*part, "assets" | "data") && parts.len() > i + 3 {
            let family = format!("{}/{}", part, parts[i + 2]);
            return (family, parts[i..].join("/"));
        }
    }
    if path.ends_with(".class") {
        return ("compiled code".into(), path.into());
    }
    if path.ends_with(".java") || path.ends_with(".kt") {
        return ("source code".into(), path.into());
    }
    let name = parts.last().unwrap_or(&"").to_lowercase();
    if name.contains("license") || name.contains("copyright") {
        return ("rights declarations".into(), path.into());
    }
    if name.contains("gradle") || name == "pom.xml" {
        return ("build configuration".into(), path.into());
    }
    if name.ends_with(".log") || path.contains("receipts/") || path.contains("evidence/") {
        return ("prior evidence".into(), path.into());
    }
    if name.ends_with(".jar") || name.ends_with(".zip") {
        return ("nested archive".into(), path.into());
    }
    ("unclassified".into(), path.into())
}

fn inspect(state: &AppState, input: &Input, task: &TaskHandle) -> Result<(Inventory, bool)> {
    let path = Path::new(&input.path);
    let metadata = state.files.external_symlink_metadata(path)?;
    if !metadata.is_file() || metadata.file_type().is_symlink() {
        return Err(Error::other(
            "Select a regular JAR or ZIP file; linked files are not imported",
        ));
    }
    if !matches!(
        path.extension()
            .and_then(|v| v.to_str())
            .map(str::to_lowercase)
            .as_deref(),
        Some("jar" | "zip" | "mcaddon" | "mcpack")
    ) {
        return Err(Error::other("Select a JAR, ZIP, MCPACK or MCADDON package"));
    }
    let (hash, size) = digest(state.files.open_external(path)?, task)?;
    if let Some(expected) = &input.expected_sha256 {
        if !hash.eq_ignore_ascii_case(expected) {
            return Err(Error::Checksum {
                path: input.label.clone(),
                expected: expected.clone(),
                actual: hash,
            });
        }
    }
    let retained = state
        .paths
        .root
        .join("project-inputs")
        .join(&hash)
        .join("original.zip");
    state.files.ensure_dir(retained.parent().unwrap())?;
    let preserved =
        state.files.is_file(&retained)? && digest(state.files.open(&retained)?, task)?.0 == hash;
    if !preserved {
        check(task)?;
        state.files.copy_external_into_sync(path, &retained)?;
        if digest(state.files.open(&retained)?, task)?.0 != hash {
            return Err(Error::other(
                "Source changed while preserving it; no checkpoint was promoted",
            ));
        }
    }
    let cache_key = format!("conversion-inventory:{ADAPTER}:{hash}");
    if let Some(cache) = state.db.library_get(&cache_key)? {
        return Ok((serde_json::from_value(cache)?, true));
    }
    let mut archive = zip::ZipArchive::new(state.files.open(&retained)?)
        .map_err(|e| Error::other(format!("Invalid package: {e}")))?;
    let mut entries = Vec::new();
    let mut warnings = Vec::new();
    let mut names = BTreeSet::new();
    let count = archive.len();
    task.set_total(count as u64, 0);
    for index in 0..count {
        check(task)?;
        let mut file = archive
            .by_index(index)
            .map_err(|e| Error::other(format!("Unreadable package entry {index}: {e}")))?;
        if file.is_dir() {
            continue;
        }
        let name = file.name().to_string();
        if file.enclosed_name().is_none()
            || name.contains('\\')
            || name.contains(':')
            || name.split('/').any(|s| matches!(s, ".." | "."))
        {
            warnings.push(format!(
                "Unsafe package path retained without extraction: {name}"
            ));
        }
        if file
            .unix_mode()
            .is_some_and(|mode| mode & 0o170000 == 0o120000)
        {
            warnings.push(format!(
                "Symbolic link retained without following it: {name}"
            ));
        }
        if !names.insert(name.to_lowercase()) {
            warnings.push(format!("Duplicate or case-colliding package path: {name}"));
        }
        // Stream entries: no entry-count cap, no whole-archive expansion in RAM.
        let (entry_hash, bytes) = digest(&mut file, task)?;
        let (family, key) = classify(&name);
        entries.push(Entry {
            path: name,
            key,
            family,
            sha256: entry_hash,
            bytes,
        });
        task.progress((index + 1) as u64, count as u64, 0, 0);
    }
    entries.sort_by(|a, b| a.path.cmp(&b.path));
    let result = Inventory {
        adapter: ADAPTER.into(),
        sha256: hash,
        bytes: size,
        retained_path: retained.display().to_string(),
        entries,
        warnings,
        measured_at: now(),
    };
    state
        .db
        .library_put(&cache_key, &serde_json::to_value(&result)?)?;
    Ok((result, false))
}

pub async fn start(state: &Arc<AppState>, args: &Value) -> Result<Value> {
    let request: Request = serde_json::from_value(args.clone())?;
    validate(&request)?;
    let task = state.tasks.start_ipc(
        TaskKind::ConversionIntake,
        TaskSpec {
            title: "Inspect conversion inputs".into(),
            subtitle: Some(request.title.clone()),
            project_id: Some(format!("local:project:{}", request.project_id)),
            ..Default::default()
        },
    )?;
    task.checkpoint(TaskCheckpoint::ConversionIntake {
        request: request.clone(),
    })?;
    let state = state.clone();
    tokio::task::spawn_blocking(move || {
        let result = run(&state, &request, &task);
        task.finish(&result);
        result
    })
    .await
    .map_err(|e| Error::other(e.to_string()))?
}

pub fn run(state: &AppState, request: &Request, task: &TaskHandle) -> Result<Value> {
    validate(request)?;
    let mut inputs = Vec::new();
    for input in &request.inputs {
        task.stage(&format!("Preserving and indexing {}", input.label));
        let (inventory, reused) = inspect(state, input, task)?;
        let families =
            inventory
                .entries
                .iter()
                .fold(BTreeMap::<String, usize>::new(), |mut map, entry| {
                    *map.entry(entry.family.clone()).or_default() += 1;
                    map
                });
        let artifact = ArtifactIdentity {
            sha256: inventory.sha256.clone(),
            size: inventory.bytes,
            hashes: vec![FileHash {
                algorithm: "sha256".into(),
                value: inventory.sha256.clone(),
            }],
            evidence_class: "measured".into(),
        };
        state.db.record_artifact_observation(
            "project",
            &request.project_id,
            "conversion-inputs",
            &ContentFile {
                file_name: input.label.clone(),
                provider: Some("local".into()),
                project_id: Some(request.project_id.clone()),
                title: Some(request.title.clone()),
                origin: "conversion-intake".into(),
                ..Default::default()
            },
            &artifact,
        )?;
        inputs.push(json!({"label":input.label,"role":input.role,"source_path":input.path,"sha256":inventory.sha256,"bytes":inventory.bytes,"retained_path":inventory.retained_path,"entry_count":inventory.entries.len(),"families":families,"warnings":inventory.warnings,"cache_reused":reused,"expected_hash_verified":input.expected_sha256.is_some(),"measured_at":inventory.measured_at}));
    }
    check(task)?;
    let snapshot_id = format!(
        "{:x}",
        Sha256::digest(serde_json::to_vec(
            &json!({"request":request,"hashes":inputs.iter().map(|v|&v["sha256"]).collect::<Vec<_>>(),"adapter":ADAPTER})
        )?)
    );
    let snapshot = json!({"id":snapshot_id,"project_id":request.project_id,"canonical_project_id":format!("local:project:{}",request.project_id),"title":request.title,"primary_target":{"minecraft":request.minecraft,"loader":request.loader,"loader_version":request.loader_version,"java":request.java},"checkpoint":request.checkpoint,"inputs":inputs,"adapter":ADAPTER,"at":now(),"state":"indexed","evidence_class":"measured","scope":"Exact package bytes and resource-path correspondences. Build, behavior, visual, save and runtime parity are not established by this inventory."});
    let key = format!("conversion-snapshot:{snapshot_id}");
    let stable = state.db.library_get(&key)?.unwrap_or(snapshot);
    state.db.library_put(&key, &stable)?;
    crate::evidence::conversion(state, &stable, Some(task.id()))?;
    state.db.library_put(&format!("conversion-project:{}",request.project_id),&json!({"project_id":request.project_id,"snapshot_id":snapshot_id,"request":request,"title":request.title,"at":now()}))?;
    if let Some(sink) = state.tasks.event_sink() {
        sink(
            "conversion:updated",
            json!({"project_id":request.project_id,"snapshot_id":snapshot_id}),
        );
    }
    Ok(stable)
}

pub fn projects(state: &AppState) -> Result<Value> {
    Ok(json!(state.db.library_list("conversion-project:")?))
}
pub fn snapshot(state: &AppState, id: &str) -> Result<Value> {
    let project = state
        .db
        .library_get(&format!("conversion-project:{id}"))?
        .ok_or_else(|| Error::other("Conversion project was not found"))?;
    let snapshot = state
        .db
        .library_get(&format!(
            "conversion-snapshot:{}",
            project["snapshot_id"].as_str().unwrap_or_default()
        ))?
        .ok_or_else(|| Error::other("Conversion checkpoint was not found"))?;
    crate::evidence::conversion(state, &snapshot, None)?;
    Ok(snapshot)
}
pub fn entries(state: &AppState, args: &Value) -> Result<Value> {
    let hash = args["sha256"].as_str().unwrap_or_default();
    if !valid_hash(hash) {
        return Err(Error::other("Invalid package SHA-256"));
    }
    let inventory: Inventory = serde_json::from_value(
        state
            .db
            .library_get(&format!("conversion-inventory:{ADAPTER}:{hash}"))?
            .ok_or_else(|| Error::other("Inspect this package first"))?,
    )?;
    let query = args["query"].as_str().unwrap_or_default().to_lowercase();
    let family = args["family"].as_str().unwrap_or_default();
    let offset = args["offset"].as_u64().unwrap_or_default() as usize;
    let rows: Vec<_> = inventory
        .entries
        .iter()
        .filter(|e| {
            (family.is_empty() || e.family == family)
                && (query.is_empty() || e.path.to_lowercase().contains(&query))
        })
        .collect();
    Ok(
        json!({"total":rows.len(),"offset":offset,"entries":rows.into_iter().skip(offset).take(100).collect::<Vec<_>>() }),
    )
}

pub fn compare(state: &AppState, args: &Value) -> Result<Value> {
    let read = |field: &str| -> Result<Inventory> {
        let hash = args[field].as_str().unwrap_or_default();
        if !valid_hash(hash) {
            return Err(Error::other("Choose two indexed packages"));
        }
        serde_json::from_value(
            state
                .db
                .library_get(&format!("conversion-inventory:{ADAPTER}:{hash}"))?
                .ok_or_else(|| Error::other("Package inventory is missing"))?,
        )
        .map_err(Into::into)
    };
    let left = read("baselineSha256")?;
    let right = read("candidateSha256")?;
    let index = |inventory: Inventory| {
        let mut result = BTreeMap::<String, Vec<Entry>>::new();
        for entry in inventory.entries {
            result.entry(entry.key.clone()).or_default().push(entry);
        }
        result
    };
    let baseline = index(left);
    let candidate = index(right);
    let mut rows = Vec::new();
    let mut counts = BTreeMap::<String, usize>::new();
    for key in baseline
        .keys()
        .chain(candidate.keys())
        .collect::<BTreeSet<_>>()
    {
        let before = baseline.get(key);
        let after = candidate.get(key);
        let status = match (before, after) {
            (Some(a), Some(b)) if a.len() != 1 || b.len() != 1 => "ambiguous",
            (Some(a), Some(b)) if a[0].sha256 == b[0].sha256 => "identical_bytes",
            (Some(_), Some(_)) => "changed",
            (Some(_), None) => "missing",
            _ => "added",
        };
        *counts.entry(status.into()).or_default() += 1;
        let query = args["query"].as_str().unwrap_or_default().to_lowercase();
        let filter = args["status"].as_str().unwrap_or_default();
        if (filter.is_empty() || filter == status) && key.to_lowercase().contains(&query) {
            rows.push(json!({"key":key,"status":status,"baseline":before,"candidate":after}));
        }
    }
    let total = rows.len();
    let offset = args["offset"].as_u64().unwrap_or_default() as usize;
    Ok(
        json!({"counts":counts,"total":total,"offset":offset,"rows":rows.into_iter().skip(offset).take(100).collect::<Vec<_>>(),"scope":"Resource-path correspondence and byte identity only. Missing paths remain unresolved; changed code is not automatically a port or an intentional removal."}),
    )
}
