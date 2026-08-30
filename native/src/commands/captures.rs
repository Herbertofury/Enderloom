use std::path::{Path, PathBuf};

use tauri::{AppHandle, State};
use tauri_plugin_clipboard_manager::ClipboardExt;

use crate::{
    error::{Error, Result},
    state::AppState,
};

const EXTENSIONS: &[&str] = &["png", "jpg", "jpeg", "webp"];
const THUMBNAIL_WIDTH: u32 = 420;

#[derive(Debug, serde::Serialize)]
pub struct Screenshot {
    pub name: String,
    pub path: String,
    pub size_bytes: u64,
    pub modified_ms: i64,
    pub thumbnail: Option<String>,
}

#[derive(Debug, serde::Serialize)]
pub struct Thumbnail {
    pub name: String,
    pub path: Option<String>,
}

fn thumbnails_dir(state: &AppState) -> PathBuf {
    state.paths.media().join("thumbnails")
}

fn thumbnail_for(directory: &Path, source: &Path, modified_ms: i64, size_bytes: u64) -> PathBuf {
    let mut hasher = sha1_smol::Sha1::new();
    hasher.update(source.to_string_lossy().as_bytes());
    hasher.update(&modified_ms.to_le_bytes());
    hasher.update(&size_bytes.to_le_bytes());
    hasher.update(&THUMBNAIL_WIDTH.to_le_bytes());
    directory.join(format!("{}.jpg", hasher.digest()))
}

fn build_thumbnail(
    files: &crate::files::FileManager,
    source: &Path,
    destination: &Path,
) -> Result<()> {
    let reader = std::io::BufReader::new(files.open(source)?);
    let image = image::ImageReader::new(reader)
        .with_guessed_format()
        .map_err(|error| Error::other(format!("could not identify the image: {error}")))?
        .decode()
        .map_err(|error| Error::other(format!("could not read the image: {error}")))?;
    let small = image.thumbnail(THUMBNAIL_WIDTH, THUMBNAIL_WIDTH);
    let mut encoded = Vec::new();
    image::codecs::jpeg::JpegEncoder::new_with_quality(&mut encoded, 84)
        .encode_image(&small.into_rgb8())
        .map_err(|error| Error::other(format!("could not write the preview: {error}")))?;
    files.write_atomic(destination, &encoded)?;
    Ok(())
}

fn screenshots_dir(state: &AppState, instance_id: &str) -> Result<PathBuf> {
    let instance = super::find_instance(state, instance_id)?;
    Ok(PathBuf::from(instance.dir).join("screenshots"))
}

fn screenshot_path(state: &AppState, instance_id: &str, name: &str) -> Result<PathBuf> {
    let lower = name.to_ascii_lowercase();
    let known = EXTENSIONS
        .iter()
        .any(|extension| lower.ends_with(&format!(".{extension}")));
    if !known || name.contains('/') || name.contains('\\') || name.contains("..") {
        return Err(Error::other(format!("not a screenshot: {name}")));
    }

    let dir = screenshots_dir(state, instance_id)?;
    let path = dir.join(name);
    if path.parent() != Some(dir.as_path()) {
        return Err(Error::other(format!("not a screenshot: {name}")));
    }
    Ok(path)
}

pub fn list_screenshots_core(state: &AppState, instance_id: &str) -> Result<Vec<Screenshot>> {
    let dir = screenshots_dir(state, instance_id)?;
    let thumbnails = thumbnails_dir(state);
    let mut shots = Vec::new();

    let Ok(entries) = state.files.read_dir(&dir) else {
        return Ok(shots);
    };

    for source in entries {
        let name = source
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .into_owned();
        let lower = name.to_ascii_lowercase();
        if !EXTENSIONS
            .iter()
            .any(|extension| lower.ends_with(&format!(".{extension}")))
        {
            continue;
        }
        let Ok(meta) = state.files.metadata(&source) else {
            continue;
        };
        if !meta.is_file() {
            continue;
        }
        let modified_ms = meta
            .modified()
            .ok()
            .and_then(|time| time.into_std().duration_since(std::time::UNIX_EPOCH).ok())
            .map(|since| since.as_millis() as i64)
            .unwrap_or(0);
        let thumbnail = thumbnail_for(&thumbnails, &source, modified_ms, meta.len());
        shots.push(Screenshot {
            name,
            path: source.display().to_string(),
            size_bytes: meta.len(),
            modified_ms,
            thumbnail: state
                .files
                .is_file(&thumbnail)
                .unwrap_or(false)
                .then(|| thumbnail.display().to_string()),
        });
    }

    shots.sort_by(|a, b| {
        b.modified_ms
            .cmp(&a.modified_ms)
            .then_with(|| a.name.cmp(&b.name))
    });
    Ok(shots)
}

