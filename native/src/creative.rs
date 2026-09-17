//! Saved favorites and evidence-based inspection of exact local mod files.
//! Generator provenance is independent of AI authorship and runtime performance.
use crate::{commands::find_instance, error::{Error, Result}, state::AppState, tasks::TaskHandle};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use std::{collections::BTreeMap, io::{Read, Seek, SeekFrom}, path::Path, sync::Mutex};

static LIBRARY_WRITE: Mutex<()> = Mutex::new(());
pub const DETECTOR: &str = "mcreator-1";
fn now() -> i64 { chrono::Utc::now().timestamp_millis() }
fn s<'a>(v: &'a Value, key: &str) -> &'a str { v[key].as_str().unwrap_or("") }
fn empty_library() -> Value { json!({"schema":1,"favorites":{},"collections":{},"preferences":{}}) }

pub fn library(state: &AppState) -> Result<Value> {
    let mut library = state.db.library_get("favorites")?.unwrap_or_else(empty_library);
    for (id, name) in [("following", "Following"), ("testing", "Testing")] {
        if library["collections"][id].is_null() { library["collections"][id] = json!({"id":id,"name":name}); }
    }
    Ok(library)
}

pub fn library_action(state: &AppState, operation: &str, args: &Value) -> Result<Value> {
    let _lock = LIBRARY_WRITE.lock().map_err(|_| Error::other("Library is busy"))?;
    let mut data = library(state)?;
    match operation {
        "save" => {
            let mut favorite = args["favorite"].clone();
            let provider = s(&favorite, "provider");
            let id = s(&favorite, "project_id");
            if !matches!(provider, "modrinth" | "curseforge" | "local") || id.is_empty() || id.len() > 256 || s(&favorite, "title").trim().is_empty() {
                return Err(Error::other("A favorite needs a provider, project ID and title"));
            }
            if !matches!(s(&favorite, "kind"), "mods" | "modpacks" | "resourcepacks" | "shaderpacks" | "datapacks" | "schematics" | "addons" | "config") {
                return Err(Error::other("Unknown favorite content type"));
            }
            let key = format!("{provider}:{id}");
            let old = &data["favorites"][&key];
            if old.is_object() {
                // Refresh display metadata without erasing the user's organization.
                for field in ["collections", "tags", "notes", "pinned", "order", "saved_at"] { favorite[field] = old[field].clone(); }
            } else {
                favorite["collections"] = json!([]); favorite["tags"] = json!([]);
                favorite["notes"] = json!(""); favorite["pinned"] = json!(false);
                favorite["order"] = json!(now()); favorite["saved_at"] = json!(now());
            }
            favorite["key"] = json!(key);
            data["favorites"][&key] = favorite;
        }
        "remove" => {
            for key in args["keys"].as_array().ok_or_else(|| Error::other("Choose favorites to remove"))? {
                if let Some(key) = key.as_str() { data["favorites"].as_object_mut().unwrap().remove(key); }
            }
        }
        "edit" => {
            let patch = args["patch"].as_object().ok_or_else(|| Error::other("Missing favorite changes"))?;
            for (key, value) in patch {
                let valid = match key.as_str() {
                    "notes" => value.is_string(), "pinned" => value.is_boolean(), "order" => value.is_number(),
                    "tags" | "collections" => value.as_array().is_some_and(|v| v.iter().all(Value::is_string)), _ => false,
                };
                if !valid { return Err(Error::other(format!("Invalid favorite field: {key}"))); }
            }
            for key in args["keys"].as_array().ok_or_else(|| Error::other("Choose favorites to edit"))? {
                let key = key.as_str().ok_or_else(|| Error::other("Invalid favorite ID"))?;
                if let Some(favorite) = data["favorites"][key].as_object_mut() { favorite.extend(patch.clone()); }
            }
        }
        "collection" => {
            let id = if s(args, "id").is_empty() { uuid::Uuid::new_v4().to_string() } else { s(args, "id").to_string() };
            if matches!(id.as_str(), "following" | "testing") { return Err(Error::other("This library section has a permanent name")); }
            let name = s(args, "name").trim();
            if name.is_empty() { return Err(Error::other("Give this collection a name")); }
            data["collections"][&id] = json!({"id":id,"name":name});
        }
        "delete_collection" => {
            let id = s(args, "id");
            if matches!(id, "following" | "testing") { return Err(Error::other("This library section cannot be deleted")); }
            data["collections"].as_object_mut().unwrap().remove(id);
            for entry in data["favorites"].as_object_mut().unwrap().values_mut() {
                if let Some(list) = entry["collections"].as_array_mut() { list.retain(|v| v.as_str() != Some(id)); }
            }
        }
        "reorder" => {
            for (index, key) in args["keys"].as_array().ok_or_else(|| Error::other("Missing favorite order"))?.iter().enumerate() {
                if let Some(key) = key.as_str() { if data["favorites"][key].is_object() { data["favorites"][key]["order"] = json!(index); } }
            }
        }
        "preferences" => {
            let prefs = args.as_object().ok_or_else(|| Error::other("Invalid library preferences"))?;
            data["preferences"].as_object_mut().unwrap().extend(prefs.clone());
        }
        _ => return Err(Error::other("Unknown library action")),
    }
    state.db.library_put("favorites", &data)?;
    if let Some(sink) = state.tasks.event_sink() { sink("creative:library", data.clone()); }
    Ok(data)
}

