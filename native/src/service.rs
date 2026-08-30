use std::{
    collections::BTreeMap,
    io::{self, BufRead, Write},
    path::PathBuf,
    sync::Arc,
};

use serde::Deserialize;
use serde_json::{json, Value};

use crate::{
    config::LauncherSettings,
    db::Db,
    error::{Error, Result},
    files::FileManager,
    migrate::{LauncherKind, MigrationScan},
    paths::{DataRoot, Paths},
    state::AppState,
    tasks::{TaskKind, TaskSpec},
};

const PROTOCOL_VERSION: u32 = 1;
const MAX_MESSAGE_BYTES: usize = 8 * 1024 * 1024;
const MAX_CONCURRENT_REQUESTS: usize = 256;
const MAX_INLINE_ICON_BYTES: usize = 256 * 1024;
const MAX_INLINE_SCAN_MEDIA_BYTES: usize = 2 * 1024 * 1024;

#[derive(Deserialize)]
struct Request {
    protocol: u32,
    id: String,
    command: String,
    #[serde(default)]
    args: Value,
}

fn required_string(args: &Value, key: &str) -> Result<String> {
    args.get(key)
        .and_then(Value::as_str)
        .map(str::to_string)
        .ok_or_else(|| Error::other(format!("missing string argument {key}")))
}

fn optional_string(args: &Value, key: &str) -> Option<String> {
    args.get(key).and_then(Value::as_str).map(str::to_string)
}

fn required_strings(args: &Value, key: &str) -> Result<Vec<String>> {
    args.get(key)
        .and_then(Value::as_array)
        .ok_or_else(|| Error::other(format!("missing array argument {key}")))?
        .iter()
        .map(|value| {
            value
                .as_str()
                .map(str::to_string)
                .ok_or_else(|| Error::other(format!("{key} must contain only strings")))
        })
        .collect()
}

fn required_value<T: serde::de::DeserializeOwned>(args: &Value, key: &str) -> Result<T> {
    serde_json::from_value(
        args.get(key)
            .cloned()
            .ok_or_else(|| Error::other(format!("missing argument {key}")))?,
    )
    .map_err(Into::into)
}

fn optional_bool(args: &Value, key: &str, default: bool) -> bool {
    args.get(key).and_then(Value::as_bool).unwrap_or(default)
}

fn required_bool(args: &Value, key: &str) -> Result<bool> {
    args.get(key)
        .and_then(Value::as_bool)
        .ok_or_else(|| Error::other(format!("missing boolean argument {key}")))
}

fn optional_u32(args: &Value, key: &str) -> Result<Option<u32>> {
    match args.get(key) {
        None | Some(Value::Null) => Ok(None),
        Some(value) => value
            .as_u64()
            .and_then(|number| u32::try_from(number).ok())
            .map(Some)
            .ok_or_else(|| Error::other(format!("{key} must be a non-negative 32-bit integer"))),
    }
}

fn optional_u64(args: &Value, key: &str) -> Result<Option<u64>> {
    match args.get(key) {
        None | Some(Value::Null) => Ok(None),
        Some(value) => value
            .as_u64()
            .map(Some)
            .ok_or_else(|| Error::other(format!("{key} must be a non-negative integer"))),
    }
}

fn value<T: serde::Serialize>(input: T) -> Result<Value> {
    Ok(serde_json::to_value(input)?)
}

fn installed_versions(state: &AppState) -> Result<Vec<String>> {
    let mut installed = Vec::new();
    for path in state
        .files
        .read_dir(state.paths.versions())
        .unwrap_or_default()
    {
        let id = path
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .into_owned();
        if state
            .files
            .is_file(state.paths.version_json(&id))
            .unwrap_or(false)
            && state
                .files
                .is_file(state.paths.version_jar(&id))
                .unwrap_or(false)
        {
            installed.push(id);
        }
    }
    installed.sort();
    Ok(installed)
}

fn data_locations(state: &AppState) -> Vec<Value> {
    let paths = state.files.paths();
    DataRoot::ALL
        .into_iter()
        .map(|slot| {
            let path = paths.located_at(slot);
            let default_path = paths.default_for(slot);
            json!({
                "slot": slot,
                "label": slot.label(),
                "summary": slot.summary(),
                "custom": path != default_path,
                "exists": path.is_dir(),
                "disk": crate::sysinfo_probe::disk_for(&path),
                "path": path.display().to_string(),
                "default_path": default_path.display().to_string(),
            })
        })
        .collect()
}

fn instance_views(state: &AppState) -> Result<Value> {
    let external = state
        .db
        .external_instance_dirs()?
        .into_iter()
        .map(|(id, _)| id)
        .collect::<std::collections::HashSet<_>>();
    let rows = state
        .db
        .list_instances(&state.files)?
        .into_iter()
        .map(|instance| {
            let available = PathBuf::from(&instance.dir).is_dir();
            let is_external = external.contains(&instance.id);
            let mut row = serde_json::to_value(instance)?;
            if let Some(object) = row.as_object_mut() {
                object.insert("external".to_string(), Value::Bool(is_external));
                object.insert("available".to_string(), Value::Bool(available));
            }
            Ok(row)
        })
        .collect::<Result<Vec<_>>>()?;
    Ok(Value::Array(rows))
}

fn detected_launchers(state: &AppState) -> Result<Value> {
    value(crate::migrate::detect(&state.files))
}

