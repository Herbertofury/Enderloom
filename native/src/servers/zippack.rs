use std::{
    io::Read,
    path::{Path, PathBuf},
};

use crate::{
    download::DownloadSpec,
    error::{Error, Result},
    files::FileManager,
    state::AppState,
    tasks::TaskHandle,
};

use super::{import, software, Server};

const MAX_SERVER_PACK_FILES: usize = 100_000;
const MAX_SERVER_PACK_ENTRY_BYTES: u64 = 8 * 1024 * 1024 * 1024;
const MAX_SERVER_PACK_TOTAL_BYTES: u64 = 64 * 1024 * 1024 * 1024;
const SERVER_PACK_PENDING: &str = ".server-pack-pending-";

struct CancelReader<'a, R> {
    inner: &'a mut R,
    token: tokio_util::sync::CancellationToken,
}

impl<R: Read> Read for CancelReader<'_, R> {
    fn read(&mut self, buffer: &mut [u8]) -> std::io::Result<usize> {
        if self.token.is_cancelled() {
            return Err(std::io::Error::new(
                std::io::ErrorKind::Interrupted,
                "server pack installation cancelled",
            ));
        }
        self.inner.read(buffer)
    }
}

pub fn root_prefix(names: &[String]) -> Option<String> {
    let mut roots = names
        .iter()
        .filter_map(|name| name.split('/').next())
        .filter(|root| !root.is_empty())
        .collect::<Vec<_>>();
    roots.sort_unstable();
    roots.dedup();
    let only = roots.first()?;
    if roots.len() != 1
        || !names
            .iter()
            .all(|name| name.starts_with(&format!("{only}/")))
    {
        return None;
    }
    Some((*only).to_string())
}

pub fn safe_join(dir: &Path, name: &str) -> Result<PathBuf> {
    Ok(dir.join(crate::modpack::sanitize_relative(name)?))
}

fn unpack_with_token(
    files: &FileManager,
    archive: &Path,
    dir: &Path,
    token: Option<tokio_util::sync::CancellationToken>,
) -> Result<()> {
    let file = files.open(archive)?;
    let mut zip = zip::ZipArchive::new(file)
        .map_err(|error| Error::other(format!("opening the server pack: {error}")))?;

    if zip.len() > MAX_SERVER_PACK_FILES {
        return Err(Error::other(format!(
            "This server pack contains too many entries ({}; maximum {MAX_SERVER_PACK_FILES}).",
            zip.len()
        )));
    }

    let names = (0..zip.len())
        .filter_map(|index| {
            zip.by_index(index)
                .ok()
                .map(|entry| entry.name().to_string())
        })
        .collect::<Vec<_>>();
    let strip = root_prefix(&names);
    let mut total_bytes = 0_u64;

    for index in 0..zip.len() {
        if token.as_ref().is_some_and(|token| token.is_cancelled()) {
            return Err(Error::Cancelled);
        }
        let mut entry = zip
            .by_index(index)
            .map_err(|error| Error::other(format!("reading the server pack: {error}")))?;
        let name = entry.name().to_string();
        let relative = match &strip {
            Some(prefix) => match name.strip_prefix(&format!("{prefix}/")) {
                Some(rest) => rest.to_string(),
                None => continue,
            },
            None => name,
        };
        if relative.is_empty() {
            continue;
        }
        let entry_size = entry.size();
        if entry_size > MAX_SERVER_PACK_ENTRY_BYTES {
            return Err(Error::other(format!(
                "Server pack entry {relative} is too large to extract safely."
            )));
        }
        total_bytes = total_bytes
            .checked_add(entry_size)
            .ok_or_else(|| Error::other("The server pack's expanded size is invalid."))?;
        if total_bytes > MAX_SERVER_PACK_TOTAL_BYTES {
            return Err(Error::other(
                "The server pack expands beyond Enderloom's 64 GiB safety limit.",
            ));
        }
        let target = safe_join(dir, &relative)?;
        if entry.is_dir() {
            files.ensure_dir(&target)?;
            continue;
        }
        if let Some(parent) = target.parent() {
            files.ensure_dir(parent)?;
        }
        if let Some(token) = token.clone() {
            let mut reader = CancelReader {
                inner: &mut entry,
                token: token.clone(),
            };
            if let Err(error) = files.copy_reader_into_sync(&mut reader, &target) {
                if token.is_cancelled() {
                    return Err(Error::Cancelled);
                }
                return Err(error);
            }
        } else {
            files.copy_reader_into_sync(&mut entry, &target)?;
        }
    }
    Ok(())
}

