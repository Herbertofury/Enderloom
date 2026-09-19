//! One ownership projection for Config, project relationships and machine clients.
//! Names are hints, never evidence of provider identity or saved world content.
use crate::db::ContentFile;
use serde::Serialize;
use std::collections::{BTreeMap, BTreeSet};

#[derive(Clone, Debug, Serialize)]
pub struct ConfigOwner {
    pub id: String,
    pub title: String,
    pub reason: String,
    pub confidence: String,
    pub file_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub evidence: Option<crate::config_sources::Evidence>,
}
fn normalized(value: &str) -> String {
    value
        .to_ascii_lowercase()
        .chars()
        .filter(char::is_ascii_alphanumeric)
        .collect()
}
fn identity(mod_file: &ContentFile) -> &str {
    mod_file
        .mod_id
        .as_deref()
        .filter(|id| !id.is_empty())
        .unwrap_or(&mod_file.file_name)
}
fn owned(mod_file: &ContentFile, reason: &str, confidence: &str) -> ConfigOwner {
    ConfigOwner {
        id: identity(mod_file).into(),
        title: mod_file
            .title
            .as_deref()
            .filter(|s| !s.is_empty())
            .unwrap_or(identity(mod_file))
            .into(),
        reason: reason.into(),
        confidence: confidence.into(),
        file_name: Some(mod_file.file_name.clone()),
        evidence: None,
    }
}
pub struct ConfigOwners {
    mods: Vec<ContentFile>,
    names: BTreeMap<String, BTreeSet<usize>>,
    evidence: BTreeMap<String, Vec<(usize, crate::config_sources::Evidence)>>,
}
impl ConfigOwners {
    pub fn new(items: &[(ContentFile, bool)]) -> Self {
        let mut unique = BTreeMap::<String, (ContentFile, bool)>::new();
        for (source, enabled) in items {
            let id = identity(source).to_string();
            if unique
                .get(&id)
                .is_none_or(|(_, old_enabled)| !old_enabled && *enabled)
            {
                unique.insert(id, (source.clone(), *enabled));
            }
        }
        let mods: Vec<_> = unique.into_values().map(|(source, _)| source).collect();
        let mut names: BTreeMap<String, BTreeSet<usize>> = BTreeMap::new();
        for (index, source) in mods.iter().enumerate() {
            for name in [source.mod_id.as_deref(), source.title.as_deref()]
                .into_iter()
                .flatten()
            {
                let key = normalized(name);
                if !key.is_empty() {
                    names.entry(key).or_default().insert(index);
                }
            }
        }
        Self {
            mods,
            names,
            evidence: BTreeMap::new(),
        }
    }
    pub fn with_sources(state: &crate::state::AppState, items: &[(ContentFile, bool)]) -> Self {
        let mut owners = Self::new(items);
        for (index, source) in owners.mods.iter().enumerate() {
            if let Some(report) = crate::config_sources::cached(state, source) {
                for evidence in report.evidence {
                    owners
                        .evidence
                        .entry(format!(
                            "{}:{}",
                            evidence.scope,
                            evidence.path.to_lowercase()
                        ))
                        .or_default()
                        .push((index, evidence));
                }
            }
        }
        owners
    }
    pub fn associate(&self, path: &str, override_id: Option<&str>) -> ConfigOwner {
        if let Some(id) = override_id.filter(|s| !s.is_empty() && *s != "auto") {
            if id == "unassigned" {
                return ConfigOwner {
                    id: id.into(),
                    title: "Unassigned & shared".into(),
                    reason: "You marked this file as shared or unassigned.".into(),
                    confidence: "manual".into(),
                    file_name: None,
                    evidence: None,
                };
            }
            return self
                .mods
                .iter()
                .find(|m| identity(m) == id)
                .map(|m| owned(m, "Assigned by you.", "manual"))
                .unwrap_or_else(|| ConfigOwner {
                    id: id.into(),
                    title: id.into(),
                    reason: "Your assigned mod is no longer installed.".into(),
                    confidence: "manual".into(),
                    file_name: None,
                    evidence: None,
                });
        }
        let lower = path.to_lowercase();
        let path = lower.strip_suffix(".disabled").unwrap_or(&lower);
        if path == "options.txt" {
            return ConfigOwner {
                id: "minecraft".into(),
                title: "Minecraft".into(),
                reason: "Minecraft’s global client settings file.".into(),
                confidence: "matched".into(),
                file_name: None,
                evidence: None,
            };
        }
        if let Some(source) = self.mods.iter().find(|m| {
            path.starts_with("mods/")
                && path
                    == format!(
                        "mods/{}",
                        m.file_name.to_lowercase().trim_end_matches(".disabled")
                    )
        }) {
            return owned(source, "The installed mod file itself.", "matched");
        }
        let mut parts: Vec<_> = path.split('/').collect();
        if parts.len() >= 4 && parts[0] == "saves" && parts[2] == "serverconfig" {
            parts.drain(..3);
        }
        let (scope, relative) = if lower.starts_with("config/") {
            (
                "config",
                parts.iter().skip(1).copied().collect::<Vec<_>>().join("/"),
            )
        } else if lower.starts_with("defaultconfigs/") || lower.starts_with("serverconfig/") {
            (
                "server",
                parts.iter().skip(1).copied().collect::<Vec<_>>().join("/"),
            )
        } else if lower.starts_with("saves/") && lower.split('/').nth(2) == Some("serverconfig") {
            ("server", parts.join("/"))
        } else {
            ("", String::new())
        };
        let mut suggested_source = None;
        if let Some(matches) = self.evidence.get(&format!("{scope}:{relative}")) {
            let ids: BTreeSet<_> = matches.iter().map(|(index, _)| *index).collect();
            if ids.len() == 1 {
                let (index, evidence) =
                    matches.iter().max_by_key(|(_, e)| e.version_match).unwrap();
                let mut owner = owned(
                    &self.mods[*index],
                    &format!(
                        "Explicit config registration in {} at {}. {}",
                        evidence.repository,
                        evidence.reference,
                        if evidence.version_match {
                            "Source release matches the installed mod version."
                        } else {
                            "Source version is unverified; this is a suggestion."
                        }
                    ),
                    if evidence.version_match {
                        "matched"
                    } else {
                        "suggested"
                    },
                );
                owner.evidence = Some(evidence.clone());
                if evidence.version_match {
                    return owner;
                }
                suggested_source = Some(owner);
            } else {
                return ConfigOwner{id:"unassigned".into(),title:"Unassigned & shared".into(),reason:"Multiple installed mods explicitly register this config path. Choose an owner or keep it shared.".into(),confidence:"unassigned".into(),file_name:None,evidence:None};
            }
        }
        let file = parts.pop().unwrap_or_default();
        let stem = file.rsplit_once('.').map_or(file, |(stem, _)| stem);
        let boundary = stem
            .char_indices()
            .find(|(index, c)| {
                matches!(c, '-' | '_' | '.')
                    && matches!(
                        stem[index + 1..].split(['-', '_', '.']).next(),
                        Some("client" | "common" | "server" | "config" | "settings" | "options")
                    )
            })
            .map(|(index, _)| index);
        let simple = &stem[..boundary.unwrap_or(stem.len())];
        let mut names: Vec<_> = parts
            .into_iter()
            .filter(|p| !matches!(*p, "config" | "defaultconfigs" | "saves" | "serverconfig"))
            .collect();
        names.extend([simple, stem]);
        let conventions: &[(&str, &[&str])] = &[
            ("tacz", &["tacz"]),
            ("pointblank", &["pointblank", "vicspointblank"]),
            ("kubejs", &["kubejs"]),
            ("scripts", &["crafttweaker"]),
            ("optionsof", &["optifine"]),
            ("optionsshaders", &["optifine"]),
        ];
        let keys: BTreeSet<_> = names.iter().map(|name| normalized(name)).collect();
        let conventional: BTreeSet<_> = conventions
            .iter()
            .filter(|(folder, _)| names.contains(folder))
            .flat_map(|(_, ids)| ids.iter().copied())
            .collect();
        let candidates: BTreeSet<_> = keys
            .iter()
            .map(String::as_str)
            .chain(conventional.iter().copied())
            .flat_map(|key| self.names.get(key).into_iter().flatten().copied())
            .collect();
        let mut scored = Vec::new();
        for index in candidates {
            let source = &self.mods[index];
            let id = normalized(source.mod_id.as_deref().unwrap_or_default());
            let title = normalized(source.title.as_deref().unwrap_or_default());
            let score = if !id.is_empty() && keys.contains(&id) {
                3
            } else if conventional.contains(id.as_str()) {
                2
            } else if title.len() > 3 && keys.contains(&title) {
                1
            } else {
                0
            };
            if score > 0 {
                scored.push((score, index));
            }
        }
        scored.sort_by(|a, b| b.0.cmp(&a.0));
        if let Some(&(score, index)) = scored
            .first()
            .filter(|(score, _)| scored.len() == 1 || *score > scored[1].0)
        {
            let scope = if path.starts_with("defaultconfigs/")
                || path.starts_with("serverconfig/")
                || path.contains("/serverconfig/")
            {
                "Server settings"
            } else if stem.split(['-', '_', '.']).any(|p| p == "client") {
                "Client settings"
            } else {
                "Config"
            };
            let basis = match score {
                3 => "filename or folder matches installed mod ID",
                2 => "known mod folder convention",
                _ => "filename or folder matches project title",
            };
            let mut owner = owned(
                &self.mods[index],
                &format!("{scope} · {basis}."),
                if score == 1 { "suggested" } else { "matched" },
            );
            if let Some(suggestion) = suggested_source.filter(|s| s.id == owner.id) {
                owner.reason = format!("{} {}", owner.reason, suggestion.reason);
                owner.evidence = suggestion.evidence;
            }
            return owner;
        }
        if let Some(owner) = suggested_source.filter(|_| scored.is_empty()) {
            return owner;
        }
        ConfigOwner { id:"unassigned".into(),title:"Unassigned & shared".into(),reason:if scored.is_empty(){"No unambiguous installed mod match. This may be shared, custom, or left by a removed mod."}else{"More than one installed mod matches. Choose the owner below."}.into(),confidence:"unassigned".into(),file_name:None,evidence:None }
    }
}
