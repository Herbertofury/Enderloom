use crate::{
    db::{ArtifactIdentity, ContentFile, Db, FileHash, ProjectGraph},
    error::{Error, Result},
    files::FileManager,
    state::AppState,
};
use sha2::{Digest, Sha256, Sha512};
use std::{io::Read, path::Path};

pub fn observe(
    db: &Db,
    files: &FileManager,
    target_kind: &str,
    target_id: &str,
    kind: &str,
    source: &ContentFile,
    path: &Path,
) -> Result<()> {
    let mut file = files.open(path)?;
    let before = file.metadata()?;
    let mut sha256 = Sha256::new();
    let mut sha512 = Sha512::new();
    let mut sha1 = sha1_smol::Sha1::new();
    let mut buffer = [0u8; 65536];
    let mut size = 0u64;
    loop {
        let count = file.read(&mut buffer)?;
        if count == 0 {
            break;
        }
        sha256.update(&buffer[..count]);
        sha512.update(&buffer[..count]);
        sha1.update(&buffer[..count]);
        size += count as u64;
    }
    let after = file.metadata()?;
    let current = files.open(path)?.metadata()?;
    if before.len() != size
        || after.len() != size
        || current.len() != size
        || before.modified()? != after.modified()?
        || current.modified()? != after.modified()?
    {
        return Err(Error::other(
            "File changed while its identity was being measured; verify again after editing stops",
        ));
    }
    let sha256 = format!("{:x}", sha256.finalize());
    let artifact = ArtifactIdentity {
        sha256: sha256.clone(),
        size,
        hashes: vec![
            FileHash {
                algorithm: "sha256".into(),
                value: sha256,
            },
            FileHash {
                algorithm: "sha1".into(),
                value: sha1.digest().to_string(),
            },
            FileHash {
                algorithm: "sha512".into(),
                value: format!("{:x}", sha512.finalize()),
            },
        ],
        evidence_class: "measured".into(),
    };
    db.record_artifact_observation(target_kind, target_id, kind, source, &artifact)
}

pub async fn observe_installed(
    state: &AppState,
    target_kind: &str,
    target_id: &str,
    kind: &str,
    source: &ContentFile,
    path: &Path,
) -> Result<()> {
    let db = state.db.clone();
    let files = state.files.clone();
    let source = source.clone();
    let path = path.to_owned();
    let target_kind = target_kind.to_owned();
    let target_id = target_id.to_owned();
    let kind = kind.to_owned();
    tokio::task::spawn_blocking(move || {
        observe(&db, &files, &target_kind, &target_id, &kind, &source, &path)
    })
    .await
    .map_err(|error| Error::other(error.to_string()))?
}

pub async fn verify_project(
    state: &AppState,
    provider: String,
    project: String,
) -> Result<ProjectGraph> {
    crate::search::Provider::parse(&provider)?;
    let existing = state.db.project_artifact_graph(&provider, &project)?;
    let aliases: Vec<(String, String)> = existing
        .project
        .map(|p| {
            p.aliases
                .into_iter()
                .map(|a| (a.provider, a.project_id))
                .collect()
        })
        .unwrap_or_else(|| vec![(provider.clone(), project.clone())]);
    let mut jobs = Vec::new();
    for instance in state.db.list_instances(&state.files)? {
        for (kind, source) in state.db.all_content_files(&instance.id)? {
            if aliases.iter().any(|(p, id)| {
                source.provider.as_deref() == Some(p) && source.project_id.as_deref() == Some(id)
            }) {
                let dir = state.paths.instance_dir(&instance.id).join(&kind);
                let path = crate::content::resolve_path(&state.files, &dir, &source.file_name);
                jobs.push((instance.id.clone(), kind, source, path));
            }
        }
    }
    let db = state.db.clone();
    let files = state.files.clone();
    tokio::task::spawn_blocking(move || {
        for (target, kind, source, path) in jobs {
            observe(&db, &files, "instance", &target, &kind, &source, &path)?;
        }
        db.project_artifact_graph(&provider, &project)
    })
    .await
    .map_err(|error| Error::other(error.to_string()))?
}