pub struct Source {
    pub url: Option<String>,
    pub local_path: Option<String>,
    pub file_name: String,
    pub sha1: Option<String>,
    pub size: Option<u64>,
    pub provider: String,
    pub project_id: String,
    pub version_id: String,
}

fn archive_name(value: &str) -> Result<&str> {
    let value = value.trim();
    if value.is_empty()
        || Path::new(value).file_name().and_then(|name| name.to_str()) != Some(value)
    {
        return Err(Error::other("The server pack file name is not safe."));
    }
    Ok(value)
}

pub async fn link_curseforge_content(state: &AppState, server: &Server) -> Result<usize> {
    let (Some(project_id), Some(pack_version_id)) = (
        server.pack_project_id.as_deref(),
        server.pack_version_id.as_deref(),
    ) else {
        return Ok(0);
    };
    if server.pack_provider.as_deref() != Some("curseforge")
        || state
            .db
            .has_server_pack_content(&server.id, pack_version_id)?
    {
        return Ok(0);
    }

    let version = crate::search::fetch_version(
        state,
        crate::search::Provider::Curseforge,
        project_id,
        crate::search::ContentKind::Modpack,
        "",
        None,
        Some(pack_version_id),
    )
    .await?;
    let file = version
        .primary_file()
        .ok_or_else(|| Error::other("This CurseForge pack version has no archive."))?;
    let archive = state.paths.cache().join("modpacks").join(&file.file_name);
    if !state.files.exists(&archive)? {
        let url = file.url.clone().ok_or_else(|| {
            Error::other(
                "CurseForge does not allow the parent pack manifest to be downloaded automatically.",
            )
        })?;
        crate::download::download_one(
            &state.network,
            &state.files,
            &DownloadSpec {
                url,
                dest: archive.clone(),
                sha1: file.sha1.clone(),
                sha256: None,
                size: file.size,
            },
        )
        .await?;
    }

    let (_, links, _, _) = crate::packs::plan_curseforge_archive(state, &archive).await?;
    let mut recorded = 0;
    for (kind, _, mut content) in links {
        if kind != "mods"
            || !state.files.is_file(
                PathBuf::from(&server.dir)
                    .join("mods")
                    .join(&content.file_name),
            )?
        {
            continue;
        }
        content.pack_version_id = Some(pack_version_id.to_string());
        state
            .db
            .record_server_content_file(&server.id, &kind, &content)?;
        recorded += 1;
    }
    tracing::info!(server_id = %server.id, recorded, "linked server mods from the CurseForge pack manifest");
    Ok(recorded)
}