fn check_cancel(task: Option<&TaskHandle>) -> Result<()> {
    if task.is_some_and(|t| t.token().is_cancelled()) { Err(Error::Cancelled) } else { Ok(()) }
}

pub fn file_hash(state: &AppState, path: &Path, task: Option<&TaskHandle>) -> Result<String> {
    let mut file = state.files.open(path)?;
    let mut sha = Sha256::new();
    let mut buffer = [0u8; 64 * 1024];
    loop {
        check_cancel(task)?;
        let n = file.read(&mut buffer)?;
        if n == 0 { break; }
        sha.update(&buffer[..n]);
    }
    Ok(format!("{:x}", sha.finalize()))
}

fn contains(bytes: &[u8], needle: &[u8]) -> bool { bytes.windows(needle.len()).any(|v| v == needle) }

pub fn inspect(state: &AppState, path: &Path, task: Option<&TaskHandle>) -> Result<Value> {
    let mut file = state.files.open(path)?;
    let before = file.metadata()?;
    if before.len() > 1024 * 1024 * 1024 { return Err(Error::other("Archive exceeds the 1 GiB inspection safety limit")); }
    let mut sha = Sha256::new();
    let mut buffer = [0u8; 64 * 1024];
    loop {
        check_cancel(task)?;
        let n = file.read(&mut buffer)?;
        if n == 0 { break; }
        sha.update(&buffer[..n]);
    }
    let hash = format!("{:x}", sha.finalize());
    let cache_key = format!("inspection:{DETECTOR}:{hash}");
    if let Some(mut cached) = state.db.library_get(&cache_key)? {
        cached["override"] = state.db.library_get(&format!("generator-override:{hash}"))?.unwrap_or(Value::Null);
        return Ok(cached);
    }
    file.seek(SeekFrom::Start(0))?;
    let mut zip = zip::ZipArchive::new(file).map_err(|e| Error::other(format!("Unreadable JAR: {e}")))?;
    if zip.len() > 100_000 { return Err(Error::other("Archive exceeds the 100,000-entry inspection safety limit")); }
    let mut evidence = Vec::new();
    let mut package = None;
    let mut procedures = 0u64;
    let mut generated = None;
    let mut explicit = None;
    let mut classes = 0u64;
    let mut texture_bytes = 0u64;
    let mut sound_bytes = 0u64;
    let mut unpacked_bytes = 0u64;
    let mut mixins = 0u64;
    let mut tick_refs = Vec::new();
    let mut inspected_bytes = 0u64;
    let mut limited = false;
    for index in 0..zip.len() {
        check_cancel(task)?;
        let mut entry = zip.by_index(index).map_err(|e| Error::other(format!("Damaged JAR directory: {e}")))?;
        let name = entry.name().to_string();
        let lower = name.to_lowercase();
        unpacked_bytes = unpacked_bytes.saturating_add(entry.size());
        if lower.ends_with(".png") { texture_bytes = texture_bytes.saturating_add(entry.size()); }
        if lower.ends_with(".ogg") { sound_bytes = sound_bytes.saturating_add(entry.size()); }
        if lower.ends_with(".json") && lower.contains("mixin") { mixins += 1; }
        if name.ends_with(".class") {
            classes += 1;
            if name.starts_with("net/mcreator/") { package.get_or_insert(name.clone()); }
            if name.contains("/procedures/") && name.ends_with("Procedure.class") { procedures += 1; }
            if name.ends_with("ModVariables.class") || name.ends_with("ModElements.class") { generated.get_or_insert(name.clone()); }
        }
        let textual = lower == "meta-inf/manifest.mf" || lower.ends_with("mods.toml") || lower == "mcmod.info" || lower == "fabric.mod.json";
        if textual || name.ends_with(".class") {
            if entry.size() > 2 * 1024 * 1024 || inspected_bytes.saturating_add(entry.size()) > 64 * 1024 * 1024 { limited = true; continue; }
            let mut bytes = Vec::new();
            (&mut entry).take(2 * 1024 * 1024 + 1).read_to_end(&mut bytes)?;
            inspected_bytes += bytes.len() as u64;
            if textual {
                let text = String::from_utf8_lossy(&bytes).to_lowercase();
                if text.lines().any(|line| {
                    let line = line.trim();
                    (line.starts_with("created-by:") || line.starts_with("generator:")) && line.contains("mcreator")
                }) { explicit = Some(name.clone()); }
            }
            if name.ends_with(".class") && [b"PlayerTickEvent".as_slice(), b"LevelTickEvent", b"WorldTickEvent", b"ServerTickEvent", b"ClientTickEvent", b"LivingTickEvent", b"LivingUpdateEvent"].iter().any(|needle| contains(&bytes, needle)) {
                tick_refs.push(name);
            }
        }
    }
    if let Some(path) = &package { evidence.push(json!({"signal":"Default MCreator package","path":path,"detail":"Class lives under net/mcreator/. Package names can be copied or customized."})); }
    if let Some(path) = &generated { evidence.push(json!({"signal":"Generated workspace structure","path":path,"detail":"ModVariables or legacy ModElements class naming matches generator templates; this signal alone is inconclusive."})); }
    if procedures > 0 { evidence.push(json!({"signal":"Procedure classes","path":"*/procedures/*Procedure.class","detail":format!("{procedures} procedure classes match the generator's naming convention; other tools can use this pattern.")})); }
    if let Some(path) = &explicit { evidence.push(json!({"signal":"Declared generator","path":path,"detail":"Archive manifest explicitly names MCreator. This is a declaration by the file author."})); }
    let status = if explicit.is_some() { "declared" } else if package.is_some() && (procedures > 0 || generated.is_some()) { "likely" } else if package.is_some() || (procedures > 0 && generated.is_some()) { "possible" } else { "unknown" };
    let after = zip.into_inner().metadata()?;
    if before.len() != after.len() || before.modified().ok() != after.modified().ok() { return Err(Error::other("File changed during inspection. Scan it again.")); }
    let result = json!({"sha256":hash,"detector":DETECTOR,"status":status,"evidence":evidence,"limited":limited,
        "facts":{"classes":classes,"procedures":procedures,"texture_bytes":texture_bytes,"sound_bytes":sound_bytes,"unpacked_bytes":unpacked_bytes,"mixin_configs":mixins,"tick_references":tick_refs},
        "scope":"Static archive evidence. Unknown means insufficient evidence. Generator identity does not establish AI authorship, quality or performance."});
    state.db.library_put(&cache_key, &result)?;
    let mut result = result;
    result["override"] = state.db.library_get(&format!("generator-override:{hash}"))?.unwrap_or(Value::Null);
    Ok(result)
}

