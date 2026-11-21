use serde::{Deserialize, Serialize};

use crate::{error::Result, files::FileManager, network::NetworkManager, paths::Paths};

const PATCH_NOTES_URL: &str = "https://launchercontent.mojang.com/v2/javaPatchNotes.json";
const CONTENT_BASE: &str = "https://launchercontent.mojang.com";

#[derive(Debug, Clone, Deserialize)]
pub struct PatchNotes {
    pub entries: Vec<PatchEntry>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct PatchEntry {
    pub version: String,
    #[serde(default)]
    pub image: Option<PatchImage>,
    #[serde(rename = "shortText", default)]
    pub short_text: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct PatchImage {
    pub url: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct VersionMedia {
    pub image_url: String,
    pub short_text: Option<String>,
    pub accent: Option<String>,
    pub local: bool,
    #[serde(default = "default_media_kind")]
    pub kind: String,
}

pub fn default_media_kind() -> String {
    "image".to_string()
}

const BANNER_EXTENSIONS: [&str; 5] = ["png", "jpg", "jpeg", "webp", "gif"];

pub async fn fetch_notes(client: &NetworkManager, files: &FileManager) -> Result<PatchNotes> {
    let cache = files.paths().root.join("patch_notes.json");
    let bytes = match client.send(client.get(PATCH_NOTES_URL)).await {
        Ok(resp) => {
            let resp = resp.error_for_status()?;
            let bytes = resp.bytes().await?;
            let _ = files.write_atomic_async(&cache, &bytes).await;
            bytes.to_vec()
        }
        Err(_) => files.read_async(&cache).await?,
    };
    Ok(serde_json::from_slice(&bytes)?)
}

pub(super) fn accent_from_pixels(img: &image::RgbImage) -> Option<String> {
    let mut buckets = [(0f32, 0f32, 0f32, 0f32); 36];
    for pixel in img.pixels() {
        let (r, g, b) = (
            pixel[0] as f32 / 255.0,
            pixel[1] as f32 / 255.0,
            pixel[2] as f32 / 255.0,
        );
        let max = r.max(g).max(b);
        let min = r.min(g).min(b);
        let delta = max - min;
        if max < 0.15 || delta < 0.12 {
            continue;
        }
        let sat = delta / max;
        if sat < 0.25 {
            continue;
        }
        let hue = if max == r {
            60.0 * (((g - b) / delta) % 6.0)
        } else if max == g {
            60.0 * ((b - r) / delta + 2.0)
        } else {
            60.0 * ((r - g) / delta + 4.0)
        };
        let hue = if hue < 0.0 { hue + 360.0 } else { hue };
        let weight = sat * max;
        let bucket = &mut buckets[(hue as usize / 10).min(35)];
        bucket.0 += weight;
        bucket.1 += r * weight;
        bucket.2 += g * weight;
        bucket.3 += b * weight;
    }

    let best = buckets
        .iter()
        .max_by(|a, b| a.0.total_cmp(&b.0))
        .filter(|b| b.0 > 1.0)?;
    let (w, r, g, b) = (best.0, best.1 / best.0, best.2 / best.0, best.3 / best.0);
    let _ = w;

    let max = r.max(g).max(b);
    let boost = if max > 0.0 {
        (0.82 / max).clamp(1.0, 1.8)
    } else {
        1.0
    };
    let to_byte = |v: f32| ((v * boost).clamp(0.0, 1.0) * 255.0) as u8;
    Some(format!(
        "#{:02x}{:02x}{:02x}",
        to_byte(r),
        to_byte(g),
        to_byte(b)
    ))
}

async fn accent_for(
    client: &NetworkManager,
    files: &FileManager,
    version_id: &str,
    image_url: &str,
) -> Option<String> {
    let media_dir = files.paths().root.join("media");
    let img_path = media_dir.join(format!("{version_id}.jpg"));
    let accent_path = media_dir.join(format!("{version_id}.accent"));

    if let Ok(cached) = files.read_string_async(&accent_path).await {
        let cached = cached.trim().to_string();
        return if cached.is_empty() {
            None
        } else {
            Some(cached)
        };
    }

    let bytes = match files.read_async(&img_path).await {
        Ok(bytes) => bytes,
        Err(_) => {
            let resp = client
                .send(client.get(image_url))
                .await
                .ok()?
                .error_for_status()
                .ok()?;
            let bytes = resp.bytes().await.ok()?.to_vec();
            let _ = files.write_atomic_async(&img_path, &bytes).await;
            bytes
        }
    };

    let accent = compute_accent(bytes).await;
    let _ = files
        .write_atomic_async(&accent_path, accent.clone().unwrap_or_default())
        .await;
    accent
}

async fn compute_accent(bytes: Vec<u8>) -> Option<String> {
    tokio::task::spawn_blocking(move || {
        let img = image::load_from_memory(&bytes).ok()?;
        let small = img.resize_exact(32, 32, image::imageops::FilterType::Triangle);
        accent_from_pixels(&small.to_rgb8())
    })
    .await
    .ok()
    .flatten()
}

fn banner_paths(paths: &Paths, instance_id: &str) -> Vec<std::path::PathBuf> {
    let media_dir = paths.root.join("media");
    BANNER_EXTENSIONS
        .iter()
        .map(|ext| media_dir.join(format!("instance-{instance_id}.{ext}")))
        .collect()
}

fn banner_accent_path(paths: &Paths, instance_id: &str) -> std::path::PathBuf {
    paths
        .root
        .join("media")
        .join(format!("instance-{instance_id}.accent"))
}

pub async fn clear_custom_banner(files: &FileManager, instance_id: &str) {
    let paths = files.paths();
    for path in banner_paths(paths, instance_id) {
        let _ = files.remove_file_if_exists_async(path).await;
    }
    let _ = files
        .remove_file_if_exists_async(banner_accent_path(paths, instance_id))
        .await;
}

fn logo_paths(paths: &Paths, instance_id: &str) -> Vec<std::path::PathBuf> {
    let media_dir = paths.root.join("media");
    BANNER_EXTENSIONS
        .iter()
        .map(|ext| media_dir.join(format!("logo-{instance_id}.{ext}")))
        .collect()
}

pub fn instance_logo(files: &FileManager, instance_id: &str) -> Option<String> {
    logo_paths(files.paths(), instance_id)
        .into_iter()
        .find(|candidate| files.is_file(candidate).unwrap_or(false))
        .map(|path| path.display().to_string())
}

/// Builds the same per-instance logo choice as `instance_logo`, but scans the media
/// directory once. This avoids five filesystem metadata probes for every instance during
/// launcher startup while preserving the existing extension-priority semantics.
pub fn instance_logo_index(files: &FileManager) -> std::collections::HashMap<String, String> {
    let media_dir = files.paths().root.join("media");
    let mut selected =
        std::collections::HashMap::<String, (usize, String)>::new();

    for path in files.read_dir(&media_dir).unwrap_or_default() {
        let Some(name) = path.file_name().and_then(|value| value.to_str()) else {
            continue;
        };
        let Some(rest) = name.strip_prefix("logo-") else {
            continue;
        };
        let Some((instance_id, ext)) = rest.rsplit_once('.') else {
            continue;
        };
        let Some(priority) = BANNER_EXTENSIONS
            .iter()
            .position(|candidate| candidate.eq_ignore_ascii_case(ext))
        else {
            continue;
        };
        if !files.metadata(&path).is_ok_and(|metadata| metadata.is_file()) {
            continue;
        }

        let candidate = path.display().to_string();
        match selected.entry(instance_id.to_string()) {
            std::collections::hash_map::Entry::Vacant(entry) => {
                entry.insert((priority, candidate));
            }
            std::collections::hash_map::Entry::Occupied(mut entry)
                if priority < entry.get().0 =>
            {
                entry.insert((priority, candidate));
            }
            std::collections::hash_map::Entry::Occupied(_) => {}
        }
    }

    selected
        .into_iter()
        .map(|(instance_id, (_, path))| (instance_id, path))
        .collect()
}

pub async fn clear_instance_logo(files: &FileManager, instance_id: &str) {
    let paths = files.paths();
    for path in logo_paths(paths, instance_id) {
        let _ = files.remove_file_if_exists_async(path).await;
    }
}

pub async fn write_logo(
    files: &FileManager,
    instance_id: &str,
    ext: &str,
    bytes: &[u8],
) -> crate::error::Result<String> {
    clear_instance_logo(files, instance_id).await;
    let paths = files.paths();
    let media_dir = paths.root.join("media");
    let dest = media_dir.join(format!("logo-{instance_id}.{ext}"));
    files.write_atomic_async(&dest, bytes).await?;
    Ok(dest.display().to_string())
}

pub fn write_instance_logo_sync(
    files: &FileManager,
    instance_id: &str,
    ext: &str,
    bytes: &[u8],
) -> crate::error::Result<String> {
    let paths = files.paths();
    for path in logo_paths(paths, instance_id) {
        let _ = files.remove_file_if_exists(path);
    }
    let dest = paths
        .root
        .join("media")
        .join(format!("logo-{instance_id}.{ext}"));
    files.write_atomic(&dest, bytes)?;
    Ok(dest.display().to_string())
}

pub async fn set_instance_logo(
    files: &FileManager,
    instance_id: &str,
    source: &str,
) -> crate::error::Result<String> {
    use crate::error::Error;

    let source_path = std::path::Path::new(source);
    let ext = source_path
        .extension()
        .and_then(|e| e.to_str())
        .map(|e| e.to_lowercase())
        .unwrap_or_default();
    if !BANNER_EXTENSIONS.contains(&ext.as_str()) {
        return Err(Error::other(format!(
            "Unsupported image type .{ext}. Use png, jpg, webp, or gif."
        )));
    }

    let bytes = files.read_external_async(source_path).await?;
    write_logo(files, instance_id, &ext, &bytes).await
}

pub async fn fetch_instance_logo(
    http: &NetworkManager,
    files: &FileManager,
    instance_id: &str,
    url: &str,
) -> Option<String> {
    let ext = url
        .rsplit('.')
        .next()
        .map(|e| e.split(['?', '#']).next().unwrap_or(e).to_lowercase())
        .filter(|e| BANNER_EXTENSIONS.contains(&e.as_str()))
        .unwrap_or_else(|| "png".to_string());

    let response = http
        .send(http.get(url))
        .await
        .ok()?
        .error_for_status()
        .ok()?;
    let bytes = response.bytes().await.ok()?;
    write_logo(files, instance_id, &ext, &bytes).await.ok()
}

pub async fn media_for(
    client: &NetworkManager,
    files: &FileManager,
    notes: &PatchNotes,
    version_id: &str,
) -> Option<VersionMedia> {
    let entry = notes.entries.iter().find(|e| e.version == version_id)?;
    let image = entry.image.as_ref()?;
    let image_url = format!("{CONTENT_BASE}{}", image.url);
    let accent = accent_for(client, files, version_id, &image_url).await;
    Some(VersionMedia {
        image_url,
        short_text: entry.short_text.clone(),
        accent,
        local: false,
        kind: default_media_kind(),
    })
}


#[cfg(test)]
mod logo_index_tests {
    use super::{instance_logo, instance_logo_index};
    use crate::{files::FileManager, paths::Paths};
    use std::time::Instant;

    #[test]
    fn logo_index_matches_existing_priority_and_reduces_probe_work() {
        let root = std::env::temp_dir().join(format!(
            "enderloom-logo-index-{}",
            uuid::Uuid::new_v4()
        ));
        std::fs::create_dir_all(&root).unwrap();
        let files = FileManager::new(Paths::plain(root.clone())).unwrap();
        let media = root.join("media");
        files.ensure_dir(&media).unwrap();

        files.write_atomic(media.join("logo-alpha.webp"), b"webp").unwrap();
        files.write_atomic(media.join("logo-alpha.png"), b"png").unwrap();
        files.write_atomic(media.join("logo-beta.gif"), b"gif").unwrap();
        files.write_atomic(media.join("logo-ignore.txt"), b"ignore").unwrap();
        files.ensure_dir(media.join("logo-directory.png")).unwrap();

        let index = instance_logo_index(&files);
        for id in ["alpha", "beta", "missing", "directory"] {
            assert_eq!(index.get(id).cloned(), instance_logo(&files, id));
        }
        assert!(
            index["alpha"].ends_with("logo-alpha.png"),
            "the batch path must preserve png-before-webp priority"
        );
        assert!(!index.contains_key("ignore"));
        assert!(!index.contains_key("directory"));

        let ids = (0..360)
            .map(|index| format!("bench-{index:04}"))
            .collect::<Vec<_>>();
        let cycles = 8;

        let legacy_started = Instant::now();
        let mut legacy_hits = 0usize;
        for _ in 0..cycles {
            for id in &ids {
                legacy_hits += instance_logo(&files, id).is_some() as usize;
            }
        }
        let legacy = legacy_started.elapsed();

        let indexed_started = Instant::now();
        let mut indexed_hits = 0usize;
        for _ in 0..cycles {
            let indexed = instance_logo_index(&files);
            for id in &ids {
                indexed_hits += indexed.contains_key(id) as usize;
            }
        }
        let indexed = indexed_started.elapsed();

        assert_eq!(legacy_hits, indexed_hits);
        eprintln!(
            "logo lookup benchmark: probes={legacy:?} index={indexed:?} speedup={:.1}x",
            legacy.as_secs_f64() / indexed.as_secs_f64().max(f64::EPSILON)
        );
        assert!(
            indexed * 3 < legacy,
            "one directory index should be at least 3x faster than repeated missing-file probes: legacy={legacy:?}, indexed={indexed:?}"
        );

        drop(files);
        std::fs::remove_dir_all(root).unwrap();
    }
}
