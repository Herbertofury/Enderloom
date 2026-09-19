//! Read-only, project-bound source evidence. Local configuration scans never wait on GitHub.
use crate::{
    db::ContentFile,
    error::{Error, Result},
    state::AppState,
};
use futures::{stream, StreamExt};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::{
    collections::BTreeMap,
    sync::{Arc, Mutex, OnceLock, Weak},
    time::Duration,
};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Evidence {
    pub path: String,
    pub scope: String,
    pub source_url: String,
    pub repository: String,
    pub revision: String,
    pub reference: String,
    pub version_match: bool,
    pub line: usize,
}
#[derive(Clone, Default, Serialize, Deserialize)]
pub struct Report {
    pub evidence: Vec<Evidence>,
    pub status: String,
    pub message: String,
    pub checked_at: i64,
    pub retry_at: Option<i64>,
}
fn now() -> i64 {
    chrono::Utc::now().timestamp()
}
fn key(source: &ContentFile) -> String {
    format!(
        "config-source:v1:{}",
        serde_json::to_string(&(
            source.provider.as_deref(),
            source.project_id.as_deref(),
            source.mod_id.as_deref(),
            source.mod_version.as_deref(),
            source.sha1.as_deref(),
            source.file_name.as_str()
        ))
        .unwrap()
    )
}
pub fn cached(state: &AppState, source: &ContentFile) -> Option<Report> {
    state
        .db
        .cache_get(&key(source), now())
        .ok()
        .flatten()
        .and_then(|c| serde_json::from_str(&c.body).ok())
}
fn lock(key: &str) -> Arc<tokio::sync::Mutex<()>> {
    static LOCKS: OnceLock<Mutex<BTreeMap<String, Weak<tokio::sync::Mutex<()>>>>> = OnceLock::new();
    let mut locks = LOCKS.get_or_init(Default::default).lock().unwrap();
    locks.retain(|_, v| v.strong_count() > 0);
    if let Some(value) = locks.get(key).and_then(Weak::upgrade) {
        return value;
    }
    let value = Arc::new(tokio::sync::Mutex::new(()));
    locks.insert(key.into(), Arc::downgrade(&value));
    value
}
fn repo(url: &str) -> Option<String> {
    let url = reqwest::Url::parse(url).ok()?;
    if url.scheme() != "https"
        || url.host_str() != Some("github.com")
        || !url.username().is_empty()
        || url.port().is_some()
    {
        return None;
    }
    let parts: Vec<_> = url.path_segments()?.filter(|p| !p.is_empty()).collect();
    if parts.len() < 2
        || parts[..2].iter().any(|p| {
            !p.chars()
                .all(|c| c.is_ascii_alphanumeric() || matches!(c, '-' | '_' | '.'))
                || matches!(*p, "." | "..")
        })
    {
        return None;
    }
    Some(format!(
        "{}/{}",
        parts[0],
        parts[1].trim_end_matches(".git")
    ))
}
fn url(repository: &str, segments: &[&str]) -> String {
    let mut url =
        reqwest::Url::parse(&format!("https://api.github.com/repos/{repository}/")).unwrap();
    url.path_segments_mut()
        .unwrap()
        .pop_if_empty()
        .extend(segments);
    url.to_string()
}
fn cooldown(state: &AppState) -> Option<i64> {
    state
        .db
        .cache_get("config-source:github-cooldown", now())
        .ok()
        .flatten()
        .filter(|c| c.fresh)
        .and_then(|c| c.body.parse().ok())
}
async fn fetch(state: &AppState, url: &str, ttl: i64) -> Result<Option<String>> {
    let cache_key = format!("config-source:http:{url}");
    let guard = lock(&cache_key);
    let _guard = guard.lock().await;
    let cached = state.db.cache_get(&cache_key, now())?;
    if let Some(c) = cached.as_ref().filter(|c| c.fresh) {
        return Ok(Some(c.body.clone()));
    }
    let missing_key = format!("config-source:missing:{url}");
    if state
        .db
        .cache_get(&missing_key, now())?
        .is_some_and(|c| c.fresh)
    {
        return Ok(None);
    }
    if url.starts_with("https://api.github.com/") {
        if let Some(until) = cooldown(state) {
            return Err(Error::other(format!(
                "GitHub requests paused until {until}; local configs remain available."
            )));
        }
    }
    let mut request = state
        .network
        .get(url)
        .timeout(Duration::from_secs(15))
        .header("Accept", "application/vnd.github+json");
    if let Some(etag) = cached.as_ref().and_then(|c| c.etag.as_ref()) {
        request = request.header("If-None-Match", etag);
    }
    let response = state.network.send_once(request).await?;
    let status = response.status();
    let header_number = |name: &str| {
        response
            .headers()
            .get(name)
            .and_then(|v| v.to_str().ok())
            .and_then(|v| v.parse::<i64>().ok())
    };
    if header_number("x-ratelimit-remaining") == Some(0)
        || status.as_u16() == 429
        || status.as_u16() == 403
    {
        let until = header_number("x-ratelimit-reset")
            .unwrap_or(now() + header_number("retry-after").unwrap_or(300))
            .max(now() + 30);
        state.db.cache_put(
            "config-source:github-cooldown",
            &until.to_string(),
            None,
            now(),
            until - now(),
        )?;
    }
    if status.as_u16() == 304 {
        if let Some(c) = cached {
            state.db.cache_touch(&cache_key, now())?;
            return Ok(Some(c.body));
        }
    }
    // GitHub's commit endpoint returns 422 for a nonexistent named ref as well as 404.
    if status.as_u16() == 404
        || (status.as_u16() == 422
            && url.starts_with("https://api.github.com/repos/")
            && url.contains("/commits/refs%2Ftags%2F"))
    {
        state
            .db
            .cache_put(&missing_key, "true", None, now(), 3600)?;
        return Ok(None);
    }
    if !status.is_success() {
        return Err(Error::other(format!("GitHub returned {status}")));
    }
    let etag = response
        .headers()
        .get("etag")
        .and_then(|v| v.to_str().ok())
        .map(str::to_string);
    let body = response.text().await?;
    state
        .db
        .cache_put(&cache_key, &body, etag.as_deref(), now(), ttl)?;
    Ok(Some(body))
}
async fn tree(state: &AppState, repository: &str, reference: &str) -> Result<Option<Value>> {
    let Some(commit) = fetch(state, &url(repository, &["commits", reference]), 86400).await? else {
        return Ok(None);
    };
    let commit: Value = serde_json::from_str(&commit)?;
    let commit_sha = commit["sha"]
        .as_str()
        .ok_or_else(|| Error::other("Missing source commit"))?;
    let address = format!(
        "{}?recursive=1",
        url(repository, &["git", "trees", commit_sha])
    );
    let Some(body) = fetch(state, &address, 86400).await? else {
        return Ok(None);
    };
    let mut tree: Value = serde_json::from_str(&body)?;
    // GitHub truncates large recursive trees. Walk every subtree instead of silently omitting files.
    if tree["truncated"].as_bool() == Some(true) {
        let mut pending = vec![(
            String::new(),
            tree["sha"].as_str().unwrap_or(reference).to_string(),
        )];
        let mut entries = Vec::new();
        while let Some((prefix, sha)) = pending.pop() {
            let body = fetch(state, &url(repository, &["git", "trees", &sha]), 86400)
                .await?
                .ok_or_else(|| Error::other("Source tree disappeared"))?;
            let node: Value = serde_json::from_str(&body)?;
            if node["truncated"].as_bool() == Some(true) {
                return Err(Error::other(
                    "GitHub could not return a complete source subtree",
                ));
            }
            for mut entry in node["tree"].as_array().cloned().unwrap_or_default() {
                let path = format!("{prefix}{}", entry["path"].as_str().unwrap_or_default());
                if entry["type"] == "tree" {
                    pending.push((
                        format!("{path}/"),
                        entry["sha"].as_str().unwrap_or_default().into(),
                    ));
                } else {
                    entry["path"] = json!(path);
                    entries.push(entry);
                }
            }
        }
        tree["tree"] = json!(entries);
        tree["truncated"] = json!(false);
    }
    tree["commit_sha"] = json!(commit_sha);
    Ok(Some(tree))
}
async fn raw(state: &AppState, repository: &str, revision: &str, path: &str) -> Result<String> {
    let mut address =
        reqwest::Url::parse(&format!("https://raw.githubusercontent.com/{repository}/")).unwrap();
    address
        .path_segments_mut()
        .unwrap()
        .pop_if_empty()
        .push(revision)
        .extend(path.split('/'));
    fetch(state, address.as_str(), 86400 * 30)
        .await?
        .ok_or_else(|| Error::other("Source file disappeared"))
}