async fn dispatch(state: &Arc<AppState>, command: &str, args: &Value) -> Result<Value> {
    match command {
        "get_settings" => value(state.db.load_settings_view(&state.credentials)?),
        "update_settings" => {
            let settings: LauncherSettings = serde_json::from_value(
                args.get("settings")
                    .cloned()
                    .ok_or_else(|| Error::other("missing settings"))?,
            )?;
            settings.memory_limits()?;
            let runtime = state
                .db
                .save_settings_secure(&state.credentials, &settings)?;
            state.network.reconfigure(&runtime)?;
            Ok(Value::Null)
        }
        "get_app_info" => Ok(json!({
            "version": env!("CARGO_PKG_VERSION"),
            "build_channel": "enderloom-electron",
            "data_dir": state.paths.root.display().to_string(),
            "default_jvm_args": crate::config::DEFAULT_JVM_ARGS,
            "jvm_placeholders": crate::launch::PLACEHOLDERS,
            "arch": std::env::consts::ARCH,
            "install_source": {
                "id": "enderloom",
                "label": "Enderloom",
                "policy": "self_managed",
                "update_hint": "Updates are managed by Enderloom."
            },
            "bundled_curseforge_key": crate::build_info::bundled_curseforge_key().is_some(),
            "bundled_discord_app_id": crate::build_info::bundled_discord_app_id().is_some()
        })),
        "get_play_stats" => value(
            state
                .db
                .play_stats(optional_u32(args, "days")?, optional_u32(args, "page")?)?,
        ),
        "reconnect_discord" => {
            crate::commands::app::reconnect_discord_core(state).await?;
            Ok(Value::Null)
        }
        "get_about_links" => Ok(json!({
            "repository": "https://github.com/Herbertofury/Enderloom",
            "issues": "https://github.com/Herbertofury/Enderloom/issues/new",
            "releases": "https://github.com/Herbertofury/Enderloom/releases",
            "discord": "https://github.com/Herbertofury/Enderloom/discussions"
        })),
        "inspect_paths" => value(crate::commands::app::inspect_paths(required_strings(
            args, "paths",
        )?)?),
        "test_network" => value(
            crate::commands::app::test_network_core(state, optional_string(args, "url")).await?,
        ),
        "inspect_pack_file" => value(
            crate::commands::pack_commands::inspect_pack_file_core(
                state,
                &required_string(args, "path")?,
            )
            .await?,
        ),
        "inspect_packwiz_url" => value(
            crate::commands::pack_commands::inspect_packwiz_url_core(
                state,
                &required_string(args, "url")?,
            )
            .await?,
        ),
        "import_pack_file" => value(
            crate::commands::pack_commands::import_pack_file_ipc(
                Arc::clone(state),
                required_string(args, "path")?,
                optional_string(args, "name"),
            )
            .await?,
        ),
        "import_packwiz_url" => value(
            crate::commands::pack_commands::import_packwiz_url_ipc(
                Arc::clone(state),
                required_string(args, "url")?,
                optional_string(args, "name"),
            )
            .await?,
        ),
        "export_instance_pack" => value(
            crate::commands::pack_commands::export_instance_pack_core(
                state,
                &required_string(args, "instanceId")?,
                &required_string(args, "format")?,
                &required_string(args, "path")?,
            )
            .await?,
        ),
        "pack_export_name" => value(crate::commands::pack_commands::pack_export_name_core(
            &required_string(args, "name")?,
            &required_string(args, "format")?,
        )?),
        "preview_launch_args" => {
            let settings: LauncherSettings = serde_json::from_value(
                args.get("settings")
                    .cloned()
                    .ok_or_else(|| Error::other("missing settings"))?,
            )?;
            value(crate::commands::app::preview_launch_args_core(
                state, &settings,
            )?)
        }
        "list_instances" => instance_views(state),
        "get_instance_launch_command" => value(
            crate::commands::instances::get_instance_launch_command_core(
                state,
                &required_string(args, "instanceId")?,
            )?,
        ),
        "create_instance" => value(crate::commands::instances::create_instance_core(
            state,
            required_string(args, "name")?,
            required_string(args, "versionId")?,
            optional_string(args, "loader"),
            optional_string(args, "loaderVersion"),
        )?),
        "update_instance" => value(crate::commands::instances::update_instance_core(
            state,
            required_string(args, "instanceId")?,
            required_string(args, "name")?,
            optional_u32(args, "minMemoryMb")?,
            optional_u32(args, "maxMemoryMb")?,
            optional_string(args, "javaPath"),
            optional_string(args, "loader"),
            optional_string(args, "loaderVersion"),
            required_string(args, "versionId")?,
            optional_string(args, "jvmArgs"),
            optional_string(args, "jvmArgsMode"),
            optional_string(args, "envVars"),
            optional_string(args, "envVarsMode"),
        )?),
        "set_instance_launch_tools" => {
            crate::commands::instances::set_instance_launch_tools_core(
                state,
                &required_string(args, "instanceId")?,
                &required_string(args, "wrapper")?,
                &required_string(args, "preLaunch")?,
                &required_string(args, "postExit")?,
            )?;
            Ok(Value::Null)
        }
        "disconnect_external_instance" => {
            crate::commands::instances::disconnect_external_instance_core(
                state,
                &required_string(args, "instanceId")?,
            )
            .await?;
            Ok(Value::Null)
        }
        "delete_instance" => {
            crate::commands::instances::delete_instance_core(
                state,
                &required_string(args, "instanceId")?,
            )
            .await?;
            Ok(Value::Null)
        }
        "repair_instance" => {
            let instance =
                crate::commands::find_instance(state, &required_string(args, "instanceId")?)?;
            value(crate::instance_ops::repair_ipc(state, instance).await?)
        }
        "duplicate_instance" => {
            let instance =
                crate::commands::find_instance(state, &required_string(args, "instanceId")?)?;
            value(crate::instance_ops::duplicate_ipc(state, instance).await?)
        }
        "get_instance_media" => value(
            crate::commands::instances::get_instance_media_core(
                state,
                &required_string(args, "instanceId")?,
            )
            .await?,
        ),
        "set_instance_banner" => {
            let instance_id = required_string(args, "instanceId")?;
            crate::commands::find_instance(state, &instance_id)?;
            let entry = crate::meta::banners::import(
                &state.files,
                &state.db,
                &required_string(args, "sourcePath")?,
            )
            .await?;
            state
                .db
                .set_instance_banner_id(&instance_id, Some(&entry.id))?;
            let media =
                crate::meta::banners::media_for_instance(&state.files, &state.db, &instance_id)
                    .ok_or_else(|| Error::other("the banner vanished after import"))?;
            state
                .media_cache
                .lock()
                .unwrap()
                .insert(instance_id, Some(media.clone()));
            value(media)
        }
        "clear_instance_banner" => {
            let instance_id = required_string(args, "instanceId")?;
            state.db.set_instance_banner_id(&instance_id, None)?;
            crate::meta::media::clear_custom_banner(&state.files, &instance_id).await;
            state.media_cache.lock().unwrap().remove(&instance_id);
            Ok(Value::Null)
        }
        "list_banner_library" => value(crate::meta::banners::list(&state.files, &state.db)?),
        "add_banner_to_library" => value(
            crate::meta::banners::import(
                &state.files,
                &state.db,
                &required_string(args, "sourcePath")?,
            )
            .await?,
        ),
        "delete_banner" => {
            let banner_id = required_string(args, "bannerId")?;
            let affected = state.db.banner_users(&banner_id).unwrap_or_default();
            crate::meta::banners::remove(&state.files, &state.db, &banner_id).await?;
            if !affected.is_empty() {
                state.media_cache.lock().unwrap().clear();
            }
            Ok(Value::Null)
        }
        "apply_banner" => {
            let instance_id = required_string(args, "instanceId")?;
            crate::commands::find_instance(state, &instance_id)?;
            let banner_id = required_string(args, "bannerId")?;
            let record = state
                .db
                .banner(&banner_id)?
                .ok_or_else(|| Error::other("that banner is no longer in the library"))?;
            if !state
                .files
                .is_file(crate::meta::banners::library_path(&state.files, &record))?
            {
                return Err(Error::other("that banner file is no longer in the library"));
            }
            state
                .db
                .set_instance_banner_id(&instance_id, Some(&banner_id))?;
            let media =
                crate::meta::banners::media_for_instance(&state.files, &state.db, &instance_id)
                    .ok_or_else(|| Error::other("that banner is no longer in the library"))?;
            state
                .media_cache
                .lock()
                .unwrap()
                .insert(instance_id, Some(media.clone()));
            value(media)
        }
        "set_instance_logo" => {
            let instance_id = required_string(args, "instanceId")?;
            crate::commands::find_instance(state, &instance_id)?;
            let source_path = required_string(args, "sourcePath")?;
            let _ = crate::meta::banners::import(&state.files, &state.db, &source_path).await;
            value(
                crate::meta::media::set_instance_logo(&state.files, &instance_id, &source_path)
                    .await?,
            )
        }
        "apply_logo" => {
            let instance_id = required_string(args, "instanceId")?;
            crate::commands::find_instance(state, &instance_id)?;
            let record = state
                .db
                .banner(&required_string(args, "bannerId")?)?
                .ok_or_else(|| Error::other("that image is no longer in the library"))?;
            if record.kind != "image" {
                return Err(Error::other("A logo has to be an image."));
            }
            let path = crate::meta::banners::library_path(&state.files, &record);
            let extension = path
                .extension()
                .and_then(|value| value.to_str())
                .unwrap_or("png");
            let bytes = state.files.read_async(&path).await?;
            value(
                crate::meta::media::write_logo(&state.files, &instance_id, extension, &bytes)
                    .await?,
            )
        }
        "clear_instance_logo" => {
            crate::meta::media::clear_instance_logo(
                &state.files,
                &required_string(args, "instanceId")?,
            )
            .await;
            Ok(Value::Null)
        }
        "backfill_pack_logos" => {
            value(crate::commands::instances::backfill_pack_logos_core(state).await?)
        }
        "list_loader_versions" => value(
            crate::commands::instances::list_loader_versions_core(
                state,
                &required_string(args, "loader")?,
                &required_string(args, "gameVersion")?,
            )
            .await?,
        ),
        "list_versions" => value(
            crate::commands::instances::list_versions_core(
                state,
                args.get("includeSnapshots")
                    .and_then(Value::as_bool)
                    .unwrap_or(false),
            )
            .await?,
        ),
        "list_instance_content" => {
            let instance_id = required_string(args, "instanceId")?;
            let kind = required_string(args, "kind")?;
            value(
                crate::commands::content_commands::list_instance_content_core(
                    state,
                    &instance_id,
                    &kind,
                    optional_bool(args, "reconcile", false),
                )
                .await?,
            )
        }
        "list_instance_content_bundle" => {
            let instance_id = required_string(args, "instanceId")?;
            value(
                crate::commands::content_commands::list_instance_content_bundle_core(
                    state,
                    &instance_id,
                    required_strings(args, "kinds")?,
                    optional_bool(args, "reconcile", false),
                )
                .await?,
            )
        }
        "toggle_instance_content" => value(crate::content::toggle(
            &state.files,
            &required_string(args, "instanceId")?,
            &required_string(args, "kind")?,
            &required_string(args, "fileName")?,
        )?),
        "delete_instance_content" => {
            let instance_id = required_string(args, "instanceId")?;
            let kind = required_string(args, "kind")?;
            let file_name = required_string(args, "fileName")?;
            crate::content::delete(&state.files, &instance_id, &kind, &file_name)?;
            state
                .db
                .delete_content_file(&instance_id, &kind, &file_name)?;
            Ok(Value::Null)
        }
        "add_instance_content" => {
            let instance_id = required_string(args, "instanceId")?;
            let kind = required_string(args, "kind")?;
            crate::commands::find_instance(state, &instance_id)?;
            let sources = required_strings(args, "sources")?;
            let copied = crate::content::add(&state.files, &instance_id, &kind, &sources)?;
            if let Err(error) = crate::search::identify::reconcile(
                state,
                crate::search::resolve::Target::Instance(&instance_id),
                &kind,
            )
            .await
            {
                tracing::warn!(%error, "could not identify content added through Electron IPC");
            }
            value(copied)
        }
        "search_content" => {
            let provider = crate::search::Provider::parse(&required_string(args, "provider")?)?;
            let kind = crate::search::ContentKind::parse(&required_string(args, "kind")?)?;
            let query: crate::search::SearchQuery = required_value(args, "query")?;
            value(crate::search::search(state, provider, kind, &query).await?)
        }
        "get_filter_taxonomy" => {
            let provider = crate::search::Provider::parse(&required_string(args, "provider")?)?;
            let kind = crate::search::ContentKind::parse(&required_string(args, "kind")?)?;
            value(
                crate::search::taxonomy(
                    state,
                    provider,
                    kind,
                    optional_bool(args, "includeSnapshots", false),
                )
                .await?,
            )
        }
        "get_version_changelog" => {
            let provider = crate::search::Provider::parse(&required_string(args, "provider")?)?;
            value(
                crate::search::version_changelog(
                    state,
                    provider,
                    &required_string(args, "projectId")?,
                    &required_string(args, "versionId")?,
                )
                .await?,
            )
        }
        "resolve_projects" => {
            let provider = crate::search::Provider::parse(&required_string(args, "provider")?)?;
            value(
                crate::search::resolve_projects(state, provider, &required_strings(args, "ids")?)
                    .await?,
            )
        }
        "get_installed_project_file" => {
            let result = state.db.installed_project_file(
                &required_string(args, "instanceId")?,
                &required_string(args, "kind")?,
                &required_string(args, "projectId")?,
            )?;
            Ok(result.map_or(Value::Null, |(version_id, file_name)| {
                json!({ "version_id": version_id, "file_name": file_name })
            }))
        }
        "get_project_details" => {
            let provider = crate::search::Provider::parse(&required_string(args, "provider")?)?;
            value(
                crate::search::project_details(
                    state,
                    provider,
                    &required_string(args, "projectId")?,
                )
                .await?,
            )
        }
        "list_project_versions" => {
            let provider = crate::search::Provider::parse(&required_string(args, "provider")?)?;
            let kind = crate::search::ContentKind::parse(&required_string(args, "kind")?)?;
            value(
                crate::search::project_versions(
                    state,
                    provider,
                    &required_string(args, "projectId")?,
                    kind,
                    &required_string(args, "gameVersion")?,
                    optional_string(args, "loader").as_deref(),
                )
                .await?,
            )
        }
        "plan_content_install" | "install_content" => {
            let instance_id = required_string(args, "instanceId")?;
            crate::commands::find_instance(state, &instance_id)?;
            let provider = crate::search::Provider::parse(&required_string(args, "provider")?)?;
            let kind = crate::search::ContentKind::parse(&required_string(args, "kind")?)?;
            let plan = crate::search::resolve::plan(
                state,
                provider,
                &required_string(args, "projectId")?,
                crate::search::resolve::Target::Instance(&instance_id),
                kind,
                &required_string(args, "gameVersion")?,
                optional_string(args, "loader").as_deref(),
                optional_string(args, "versionId").as_deref(),
                optional_bool(args, "withDependencies", true),
            )
            .await?;
            if command == "plan_content_install" {
                value(plan)
            } else {
                value(
                    crate::search::resolve::apply_ipc(
                        state,
                        &plan,
                        provider,
                        crate::search::resolve::Target::Instance(&instance_id),
                        kind,
                        None,
                    )
                    .await?,
                )
            }
        }
        "check_content_updates" => {
            let instance_id = required_string(args, "instanceId")?;
            let instance = crate::commands::find_instance(state, &instance_id)?;
            let checked_at = state.db.updates_checked_at(&instance_id)?;
            if !optional_bool(args, "force", false) && !crate::search::updates::is_stale(checked_at)
            {
                value(state.db.content_updates(&instance_id)?)
            } else {
                value(
                    crate::search::updates::check(
                        state,
                        &instance_id,
                        &instance.version_id,
                        instance.loader.as_deref(),
                    )
                    .await?,
                )
            }
        }
        "get_content_updates" => value(
            state
                .db
                .content_updates(&required_string(args, "instanceId")?)?,
        ),
        "plan_content_update" => value(
            crate::commands::content_commands::plan_content_update_core(
                state,
                &required_string(args, "instanceId")?,
                &required_string(args, "kind")?,
                &required_string(args, "fileName")?,
            )
            .await?,
        ),
        "apply_content_update" => {
            let manual_downloads: Vec<crate::modpack::ManualDownloadSource> = args
                .get("manualDownloads")
                .cloned()
                .map(serde_json::from_value)
                .transpose()?
                .unwrap_or_default();
            value(
                crate::commands::content_commands::apply_content_update_ipc(
                    state,
                    &required_string(args, "instanceId")?,
                    &required_string(args, "kind")?,
                    &required_string(args, "fileName")?,
                    &manual_downloads,
                    &PathBuf::from(required_string(args, "downloadsDir")?),
                )
                .await?,
            )
        }
        "find_curseforge_download" => {
            let download = required_value(args, "download")?;
            let started_at_ms = args
                .get("startedAtMs")
                .and_then(Value::as_u64)
                .ok_or_else(|| Error::other("startedAtMs must be a non-negative integer"))?;
            value(
                crate::modpack::find_manual_download_in(
                    &PathBuf::from(required_string(args, "downloadsDir")?),
                    &download,
                    started_at_ms,
                )
                .await?,
            )
        }
        "check_modpack_upgrade" => {
            let instance_id = required_string(args, "instanceId")?;
            let instance = crate::commands::find_instance(state, &instance_id)?;
            value(crate::modpack::check_modpack_upgrade(state, &instance).await?)
        }
        "plan_modpack_install" => {
            let manual_downloads: Vec<crate::modpack::ManualDownloadSource> = args
                .get("manualDownloads")
                .cloned()
                .map(serde_json::from_value)
                .transpose()?
                .unwrap_or_default();
            value(
                crate::modpack::plan_modpack_install_ipc(
                    &PathBuf::from(required_string(args, "downloadsDir")?),
                    state,
                    crate::search::Provider::parse(&required_string(args, "provider")?)?,
                    &required_string(args, "projectId")?,
                    &required_string(args, "versionId")?,
                    &manual_downloads,
                )
                .await?,
            )
        }
        "install_modpack" => {
            let manual_downloads: Vec<crate::modpack::ManualDownloadSource> = args
                .get("manualDownloads")
                .cloned()
                .map(serde_json::from_value)
                .transpose()?
                .unwrap_or_default();
            value(
                crate::modpack::install_modpack_ipc(
                    &PathBuf::from(required_string(args, "downloadsDir")?),
                    state,
                    crate::search::Provider::parse(&required_string(args, "provider")?)?,
                    &required_string(args, "projectId")?,
                    &required_string(args, "versionId")?,
                    &manual_downloads,
                )
                .await?,
            )
        }
        "link_modpack" => {
            let instance_id = required_string(args, "instanceId")?;
            let instance = crate::commands::find_instance(state, &instance_id)?;
            crate::modpack::link_modpack_ipc(
                &PathBuf::from(required_string(args, "downloadsDir")?),
                state,
                &instance,
                crate::search::Provider::parse(&required_string(args, "provider")?)?,
                &required_string(args, "projectId")?,
                &required_string(args, "versionId")?,
            )
            .await?;
            value(crate::commands::find_instance(state, &instance_id)?)
        }
        "plan_modpack_upgrade" => {
            let instance =
                crate::commands::find_instance(state, &required_string(args, "instanceId")?)?;
            let manual_downloads: Vec<crate::modpack::ManualDownloadSource> = args
                .get("manualDownloads")
                .cloned()
                .map(serde_json::from_value)
                .transpose()?
                .unwrap_or_default();
            value(
                crate::modpack::plan_modpack_upgrade_ipc(
                    &PathBuf::from(required_string(args, "downloadsDir")?),
                    state,
                    &instance,
                    &required_string(args, "targetVersionId")?,
                    &manual_downloads,
                )
                .await?,
            )
        }
        "upgrade_modpack" => {
            let instance =
                crate::commands::find_instance(state, &required_string(args, "instanceId")?)?;
            let manual_downloads: Vec<crate::modpack::ManualDownloadSource> = args
                .get("manualDownloads")
                .cloned()
                .map(serde_json::from_value)
                .transpose()?
                .unwrap_or_default();
            value(
                crate::modpack::upgrade_modpack_ipc(
                    &PathBuf::from(required_string(args, "downloadsDir")?),
                    state,
                    instance,
                    &required_string(args, "targetVersionId")?,
                    &manual_downloads,
                    optional_bool(args, "snapshotFirst", true),
                )
                .await?,
            )
        }
        "plan_content_removal" => {
            let instance_id = required_string(args, "instanceId")?;
            let kind = crate::search::ContentKind::parse(&required_string(args, "kind")?)?;
            value(crate::search::resolve::plan_removal(
                state,
                crate::search::resolve::Target::Instance(&instance_id),
                kind,
                &required_string(args, "fileName")?,
            ))
        }
        "get_content_dependents" => {
            let instance_id = required_string(args, "instanceId")?;
            let kind_name = required_string(args, "kind")?;
            let kind = crate::search::ContentKind::parse(&kind_name)?;
            let file_name = required_string(args, "fileName")?;
            let Some(file) = state
                .db
                .content_file(&instance_id, &kind_name, &file_name)?
            else {
                return Ok(json!([]));
            };
            let Some(project_id) = file.project_id else {
                return Ok(json!([]));
            };
            value(crate::search::resolve::dependents_of(
                state,
                crate::search::resolve::Target::Instance(&instance_id),
                kind,
                &project_id,
            ))
        }
        "unlink_modpack" => {
            let instance_id = required_string(args, "instanceId")?;
            crate::commands::find_instance(state, &instance_id)?;
            state.db.unlink_instance_pack(&instance_id)?;
            value(crate::commands::find_instance(state, &instance_id)?)
        }
        "list_instance_datapacks" => {
            let instance_id = required_string(args, "instanceId")?;
            let instance = crate::commands::find_instance(state, &instance_id)?;
            value(crate::datapacks::list(&state.files, &state.db, &instance)?)
        }
        "toggle_datapack" => {
            let instance_id = required_string(args, "instanceId")?;
            crate::commands::find_instance(state, &instance_id)?;
            value(crate::datapacks::toggle(
                &state.files,
                &instance_id,
                &required_string(args, "world")?,
                &required_string(args, "fileName")?,
            )?)
        }
        "delete_datapack" => {
            let instance_id = required_string(args, "instanceId")?;
            let world = required_string(args, "world")?;
            let file_name = required_string(args, "fileName")?;
            crate::commands::find_instance(state, &instance_id)?;
            crate::datapacks::delete(&state.files, &instance_id, &world, &file_name)?;
            state
                .db
                .delete_world_datapack(&instance_id, &world, &file_name)?;
            Ok(Value::Null)
        }
        "add_datapacks" => {
            let instance_id = required_string(args, "instanceId")?;
            crate::commands::find_instance(state, &instance_id)?;
            value(crate::datapacks::add(
                &state.files,
                &instance_id,
                &required_string(args, "world")?,
                &required_strings(args, "sources")?,
            )?)
        }
        "check_datapack_updates" => {
            let instance_id = required_string(args, "instanceId")?;
            let instance = crate::commands::find_instance(state, &instance_id)?;
            value(crate::datapacks::check_updates(state, &instance).await?)
        }
        "install_datapack" => {
            let instance_id = required_string(args, "instanceId")?;
            let instance = crate::commands::find_instance(state, &instance_id)?;
            value(
                crate::datapacks::install_ipc(
                    state,
                    crate::search::Provider::parse(&required_string(args, "provider")?)?,
                    &required_string(args, "projectId")?,
                    &instance,
                    &required_string(args, "world")?,
                    optional_string(args, "versionId").as_deref(),
                )
                .await?,
            )
        }
        "apply_datapack_update" => {
            let instance_id = required_string(args, "instanceId")?;
            let world = required_string(args, "world")?;
            let file_name = required_string(args, "fileName")?;
            let instance = crate::commands::find_instance(state, &instance_id)?;
            let row = state
                .db
                .world_datapacks(&instance_id, &world)?
                .into_iter()
                .find(|entry| entry.file_name == file_name)
                .ok_or_else(|| Error::NotFound(format!("datapack {file_name}")))?;
            let (Some(provider), Some(project_id), Some(latest)) =
                (row.provider, row.project_id, row.latest_version_id)
            else {
                return Err(Error::other(
                    "Enderloom does not know where this datapack came from.",
                ));
            };
            let installed = crate::datapacks::install_ipc(
                state,
                crate::search::Provider::parse(&provider)?,
                &project_id,
                &instance,
                &world,
                Some(&latest),
            )
            .await?;
            if !installed.iter().any(|name| name == &file_name) {
                crate::datapacks::delete(&state.files, &instance_id, &world, &file_name)?;
                state
                    .db
                    .delete_world_datapack(&instance_id, &world, &file_name)?;
            }
            value(installed)
        }
        "list_instance_worlds" => {
            let instance_id = required_string(args, "instanceId")?;
            crate::commands::find_instance(state, &instance_id)?;
            let files = state.files.clone();
            value(
                tokio::task::spawn_blocking(move || crate::worlds::list(&files, &instance_id))
                    .await
                    .map_err(|error| {
                        Error::other(format!("world listing task failed: {error}"))
                    })??,
            )
        }
        "inspect_world_source" => {
            let files = state.files.clone();
            let source = PathBuf::from(required_string(args, "sourcePath")?);
            value(
                tokio::task::spawn_blocking(move || crate::worlds::inspect_source(&files, &source))
                    .await
                    .map_err(|error| {
                        Error::other(format!("world inspection task failed: {error}"))
                    })??,
            )
        }
        "import_worlds" => value(
            crate::commands::worlds::import_worlds_ipc(
                state,
                required_string(args, "instanceId")?,
                required_string(args, "sourcePath")?,
                required_strings(args, "candidateIds")?,
            )
            .await?,
        ),
        "delete_instance_world" => {
            crate::commands::worlds::delete_instance_world_core(
                state,
                &required_string(args, "instanceId")?,
                &required_string(args, "folderName")?,
            )
            .await?;
            Ok(Value::Null)
        }
        "list_instance_snapshots" => {
            let instance_id = required_string(args, "instanceId")?;
            crate::commands::find_instance(state, &instance_id)?;
            value(crate::snapshots::list(state, &instance_id).await?)
        }
        "instance_snapshot_usage" => {
            let instance_id = required_string(args, "instanceId")?;
            crate::commands::find_instance(state, &instance_id)?;
            value(crate::snapshots::usage(state, &instance_id).await?)
        }
        "create_instance_snapshot" => {
            let instance =
                crate::commands::find_instance(state, &required_string(args, "instanceId")?)?;
            let excluded = if args.get("excluded").is_some() {
                required_strings(args, "excluded")?
            } else {
                Vec::new()
            };
            value(
                crate::snapshots::create_ipc(
                    state,
                    instance,
                    optional_string(args, "name"),
                    excluded,
                )
                .await?,
            )
        }
        "rename_instance_snapshot" => {
            let instance_id = required_string(args, "instanceId")?;
            crate::commands::find_instance(state, &instance_id)?;
            value(
                crate::snapshots::rename(
                    state,
                    &instance_id,
                    &required_string(args, "snapshotId")?,
                    &required_string(args, "name")?,
                )
                .await?,
            )
        }
        "delete_instance_snapshot" => {
            let instance_id = required_string(args, "instanceId")?;
            crate::commands::find_instance(state, &instance_id)?;
            crate::snapshots::delete(state, &instance_id, &required_string(args, "snapshotId")?)
                .await?;
            Ok(Value::Null)
        }
        "restore_instance_snapshot" => {
            let instance =
                crate::commands::find_instance(state, &required_string(args, "instanceId")?)?;
            value(
                crate::snapshots::restore_ipc(
                    state,
                    instance,
                    &required_string(args, "snapshotId")?,
                )
                .await?,
            )
        }
        "get_instance_organization" => value(state.db.instance_organization()?),
        "create_instance_group" => value(
            state
                .db
                .create_instance_group(&required_string(args, "name")?)?,
        ),
        "rename_instance_group" => value(state.db.rename_instance_group(
            &required_string(args, "groupId")?,
            &required_string(args, "name")?,
        )?),
        "delete_instance_group" => {
            state
                .db
                .delete_instance_group(&required_string(args, "groupId")?)?;
            Ok(Value::Null)
        }
        "move_instance_to_group" => {
            state.db.move_instance_to_group(
                &required_string(args, "instanceId")?,
                optional_string(args, "groupId").as_deref(),
            )?;
            Ok(Value::Null)
        }
        "reorder_instance_groups" => {
            state
                .db
                .reorder_instance_groups(&required_strings(args, "groupIds")?)?;
            Ok(Value::Null)
        }
        "reorder_group_instances" => {
            state.db.reorder_group_instances(
                optional_string(args, "groupId").as_deref(),
                &required_strings(args, "instanceIds")?,
            )?;
            Ok(Value::Null)
        }
        "set_instance_favorite" => {
            state.db.set_instance_favorite(
                &required_string(args, "instanceId")?,
                required_bool(args, "favorite")?,
            )?;
            Ok(Value::Null)
        }
        "create_instance_tag" => value(
            state
                .db
                .create_instance_tag(&required_string(args, "name")?)?,
        ),
        "rename_instance_tag" => value(state.db.rename_instance_tag(
            &required_string(args, "tagId")?,
            &required_string(args, "name")?,
        )?),
        "delete_instance_tag" => {
            state
                .db
                .delete_instance_tag(&required_string(args, "tagId")?)?;
            Ok(Value::Null)
        }
        "set_instance_tag" => {
            state.db.set_instance_tag(
                &required_string(args, "instanceId")?,
                &required_string(args, "tagId")?,
                required_bool(args, "enabled")?,
            )?;
            Ok(Value::Null)
        }
        "reorder_instance_tags" => {
            state
                .db
                .reorder_instance_tags(&required_strings(args, "tagIds")?)?;
            Ok(Value::Null)
        }
        "set_instance_notes" => {
            let notes = required_string(args, "notes")?;
            state.db.set_instance_notes(
                &required_string(args, "instanceId")?,
                (!notes.trim().is_empty()).then_some(notes.as_str()),
            )?;
            Ok(Value::Null)
        }
        "list_accounts" => value(state.db.list_account_views()?),
        "auth_begin" => {
            let event_sink = state
                .tasks
                .event_sink()
                .ok_or_else(|| Error::other("IPC event channel is unavailable"))?;
            value(crate::commands::accounts::auth_begin_core(state, event_sink).await?)
        }
        "set_active_account" => {
            crate::commands::accounts::set_active_account_core(
                state,
                &required_string(args, "accountId")?,
            )?;
            Ok(Value::Null)
        }
        "remove_account" => {
            crate::commands::accounts::remove_account_core(
                state,
                &required_string(args, "accountId")?,
            )?;
            Ok(Value::Null)
        }
        "list_installed_versions" => value(installed_versions(state)?),
        "get_java_status" => value(
            crate::commands::instances::get_java_status_core(
                state,
                &required_string(args, "instanceId")?,
            )
            .await?,
        ),
        "install_instance" => {
            crate::commands::instances::install_instance_ipc(
                state,
                &required_string(args, "instanceId")?,
            )
            .await?;
            Ok(Value::Null)
        }
        "install_java_runtime" => {
            let major = optional_u32(args, "major")?
                .ok_or_else(|| Error::other("missing integer argument major"))?;
            let instance_id = optional_string(args, "instanceId");
            value(
                crate::commands::app::install_java_runtime_ipc(
                    state,
                    major,
                    instance_id.as_deref(),
                )
                .await?,
            )
        }
        "list_skins" => value(crate::skin::library(state)?),
        "get_worn_skin" => value(crate::skin::worn_skin(
            state,
            &required_string(args, "uuid")?,
        )?),
        "add_skin_from_file" => value(crate::skin::add_from_file(
            state,
            &required_string(args, "path")?,
            optional_string(args, "name").as_deref(),
            &required_string(args, "variant")?,
        )?),
        "add_skin_from_reference" => value(
            crate::skin::add_from_reference(state, &required_string(args, "reference")?).await?,
        ),
        "delete_skin" => {
            crate::skin::remove(state, &required_string(args, "skinId")?)?;
            Ok(Value::Null)
        }
        "rename_skin" => value(crate::skin::rename(
            state,
            &required_string(args, "skinId")?,
            &required_string(args, "name")?,
        )?),
        "get_appearance" => value(crate::skin::appearance(state).await?),
        "apply_saved_skin" => value(
            crate::skin::apply_saved(
                state,
                &required_string(args, "skinId")?,
                optional_string(args, "variant").as_deref(),
            )
            .await?,
        ),
        "reset_skin" => value(crate::skin::reset(state).await?),
        "set_cape" => {
            value(crate::skin::set_cape(state, optional_string(args, "capeId").as_deref()).await?)
        }
        "get_data_locations" => Ok(Value::Array(data_locations(state))),
        "inspect_data_location" => value(crate::commands::locations::inspect_data_location_core(
            state,
            required_value(args, "slot")?,
            &required_string(args, "path")?,
        )?),
        "set_data_location" => {
            crate::commands::locations::set_data_location_ipc(
                state,
                required_value(args, "slot")?,
                optional_string(args, "path"),
                optional_bool(args, "moveExisting", false),
            )
            .await?;
            Ok(Value::Null)
        }
        "scan_storage" => value(
            crate::commands::storage::scan_storage_ipc(state, optional_bool(args, "force", false))
                .await?,
        ),
        "reclaim_storage" => value(
            crate::commands::storage::reclaim_storage_core(
                state,
                required_strings(args, "targets")?,
            )
            .await?,
        ),
        "get_system_stats" => value(crate::sysinfo_probe::collect(&state.paths)),
        "get_system_usage" => value(crate::sysinfo_probe::usage(&state.paths)),
        "get_lan_address" => value(crate::sysinfo_probe::lan_address()),
        "list_tasks" => value(state.tasks.list()),
        "clear_finished_tasks" => {
            state.tasks.clear_finished();
            Ok(Value::Null)
        }
        "cancel_task" => Ok(Value::Bool(
            state.tasks.cancel(&required_string(args, "taskId")?),
        )),
        "recover_interrupted" => value(state.db.pending_operations()?),
        "launch_instance" => {
            let instance_id = required_string(args, "instanceId")?;
            if state.tasks.has_active(&instance_id, TaskKind::WorldImport) {
                return Err(Error::other(
                    "Wait for the world import to finish before launching this instance.",
                ));
            }
            let instance = crate::commands::find_instance(state, &instance_id)?;
            let event_sink = state
                .tasks
                .event_sink()
                .ok_or_else(|| Error::other("IPC event channel is unavailable"))?;
            value(crate::launch::launch_instance_ipc(event_sink, state, &instance).await?)
        }
        "kill_instance" => {
            let running_id = required_string(args, "runningId")?;
            let mut registry = state.running.lock().unwrap();
            if let Some(handle) = registry.get_mut(&running_id) {
                handle.request_kill(&running_id);
            }
            Ok(Value::Null)
        }
        "list_running" => {
            let registry = state.running.lock().unwrap();
            value(
                registry
                    .iter()
                    .map(|(id, handle)| handle.info(id))
                    .collect::<Vec<_>>(),
            )
        }
        "get_logs" => {
            let running_id = required_string(args, "runningId")?;
            let registry = state.running.lock().unwrap();
            value(
                registry
                    .get(&running_id)
                    .map(|handle| handle.logs.lock().unwrap().clone())
                    .unwrap_or_default(),
            )
        }
        "close_running" => {
            state
                .running
                .lock()
                .unwrap()
                .remove(&required_string(args, "runningId")?);
            Ok(Value::Null)
        }
        "qa_process_contract" => {
            if std::env::var("ENDERLOOM_QA_MODE").as_deref() != Ok("1") {
                return Err(Error::other("QA process probe is disabled"));
            }
            let instance =
                crate::commands::find_instance(state, &required_string(args, "instanceId")?)?;
            let running_id = uuid::Uuid::new_v4().to_string();
            let marker = crate::launch::identity::run_marker(&running_id);
            let program = std::env::var("ENDERLOOM_QA_NODE")
                .map_err(|_| Error::other("QA Node runtime was not provided"))?;
            let probe = std::env::var("ENDERLOOM_QA_PROCESS_SCRIPT")
                .map_err(|_| Error::other("QA process script was not provided"))?;
            let child_args = vec![probe, marker];
            let event_sink = state
                .tasks
                .event_sink()
                .ok_or_else(|| Error::other("IPC event channel is unavailable"))?;
            let game_dir = PathBuf::from(&instance.dir);
            crate::launch::process::spawn_process_with_events(
                crate::launch::process::ProcessEvents::ipc(event_sink),
                &state.running,
                state.files.clone(),
                state.db.clone(),
                state.presence.clone(),
                crate::launch::process::ProcessLaunch {
                    instance_id: &instance.id,
                    running_id: &running_id,
                    started_at: chrono::Utc::now().timestamp(),
                    program: &program,
                    args: child_args,
                    cwd: &game_dir,
                    env: Vec::new(),
                    post_exit: None,
                },
            )?;
            value(running_id)
        }
        "get_app_update_status" => value(state.updates.status()),
        "check_for_updates" => {
            let event_sink = state
                .tasks
                .event_sink()
                .ok_or_else(|| Error::other("IPC event channel is unavailable"))?;
            value(
                crate::update::check_and_record_ipc(
                    &state.network,
                    &state.updates,
                    required_string(args, "currentVersion")?,
                    optional_bool(args, "packaged", false),
                    &event_sink,
                )
                .await?,
            )
        }
        "dismiss_app_update" => {
            let event_sink = state
                .tasks
                .event_sink()
                .ok_or_else(|| Error::other("IPC event channel is unavailable"))?;
            value(crate::update::dismiss_ipc(
                &state.updates,
                &required_string(args, "version")?,
                &event_sink,
            )?)
        }
        "download_app_update" => value(crate::update::download_electron(&state.updates)?),
        "install_app_update" => {
            crate::update::install_electron(&state.updates)?;
            Ok(Value::Null)
        }
        "prepare_reset" => {
            if state.running.lock().unwrap().values().any(|handle| {
                matches!(
                    handle.status.lock().unwrap().state.as_str(),
                    "running" | "stopping"
                )
            }) {
                return Err(Error::other("Close Minecraft before resetting Enderloom."));
            }
            if state
                .servers
                .lock()
                .unwrap()
                .values()
                .any(crate::servers::runtime::ServerHandle::live)
            {
                return Err(Error::other(
                    "Stop every server before resetting Enderloom.",
                ));
            }
            if state
                .tasks
                .list()
                .iter()
                .any(|task| task.state == crate::tasks::TaskState::Running)
            {
                return Err(Error::other(
                    "Wait for active downloads and installs before resetting Enderloom.",
                ));
            }
            value(crate::reset::plan(
                &state.paths.root,
                optional_bool(args, "deep", false),
            )?)
        }
        "list_servers" => value(state.db.list_servers(&state.paths)?),
        "list_server_software" => value(crate::servers::software::specs()),
        "list_server_flavor_versions" => value(
            crate::servers::software::find(&required_string(args, "flavor")?)?
                .versions(&state.network, &required_string(args, "versionId")?)
                .await?,
        ),
        "create_server" => value(crate::commands::servers::create_server_core(
            state,
            &required_string(args, "name")?,
            &required_string(args, "flavor")?,
            &required_string(args, "versionId")?,
            optional_string(args, "flavorVersion"),
            optional_bool(args, "acceptEula", false),
        )?),
        "inspect_server_folder" => value(crate::commands::servers::inspect_server_folder_core(
            state,
            &required_string(args, "path")?,
        )?),
        "import_server" => value(crate::commands::servers::import_server_core(
            state,
            &required_string(args, "path")?,
            &required_string(args, "name")?,
            &required_string(args, "flavor")?,
            &required_string(args, "versionId")?,
            optional_string(args, "flavorVersion"),
            optional_bool(args, "acceptEula", false),
        )?),
        "install_server" => value(
            crate::commands::servers::install_server_ipc(
                state,
                &required_string(args, "serverId")?,
            )
            .await?,
        ),
        "get_server_pack_file" => value(
            crate::search::curseforge::server_pack(
                state,
                &required_string(args, "projectId")?,
                &required_string(args, "fileId")?,
                &required_string(args, "parentId")?,
            )
            .await?,
        ),
        "install_server_pack" => {
            let project_id = required_string(args, "projectId")?;
            let manual_sources: Vec<crate::modpack::ManualDownloadSource> = args
                .get("manualSources")
                .cloned()
                .map(serde_json::from_value)
                .transpose()?
                .unwrap_or_default();
            let task = state.tasks.start_ipc(
                TaskKind::ServerInstall,
                TaskSpec {
                    title: "Modpack server".to_string(),
                    project_id: Some(project_id.clone()),
                    ..Default::default()
                },
            )?;
            let result = crate::servers::pack::install_ipc(
                &PathBuf::from(required_string(args, "downloadsDir")?),
                state,
                crate::search::Provider::parse(&required_string(args, "provider")?)?,
                &project_id,
                &required_string(args, "versionId")?,
                &manual_sources,
                &task,
            )
            .await;
            task.finish(&result);
            value(result?)
        }
        "install_server_zip" => {
            let name = required_string(args, "name")?;
            let task = state.tasks.start_ipc(
                TaskKind::ServerInstall,
                TaskSpec {
                    title: name.clone(),
                    subtitle: Some("server pack".to_string()),
                    ..Default::default()
                },
            )?;
            let source = crate::servers::zippack::Source {
                url: optional_string(args, "url"),
                local_path: optional_string(args, "localPath"),
                file_name: required_string(args, "fileName")?,
                sha1: optional_string(args, "sha1"),
                size: optional_u64(args, "size")?,
                provider: required_string(args, "provider")?,
                project_id: required_string(args, "projectId")?,
                version_id: required_string(args, "packVersionId")?,
            };
            let game_version = optional_string(args, "gameVersion");
            let result = crate::servers::zippack::install(
                state,
                &name,
                &source,
                game_version.as_deref(),
                &task,
            )
            .await;
            task.finish(&result);
            value(result?)
        }
        "start_server" => {
            let server_id = required_string(args, "serverId")?;
            let server = crate::commands::find_server(state, &server_id)?;
            let event_sink = state
                .tasks
                .event_sink()
                .ok_or_else(|| Error::other("server event bridge is unavailable"))?;
            value(crate::servers::runtime::start_ipc(event_sink, state, &server).await?)
        }
        "stop_server" => {
            let server_id = required_string(args, "serverId")?;
            let server = crate::commands::find_server(state, &server_id)?;
            let event_sink = state
                .tasks
                .event_sink()
                .ok_or_else(|| Error::other("server event bridge is unavailable"))?;
            crate::servers::runtime::stop_ipc(event_sink, state, &server).await?;
            Ok(Value::Null)
        }
        "restart_server" => {
            let server_id = required_string(args, "serverId")?;
            let server = crate::commands::find_server(state, &server_id)?;
            let event_sink = state
                .tasks
                .event_sink()
                .ok_or_else(|| Error::other("server event bridge is unavailable"))?;
            if state
                .servers
                .lock()
                .unwrap()
                .get(&server_id)
                .is_some_and(crate::servers::runtime::ServerHandle::live)
            {
                crate::servers::runtime::stop_ipc(event_sink.clone(), state, &server).await?;
            }
            value(crate::servers::runtime::start_ipc(event_sink, state, &server).await?)
        }
        "update_server_settings" => {
            let server_id = required_string(args, "serverId")?;
            let name = required_string(args, "name")?;
            let version_id = required_string(args, "versionId")?;
            if name.trim().is_empty() {
                return Err(Error::other("Give the server a name first."));
            }
            if version_id.trim().is_empty() {
                return Err(Error::other("Pick a Minecraft version first."));
            }
            let min_memory_mb = optional_u32(args, "minMemoryMb")?;
            let max_memory_mb = optional_u32(args, "maxMemoryMb")?;
            if let (Some(min), Some(max)) = (min_memory_mb, max_memory_mb) {
                crate::config::MemoryLimits::new(min, max)?;
            }
            let flavor_version = optional_string(args, "flavorVersion");
            let current = crate::commands::find_server(state, &server_id)?;
            let reinstall = current.version_id != version_id
                || current.flavor_version.as_deref() != flavor_version.as_deref();
            if reinstall && current.pack_project_id.is_some() {
                return Err(Error::other(
                    "This server's versions come from its modpack. Update the pack instead.",
                ));
            }
            if reinstall
                && state
                    .servers
                    .lock()
                    .unwrap()
                    .get(&server_id)
                    .is_some_and(crate::servers::runtime::ServerHandle::live)
            {
                return Err(Error::other("Stop the server before changing its version."));
            }
            let manages_script_memory = state.db.server_manages_script_memory(&server_id)?;
            if manages_script_memory {
                let settings = state.runtime_settings()?;
                let memory = crate::config::MemoryLimits::new(
                    min_memory_mb.unwrap_or(settings.server_min_memory_mb),
                    max_memory_mb.unwrap_or(settings.server_max_memory_mb),
                )?;
                crate::servers::jvmargs::apply(
                    &state.files,
                    &crate::commands::servers::reachable(&current)?,
                    memory,
                )?;
            }
            state.db.update_server_settings(
                &server_id,
                name.trim(),
                version_id.trim(),
                flavor_version,
                min_memory_mb,
                max_memory_mb,
                optional_string(args, "javaPath"),
                optional_string(args, "jvmArgs"),
                optional_string(args, "jvmArgsMode"),
                optional_u32(args, "stopTimeoutSecs")?,
                optional_string(args, "notes"),
            )?;
            if reinstall {
                state.db.clear_server_launch(&server_id)?;
            }
            if manages_script_memory {
                if let Some(sink) = state.tasks.event_sink() {
                    sink(
                        "server:file-changed",
                        json!({ "server_id": server_id, "path": crate::servers::jvmargs::FILE }),
                    );
                }
            }
            value(crate::commands::find_server(state, &server_id)?)
        }
        "get_server_launch_command" => {
            let server = crate::commands::find_server(state, &required_string(args, "serverId")?)?;
            value(crate::servers::runtime::launch_preview(state, &server).await?)
        }
        "accept_server_eula" => {
            let server_id = required_string(args, "serverId")?;
            let server = crate::commands::find_server(state, &server_id)?;
            let dir = crate::commands::servers::reachable(&server)?;
            crate::servers::provision::write_eula(&state.files, &dir)?;
            state
                .db
                .accept_server_eula(&server_id, chrono::Utc::now().timestamp())?;
            value(crate::commands::find_server(state, &server_id)?)
        }
        "delete_server" => {
            crate::commands::servers::delete_server_core(
                state,
                &required_string(args, "serverId")?,
                optional_bool(args, "deleteFiles", false),
            )?;
            Ok(Value::Null)
        }
        "force_stop_server" => {
            crate::servers::runtime::force_stop(state, &required_string(args, "serverId")?)?;
            Ok(Value::Null)
        }
        "get_server_disk_usage" => {
            let server = crate::commands::find_server(state, &required_string(args, "serverId")?)?;
            let dir = crate::commands::servers::reachable(&server)?;
            value(crate::storage::directory_size(&state.files, &dir))
        }
        "send_server_command" => {
            let line = required_string(args, "line")?;
            if !line.trim().is_empty() {
                crate::servers::runtime::send_command(
                    state,
                    &required_string(args, "serverId")?,
                    &line,
                )
                .await?;
            }
            Ok(Value::Null)
        }
        "get_server_console" => value(crate::servers::runtime::console(
            state,
            &required_string(args, "serverId")?,
        )),
        "list_running_servers" => value(crate::servers::runtime::running(state)),
        "get_server_properties" => {
            let server = crate::commands::find_server(state, &required_string(args, "serverId")?)?;
            crate::commands::servers::reachable(&server)?;
            let config = crate::servers::config::read(&state.files, &server)?;
            crate::commands::servers::cache_config(state, &server, &config)?;
            value(crate::commands::servers::properties_of(config))
        }
        "set_server_properties" => {
            let server = crate::commands::find_server(state, &required_string(args, "serverId")?)?;
            crate::commands::servers::reachable(&server)?;
            let changes: Vec<crate::commands::servers::ServerProperty> =
                required_value(args, "changes")?;
            let edits = changes
                .into_iter()
                .map(|property| crate::servers::config::Entry {
                    key: property.key,
                    value: property.value,
                })
                .collect::<Vec<_>>();
            let config = crate::servers::config::write(
                &state.files,
                &server,
                &edits,
                &required_strings(args, "removed")?,
            )?;
            crate::commands::servers::cache_config(state, &server, &config)?;
            value(crate::commands::servers::properties_of(config))
        }
        "list_server_content" => {
            let server_id = required_string(args, "serverId")?;
            let server = crate::commands::find_server(state, &server_id)?;
            crate::commands::servers::reachable(&server)?;
            if let Err(error) =
                crate::servers::zippack::link_curseforge_content(state, &server).await
            {
                tracing::warn!(%error, server_id = %server.id, "could not restore server pack content links");
            }
            if optional_bool(args, "reconcile", false) {
                crate::search::identify::reconcile(
                    state,
                    crate::search::resolve::Target::Server(&server),
                    "mods",
                )
                .await?;
            }
            let mut items = crate::servers::content::list(&state.files, &server)?;
            let mut sources = state
                .db
                .server_content_files(&server.id, "mods")?
                .into_iter()
                .map(|file| (file.file_name.clone(), file))
                .collect::<std::collections::HashMap<_, _>>();
            let mut updates = state
                .db
                .server_content_updates(&server.id)?
                .into_iter()
                .map(|update| (update.file_name.clone(), update))
                .collect::<std::collections::HashMap<_, _>>();
            for item in &mut items {
                item.source = sources.remove(&item.file_name);
                item.update = updates.remove(&item.file_name);
            }
            value(items)
        }
        "toggle_server_content" => {
            let server = crate::commands::find_server(state, &required_string(args, "serverId")?)?;
            crate::commands::servers::reachable(&server)?;
            value(crate::servers::content::toggle(
                &state.files,
                &server,
                &required_string(args, "fileName")?,
            )?)
        }
        "delete_server_content" => {
            let server = crate::commands::find_server(state, &required_string(args, "serverId")?)?;
            crate::commands::servers::reachable(&server)?;
            let file_name = required_string(args, "fileName")?;
            crate::servers::content::delete(&state.files, &server, &file_name)?;
            state
                .db
                .delete_server_content_file(&server.id, "mods", &file_name)?;
            Ok(Value::Null)
        }
        "add_server_content" => {
            let server = crate::commands::find_server(state, &required_string(args, "serverId")?)?;
            crate::commands::servers::reachable(&server)?;
            value(crate::servers::content::add(
                &state.files,
                &server,
                &required_strings(args, "sources")?,
            )?)
        }
        "list_server_players" => {
            let server = crate::commands::find_server(state, &required_string(args, "serverId")?)?;
            let dir = crate::commands::servers::reachable(&server)?;
            value(crate::servers::players::read(
                &state.files,
                &dir,
                crate::servers::players::PlayerList::parse(&required_string(args, "list")?)?,
            ))
        }
        "add_server_player" => {
            let server_id = required_string(args, "serverId")?;
            let server = crate::commands::find_server(state, &server_id)?;
            let dir = crate::commands::servers::reachable(&server)?;
            let list = crate::servers::players::PlayerList::parse(&required_string(args, "list")?)?;
            let name = required_string(args, "name")?;
            let reason = optional_string(args, "reason");
            if state
                .servers
                .lock()
                .unwrap()
                .get(&server_id)
                .is_some_and(crate::servers::runtime::ServerHandle::live)
            {
                crate::servers::runtime::send_command(
                    state,
                    &server_id,
                    &crate::servers::players::command_to_add(list, name.trim(), reason.as_deref()),
                )
                .await?;
            } else {
                let (uuid, resolved) =
                    crate::servers::players::look_up(&state.network, &name).await?;
                let mut entries = crate::servers::players::read(&state.files, &dir, list);
                if entries
                    .iter()
                    .any(|entry| entry.uuid.eq_ignore_ascii_case(&uuid))
                {
                    return Err(Error::other(format!("{resolved} is already on this list.")));
                }
                entries.push(crate::servers::players::entry_for(
                    list, uuid, resolved, reason,
                ));
                crate::servers::players::write(&state.files, &dir, list, &entries)?;
            }
            Ok(Value::Null)
        }
        "remove_server_player" => {
            let server_id = required_string(args, "serverId")?;
            let server = crate::commands::find_server(state, &server_id)?;
            let dir = crate::commands::servers::reachable(&server)?;
            let list = crate::servers::players::PlayerList::parse(&required_string(args, "list")?)?;
            let name = required_string(args, "name")?;
            if state
                .servers
                .lock()
                .unwrap()
                .get(&server_id)
                .is_some_and(crate::servers::runtime::ServerHandle::live)
            {
                crate::servers::runtime::send_command(
                    state,
                    &server_id,
                    &crate::servers::players::command_to_remove(list, name.trim()),
                )
                .await?;
            } else {
                let mut entries = crate::servers::players::read(&state.files, &dir, list);
                let before = entries.len();
                entries.retain(|entry| {
                    !entry.name.eq_ignore_ascii_case(name.trim())
                        && !entry.uuid.eq_ignore_ascii_case(name.trim())
                });
                if entries.len() == before {
                    return Err(Error::other(format!("{name} is not on this list.")));
                }
                crate::servers::players::write(&state.files, &dir, list, &entries)?;
            }
            Ok(Value::Null)
        }
        "get_server_script_memory" => {
            let server = crate::commands::find_server(state, &required_string(args, "serverId")?)?;
            let dir = crate::commands::servers::reachable(&server)?;
            value(
                crate::servers::jvmargs::read(&state.files, &dir)
                    .map(|text| crate::servers::jvmargs::declared_memory(&text)),
            )
        }
        "apply_server_script_memory" => {
            let server_id = required_string(args, "serverId")?;
            let server = crate::commands::find_server(state, &server_id)?;
            if server.launch_script.is_none() {
                return Err(Error::other(
                    "This server does not have a modpack compatibility script.",
                ));
            }
            let dir = crate::commands::servers::reachable(&server)?;
            let settings = state.runtime_settings()?;
            let memory = crate::config::MemoryLimits::new(
                server
                    .min_memory_mb
                    .unwrap_or(settings.server_min_memory_mb),
                server
                    .max_memory_mb
                    .unwrap_or(settings.server_max_memory_mb),
            )?;
            crate::servers::jvmargs::apply(&state.files, &dir, memory)?;
            state.db.manage_server_script_memory(&server_id)?;
            if let Some(sink) = state.tasks.event_sink() {
                sink(
                    "server:file-changed",
                    json!({ "server_id": server_id, "path": crate::servers::jvmargs::FILE }),
                );
            }
            Ok(Value::Null)
        }
        "rescan_server" => {
            let server = crate::commands::find_server(state, &required_string(args, "serverId")?)?;
            value(crate::servers::rescan::run(&state.db, &server)?)
        }
        "set_server_launch_script" => {
            let server_id = required_string(args, "serverId")?;
            let server = crate::commands::find_server(state, &server_id)?;
            let use_script = optional_bool(args, "useScript", false);
            if server.pack_provider.as_deref() != Some("curseforge")
                || server.launch_script.is_none()
            {
                return Err(Error::other(
                    "Only a CurseForge server pack with a start script can change this setting.",
                ));
            }
            if !use_script && server.launch_jar.is_none() && server.launch_argfiles.is_empty() {
                return Err(Error::other(
                    "Run the pack script once, then rescan before turning it off.",
                ));
            }
            state
                .db
                .set_server_skip_launch_script(&server_id, !use_script)?;
            Ok(Value::Null)
        }
        "set_server_whitelist" => {
            let server_id = required_string(args, "serverId")?;
            let server = crate::commands::find_server(state, &server_id)?;
            crate::commands::servers::reachable(&server)?;
            if server.flavor.native() {
                return Err(Error::other(format!(
                    "A {} server keeps this in {}.",
                    server.flavor.label(),
                    server.flavor.config_file()
                )));
            }
            let enabled = optional_bool(args, "enabled", false);
            if state
                .servers
                .lock()
                .unwrap()
                .get(&server_id)
                .is_some_and(crate::servers::runtime::ServerHandle::live)
            {
                crate::servers::runtime::send_command(
                    state,
                    &server_id,
                    if enabled {
                        "whitelist on"
                    } else {
                        "whitelist off"
                    },
                )
                .await?;
            }
            crate::servers::config::write(
                &state.files,
                &server,
                &[crate::servers::config::Entry {
                    key: "white-list".to_string(),
                    value: enabled.to_string(),
                }],
                &[],
            )?;
            Ok(Value::Null)
        }
        "check_server_pack_update" => {
            let server = crate::commands::find_server(state, &required_string(args, "serverId")?)?;
            let (Some(provider), Some(project_id), Some(current)) = (
                server.pack_provider.as_deref(),
                server.pack_project_id.as_deref(),
                server.pack_version_id.as_deref(),
            ) else {
                return Ok(Value::Null);
            };
            value(
                crate::modpack::update_between(
                    state,
                    crate::search::Provider::parse(provider)?,
                    project_id,
                    current,
                    None,
                )
                .await?,
            )
        }
        "plan_server_content_removal" => {
            let server = crate::commands::find_server(state, &required_string(args, "serverId")?)?;
            crate::commands::servers::reachable(&server)?;
            value(crate::search::resolve::plan_removal(
                state,
                crate::search::resolve::Target::Server(&server),
                crate::search::ContentKind::Mod,
                &required_string(args, "fileName")?,
            ))
        }
        "check_server_content_updates" => {
            let server_id = required_string(args, "serverId")?;
            let server = crate::commands::find_server(state, &server_id)?;
            crate::commands::servers::reachable(&server)?;
            let checked_at = state.db.server_updates_checked_at(&server_id)?;
            if !optional_bool(args, "force", false) && !crate::search::updates::is_stale(checked_at)
            {
                value(state.db.server_content_updates(&server_id)?)
            } else {
                value(crate::search::updates::check_server(state, &server).await?)
            }
        }
        "plan_server_content_install" | "install_server_content" => {
            let server = crate::commands::find_server(state, &required_string(args, "serverId")?)?;
            crate::commands::servers::reachable(&server)?;
            let provider = crate::search::Provider::parse(&required_string(args, "provider")?)?;
            let kind = crate::search::ContentKind::Mod;
            let target = crate::search::resolve::Target::Server(&server);
            let plan = crate::search::resolve::plan(
                state,
                provider,
                &required_string(args, "projectId")?,
                target,
                kind,
                &server.version_id,
                Some(server.flavor.id()),
                optional_string(args, "versionId").as_deref(),
                optional_bool(args, "withDependencies", true),
            )
            .await?;
            if command == "plan_server_content_install" {
                value(plan)
            } else {
                value(
                    crate::search::resolve::apply_ipc(state, &plan, provider, target, kind, None)
                        .await?,
                )
            }
        }
        "list_server_files" => {
            let server = crate::commands::find_server(state, &required_string(args, "serverId")?)?;
            let dir = crate::commands::servers::reachable(&server)?;
            value(crate::servers::files::entries(
                &state.files,
                &dir,
                &required_string(args, "path")?,
            )?)
        }
        "read_server_file" => {
            let server = crate::commands::find_server(state, &required_string(args, "serverId")?)?;
            let dir = crate::commands::servers::reachable(&server)?;
            value(crate::servers::files::read_text(
                &state.files,
                &dir,
                &required_string(args, "path")?,
            )?)
        }
        "write_server_file" => {
            let server = crate::commands::find_server(state, &required_string(args, "serverId")?)?;
            let dir = crate::commands::servers::reachable(&server)?;
            let path = required_string(args, "path")?;
            let problem = crate::servers::files::write_text(
                &state.files,
                &dir,
                &path,
                &required_string(args, "text")?,
            )?;
            if problem.is_none() && path.trim_matches('/') == server.flavor.config_file() {
                let config = crate::servers::config::read(&state.files, &server)?;
                crate::commands::servers::cache_config(state, &server, &config)?;
            }
            value(problem)
        }
        "check_server_file" => value(crate::servers::files::validate(
            crate::servers::files::FileKind::of(&required_string(args, "path")?),
            &required_string(args, "text")?,
        )),
        "create_server_folder" => {
            let server = crate::commands::find_server(state, &required_string(args, "serverId")?)?;
            let dir = crate::commands::servers::reachable(&server)?;
            value(crate::servers::files::create_dir(
                &state.files,
                &dir,
                &required_string(args, "path")?,
                &required_string(args, "name")?,
            )?)
        }
        "rename_server_entry" => {
            let server = crate::commands::find_server(state, &required_string(args, "serverId")?)?;
            let dir = crate::commands::servers::reachable(&server)?;
            value(crate::servers::files::rename(
                &state.files,
                &dir,
                &required_string(args, "path")?,
                &required_string(args, "name")?,
            )?)
        }
        "delete_server_entry" => {
            let server = crate::commands::find_server(state, &required_string(args, "serverId")?)?;
            let dir = crate::commands::servers::reachable(&server)?;
            crate::servers::files::delete(&state.files, &dir, &required_string(args, "path")?)?;
            Ok(Value::Null)
        }
        "upload_server_files" => {
            let server = crate::commands::find_server(state, &required_string(args, "serverId")?)?;
            let dir = crate::commands::servers::reachable(&server)?;
            value(crate::servers::files::upload(
                &state.files,
                &dir,
                &required_string(args, "path")?,
                &required_strings(args, "sources")?,
            )?)
        }
        "list_javas" => value(crate::java::list_all(&state.files).await),
        "get_log_records" => {
            let limit = args
                .get("limit")
                .and_then(Value::as_u64)
                .and_then(|limit| usize::try_from(limit).ok())
                .unwrap_or(2000)
                .clamp(1, 5000);
            value(state.service_log_records(limit))
        }
        "clear_log_records" => {
            state.clear_service_log_records();
            tracing::info!("log view cleared");
            Ok(Value::Null)
        }
        "get_log_config" => value(crate::logging::config(&state.files)),
        "set_log_level" => value(crate::commands::logging_commands::set_log_level_core(
            state,
            &required_string(args, "level")?,
        )?),
        "list_instance_logs" => value(crate::commands::logging_commands::list_instance_logs_core(
            state,
            &required_string(args, "instanceId")?,
        )?),
        "search_instance_log" => {
            value(crate::commands::logging_commands::search_instance_log_core(
                state,
                &required_string(args, "instanceId")?,
                &required_string(args, "name")?,
                optional_bool(args, "crash", false),
                &required_string(args, "query")?,
                optional_string(args, "minLevel").as_deref(),
                args.get("limit")
                    .and_then(Value::as_u64)
                    .and_then(|limit| usize::try_from(limit).ok())
                    .unwrap_or(20_000)
                    .clamp(1, 20_000),
            )?)
        }
        "diagnose_instance" => value(crate::commands::logging_commands::diagnose_instance_core(
            state,
            &required_string(args, "instanceId")?,
            optional_string(args, "name").as_deref(),
            optional_bool(args, "crash", false),
        )?),
        "redact_instance_log" => {
            value(crate::commands::logging_commands::redact_instance_log_core(
                state,
                &required_string(args, "instanceId")?,
                &required_string(args, "name")?,
                optional_bool(args, "crash", false),
            )?)
        }
        "redact_text" => value(crate::commands::logging_commands::redact_text_core(
            state,
            &required_string(args, "text")?,
        )),
        "share_log" => value(
            crate::commands::logging_commands::share_log_core(
                state,
                &required_string(args, "text")?,
            )
            .await?,
        ),
        "delete_instance_log" => {
            crate::commands::logging_commands::delete_instance_log_core(
                state,
                &required_string(args, "instanceId")?,
                &required_string(args, "name")?,
                optional_bool(args, "crash", false),
            )?;
            Ok(Value::Null)
        }
        "list_screenshots" => value(crate::commands::captures::list_screenshots_core(
            state,
            &required_string(args, "instanceId")?,
        )?),
        "delete_screenshots" => value(crate::commands::captures::delete_screenshots_core(
            state,
            &required_string(args, "instanceId")?,
            &required_strings(args, "names")?,
        )?),
        "copy_screenshot" => value(crate::commands::captures::copy_screenshot_path_core(
            state,
            &required_string(args, "instanceId")?,
            &required_string(args, "name")?,
        )?),
        "ensure_thumbnails" => value(
            crate::commands::captures::ensure_thumbnails_core(
                state,
                &required_string(args, "instanceId")?,
                required_strings(args, "names")?,
            )
            .await?,
        ),
        "detect_launchers" => detected_launchers(state),
        "scan_launcher" => {
            let root = PathBuf::from(required_string(args, "root")?);
            let kind = required_string(args, "kind")?;
            let scan =
                crate::migrate::scan(&state.files, &state.db, LauncherKind::parse(&kind)?, &root)?;
            value(bound_scan_media(scan))
        }
        "connect_instances_in_place" => {
            let root = PathBuf::from(required_string(args, "root")?);
            let kind = LauncherKind::parse(&required_string(args, "kind")?)?;
            let ids = required_strings(args, "ids")?;
            let files = state.files.clone();
            let db = state.db.clone();
            let outcome = tokio::task::spawn_blocking(move || {
                crate::migrate::connect(&files, &db, kind, &root, &ids)
            })
            .await
            .map_err(|error| Error::other(format!("connect task failed: {error}")))??;
            state.adopt_external_dirs()?;
            value(outcome)
        }
        "reconcile_external_instances" => {
            value(crate::migrate::reconcile_external_instances(state)?)
        }
        "migrate_instances" => {
            let root = PathBuf::from(required_string(args, "root")?);
            let kind = LauncherKind::parse(&required_string(args, "kind")?)?;
            let ids = required_strings(args, "ids")?;
            if ids.is_empty() {
                return Err(Error::other("no instances were selected"));
            }
            let task = state.tasks.start_ipc(
                TaskKind::InstanceImport,
                TaskSpec {
                    title: if ids.len() == 1 {
                        "Cloning launcher instance".to_string()
                    } else {
                        format!("Cloning {} launcher instances", ids.len())
                    },
                    subtitle: Some("Creating independent Enderloom copies".to_string()),
                    ..Default::default()
                },
            )?;
            let files = state.files.clone();
            let db = state.db.clone();
            let outcome = tokio::task::spawn_blocking(move || {
                let result = crate::migrate::import(&files, &db, kind, &root, &ids, &task);
                task.finish(&result);
                result
            })
            .await
            .map_err(|error| Error::other(format!("migration task failed: {error}")))??;
            value(outcome)
        }
        "frontend_log" => {
            crate::logging::record_frontend(
                &required_string(args, "level")?,
                &required_string(args, "scope")?,
                &required_string(args, "message")?,
                optional_string(args, "data").as_deref(),
            );
            Ok(Value::Null)
        }
        other => Err(Error::other(format!(
            "command {other} is not yet available through Enderloom IPC"
        ))),
    }
}