#[derive(serde::Serialize)]
pub struct ProjectSourcePreview {
    pub left: crate::db::ProviderProjectIdentity,
    pub right: crate::db::ProviderProjectIdentity,
    pub matching_file_hashes: Vec<String>,
}

async fn resolve_source(
    state: &AppState,
    provider: &str,
    project: &str,
) -> Result<crate::db::ProviderProjectIdentity> {
    let parsed = crate::search::Provider::parse(provider)?;
    let project = project.trim();
    if project.is_empty()
        || !project
            .bytes()
            .all(|b| b.is_ascii_alphanumeric() || b == b'-' || b == b'_')
    {
        return Err(Error::other(
            "Enter a project ID (or a Modrinth slug), without a URL or extra path.",
        ));
    }
    if provider == "curseforge" && !project.bytes().all(|b| b.is_ascii_digit()) {
        return Err(Error::other(
            "CurseForge needs the numeric Project ID shown on its project page.",
        ));
    }
    let detail = crate::search::project_details(state, parsed, project).await?;
    if detail.id.is_empty() || (provider == "curseforge" && detail.id != project) {
        return Err(Error::other(
            "The provider returned a different project identity.",
        ));
    }
    let source_url = detail
        .website_url
        .ok_or_else(|| Error::other("The provider did not return this project's source page."))?;
    let page = reqwest::Url::parse(&source_url)
        .map_err(|_| Error::other("The provider returned an invalid project page."))?;
    let domain = if provider == "modrinth" {
        "modrinth.com"
    } else {
        "curseforge.com"
    };
    if page.scheme() != "https"
        || !page
            .host_str()
            .is_some_and(|host| host == domain || host == format!("www.{domain}"))
        || !page.username().is_empty()
        || page.password().is_some()
    {
        return Err(Error::other(
            "The source page does not belong to the selected provider.",
        ));
    }
    Ok(crate::db::ProviderProjectIdentity {
        provider: provider.into(),
        project_id: detail.id,
        title: detail.title,
        author: detail.author,
        source_url,
        icon_url: detail.icon_url,
    })
}

pub async fn preview_source_link(
    state: &AppState,
    provider: &str,
    project: &str,
    other_provider: &str,
    other_project: &str,
) -> Result<ProjectSourcePreview> {
    let (left, right) = tokio::try_join!(
        resolve_source(state, provider, project),
        resolve_source(state, other_provider, other_project)
    )?;
    if left.provider == right.provider && left.project_id == right.project_id {
        return Err(Error::other("These are already the same provider project."));
    }
    let first = state
        .db
        .project_artifact_graph(&left.provider, &left.project_id)?;
    let second = state
        .db
        .project_artifact_graph(&right.provider, &right.project_id)?;
    let hashes = |graph: &ProjectGraph| {
        graph
            .releases
            .iter()
            .flat_map(|r| r.artifacts.iter().map(|a| a.sha256.clone()))
            .collect::<std::collections::BTreeSet<_>>()
    };
    let matching_file_hashes = hashes(&first)
        .intersection(&hashes(&second))
        .cloned()
        .collect();
    Ok(ProjectSourcePreview {
        left,
        right,
        matching_file_hashes,
    })
}

pub async fn link_sources(
    state: &AppState,
    provider: &str,
    project: &str,
    other_provider: &str,
    other_project: &str,
    reason: &str,
    confirmed: bool,
) -> Result<ProjectGraph> {
    if !confirmed {
        return Err(Error::other(
            "Confirm that both pages represent the same project before linking them.",
        ));
    }
    if reason.trim().is_empty() {
        return Err(Error::other(
            "Explain why these pages represent the same project.",
        ));
    }
    let preview =
        preview_source_link(state, provider, project, other_provider, other_project).await?;
    state
        .db
        .link_project_sources(&preview.left, &preview.right, reason)?;
    state
        .db
        .project_artifact_graph(&preview.left.provider, &preview.left.project_id)
}
