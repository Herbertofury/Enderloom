//! Declared mod identities and dependencies, including loader-declared bundled JARs.
use crate::{
    error::{Error, Result},
    files::FileManager,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use std::{
    collections::{BTreeSet, VecDeque},
    io::{Cursor, Read, Seek},
    path::Path,
    sync::{Mutex, OnceLock},
};

#[derive(Clone, Serialize, Deserialize)]
pub struct ModIdentity {
    pub id: String,
    pub version: Option<String>,
    pub title: Option<String>,
    pub manifest: String,
    pub archive_path: String,
    pub sha256: Option<String>,
}
#[derive(Clone, Serialize, Deserialize, Default)]
pub struct ArchiveFacts {
    pub mods: Vec<ModIdentity>,
    pub dependencies: Vec<Value>,
    pub warnings: Vec<String>,
}
const MANIFESTS: [&str; 5] = [
    "fabric.mod.json",
    "quilt.mod.json",
    "META-INF/neoforge.mods.toml",
    "META-INF/mods.toml",
    "mcmod.info",
];
const MANIFEST_BYTES: u64 = 1024 * 1024;
const NESTED_BYTES: u64 = 128 * 1024 * 1024;

fn entry<R: Read + Seek>(
    zip: &mut zip::ZipArchive<R>,
    name: &str,
    budget: u64,
) -> Result<Option<Vec<u8>>> {
    let mut file = match zip.by_name(name) {
        Ok(file) => file,
        Err(zip::result::ZipError::FileNotFound) => return Ok(None),
        Err(e) => return Err(Error::other(e.to_string())),
    };
    if file.size() > budget {
        return Err(Error::other(
            "Archive entry exceeds the metadata inspection memory budget",
        ));
    }
    let mut bytes = Vec::new();
    file.by_ref().take(budget + 1).read_to_end(&mut bytes)?;
    if bytes.len() as u64 > budget {
        return Err(Error::other(
            "Archive entry exceeds the metadata inspection memory budget",
        ));
    }
    Ok(Some(bytes))
}
fn document<R: Read + Seek>(zip: &mut zip::ZipArchive<R>, name: &str) -> Result<Option<Value>> {
    let Some(bytes) = entry(zip, name, MANIFEST_BYTES)? else {
        return Ok(None);
    };
    if name.ends_with(".toml") {
        let text = std::str::from_utf8(&bytes).map_err(|e| Error::other(e.to_string()))?;
        let parsed: toml::Value = toml::from_str(text).map_err(|e| Error::other(e.to_string()))?;
        Ok(Some(serde_json::to_value(parsed)?))
    } else {
        Ok(Some(serde_json::from_slice(&bytes)?))
    }
}
fn identities(name: &str, value: &Value) -> Vec<(String, Option<String>, Option<String>)> {
    let rows: Vec<(&Value, &str, &str)> = match name {
        "fabric.mod.json" => vec![(value, "id", "name")],
        "quilt.mod.json" if value["schema_version"] == 1 => {
            vec![(&value["quilt_loader"], "id", "name")]
        }
        "mcmod.info" => value
            .as_array()
            .or_else(|| value["modList"].as_array())
            .into_iter()
            .flatten()
            .map(|v| (v, "modid", "name"))
            .collect(),
        _ => value["mods"]
            .as_array()
            .into_iter()
            .flatten()
            .map(|v| (v, "modId", "displayName"))
            .collect(),
    };
    rows.into_iter()
        .filter_map(|(v, key, title)| {
            let id = v[key].as_str()?.trim();
            if id.is_empty() {
                return None;
            }
            Some((
                id.to_string(),
                v["version"].as_str().map(str::to_string),
                v[title]
                    .as_str()
                    .or_else(|| v["metadata"]["name"].as_str())
                    .map(str::to_string),
            ))
        })
        .collect()
}
fn safe_entry(name: &str) -> bool {
    !name.contains(['\\', ':', '\0'])
        && name.ends_with(".jar")
        && name
            .split('/')
            .all(|part| !part.is_empty() && part != "." && part != "..")
}
fn scan<R: Read + Seek>(
    zip: &mut zip::ZipArchive<R>,
    scope: &str,
    hash: Option<&str>,
    depth: usize,
    remaining: &mut u64,
    out: &mut ArchiveFacts,
) {
    let mut nested = BTreeSet::new();
    for name in MANIFESTS {
        match document(zip, name) {
            Ok(Some(value)) => {
                for (id, version, title) in identities(name, &value) {
                    out.mods.push(ModIdentity {
                        id,
                        version,
                        title,
                        manifest: name.into(),
                        archive_path: scope.into(),
                        sha256: hash.map(str::to_string),
                    });
                }
                if name == "fabric.mod.json" {
                    nested.extend(
                        value["jars"]
                            .as_array()
                            .into_iter()
                            .flatten()
                            .filter_map(|v| v["file"].as_str())
                            .map(str::to_string),
                    );
                } else if name == "quilt.mod.json" && value["schema_version"] == 1 {
                    nested.extend(
                        value["quilt_loader"]["jars"]
                            .as_array()
                            .into_iter()
                            .flatten()
                            .filter_map(Value::as_str)
                            .map(str::to_string),
                    );
                }
            }
            Ok(None) => {}
            Err(error) => out.warnings.push(format!("{scope}{name}: {error}")),
        }
    }
    match dependencies(zip) {
        Ok(rows) => out.dependencies.extend(rows.into_iter().map(|mut row| {
            row["archive_path"] = json!(scope);
            row["artifact_sha256"] = json!(hash);
            row
        })),
        Err(error) => out.warnings.push(format!("{scope}dependencies: {error}")),
    }
    match document(zip, "META-INF/jarjar/metadata.json") {
        Ok(Some(value)) => nested.extend(
            value["jars"]
                .as_array()
                .into_iter()
                .flatten()
                .filter_map(|v| v["path"].as_str())
                .map(str::to_string),
        ),
        Err(error) => out
            .warnings
            .push(format!("{scope}META-INF/jarjar/metadata.json: {error}")),
        _ => {}
    }
    for name in nested {
        let nested_scope = format!("{scope}{name}!/");
        if !safe_entry(&name) {
            out.warnings.push(format!(
                "{nested_scope}Unsafe bundled JAR path; metadata was not read."
            ));
            continue;
        }
        if depth >= 16 {
            out.warnings.push(format!("{nested_scope}Nested metadata recursion budget reached; this branch is unverified."));
            continue;
        }
        let parsed: Result<()> = (|| {
            let bytes = entry(zip, &name, *remaining)?
                .ok_or_else(|| Error::other("Declared bundled JAR is missing"))?;
            *remaining = remaining.saturating_sub(bytes.len() as u64);
            let hash = format!("{:x}", Sha256::digest(&bytes));
            let mut child = zip::ZipArchive::new(Cursor::new(bytes))
                .map_err(|e| Error::other(e.to_string()))?;
            scan(
                &mut child,
                &nested_scope,
                Some(&hash),
                depth + 1,
                remaining,
                out,
            );
            Ok(())
        })();
        if let Err(error) = parsed {
            out.warnings.push(format!("{nested_scope}{error}"));
        }
    }
}
pub fn inspect(files: &FileManager, path: &Path) -> Result<ArchiveFacts> {
    let mut archive =
        zip::ZipArchive::new(files.open(path)?).map_err(|e| Error::other(e.to_string()))?;
    // Disposable derived cache; not a second source of truth. Central-directory
    // checksums invalidate edits retaining the same file length and timestamp.
    type CacheEntry = (String, String, usize, ArchiveFacts);
    static CACHE: OnceLock<Mutex<VecDeque<CacheEntry>>> = OnceLock::new();
    let names: Vec<String> = archive
        .file_names()
        .filter(|name| {
            MANIFESTS.contains(name)
                || *name == "META-INF/jarjar/metadata.json"
                || name.ends_with(".jar")
        })
        .map(str::to_string)
        .collect();
    let mut digest = Sha256::new();
    for name in names {
        let item = archive
            .by_name(&name)
            .map_err(|e| Error::other(e.to_string()))?;
        digest.update((name.len() as u64).to_le_bytes());
        digest.update(name.as_bytes());
        digest.update(item.crc32().to_le_bytes());
        digest.update(item.size().to_le_bytes());
    }
    let fingerprint = format!("{:x}", digest.finalize());
    let key = path.to_string_lossy().into_owned();
    {
        let mut cache = CACHE.get_or_init(Default::default).lock().unwrap();
        if let Some(index) = cache
            .iter()
            .position(|(p, f, _, _)| p == &key && f == &fingerprint)
        {
            let entry = cache.remove(index).unwrap();
            let value = entry.3.clone();
            cache.push_back(entry);
            return Ok(value);
        }
    }
    let mut found = ArchiveFacts::default();
    let mut remaining = NESTED_BYTES;
    scan(&mut archive, "", None, 0, &mut remaining, &mut found);
    found.mods.sort_by(|a, b| {
        (&a.archive_path, &a.id, &a.manifest).cmp(&(&b.archive_path, &b.id, &b.manifest))
    });
    found.mods.dedup_by(|a, b| {
        a.archive_path == b.archive_path && a.id == b.id && a.version == b.version
    });
    let size = serde_json::to_vec(&found)?.len();
    const CACHE_BYTES: usize = 16 * 1024 * 1024;
    if size <= CACHE_BYTES {
        let mut cache = CACHE.get_or_init(Default::default).lock().unwrap();
        cache.retain(|(p, _, _, _)| p != &key);
        while cache.iter().map(|entry| entry.2).sum::<usize>() + size > CACHE_BYTES {
            cache.pop_front();
        }
        cache.push_back((key, fingerprint, size, found.clone()));
    }
    Ok(found)
}

fn quilt_dependency(
    value: &Value,
    owner: &str,
    kind: &str,
    side: &str,
    group: Option<&str>,
    expression: &Value,
    found: &mut Vec<Value>,
) -> Result<()> {
    if let Some(alternatives) = value.as_array() {
        for alternative in alternatives {
            quilt_dependency(alternative, owner, kind, side, group, expression, found)?;
        }
        return Ok(());
    }
    let qualified = value
        .as_str()
        .or_else(|| value["id"].as_str())
        .ok_or_else(|| Error::other("Quilt dependency has no mod ID"))?;
    let mod_id = qualified.rsplit(':').next().unwrap_or(qualified);
    if mod_id.is_empty() {
        return Err(Error::other("Quilt dependency has an empty mod ID"));
    }
    let range = value.get("versions").cloned().unwrap_or_else(|| json!("*"));
    found.push(json!({"owner":owner,"mod_id":mod_id,"qualified_id":qualified,"kind":if kind=="required"&&value["optional"]==true{"optional"}else{kind},"version_range":range,"side":value["environment"].as_str().unwrap_or(side),"manifest":"quilt.mod.json","alternative_group":group,"unless":value.get("unless"),"declared_expression":expression}));
    Ok(())
}

fn dependencies<R: Read + Seek>(zip: &mut zip::ZipArchive<R>) -> Result<Vec<Value>> {
    let mut found = Vec::new();
    for manifest in [
        "fabric.mod.json",
        "quilt.mod.json",
        "META-INF/neoforge.mods.toml",
        "META-INF/mods.toml",
        "mcmod.info",
    ] {
        let mut file = match zip.by_name(manifest) {
            Ok(file) => file,
            Err(zip::result::ZipError::FileNotFound) => continue,
            Err(error) => return Err(Error::other(error.to_string())),
        };
        let mut text = String::new();
        file.by_ref()
            .take(1024 * 1024 + 1)
            .read_to_string(&mut text)?;
        if text.len() > 1024 * 1024 {
            return Err(Error::other(
                "Dependency manifest exceeds the parser's memory budget",
            ));
        }
        if manifest == "mcmod.info" {
            let value: Value = serde_json::from_str(&text)?;
            for item in value
                .as_array()
                .or_else(|| value["modList"].as_array())
                .into_iter()
                .flatten()
            {
                let owner = item["modid"]
                    .as_str()
                    .ok_or_else(|| Error::other("Legacy manifest has no mod ID"))?;
                for (key, kind) in [("requiredMods", "required"), ("dependencies", "optional")] {
                    for declaration in item[key].as_array().into_iter().flatten() {
                        let declaration = declaration
                            .as_str()
                            .ok_or_else(|| Error::other("Invalid legacy dependency declaration"))?;
                        let (id, range) = declaration.split_once('@').unwrap_or((declaration, "*"));
                        found.push(json!({"owner":owner,"mod_id":id,"kind":kind,"version_range":range,"side":"BOTH","manifest":manifest}));
                    }
                }
            }
        } else if manifest == "quilt.mod.json" {
            let value: Value = serde_json::from_str(&text)?;
            if value["schema_version"] != 1 {
                return Err(Error::other("Unsupported Quilt manifest schema"));
            }
            let loader = &value["quilt_loader"];
            let owner = loader["id"]
                .as_str()
                .ok_or_else(|| Error::other("Quilt manifest has no mod ID"))?;
            let side = value["minecraft"]["environment"].as_str().unwrap_or("*");
            for (key, kind) in [("depends", "required"), ("breaks", "incompatible")] {
                if loader[key].is_null() {
                    continue;
                }
                let declarations = loader[key]
                    .as_array()
                    .ok_or_else(|| Error::other("Invalid Quilt dependency declarations"))?;
                for (index, declaration) in declarations.iter().enumerate() {
                    let group = declaration.is_array().then(|| format!("{key}:{index}"));
                    quilt_dependency(
                        declaration,
                        owner,
                        kind,
                        side,
                        group.as_deref(),
                        declaration,
                        &mut found,
                    )?;
                }
            }
        } else if manifest.ends_with(".json") {
            let value: Value = serde_json::from_str(&text)?;
            let owner = value["id"]
                .as_str()
                .ok_or_else(|| Error::other("Fabric manifest has no mod ID"))?;
            for (key, kind) in [
                ("depends", "required"),
                ("recommends", "recommended"),
                ("suggests", "optional"),
                ("breaks", "incompatible"),
                ("conflicts", "discouraged"),
            ] {
                if value[key].is_null() {
                    continue;
                }
                let declarations = value[key]
                    .as_object()
                    .ok_or_else(|| Error::other("Invalid Fabric dependency declarations"))?;
                for (id, range) in declarations {
                    if !range.is_string()
                        && !range
                            .as_array()
                            .is_some_and(|a| a.iter().all(Value::is_string))
                    {
                        return Err(Error::other("Invalid Fabric dependency version range"));
                    }
                    found.push(json!({"owner":owner,"mod_id":id,"kind":kind,"version_range":range,"side":value["environment"].as_str().unwrap_or("*"),"manifest":manifest}));
                }
            }
        } else {
            let parsed: toml::Value =
                toml::from_str(&text).map_err(|e| Error::other(e.to_string()))?;
            let value = serde_json::to_value(parsed)?;
            if let Some(groups) = value["dependencies"].as_object() {
                for (owner, group) in groups {
                    for dependency in group
                        .as_array()
                        .ok_or_else(|| Error::other("Invalid Forge dependency declarations"))?
                    {
                        let id = dependency["modId"]
                            .as_str()
                            .ok_or_else(|| Error::other("Dependency has no mod ID"))?;
                        let kind = dependency["type"].as_str().unwrap_or_else(|| {
                            if dependency["mandatory"] == false {
                                "optional"
                            } else {
                                "required"
                            }
                        });
                        found.push(json!({"owner":owner,"mod_id":id,"kind":kind,"version_range":dependency["versionRange"],"side":dependency["side"].as_str().unwrap_or("BOTH"),"manifest":manifest}));
                    }
                }
            }
        }
    }
    Ok(found)
}