pub fn generator_override(state: &AppState, args: &Value) -> Result<Value> {
    let hash = s(args, "sha256");
    let choice = s(args, "choice");
    if hash.len() != 64 || !hash.bytes().all(|b| b.is_ascii_hexdigit()) || !matches!(choice, "auto" | "mcreator" | "not_mcreator") {
        return Err(Error::other("Invalid exact-file generator override"));
    }
    if state.db.library_get(&format!("inspection:{DETECTOR}:{hash}"))?.is_none() { return Err(Error::other("Inspect this file before adding an override")); }
    let value = if choice == "auto" { Value::Null } else { json!({"choice":choice,"note":s(args,"note"),"at":now()}) };
    state.db.library_put(&format!("generator-override:{hash}"), &value)?;
    if let Some(sink)=state.tasks.event_sink(){sink("creative:generator",json!({"sha256":hash,"override":value}));}
    Ok(value)
}

pub fn scan_instance(state: &AppState, id: &str, task: &TaskHandle, history: bool, persist: bool) -> Result<Value> {
    let started = std::time::Instant::now();
    let instance = find_instance(state, id)?;
    let root = Path::new(&instance.dir);
    let dir = root.join("mods");
    let mut entries = match state.files.read_dir(&dir) { Ok(v) => v, Err(Error::Io(e)) if e.kind() == std::io::ErrorKind::NotFound => Vec::new(), Err(e) => return Err(e) };
    entries.retain(|p| p.file_name().is_some_and(|n| { let n = n.to_string_lossy().to_lowercase(); n.ends_with(".jar") || n.ends_with(".jar.disabled") }));
    entries.sort();
    let sources = state.db.content_files(id, "mods")?;
    let mut rows = Vec::new();
    for (index, path) in entries.iter().enumerate() {
        check_cancel(Some(task))?;
        let name = path.file_name().unwrap().to_string_lossy().to_string();
        task.stage(&format!("Inspecting {name}"));
        let file_name = name.trim_end_matches(".disabled");
        let mut source = sources.iter().find(|s| s.file_name == file_name).cloned();
        crate::search::identify::enrich_local_source(&state.files, path, file_name, &mut source);
        let inspected = inspect(state, path, Some(task));
        if matches!(inspected, Err(Error::Cancelled)) { return Err(Error::Cancelled); }
        rows.push(json!({"file_name":file_name,"enabled":!name.ends_with(".disabled"),"size":state.files.metadata(path).map(|m|m.len()).unwrap_or(0),
            "title":source.as_ref().and_then(|s|s.title.as_deref()).unwrap_or(file_name),"source":source,
            "inspection":inspected.as_ref().ok(),"error":inspected.err().map(|e|e.to_string())}));
        task.progress((index+1) as u64, entries.len() as u64, 0, 0);
    }
    if !history {
        let report = json!({"id":uuid::Uuid::new_v4().to_string(),"instance_id":id,"instance_name":instance.name,"at":now(),"kind":"mod_inspection","detector":DETECTOR,
            "fingerprint":"","environment":{},"config_hashes":{},"files":rows,"duration_ms":started.elapsed().as_millis()});
        if persist { state.db.library_put(&format!("latest-scan:{id}"), &report)?; }
        return Ok(report);
    }
    // Exact inputs used for staleness comparisons; no credentials or account data in reports.
    let mut configs = BTreeMap::new();
    fingerprint_configs(state, root, &root.join("config"), &mut configs, task, 0)?;
    fingerprint_configs(state, root, &root.join("defaultconfigs"), &mut configs, task, 0)?;
    let mut content_hashes = BTreeMap::new();
    for folder in ["resourcepacks","shaderpacks","pointblank","tacz","kubejs","scripts"] {
        fingerprint_configs(state,root,&root.join(folder),&mut content_hashes,task,0)?;
    }
    for name in ["options.txt", "optionsof.txt", "optionsshaders.txt"] {
        let path = root.join(name);
        if state.files.is_file(&path)? { configs.insert(name.to_string(), file_hash(state, &path, Some(task))?); }
    }
    let settings = state.db.load_settings()?;
    let environment = json!({"minecraft":instance.version_id,"loader":instance.loader,"loader_version":instance.loader_version,
        "java":instance.java_path.or(settings.java_path),"memory_min":instance.min_memory_mb,"memory_max":instance.max_memory_mb,
        "global_memory_min":settings.min_memory_mb,"global_memory_max":settings.max_memory_mb,
        "jvm_args_hash":format!("{:x}",Sha256::digest(format!("{:?}:{:?}:{:?}",instance.jvm_args,instance.jvm_args_mode,settings.jvm_args))),
        "os":std::env::consts::OS,"arch":std::env::consts::ARCH});
    let inputs = json!({"mods":rows.iter().map(|r|json!([r["file_name"],r["enabled"],r["inspection"]["sha256"],r["error"]])).collect::<Vec<_>>(),"configs":configs,"content":content_hashes,"environment":environment});
    let fingerprint = format!("{:x}", Sha256::digest(inputs.to_string()));
    let report_id = uuid::Uuid::new_v4().to_string();
    let report = json!({"id":report_id,"instance_id":id,"instance_name":instance.name,"at":now(),"kind":"static_scan","detector":DETECTOR,
        "fingerprint":fingerprint,"environment":environment,"config_hashes":configs,"content_hashes":content_hashes,"files":rows,"duration_ms":started.elapsed().as_millis()});
    check_cancel(Some(task))?;
    if persist {
        state.db.library_put(&format!("scan:{:015}:{report_id}",now()), &report)?;
        state.db.library_put(&format!("latest-scan:{id}"), &report)?;
    }
    Ok(report)
}