pub async fn install(
    state: &AppState,
    name: &str,
    source: &Source,
    game_version: Option<&str>,
    task: &TaskHandle,
) -> Result<Server> {
    task.stage("server-pack");
    let file_name = archive_name(&source.file_name)?;
    let cached_archive = state.paths.cache().join("server-packs").join(file_name);
    let archive = match (&source.url, &source.local_path) {
        (Some(url), _) => {
            super::provision::fetch(
                task,
                state,
                vec![DownloadSpec {
                    url: url.clone(),
                    dest: cached_archive.clone(),
                    sha1: source.sha1.clone(),
                    sha256: None,
                    size: source.size,
                }],
            )
            .await?;
            cached_archive.clone()
        }
        (None, Some(path)) => {
            let path = PathBuf::from(path);
            if !state.files.is_external_file(&path) {
                return Err(Error::other("That downloaded file is not readable."));
            }
            crate::download::copy_verified(
                &state.files,
                &path,
                &cached_archive,
                source.sha1.as_deref(),
                source.size,
            )
            .await?;
            cached_archive.clone()
        }
        (None, None) => {
            return Err(Error::other(
                "This server pack has to be downloaded in your browser first.",
            ));
        }
    };

    let id = uuid::Uuid::new_v4().to_string();
    let dir = state
        .paths
        .server_dir_checked(&id)
        .ok_or_else(|| Error::other("invalid server id"))?;
    let staging = state.paths.servers().join(format!(
        "{SERVER_PACK_PENDING}{id}-{}",
        uuid::Uuid::new_v4()
    ));
    state.files.ensure_dir(&staging)?;

    task.stage("server-unpack");
    let files = state.files.clone();
    let from = archive.clone();
    let destination = staging.clone();
    let token = task.token();
    let unpacked = tokio::task::spawn_blocking(move || {
        unpack_with_token(&files, &from, &destination, Some(token))
    })
    .await
    .map_err(|error| Error::other(format!("unpacking the server pack: {error}")))?;
    if let Err(error) = unpacked {
        let _ = state.files.remove_managed_dir_all_if_exists(&staging);
        return Err(error);
    }

    let found = import::inspect(&staging);
    let flavor = found.flavor.unwrap_or(software::vanilla());
    let linked = !source.provider.is_empty()
        && !source.project_id.is_empty()
        && !source.version_id.is_empty();
    let mut server = Server {
        id,
        name: name.to_string(),
        flavor,
        version_id: found
            .version_id
            .clone()
            .or_else(|| game_version.map(str::to_string))
            .unwrap_or_default(),
        created_at: chrono::Utc::now(),
        managed: true,
        dir: dir.display().to_string(),
        available: true,
        flavor_version: found.flavor_version,
        launch_jar: found.launch_jar,
        launch_argfiles: found.launch_argfiles,
        min_memory_mb: None,
        max_memory_mb: None,
        java_path: None,
        jvm_args: None,
        jvm_args_mode: None,
        stop_timeout_secs: None,
        eula_accepted_at: Some(chrono::Utc::now().timestamp()),
        installed_at: Some(chrono::Utc::now().timestamp()),
        last_started_at: None,
        uptime_secs: 0,
        port: found.port,
        motd: None,
        max_players: None,
        notes: None,
        launch_script: None,
        skip_launch_script: false,
        pack_provider: linked.then(|| source.provider.clone()),
        pack_project_id: linked.then(|| source.project_id.clone()),
        pack_version_id: linked.then(|| source.version_id.clone()),
        import_source: (!linked).then(|| "zip".to_string()),
        import_source_id: (!linked).then(|| source.file_name.clone()),
    };
    if let Err(error) = super::provision::write_eula(&state.files, &staging) {
        let _ = state.files.remove_managed_dir_all_if_exists(&staging);
        return Err(error);
    }
    if let Err(error) = state.files.rename(&staging, &dir) {
        let _ = state.files.remove_managed_dir_all_if_exists(&staging);
        return Err(error);
    }
    if let Err(error) = state.db.insert_server(&server) {
        let rollback = state.files.rename(&dir, &staging);
        if rollback.is_ok() {
            let _ = state.files.remove_managed_dir_all_if_exists(&staging);
            return Err(error);
        }
        return Err(Error::other(format!(
            "{error}; unpacked server files remain recoverable at {} because rollback failed",
            dir.display()
        )));
    }
    if let Err(error) = link_curseforge_content(state, &server).await {
        tracing::warn!(%error, server_id = %server.id, "could not link the server pack's CurseForge mods");
    }
    match super::rescan::run(&state.db, &server) {
        Ok(result) if result.changed => {
            if let Some(fresh) = state.db.server(&state.paths, &server.id)? {
                server = fresh;
            }
        }
        Ok(_) => {}
        Err(error) => {
            tracing::warn!(%error, server_id = %server.id, "could not rescan the installed server pack")
        }
    }
    if source.provider == "curseforge"
        && linked
        && (!server.launch_argfiles.is_empty() || server.launch_jar.is_some())
    {
        match state.db.set_server_skip_launch_script(&server.id, true) {
            Ok(()) => server.skip_launch_script = true,
            Err(error) => {
                tracing::warn!(%error, server_id = %server.id, "could not persist the server pack launch preference")
            }
        }
    }
    tracing::info!(server_id = %server.id, software = %server.flavor, "installed a server pack");
    Ok(server)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn names(raw: &[&str]) -> Vec<String> {
        raw.iter().map(|entry| (*entry).to_string()).collect()
    }

    #[test]
    fn a_single_wrapping_folder_is_stripped() {
        assert_eq!(
            root_prefix(&names(&[
                "ATM10-server/",
                "ATM10-server/mods/a.jar",
                "ATM10-server/run.sh"
            ])),
            Some("ATM10-server".to_string())
        );
    }

    #[test]
    fn a_flat_pack_keeps_its_layout() {
        assert!(root_prefix(&names(&["mods/a.jar", "run.sh", "server.jar"])).is_none());
    }

    #[test]
    fn nothing_escapes_the_server_folder() {
        let dir = Path::new("/srv/smp");
        assert!(safe_join(dir, "../../etc/passwd").is_err());
        assert!(safe_join(dir, "mods/../../out.jar").is_err());
        assert_eq!(
            safe_join(dir, "mods/a.jar").unwrap(),
            dir.join("mods").join("a.jar")
        );
    }
}
