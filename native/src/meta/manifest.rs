use serde::{Deserialize, Serialize};

use crate::{error::{Error, Result}, files::FileManager, network::NetworkManager};

const MANIFEST_URL: &str = "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LatestVersions {
    pub release: String,
    pub snapshot: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VersionEntry {
    pub id: String,
    #[serde(rename = "type")]
    pub kind: String,
    pub url: String,
    pub time: String,
    #[serde(rename = "releaseTime")]
    pub release_time: String,
    pub sha1: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VersionManifest {
    pub latest: LatestVersions,
    pub versions: Vec<VersionEntry>,
}

pub async fn fetch(client: &NetworkManager, files: &FileManager) -> Result<VersionManifest> {
    let cache = files.paths().manifest_cache();
    let fetched: Result<VersionManifest> = async {
        let response = client.send(client.get(MANIFEST_URL)).await?.error_for_status()?;
        let bytes = response.bytes().await?;
        let manifest = parse(&bytes)?;
        // An error page or malformed feed must never replace the offline copy.
        let _ = files.write_atomic_async(&cache, &bytes).await;
        Ok(manifest)
    }.await;
    match fetched {
        Ok(manifest) => Ok(manifest),
        Err(error) => {
            tracing::warn!(error = %error, "Minecraft version refresh failed; trying the last verified manifest");
            match files.read_async(&cache).await.ok().and_then(|bytes| parse(&bytes).ok()) {
                Some(manifest) => Ok(manifest),
                None => Err(error),
            }
        }
    }
}

fn parse(bytes: &[u8]) -> Result<VersionManifest> {
    let manifest: VersionManifest = serde_json::from_slice(bytes)?;
    if !manifest.versions.iter().any(|version| version.id == manifest.latest.release && version.kind == "release") {
        return Err(Error::other("Minecraft's version feed did not contain its latest release."));
    }
    Ok(manifest)
}
