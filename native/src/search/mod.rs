pub mod cache;
pub mod curseforge;
pub mod identify;
pub mod model;
pub mod modrinth;
pub mod resolve;
pub mod updates;

pub use model::*;

use crate::{
    error::{Error, Result},
    state::AppState,
};

pub async fn search(
    state: &AppState,
    provider: Provider,
    kind: ContentKind,
    query: &SearchQuery,
) -> Result<SearchPage> {
    match provider {
        Provider::Modrinth => modrinth::search(state, kind, query).await,
        Provider::Curseforge => curseforge::search(state, kind, query).await,
    }
}

pub async fn project_details(
    state: &AppState,
    provider: Provider,
    project_id: &str,
) -> Result<ProjectDetails> {
    match provider {
        Provider::Modrinth => modrinth::project_details(state, project_id).await,
        Provider::Curseforge => curseforge::project_details(state, project_id).await,
    }
}

fn identity_key(value: &str) -> String {
    value
        .chars()
        .filter(|ch| ch.is_ascii_alphanumeric())
        .flat_map(char::to_lowercase)
        .collect()
}

fn title_tokens(value: &str) -> Vec<String> {
    value
        .split(|ch: char| !ch.is_ascii_alphanumeric())
        .filter(|part| !part.is_empty())
        .map(str::to_lowercase)
        .collect()
}

fn title_similarity(left: &str, right: &str) -> u8 {
    let left_key = identity_key(left);
    let right_key = identity_key(right);
    if left_key.is_empty() || right_key.is_empty() {
        return 0;
    }
    if left_key == right_key {
        return 100;
    }

    let left_tokens = title_tokens(left);
    let right_tokens = title_tokens(right);
    if left_tokens.is_empty() || right_tokens.is_empty() {
        return 0;
    }

    let shorter = left_tokens.len().min(right_tokens.len());
    if left_tokens[0] == right_tokens[0]
        && left_tokens
            .iter()
            .zip(right_tokens.iter())
            .take(shorter)
            .all(|(a, b)| a == b)
    {
        return if shorter == 1 { 80 } else { 90 };
    }

    let common = left_tokens
        .iter()
        .filter(|token| right_tokens.contains(token))
        .count();
    ((common * 100) / left_tokens.len().max(right_tokens.len())) as u8
}

fn short_identity_query(title: &str) -> Option<String> {
    title_tokens(title)
        .into_iter()
        .find(|token| token.len() >= 4)
}

fn normalized_source(details: &ProjectDetails) -> Option<String> {
    let source = details
        .links
        .iter()
        .find(|link| link.label.eq_ignore_ascii_case("View source"))?
        .url
        .trim()
        .trim_end_matches('/')
        .trim_end_matches(".git")
        .to_ascii_lowercase()
        .replace("https://", "")
        .replace("http://", "");
    (!source.is_empty()).then_some(source)
}

fn mirror_confidence(
    current_title: &str,
    current_author: &str,
    candidate_title: &str,
    candidate_author: &str,
) -> u8 {
    let title_score = title_similarity(current_title, candidate_title);
    let current_author = identity_key(current_author);
    let candidate_author = identity_key(candidate_author);
    let same_author = !current_author.is_empty()
        && !candidate_author.is_empty()
        && current_author == candidate_author;

    if same_author && title_score >= 75 {
        95
    } else if same_author && title_score >= 55 {
        88
    } else {
        0
    }
}