fn data_dir_from_args() -> Result<PathBuf> {
    let mut args = std::env::args_os().skip(1);
    while let Some(argument) = args.next() {
        if argument == "--data-dir" {
            return args
                .next()
                .map(PathBuf::from)
                .ok_or_else(|| Error::other("--data-dir needs a path"));
        }
    }
    Err(Error::other("start the service with --data-dir <path>"))
}

fn bound_scan_media(mut scan: MigrationScan) -> MigrationScan {
    let mut retained_bytes = 0usize;
    for candidate in &mut scan.candidates {
        let Some(icon) = candidate.icon_data_url.as_ref() else {
            continue;
        };
        let icon_bytes = icon.len();
        let fits_individually = icon_bytes <= MAX_INLINE_ICON_BYTES;
        let fits_scan = retained_bytes
            .checked_add(icon_bytes)
            .is_some_and(|total| total <= MAX_INLINE_SCAN_MEDIA_BYTES);
        if fits_individually && fits_scan {
            retained_bytes += icon_bytes;
        } else {
            candidate.icon_data_url = None;
        }
    }
    scan
}

fn write_message(output: &mut impl Write, message: &Value) -> Result<()> {
    let mut encoded = serde_json::to_vec(message)?;
    if encoded.len() > MAX_MESSAGE_BYTES {
        let id = message.get("id").and_then(Value::as_str).unwrap_or("");
        encoded = serde_json::to_vec(&json!({
            "protocol": PROTOCOL_VERSION,
            "id": id,
            "ok": false,
            "error": "IPC response exceeds the 8 MiB limit"
        }))?;
    }
    output.write_all(&encoded)?;
    output.write_all(b"\n")?;
    output.flush()?;
    Ok(())
}

