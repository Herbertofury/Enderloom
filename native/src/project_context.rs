//! Current relationships projected from existing inventory and config owners.
use crate::{
    db::ContentFile,
    error::{Error, Result},
    state::AppState,
};
use serde_json::{json, Value};
use std::{collections::BTreeSet, io::Read, path::Path};

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

fn dependencies(state: &AppState, path: &Path) -> Result<Vec<Value>> {
    let mut zip =
        zip::ZipArchive::new(state.files.open(path)?).map_err(|e| Error::other(e.to_string()))?;
    let mut found = Vec::new();
    for manifest in [
        "fabric.mod.json",
        "quilt.mod.json",
        "META-INF/neoforge.mods.toml",
        "META-INF/mods.toml",
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
        if manifest == "quilt.mod.json" {
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

pub fn get(state: &AppState, provider: &str, project: &str) -> Result<Value> {
    crate::search::Provider::parse(provider)?;
    let graph = state.db.project_artifact_graph(provider, project)?;
    let mut aliases: BTreeSet<(String, String)> = graph
        .project
        .into_iter()
        .flat_map(|p| p.aliases.into_iter().map(|a| (a.provider, a.project_id)))
        .collect();
    aliases.insert((provider.into(), project.into()));
    let matches = |source: &ContentFile| {
        source
            .provider
            .as_ref()
            .zip(source.project_id.as_ref())
            .is_some_and(|(p, id)| aliases.contains(&(p.clone(), id.clone())))
    };
    let mut targets = Vec::new();
    let mut warnings = Vec::new();
    for instance in state.db.list_instances(&state.files)? {
        let sources = state.db.all_content_files(&instance.id)?;
        if !sources.iter().any(|(_, s)| matches(s)) {
            continue;
        }
        let mut target = target_context(
            state,
            "instance",
            &instance.id,
            &instance.name,
            Path::new(&instance.dir),
            &instance.version_id,
            instance.loader.as_deref(),
            &sources,
            &matches,
        )?;
        match crate::workbench::scan_mode(state, &instance.id, false, false) {
            Ok(scan) => {
                let ids: BTreeSet<_> = target["project_mod_ids"]
                    .as_array()
                    .into_iter()
                    .flatten()
                    .filter_map(Value::as_str)
                    .collect();
                target["configs"]=json!(scan["entries"].as_array().into_iter().flatten().filter(|entry|entry["config"]==true && entry["mod"]!=true && entry["owner"]["confidence"]!="unassigned" && entry["owner"]["id"].as_str().is_some_and(|id|ids.contains(id))).map(|entry|{
                    let path=entry["path"].as_str().unwrap_or_default();let parts:Vec<_>=path.split('/').collect();
                    json!({"path":path,"title":entry["title"],"exists":entry["exists"],"enabled":entry["enabled"],"owner":entry["owner"],"world":if parts.len()>3&&parts[0]=="saves"&&parts[2]=="serverconfig"{Some(parts[1])}else{None}})
                }).collect::<Vec<_>>());
                for warning in scan["warnings"].as_array().into_iter().flatten() {
                    warnings.push(json!({"target_id":instance.id,"message":warning}));
                }
            }
            Err(error) => warnings
                .push(json!({"target_id":instance.id,"message":format!("Config lookup: {error}")})),
        }
        targets.push(target);
    }
    for server in state.db.list_servers(&state.paths)? {
        let mut sources = Vec::new();
        for kind in ["mods", "plugins", "resourcepacks", "shaderpacks"] {
            sources.extend(
                state
                    .db
                    .server_content_files(&server.id, kind)?
                    .into_iter()
                    .map(|source| (kind.to_string(), source)),
            );
        }
        if !sources.iter().any(|(_, s)| matches(s)) {
            continue;
        }
        targets.push(target_context(
            state,
            "server",
            &server.id,
            &server.name,
            Path::new(&server.dir),
            &server.version_id,
            Some(server.flavor.id()),
            &sources,
            &matches,
        )?);
    }
    Ok(
        json!({"schema_version":1,"provider":provider,"project_id":project,"checked_at":chrono::Utc::now().timestamp_millis(),"targets":targets,"warnings":warnings}),
    )
}

#[allow(clippy::too_many_arguments)]
fn target_context(
    state: &AppState,
    kind: &str,
    id: &str,
    name: &str,
    root: &Path,
    version: &str,
    loader: Option<&str>,
    sources: &[(String, ContentFile)],
    matches: &impl Fn(&ContentFile) -> bool,
) -> Result<Value> {
    let mut files = Vec::new();
    let mut declared = Vec::new();
    let mut issues = Vec::new();
    let mut installed = Vec::new();
    for (content_kind, source) in sources {
        // Inventory names are a single file, never a path supplied by metadata.
        if source.file_name.contains(['/', '\\'])
            || source.file_name == ".."
            || ![
                "mods",
                "plugins",
                "resourcepacks",
                "shaderpacks",
                "schematics",
            ]
            .contains(&content_kind.as_str())
        {
            continue;
        }
        let path =
            crate::content::resolve_path(&state.files, &root.join(content_kind), &source.file_name);
        let exists = state.files.is_file(&path).unwrap_or(false);
        let enabled = exists && !path.to_string_lossy().ends_with(".disabled");
        if matches(source) {
            files.push(json!({"file_name":source.file_name,"content_kind":content_kind,"exists":exists,"enabled":enabled,"provider":source.provider,"project_id":source.project_id,"version_id":source.version_id,"mod_id":source.mod_id,"mod_version":source.mod_version,"icon_url":source.icon_url}));
        }
        if content_kind == "mods" && exists {
            let mut local = source.clone();
            if let Some((mod_id, mod_version, title)) =
                crate::search::identify::cached_metadata(&state.files, &path)
            {
                local.mod_id = mod_id.or(local.mod_id);
                local.mod_version = mod_version.or(local.mod_version);
                local.title = local.title.or(title);
            }
            installed.push((local.clone(), enabled));
            match dependencies(state, &path) {
                Ok(rows) => {
                    for mut row in rows {
                        row["file_name"] = json!(source.file_name);
                        row["source_enabled"] = json!(enabled);
                        row["source_title"] = json!(local.title);
                        row["source_provider"] = json!(source.provider);
                        row["source_project_id"] = json!(source.project_id);
                        row["project_owned"] = json!(matches(source));
                        declared.push(row);
                    }
                }
                Err(error) => issues.push(format!("{}: {error}", source.file_name)),
            }
        }
    }
    let project_ids: BTreeSet<_> = installed
        .iter()
        .filter(|(s, _)| matches(s))
        .filter_map(|(s, _)| s.mod_id.as_deref())
        .collect();
    let mut worlds = Vec::new();
    if !project_ids.is_empty() {
        let candidates = if kind == "instance" {
            state.files.read_dir(root.join("saves")).unwrap_or_default()
        } else {
            let properties = crate::servers::properties::Properties::parse(
                &state
                    .files
                    .read(root.join("server.properties"))
                    .unwrap_or_default(),
            );
            let name = properties.get("level-name").unwrap_or("world");
            if name.is_empty()
                || Path::new(name)
                    .components()
                    .any(|c| !matches!(c, std::path::Component::Normal(_)))
            {
                issues.push("Server world path is unsafe; world evidence was not read.".into());
                vec![]
            } else {
                vec![root.join(name)]
            }
        };
        for world in candidates {
            if let Some(link) = crate::worlds::project_links(&state.files, &world, &project_ids) {
                worlds.push(link);
            }
        }
        worlds.sort_by(|a, b| a["folder"].as_str().cmp(&b["folder"].as_str()));
    }
    let relationships:Vec<_>=declared.into_iter().filter(|row|row["project_owned"]==true || row["mod_id"].as_str().is_some_and(|id|project_ids.contains(id))).map(|mut row|{
        let dependency_id=row["mod_id"].as_str().unwrap_or_default();
        row["installed_targets"]=json!(installed.iter().filter(|(s,_)|s.mod_id.as_deref()==Some(dependency_id)).map(|(s,enabled)|json!({"file_name":s.file_name,"title":s.title,"enabled":enabled,"provider":s.provider,"project_id":s.project_id,"mod_version":s.mod_version})).collect::<Vec<_>>());
        row["direction"]=json!(if row["project_owned"]==true {"dependency"}else{"dependent"});row["confidence"]=json!("declared");row
    }).collect();
    let mut configs = Vec::new();
    if kind == "server" {
        let properties = crate::servers::properties::Properties::parse(
            &state
                .files
                .read(root.join("server.properties"))
                .unwrap_or_default(),
        );
        let world = properties.get("level-name").unwrap_or("world");
        let world_prefix = format!("{world}/serverconfig/");
        let (paths, warnings) = crate::workbench::config_paths(
            &state.files,
            root,
            &[
                "config".into(),
                "defaultconfigs".into(),
                format!("{world}/serverconfig"),
            ],
        );
        issues.extend(warnings);
        let owners = crate::config_ownership::ConfigOwners::with_sources(state, &installed);
        let preferences = crate::creative::library(state)?;
        for path in paths {
            // A server world's folder name also provides no evidence of ownership.
            let world_relative = path
                .strip_prefix(&world_prefix)
                .map(|suffix| format!("serverconfig/{suffix}"));
            let owner = owners.associate(
                world_relative.as_deref().unwrap_or(&path),
                preferences["preferences"][format!("config-owner:{id}:{path}")].as_str(),
            );
            if owner.confidence != "unassigned" && project_ids.contains(owner.id.as_str()) {
                configs.push(json!({"path":path,"title":path.rsplit('/').next(),"exists":true,"enabled":!path.ends_with(".disabled"),"world":world_relative.map(|_|world),"owner":owner}));
            }
        }
    }
    Ok(
        json!({"kind":kind,"id":id,"name":name,"minecraft":version,"loader":loader,"project_mod_ids":project_ids,"files":files,"configs":configs,"worlds":worlds,"dependencies":relationships,"warnings":issues}),
    )
}