pub async fn project_mirrors(
    state: &AppState,
    provider: Provider,
    project_id: &str,
    kind: ContentKind,
) -> Result<Vec<ProjectMirror>> {
    let mapping_key = format!(
        "provider-map:{}:{}:{}",
        kind.as_str(),
        provider.as_str(),
        project_id
    );
    if let Some(cached) = cache::local_json::<Vec<ProjectMirror>>(state, &mapping_key) {
        return Ok(cached);
    }

    let current = project_details(state, provider, project_id).await?;
    let other = match provider {
        Provider::Modrinth => Provider::Curseforge,
        Provider::Curseforge => Provider::Modrinth,
    };
    let mut queries = vec![current.title.clone()];
    if let Some(short) = short_identity_query(&current.title) {
        if identity_key(&short) != identity_key(&current.title) {
            queries.push(short);
        }
    }

    let searches = queries.into_iter().map(|query_text| async move {
        let query = SearchQuery {
            query: query_text,
            limit: 50,
            ..SearchQuery::default()
        };
        search(state, other, kind, &query).await
    });

    let search_results = futures::future::join_all(searches).await;
    let successful_searches = search_results.iter().filter(|result| result.is_ok()).count();
    if successful_searches == 0 {
        return Err(Error::other(format!(
            "Could not resolve the {} mirror for this project yet.",
            other.as_str()
        )));
    }

    let mut candidates = std::collections::HashMap::<String, ProjectSummary>::new();
    for page in search_results.into_iter().flatten() {
        for candidate in page.hits {
            candidates.entry(candidate.id.clone()).or_insert(candidate);
        }
    }

    let current_source = normalized_source(&current);
    let mut mirrors = Vec::new();
    let mut source_checks = Vec::new();

    for candidate in candidates.into_values() {
        let confidence = mirror_confidence(
            &current.title,
            &current.author,
            &candidate.title,
            &candidate.author,
        );

        if confidence > 0 {
            mirrors.push(ProjectMirror {
                provider: other.as_str().to_string(),
                project: candidate,
                confidence,
            });
            continue;
        }

        if current_source.is_some() && title_similarity(&current.title, &candidate.title) >= 55 {
            source_checks.push(candidate);
        }
    }

    if let Some(current_source) = current_source {
        let checks = source_checks.into_iter().map(|candidate| {
            let current_source = current_source.clone();
            async move {
                let details = project_details(state, other, &candidate.id).await.ok()?;
                (normalized_source(&details).as_deref() == Some(current_source.as_str())).then_some(
                    ProjectMirror {
                        provider: other.as_str().to_string(),
                        project: candidate,
                        confidence: 100,
                    },
                )
            }
        });
        mirrors.extend(
            futures::future::join_all(checks)
                .await
                .into_iter()
                .flatten(),
        );
    }

    mirrors.sort_by(|a, b| {
        b.confidence
            .cmp(&a.confidence)
            .then_with(|| b.project.downloads.cmp(&a.project.downloads))
    });

    let ttl = if mirrors.is_empty() {
        cache::TTL_PROVIDER_MAP_MISS
    } else {
        cache::TTL_PROVIDER_MAP
    };
    if let Err(error) = cache::put_local_json(state, &mapping_key, ttl, &mirrors) {
        tracing::warn!(%error, "could not persist provider mirror mapping");
    }
    Ok(mirrors)
}

pub async fn project_versions(
    state: &AppState,
    provider: Provider,
    project_id: &str,
    kind: ContentKind,
    game_version: &str,
    loader: Option<&str>,
) -> Result<Vec<ProjectVersion>> {
    let mut versions = match provider {
        Provider::Modrinth => {
            modrinth::project_versions(state, project_id, kind, game_version, loader).await?
        }
        Provider::Curseforge => {
            curseforge::project_versions(state, project_id, kind, game_version, loader).await?
        }
    };
    versions.sort_by(|a, b| b.date.cmp(&a.date));
    Ok(versions)
}

pub async fn resolve_projects(
    state: &AppState,
    provider: Provider,
    ids: &[String],
) -> Result<Vec<ProjectSummary>> {
    match provider {
        Provider::Modrinth => modrinth::resolve_projects(state, ids).await,
        Provider::Curseforge => curseforge::resolve_projects(state, ids).await,
    }
}

pub async fn version_changelog(
    state: &AppState,
    provider: Provider,
    project_id: &str,
    version_id: &str,
) -> Result<Changelog> {
    match provider {
        Provider::Modrinth => modrinth::changelog(state, version_id).await,
        Provider::Curseforge => curseforge::changelog(state, project_id, version_id).await,
    }
}

pub async fn taxonomy(
    state: &AppState,
    provider: Provider,
    kind: ContentKind,
    include_snapshots: bool,
) -> Result<FilterTaxonomy> {
    match provider {
        Provider::Modrinth => modrinth::taxonomy(state, kind, include_snapshots).await,
        Provider::Curseforge => curseforge::taxonomy(state, kind).await,
    }
}

fn channel_rank(channel: &str) -> u8 {
    match channel {
        "release" => 0,
        "beta" => 1,
        _ => 2,
    }
}