pub async fn run() -> Result<()> {
    let root = data_dir_from_args()?;
    std::fs::create_dir_all(&root)?;
    let paths = Paths::relocated(root, BTreeMap::new());
    let files = FileManager::new(paths)?;
    files.ensure_base_dirs()?;
    let db = Db::open(&files)?;
    let state = Arc::new(AppState::new(files, db));
    state.adopt_external_dirs()?;
    match crate::commands::instances::recover_committed_instance_deletions(&state) {
        Ok(count) if count > 0 => tracing::info!(count, "cleaned committed instance deletions"),
        Err(error) => tracing::warn!(%error, "could not clean committed instance deletions"),
        _ => {}
    }
    match crate::commands::servers::recover_committed_server_deletions(&state) {
        Ok(count) if count > 0 => tracing::info!(count, "cleaned committed server deletions"),
        Err(error) => tracing::warn!(%error, "could not clean committed server deletions"),
        _ => {}
    }

    let (output_tx, output_rx) = std::sync::mpsc::channel::<Value>();
    std::thread::Builder::new()
        .name("enderloom-ipc-writer".to_string())
        .spawn(move || {
            let stdout = io::stdout();
            let mut output = stdout.lock();
            for message in output_rx {
                if let Err(error) = write_message(&mut output, &message) {
                    eprintln!("Enderloom IPC writer failed: {error}");
                    break;
                }
            }
        })?;
    let log_tx = output_tx.clone();
    let saved_log_level = state
        .db
        .load_settings()
        .map(|settings| settings.log_level)
        .unwrap_or_else(|_| crate::logging::DEFAULT_LEVEL.to_string());
    let log_state = crate::logging::init_service(
        &state.files,
        &saved_log_level,
        true,
        Arc::new(move |records| {
            let _ = log_tx.send(json!({
                "protocol": PROTOCOL_VERSION,
                "event": "log:record",
                "payload": records
            }));
        }),
    )?;
    state.attach_service_logs(&log_state);
    tracing::info!(
        version = env!("CARGO_PKG_VERSION"),
        data_dir = %state.paths.root.display(),
        log_file = %crate::logging::log_file(&state.files).display(),
        "Enderloom launcher service starting"
    );
    let event_tx = output_tx.clone();
    state.tasks.set_event_sink(Arc::new(move |event, payload| {
        let _ = event_tx.send(json!({
            "protocol": PROTOCOL_VERSION,
            "event": event,
            "payload": payload
        }));
    }));
    if let Some(event_sink) = state.tasks.event_sink() {
        if let Err(error) = crate::launch::process::recover_processes_ipc(
            event_sink.clone(),
            &state.running,
            &state.files,
            &state.db,
            &state.presence,
        ) {
            tracing::warn!(%error, "could not recover running game processes for Electron IPC");
        }
        if let Err(error) = crate::servers::runtime::recover_ipc(event_sink, &state) {
            tracing::warn!(%error, "could not recover running servers for Electron IPC");
        }
    }

    let stdin = io::stdin();
    let mut input = stdin.lock();
    output_tx
        .send(json!({
            "protocol": PROTOCOL_VERSION,
            "event": "service:ready",
            "payload": {
                "name": "Enderloom Enderloom Core",
                "version": env!("CARGO_PKG_VERSION"),
                "pid": std::process::id()
            }
        }))
        .map_err(|error| Error::other(format!("IPC writer stopped: {error}")))?;
    let request_permits = Arc::new(tokio::sync::Semaphore::new(MAX_CONCURRENT_REQUESTS));

    let mut line = String::new();
    loop {
        line.clear();
        let read = input.read_line(&mut line)?;
        if read == 0 {
            return Ok(());
        }
        if read > MAX_MESSAGE_BYTES {
            output_tx
                .send(json!({
                    "protocol": PROTOCOL_VERSION,
                    "id": "",
                    "ok": false,
                    "error": "IPC message exceeds the 8 MiB limit"
                }))
                .map_err(|error| Error::other(format!("IPC writer stopped: {error}")))?;
            continue;
        }
        let request: Request = match serde_json::from_str(&line) {
            Ok(request) => request,
            Err(error) => {
                output_tx
                    .send(json!({
                        "protocol": PROTOCOL_VERSION,
                        "id": "",
                        "ok": false,
                        "error": format!("invalid request: {error}")
                    }))
                    .map_err(|error| Error::other(format!("IPC writer stopped: {error}")))?;
                continue;
            }
        };
        if request.protocol != PROTOCOL_VERSION {
            output_tx
                .send(json!({
                    "protocol": PROTOCOL_VERSION,
                    "id": request.id,
                    "ok": false,
                    "error": "IPC protocol version mismatch"
                }))
                .map_err(|error| Error::other(format!("IPC writer stopped: {error}")))?;
            continue;
        }
        let request_state = Arc::clone(&state);
        let response_tx = output_tx.clone();
        let permits = Arc::clone(&request_permits);
        tokio::spawn(async move {
            let permit = permits.acquire_owned().await;
            if permit.is_err() {
                return;
            }
            let response = match dispatch(&request_state, &request.command, &request.args).await {
                Ok(result) => json!({
                    "protocol": PROTOCOL_VERSION,
                    "id": request.id,
                    "ok": true,
                    "result": result
                }),
                Err(error) => json!({
                    "protocol": PROTOCOL_VERSION,
                    "id": request.id,
                    "ok": false,
                    "error": error.to_string()
                }),
            };
            let _ = response_tx.send(response);
        });
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::migrate::MigrationCandidate;

    fn candidate(icon_data_url: Option<String>) -> MigrationCandidate {
        MigrationCandidate {
            id: "profile-id".to_string(),
            name: "Profile".to_string(),
            version_id: "1.20.1".to_string(),
            loader: Some("fabric".to_string()),
            loader_version: None,
            icon_data_url,
            pack: None,
            mod_count: 0,
            file_count: 0,
            total_bytes: 0,
            last_played_ms: None,
            warnings: Vec::new(),
            importable: true,
            imported: false,
        }
    }

    #[test]
    fn scan_media_is_bounded_before_serialization() {
        let small = "a".repeat(MAX_INLINE_ICON_BYTES);
        let large = "b".repeat(MAX_INLINE_ICON_BYTES + 1);
        let scan = MigrationScan {
            kind: LauncherKind::Modrinth,
            root: "profiles".to_string(),
            candidates: vec![candidate(Some(small)), candidate(Some(large))],
        };

        let bounded = bound_scan_media(scan);
        assert!(bounded.candidates[0].icon_data_url.is_some());
        assert!(bounded.candidates[1].icon_data_url.is_none());
    }

    #[test]
    fn oversized_response_becomes_a_correlated_error() {
        let mut output = Vec::new();
        let message = json!({
            "protocol": PROTOCOL_VERSION,
            "id": "request-42",
            "ok": true,
            "result": "x".repeat(MAX_MESSAGE_BYTES)
        });

        write_message(&mut output, &message).expect("bounded response should be writable");
        let response: Value = serde_json::from_slice(&output).expect("response should be JSONL");
        assert_eq!(response["id"], "request-42");
        assert_eq!(response["ok"], false);
        assert!(response["error"]
            .as_str()
            .is_some_and(|error| error.contains("8 MiB")));
    }
}