#[tauri::command]
#[tracing::instrument(skip(state), err)]
pub fn list_screenshots(state: State<AppState>, instance_id: String) -> Result<Vec<Screenshot>> {
    list_screenshots_core(&state, &instance_id)
}

pub fn delete_screenshots_core(
    state: &AppState,
    instance_id: &str,
    names: &[String],
) -> Result<usize> {
    let directory = thumbnails_dir(state);
    let mut removed = 0;
    for name in names {
        let path = screenshot_path(state, instance_id, name)?;
        if let Ok(meta) = state.files.metadata(&path) {
            let modified_ms = meta
                .modified()
                .ok()
                .and_then(|time| time.into_std().duration_since(std::time::UNIX_EPOCH).ok())
                .map(|since| since.as_millis() as i64)
                .unwrap_or(0);
            let _ = state.files.remove_file_if_exists(thumbnail_for(
                &directory,
                &path,
                modified_ms,
                meta.len(),
            ));
        }
        if state.files.remove_file_if_exists(&path)? {
            removed += 1;
        }
    }
    tracing::info!(removed, "screenshots deleted");
    Ok(removed)
}

#[tauri::command]
#[tracing::instrument(skip(state), err)]
pub fn delete_screenshots(
    state: State<AppState>,
    instance_id: String,
    names: Vec<String>,
) -> Result<usize> {
    delete_screenshots_core(&state, &instance_id, &names)
}

pub fn copy_screenshot_path_core(
    state: &AppState,
    instance_id: &str,
    name: &str,
) -> Result<String> {
    let path = screenshot_path(state, instance_id, name)?;
    if !state.files.is_file(&path)? {
        return Err(Error::other(format!("screenshot does not exist: {name}")));
    }
    Ok(path.display().to_string())
}

#[tauri::command]
#[tracing::instrument(skip(app, state), err)]
pub fn copy_screenshot(
    app: AppHandle,
    state: State<AppState>,
    instance_id: String,
    name: String,
) -> Result<()> {
    let path = copy_screenshot_path_core(&state, &instance_id, &name)?;
    let image = tauri::image::Image::from_path(&path)
        .map_err(|error| Error::other(format!("could not read {name}: {error}")))?;
    app.clipboard()
        .write_image(&image)
        .map_err(|error| Error::other(format!("could not reach the clipboard: {error}")))
}

pub async fn ensure_thumbnails_core(
    state: &AppState,
    instance_id: &str,
    names: Vec<String>,
) -> Result<Vec<Thumbnail>> {
    let directory = thumbnails_dir(state);
    let mut jobs = Vec::new();
    for name in names {
        let source = screenshot_path(state, instance_id, &name)?;
        let Ok(meta) = state.files.metadata(&source) else {
            continue;
        };
        let modified_ms = meta
            .modified()
            .ok()
            .and_then(|time| time.into_std().duration_since(std::time::UNIX_EPOCH).ok())
            .map(|since| since.as_millis() as i64)
            .unwrap_or(0);
        let destination = thumbnail_for(&directory, &source, modified_ms, meta.len());
        jobs.push((name, source, destination));
    }

    let files = state.files.clone();
    let running: Vec<_> = jobs
        .into_iter()
        .map(|(name, source, destination)| {
            let files = files.clone();
            tokio::task::spawn_blocking(move || {
                if !files.is_file(&destination).unwrap_or(false) {
                    if let Err(error) = build_thumbnail(&files, &source, &destination) {
                        tracing::warn!(file = %name, error = %error, "no preview for this screenshot");
                        return Thumbnail { name, path: None };
                    }
                }
                Thumbnail {
                    name,
                    path: Some(destination.display().to_string()),
                }
            })
        })
        .collect();

    let mut built = Vec::with_capacity(running.len());
    for handle in running {
        if let Ok(thumbnail) = handle.await {
            built.push(thumbnail);
        }
    }
    Ok(built)
}

#[tauri::command]
#[tracing::instrument(skip(state), err)]
pub async fn ensure_thumbnails(
    state: State<'_, AppState>,
    instance_id: String,
    names: Vec<String>,
) -> Result<Vec<Thumbnail>> {
    ensure_thumbnails_core(&state, &instance_id, names).await
}