pub fn pick_best(versions: Vec<ProjectVersion>) -> Option<ProjectVersion> {
    let mut compatible: Vec<ProjectVersion> =
        versions.into_iter().filter(|v| v.compatible).collect();
    compatible.sort_by(|a, b| {
        channel_rank(&a.channel)
            .cmp(&channel_rank(&b.channel))
            .then(b.date.cmp(&a.date))
    });
    compatible.into_iter().next()
}

pub async fn fetch_version(
    state: &AppState,
    provider: Provider,
    project_id: &str,
    kind: ContentKind,
    game_version: &str,
    loader: Option<&str>,
    version_id: Option<&str>,
) -> Result<ProjectVersion> {
    match (provider, version_id) {
        (Provider::Modrinth, Some(id)) => {
            let raw = modrinth::version(state, id).await?;
            Ok(modrinth::to_version(raw, game_version, loader, kind))
        }
        (Provider::Curseforge, Some(id)) => {
            let file = curseforge::version(state, project_id, id).await?;
            Ok(curseforge::to_version(
                file,
                project_id,
                game_version,
                loader,
                kind,
            ))
        }
        (provider, None) => {
            let versions =
                project_versions(state, provider, project_id, kind, game_version, loader).await?;
            pick_best(versions).ok_or_else(|| {
                Error::other(format!(
                    "No version of this project supports {game_version}{}.",
                    loader.map(|l| format!(" with {l}")).unwrap_or_default()
                ))
            })
        }
    }
}

pub fn download_url(version: &ProjectVersion) -> Result<(String, VersionFile)> {
    let file = version
        .primary_file()
        .ok_or_else(|| Error::other("This version has no downloadable file."))?;
    let url = file.url.clone().ok_or_else(|| {
        Error::other(format!(
            "{} cannot be downloaded automatically. The author disabled third-party downloads, so it has to be fetched from the project page.",
            file.file_name
        ))
    })?;
    Ok((url, file.clone()))
}

#[cfg(test)]
mod tests {
    use super::{mirror_confidence, pick_best, title_similarity, ProjectVersion};

    fn version(id: &str, channel: &str, date: &str, compatible: bool) -> ProjectVersion {
        ProjectVersion {
            server_pack_file_id: None,
            id: id.into(),
            project_id: "p".into(),
            name: id.into(),
            version_number: id.into(),
            channel: channel.into(),
            date: date.into(),
            downloads: 0,
            file_name: "a.jar".into(),
            size: None,
            game_versions: vec!["1.21".into()],
            loaders: vec!["fabric".into()],
            compatible,
            changelog: None,
            dependencies: Vec::new(),
            files: Vec::new(),
        }
    }

    #[test]
    fn provider_title_matching_handles_subtitle_drift() {
        assert_eq!(
            title_similarity("Punchy! - First person animations", "Punchy!"),
            80
        );
        assert_eq!(title_similarity("Grimoire of Gaia", "Grimoire of Gaia"), 100);
        assert!(title_similarity("Sodium", "Completely Different Mod") < 50);
        assert_eq!(
            mirror_confidence(
                "Punchy! - First person animations",
                "DevPunchyMan",
                "Punchy!",
                "DevPunchyMan",
            ),
            95
        );
        assert_eq!(
            mirror_confidence("Example Mod", "Alice", "Example Mod", "Bob"),
            0
        );
    }

    #[test]
    fn prefers_newest_release_over_newer_beta() {
        let picked = pick_best(vec![
            version("beta", "beta", "2026-07-20T00:00:00Z", true),
            version("old", "release", "2026-01-01T00:00:00Z", true),
            version("new", "release", "2026-07-01T00:00:00Z", true),
        ]);
        assert_eq!(picked.unwrap().id, "new");
    }

    #[test]
    fn skips_incompatible_versions() {
        let picked = pick_best(vec![
            version("bad", "release", "2026-07-20T00:00:00Z", false),
            version("good", "beta", "2026-01-01T00:00:00Z", true),
        ]);
        assert_eq!(picked.unwrap().id, "good");
    }

    #[test]
    fn returns_nothing_when_all_incompatible() {
        assert!(pick_best(vec![version(
            "bad",
            "release",
            "2026-07-20T00:00:00Z",
            false
        )])
        .is_none());
    }
}