// A tiny lexer, not a text search: comments and string contents cannot masquerade as calls.
#[derive(Clone)]
struct Token {
    text: String,
    literal: bool,
    line: usize,
}
fn tokens(text: &str) -> Vec<Token> {
    let chars: Vec<_> = text.chars().collect();
    let (mut i, mut line) = (0, 1);
    let mut out = Vec::new();
    while i < chars.len() {
        let c = chars[i];
        if c == '\n' {
            line += 1;
            i += 1;
            continue;
        }
        if c.is_whitespace() {
            i += 1;
            continue;
        }
        if c == '/' && chars.get(i + 1) == Some(&'/') {
            while i < chars.len() && chars[i] != '\n' {
                i += 1
            }
            continue;
        }
        if c == '/' && chars.get(i + 1) == Some(&'*') {
            i += 2;
            while i < chars.len() {
                if chars[i] == '\n' {
                    line += 1
                }
                if chars[i] == '*' && chars.get(i + 1) == Some(&'/') {
                    i += 2;
                    break;
                }
                i += 1
            }
            continue;
        }
        let start = line;
        if c == '"' || c == '\'' {
            let quote = c;
            i += 1;
            let mut value = String::new();
            let mut escaped = false;
            while i < chars.len() {
                let c = chars[i];
                i += 1;
                if c == '\n' {
                    line += 1
                }
                if c == quote && !escaped {
                    break;
                }
                if c == '\\' && !escaped {
                    escaped = true;
                    value.push(c);
                    continue;
                }
                escaped = false;
                value.push(c);
            }
            out.push(Token {
                text: value,
                literal: true,
                line: start,
            });
            continue;
        }
        let mut value = c.to_string();
        i += 1;
        if c.is_ascii_alphanumeric() || c == '_' {
            while i < chars.len() && (chars[i].is_ascii_alphanumeric() || chars[i] == '_') {
                value.push(chars[i]);
                i += 1;
            }
        }
        out.push(Token {
            text: value,
            literal: false,
            line: start,
        });
    }
    out
}
fn config_path(path: &str) -> bool {
    !path.starts_with('/')
        && !path.contains(['\\', ':', '$'])
        && path
            .split('/')
            .all(|p| !p.is_empty() && !matches!(p, "." | ".."))
        && [
            ".toml",
            ".json",
            ".json5",
            ".yaml",
            ".yml",
            ".properties",
            ".cfg",
        ]
        .iter()
        .any(|ext| path.ends_with(ext))
}
fn declarations(text: &str, mod_id: &str) -> Vec<(String, String, usize)> {
    let ts = tokens(text);
    let mut found = Vec::new();
    for (i, t) in ts.iter().enumerate() {
        if t.literal || t.text != "registerConfig" || ts.get(i + 1).is_none_or(|t| t.text != "(") {
            continue;
        }
        let (mut depth, mut args, mut start) = (0, Vec::new(), i + 2);
        for j in i + 2..ts.len() {
            let token = &ts[j];
            if !token.literal {
                if token.text == "(" {
                    depth += 1
                }
                if token.text == ")" {
                    if depth == 0 {
                        args.push(&ts[start..j]);
                        break;
                    }
                    depth -= 1
                }
                if token.text == "," && depth == 0 {
                    args.push(&ts[start..j]);
                    start = j + 1;
                }
            }
        }
        if args.len() != 2 && args.len() != 3 {
            continue;
        }
        let kind: Vec<_> = args[0].iter().map(|t| t.text.as_str()).collect();
        if !kind.windows(3).any(|w| w == ["ModConfig", ".", "Type"]) {
            continue;
        }
        let Some(scope) = kind
            .last()
            .filter(|s| matches!(**s, "CLIENT" | "COMMON" | "SERVER" | "STARTUP"))
        else {
            continue;
        };
        if args.len() == 2 {
            found.push((
                format!("{mod_id}-{}.toml", scope.to_ascii_lowercase()),
                if *scope == "SERVER" {
                    "server"
                } else {
                    "config"
                }
                .into(),
                t.line,
            ));
        } else if args[2].len() == 1 && args[2][0].literal && config_path(&args[2][0].text) {
            found.push((
                args[2][0].text.clone(),
                if *scope == "SERVER" {
                    "server"
                } else {
                    "config"
                }
                .into(),
                args[2][0].line,
            ));
        }
    }
    // Fabric and Forge's explicit config-directory resolve calls. No generic File/resolve matches.
    for i in 0..ts.len() {
        if ts[i].literal || ts[i].text != "resolve" {
            continue;
        }
        if ts.get(i + 1).is_none_or(|t| t.text != "(")
            || ts
                .get(i + 2)
                .is_none_or(|t| !t.literal || !config_path(&t.text))
            || ts.get(i + 3).is_none_or(|t| t.text != ")")
        {
            continue;
        }
        let prefix: Vec<_> = ts[i.saturating_sub(8)..i]
            .iter()
            .filter(|t| !t.literal)
            .map(|t| t.text.as_str())
            .collect();
        if prefix.ends_with(&["getConfigDir", "(", ")", "."])
            || prefix.ends_with(&["FMLPaths", ".", "CONFIGDIR", ".", "get", "(", ")", "."])
        {
            found.push((ts[i + 2].text.clone(), "config".into(), ts[i + 2].line));
        }
    }
    found.sort();
    found.dedup();
    found
}
fn production(path: &str) -> bool {
    !path.split('/').any(|p| {
        matches!(
            p,
            "test" | "tests" | "testmod" | "examples" | "example" | "samples" | "docs" | "build"
        )
    })
}
fn manifest_ids(path: &str, text: &str) -> Vec<(String, String)> {
    if path.ends_with("fabric.mod.json") {
        return serde_json::from_str::<Value>(text)
            .ok()
            .into_iter()
            .filter_map(|v| {
                Some((
                    v["id"].as_str()?.into(),
                    v["version"].as_str().unwrap_or_default().into(),
                ))
            })
            .collect();
    }
    let Ok(v) = toml::from_str::<toml::Value>(text) else {
        return vec![];
    };
    v.get("mods")
        .and_then(|v| v.as_array())
        .into_iter()
        .flatten()
        .filter_map(|m| {
            Some((
                m.get("modId")?.as_str()?.into(),
                m.get("version")
                    .and_then(|v| v.as_str())
                    .unwrap_or_default()
                    .into(),
            ))
        })
        .collect()
}
async fn inspect(
    state: &AppState,
    source: &ContentFile,
    source_url: &str,
    installed_manifests: &[String],
) -> Result<Report> {
    let repository = repo(source_url).ok_or_else(|| {
        Error::other("No supported GitHub source repository is linked by this project.")
    })?;
    let version = source.mod_version.as_deref().unwrap_or_default();
    let id = source.mod_id.as_deref().unwrap_or_default();
    if id.is_empty() {
        return Err(Error::other("Installed mod ID is not available yet."));
    }
    // Exact release tags first; a default-branch match is explicitly only a suggestion.
    let mut selected = None;
    if !version.is_empty() && !version.contains(['$', '/', '\\']) {
        for tag in [version.to_string(), format!("v{version}")] {
            if let Some(value) = tree(state, &repository, &format!("refs/tags/{tag}")).await? {
                selected = Some((tag, value, true));
                break;
            }
        }
    }
    let (reference, tree, tag_match) = match selected {
        Some(v) => v,
        None => (
            "HEAD".into(),
            tree(state, &repository, "HEAD")
                .await?
                .ok_or_else(|| Error::other("Repository source is unavailable"))?,
            false,
        ),
    };
    let revision = tree["commit_sha"]
        .as_str()
        .ok_or_else(|| Error::other("Missing immutable source revision"))?
        .to_string();
    let files: Vec<String> = tree["tree"]
        .as_array()
        .into_iter()
        .flatten()
        .filter(|e| e["type"] == "blob")
        .filter_map(|e| e["path"].as_str().map(str::to_string))
        .filter(|p| production(p))
        .collect();
    let manifests: Vec<_> = files
        .iter()
        .filter(|p| {
            p.ends_with("/fabric.mod.json")
                || p.ends_with("/META-INF/mods.toml")
                || p.ends_with("/META-INF/neoforge.mods.toml")
                || p.as_str() == "fabric.mod.json"
        })
        .filter(|p| {
            installed_manifests
                .iter()
                .any(|name| p.ends_with(&format!("/{name}")) || p.as_str() == name)
        })
        .cloned()
        .collect();
    let mut modules = Vec::new();
    for path in manifests {
        let mut body = raw(state, &repository, &revision, &path).await?;
        let prefix = path.split("src/main/").next().unwrap_or_default();
        if body.contains("${") {
            // Resolve literal Gradle identity/version properties; never execute build scripts.
            let properties = [
                "gradle.properties".to_string(),
                format!("{prefix}gradle.properties"),
            ];
            for property_path in properties
                .into_iter()
                .collect::<std::collections::BTreeSet<_>>()
            {
                if !files.contains(&property_path) {
                    continue;
                }
                let properties = raw(state, &repository, &revision, &property_path).await?;
                for line in properties
                    .lines()
                    .filter(|line| !line.trim_start().starts_with(['#', '!']))
                {
                    if let Some((key, value)) = line.split_once('=') {
                        let (key, value) = (key.trim(), value.trim());
                        if matches!(key, "mod_id" | "mod_version" | "version")
                            && value.chars().all(|c| {
                                c.is_ascii_alphanumeric() || matches!(c, '_' | '-' | '.' | '+')
                            })
                        {
                            body = body.replace(&format!("${{{key}}}"), value);
                        }
                    }
                }
            }
        }
        let ids = manifest_ids(&path, &body);
        // Multi-mod modules require symbol-level attribution; do not guess across sibling mods.
        if ids.len() == 1 && ids[0].0 == id {
            if !path.contains("src/main/") {
                continue;
            }
            modules.push((
                prefix.to_string(),
                tag_match
                    && ((!version.is_empty() && ids[0].1 == version)
                        || ids[0].1.is_empty()
                        || ids[0].1.contains('$')),
            ));
        }
    }
    if modules.is_empty() {
        return Ok(Report{status:"unverified".into(),message:"Repository found, but its production manifest could not be bound to this installed mod. Existing ownership was kept.".into(),checked_at:now(),..Default::default()});
    }
    let normalized = |value: &str| {
        value
            .to_ascii_lowercase()
            .chars()
            .filter(char::is_ascii_alphanumeric)
            .collect::<String>()
    };
    let source_files: Vec<_> = files
        .iter()
        .filter(|p| p.ends_with(".java") || p.ends_with(".kt"))
        .filter(|p| p.contains("/src/main/") || p.starts_with("src/main/"))
        .filter(|p| {
            modules
                .iter()
                .any(|(prefix, _)| p.starts_with(&format!("{prefix}src/main/")))
        })
        .filter(|p| {
            let name = p
                .rsplit('/')
                .next()
                .unwrap_or_default()
                .rsplit_once('.')
                .map(|v| v.0)
                .unwrap_or_default();
            p.to_ascii_lowercase().contains("config")
                || name.ends_with("Mod")
                || normalized(name) == normalized(id)
                || normalized(name) == normalized(source.title.as_deref().unwrap_or_default())
        })
        .cloned()
        .collect();
    let results = stream::iter(source_files.into_iter().map(|path| {
        let repository = &repository;
        let revision = &revision;
        async move {
            let body = raw(state, repository, revision, &path).await?;
            Ok::<_, Error>((path, declarations(&body, id)))
        }
    }))
    .buffer_unordered(3)
    .collect::<Vec<_>>()
    .await;
    let mut evidence = Vec::new();
    for result in results {
        let (path, declarations) = result?;
        let version_match = modules
            .iter()
            .any(|(prefix, exact)| *exact && path.starts_with(&format!("{prefix}src/main/")));
        for (config, scope, line) in declarations {
            evidence.push(Evidence {
                path: config,
                scope,
                source_url: format!(
                    "https://github.com/{repository}/blob/{revision}/{path}#L{line}"
                ),
                repository: repository.clone(),
                revision: revision.clone(),
                reference: reference.clone(),
                version_match,
                line,
            });
        }
    }
    evidence.sort_by(|a, b| {
        (&a.path, &a.scope, &a.source_url).cmp(&(&b.path, &b.scope, &b.source_url))
    });
    evidence.dedup_by(|a, b| a.path == b.path && a.scope == b.scope);
    let message = if evidence.is_empty() {
        "No supported explicit registrations were found in config and mod entry classes. Existing ownership was kept."
    } else {
        "Explicit filenames found in config and mod entry classes. Dynamic registrations and other classes may require a manual assignment."
    };
    Ok(Report {
        evidence,
        status: "checked".into(),
        message: message.into(),
        checked_at: now(),
        ..Default::default()
    })
}
pub async fn discover(state: &AppState, id: &str, file_name: &str) -> Result<Report> {
    let root = std::path::PathBuf::from(crate::commands::find_instance(state, id)?.dir);
    if file_name.contains(['/', '\\']) || !file_name.trim_end_matches(".disabled").ends_with(".jar")
    {
        return Err(Error::other("Choose an installed mod JAR"));
    }
    let mut source = state
        .db
        .content_file(id, "mods", file_name.trim_end_matches(".disabled"))?
        .ok_or_else(|| Error::other("Mod has no indexed provider identity yet"))?;
    let mut path = crate::workbench::target(&root, &format!("mods/{file_name}"))?;
    if !state.files.is_file(&path)? {
        path = crate::workbench::target(&root, &format!("mods/{file_name}.disabled"))?;
    }
    if !state.files.is_file(&path)? {
        return Err(Error::other("Mod is no longer installed"));
    }
    if let Some((id, version, _)) = crate::search::identify::cached_metadata(&state.files, &path) {
        source.mod_id = id.or(source.mod_id);
        source.mod_version = version.or(source.mod_version);
    }
    let archive =
        zip::ZipArchive::new(state.files.open(&path)?).map_err(|e| Error::other(e.to_string()))?;
    let installed_manifests: Vec<String> = archive
        .file_names()
        .filter(|name| {
            matches!(
                *name,
                "fabric.mod.json" | "META-INF/mods.toml" | "META-INF/neoforge.mods.toml"
            )
        })
        .map(str::to_string)
        .collect();
    let cache_key = key(&source);
    let guard = lock(&cache_key);
    let _guard = guard.lock().await;
    if let Some(c) = state.db.cache_get(&cache_key, now())?.filter(|c| c.fresh) {
        if let Ok(report) = serde_json::from_str(&c.body) {
            return Ok(report);
        }
    }
    static SLOTS: OnceLock<tokio::sync::Semaphore> = OnceLock::new();
    let _slot = SLOTS
        .get_or_init(|| tokio::sync::Semaphore::new(3))
        .acquire()
        .await
        .unwrap();
    let result:Result<Report>=tokio::time::timeout(Duration::from_secs(75),async{
        if let Some(until)=cooldown(state){return Ok(Report{status:"deferred".into(),message:"GitHub's request allowance is resting. Local configs and cached associations remain available.".into(),retry_at:Some(until),checked_at:now(),..Default::default()})}
        let provider=crate::search::Provider::parse(source.provider.as_deref().unwrap_or_default())?;
        let project=source.project_id.as_deref().ok_or_else(||Error::other("This mod has no verified provider project yet."))?;
        let detail=crate::search::project_details(state,provider,project).await?;
        let source_url=detail.links.iter().find(|link|link.label=="View source"&&repo(&link.url).is_some()).map(|l|l.url.as_str()).ok_or_else(||Error::other("The project does not link a supported GitHub source repository."))?;
        tokio::time::timeout(Duration::from_secs(60),inspect(state,&source,source_url,&installed_manifests)).await.map_err(|_|Error::other("Source check paused after a slow repository response; cached files will be reused on retry."))?
    }).await.unwrap_or_else(|_|Err(Error::other("Source lookup timed out; cached ownership remains available.")));
    let report = result.unwrap_or_else(|e| Report {
        status: if cooldown(state).is_some() {
            "deferred"
        } else {
            "unavailable"
        }
        .into(),
        message: e.to_string(),
        checked_at: now(),
        retry_at: cooldown(state),
        ..Default::default()
    });
    // Failed refreshes must not erase previously established immutable source evidence.
    let mut report = report;
    if report.status == "unavailable" || report.status == "deferred" {
        if let Some(previous) = cached(state, &source) {
            report.evidence = previous.evidence;
        }
    }
    let ttl = if report.status == "checked" || report.status == "unverified" {
        86400
    } else {
        report
            .retry_at
            .map(|at| (at - now()).max(30))
            .unwrap_or(3600)
    };
    state.db.cache_put(
        &cache_key,
        &serde_json::to_string(&report)?,
        None,
        now(),
        ttl,
    )?;
    Ok(report)
}

pub fn resolve(state: &AppState, id: &str, paths: &[String]) -> Result<Value> {
    let root = std::path::PathBuf::from(crate::commands::find_instance(state, id)?.dir);
    let sources = state.db.content_files(id, "mods")?;
    let installed = crate::workbench::installed_mod_sources(state, &root, &sources, false)?;
    let owners = crate::config_ownership::ConfigOwners::with_sources(state, &installed);
    let prefs = crate::creative::library(state)?["preferences"].clone();
    Ok(json!(paths.iter().map(|path|(path,json!({"owner":owners.associate(path,prefs[format!("config-owner:{id}:{path}")].as_str()),"automatic_owner":owners.associate(path,None)}))).collect::<BTreeMap<_,_>>()))
}
