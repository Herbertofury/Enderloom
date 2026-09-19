//! Current relationships projected from existing inventory and config owners.
use crate::{db::ContentFile, error::Result, state::AppState};
use serde_json::{json, Value};
use std::{collections::BTreeSet, path::Path};

fn safe_world_path(files: &crate::files::FileManager, root: &Path, path: &Path) -> bool {
    let Ok(relative) = path.strip_prefix(root) else {
        return false;
    };
    let mut current = root.to_path_buf();
    relative.components().all(|part| {
        if !matches!(part, std::path::Component::Normal(_)) {
            return false;
        }
        current.push(part);
        files
            .symlink_metadata(&current)
            .is_ok_and(|m| m.is_dir() && !m.is_symlink())
    })
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
    let mut available = Vec::new();
    let mut bundled_mods = Vec::new();
    let mut provenance = Vec::new();
    let mut source_evidence = Vec::new();
    let mut declared_project_ids = BTreeSet::new();
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
            if matches(source) {
                if let Some(report) = crate::config_sources::cached(state, &local) {
                    for evidence in report.evidence {
                        source_evidence.push(json!({"file_name":source.file_name,"evidence":evidence,"checked_at":report.checked_at}));
                    }
                }
            }
            match crate::mod_manifest::inspect(&state.files, &path) {
                Ok(facts) => {
                    for identity in &facts.mods {
                        let bundled = !identity.archive_path.is_empty();
                        let candidate = json!({"mod_id":identity.id,"file_name":source.file_name,"title":identity.title.as_ref().or(local.title.as_ref()),"mod_version":identity.version,"enabled":enabled,"bundled":bundled,"archive_path":identity.archive_path,"sha256":identity.sha256,"provider":if bundled{None}else{source.provider.as_ref()},"project_id":if bundled{None}else{source.project_id.as_ref()}});
                        available.push(candidate.clone());
                        if matches(source) {
                            if bundled {
                                bundled_mods.push(candidate);
                            } else {
                                declared_project_ids.insert(identity.id.clone());
                            }
                        }
                        if !bundled && local.mod_id.as_ref() != Some(&identity.id) {
                            let mut extra = local.clone();
                            extra.mod_id = Some(identity.id.clone());
                            extra.mod_version = identity.version.clone();
                            extra.title = identity.title.clone().or(extra.title);
                            installed.push((extra, enabled));
                        }
                    }
                    if matches(source) {
                        for record in facts.provenance {
                            provenance.push(json!({"file_name":source.file_name,"enabled":enabled,"record":record}));
                        }
                    }
                    issues.extend(
                        facts
                            .warnings
                            .into_iter()
                            .map(|warning| format!("{}: {warning}", source.file_name)),
                    );
                    for mut row in facts.dependencies {
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
    let mut project_ids: BTreeSet<_> = installed
        .iter()
        .filter(|(s, _)| matches(s))
        .filter_map(|(s, _)| s.mod_id.as_deref())
        .collect();
    project_ids.extend(declared_project_ids.iter().map(String::as_str));
    // Removing a JAR must not erase the known mod IDs needed to inspect its saved worlds.
    project_ids.extend(
        files
            .iter()
            .filter(|file| file["exists"] == false)
            .filter_map(|file| file["mod_id"].as_str()),
    );
    let mut worlds = Vec::new();
    if !project_ids.is_empty() {
        let candidates = if kind == "instance" {
            let saves = root.join("saves");
            if safe_world_path(&state.files, root, &saves) {
                state.files.read_dir(saves).unwrap_or_default()
            } else {
                vec![]
            }
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
            if !safe_world_path(&state.files, root, &world) {
                continue;
            }
            if let Some(mut link) = crate::worlds::project_links(&state.files, &world, &project_ids) {
                for evidence in link["evidence"].as_array_mut().into_iter().flatten() {
                    if evidence["kind"] != "saved_mod" { continue; }
                    let candidates: Vec<_> = available.iter().filter(|m| m["enabled"] == true && m["mod_id"] == evidence["mod_id"]).collect();
                    let versions: BTreeSet<_> = candidates.iter().filter_map(|m| m["mod_version"].as_str()).filter(|v| !v.is_empty() && !v.contains("${")).collect();
                    let saved = evidence["saved_version"].as_str().filter(|v| !v.is_empty());
                    let comparison = if candidates.is_empty() { "not_enabled" }
                        else if saved.is_none() || versions.is_empty() { "version_unknown" }
                        else if versions.contains(saved.unwrap()) { "version_matches" }
                        else { "version_changed" };
                    evidence["installed_versions"] = json!(versions);
                    evidence["comparison"] = json!(comparison);
                }
                worlds.push(link);
            }
        }
        worlds.sort_by(|a, b| a["folder"].as_str().cmp(&b["folder"].as_str()));
    }
    let relationships: Vec<_> = declared
        .into_iter()
        .filter(|row| {
            row["project_owned"] == true
                || row["mod_id"]
                    .as_str()
                    .is_some_and(|id| project_ids.contains(id))
        })
        .map(|mut row| {
            let dependency_id = row["mod_id"].as_str().unwrap_or_default();
            row["installed_targets"] = json!(available
                .iter()
                .filter(|candidate| candidate["mod_id"].as_str() == Some(dependency_id))
                .collect::<Vec<_>>());
            row["direction"] = json!(if row["project_owned"] == true {
                "dependency"
            } else {
                "dependent"
            });
            row["confidence"] = json!("declared");
            row
        })
        .collect();
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
        json!({"kind":kind,"id":id,"name":name,"minecraft":version,"loader":loader,"project_mod_ids":project_ids,"files":files,"configs":configs,"worlds":worlds,"dependencies":relationships,"bundled_mods":bundled_mods,"provenance":provenance,"source_evidence":source_evidence,"warnings":issues}),
    )
}