fn fingerprint_configs(state: &AppState, root: &Path, dir: &Path, out: &mut BTreeMap<String,String>, task: &TaskHandle, depth: usize) -> Result<()> {
    check_cancel(Some(task))?;
    if depth > 24 { return Err(Error::other("Config nesting exceeds the inspection safety limit")); }
    let entries = match state.files.read_dir(dir) { Ok(v) => v, Err(Error::Io(e)) if e.kind() == std::io::ErrorKind::NotFound => return Ok(()), Err(e) => return Err(e) };
    for path in entries {
        let meta = state.files.symlink_metadata(&path)?;
        if meta.file_type().is_symlink() { return Err(Error::other("Linked configs cannot be fingerprinted safely")); }
        #[cfg(windows)] { use std::os::windows::fs::MetadataExt; if std::fs::symlink_metadata(&path)?.file_attributes() & 0x400 != 0 { return Err(Error::other("Linked configs cannot be fingerprinted safely")); } }
        if meta.is_dir() { fingerprint_configs(state,root,&path,out,task,depth+1)?; }
        else if meta.is_file() { out.insert(path.strip_prefix(root).unwrap().to_string_lossy().replace('\\',"/"),file_hash(state,&path,Some(task))?); }
    }
    Ok(())
}

pub fn installed_context(state: &AppState) -> Result<Value> {
    let saved=library(state)?;
    let mut context = BTreeMap::<String, Vec<Value>>::new();
    for instance in state.db.list_instances(&state.files)? {
        let updates = state.db.content_updates(&instance.id)?;
        for kind in ["mods","resourcepacks","shaderpacks","datapacks","schematics"] {
            for source in state.db.content_files(&instance.id, kind)? {
                let Some(provider) = &source.provider else { continue }; let Some(project) = &source.project_id else { continue };
                let path = Path::new(&instance.dir).join(kind).join(&source.file_name);
                let enabled = state.files.is_file(&path).unwrap_or(false);
                if !enabled && !state.files.is_file(path.with_file_name(format!("{}.disabled",source.file_name))).unwrap_or(false) { continue; }
                let key=format!("{provider}:{project}");
                let inspection=if kind=="mods" && saved["favorites"][&key].is_object() { inspect(state,&if enabled {path.clone()} else {path.with_file_name(format!("{}.disabled",source.file_name))},None).ok() } else { None };
                context.entry(key).or_default().push(json!({"instance_id":instance.id,"instance_name":instance.name,"kind":kind,"file_name":source.file_name,"version":source.mod_version,"version_id":source.version_id,"enabled":enabled,"inspection":inspection,
                    "update":updates.iter().find(|u|u.kind==kind && u.file_name==source.file_name)}));
            }
        }
        if let (Some(provider),Some(project)) = (&instance.pack_provider,&instance.pack_project_id) {
            context.entry(format!("{provider}:{project}")).or_default().push(json!({"instance_id":instance.id,"instance_name":instance.name,"kind":"modpacks","file_name":"","version_id":instance.pack_version_id,"enabled":true}));
        }
        let has_custom=saved["favorites"].as_object().is_some_and(|f|f.values().any(|v|v["provider"]=="local" || v["kind"]=="config" || v["kind"]=="addons"));
        if has_custom {
            let entries=crate::workbench::favorite_entries(state,&instance.id,&saved["favorites"])?;
            for entry in &entries {
                if entry["exists"]!=true {continue;}
                let hash=s(entry,"hash");let record=&entry["record"];
                let keys=[format!("local:{hash}"),format!("{}:{}",s(record,"provider"),s(record,"project_id"))];
                for key in keys {if saved["favorites"][&key].is_object() {
                    let kind=if entry["mod"]==true{"mods"}else if entry["addon"]==true{"addons"}else{"config"};
                    let inspection=if kind=="mods"{inspect(state,&Path::new(&instance.dir).join(s(entry,"path")),None).ok()}else{None};
                    let found=context.entry(key).or_default();
                    if !found.iter().any(|i|i["instance_id"]==instance.id && i["file_name"].as_str()==Some(s(entry,"path"))) {
                        found.push(json!({"instance_id":instance.id,"instance_name":instance.name,"kind":kind,"file_name":entry["path"],"version_id":record["version_id"],"enabled":entry["enabled"],"inspection":inspection,
                            "update":if record["update"]["status"]=="available"{json!({"latest_name":record["update"]["name"],"latest_version_id":record["update"]["version_id"]})}else{Value::Null}}));
                    }
                }}
            }
        }
    }
    Ok(json!(context))
}
