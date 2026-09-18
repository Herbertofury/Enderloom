use super::Db;
use crate::{
    db::ContentFile,
    error::{Error, Result},
};
use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};

pub(super) fn migrate_graph(conn: &Connection) -> Result<()> {
    conn.execute_batch("
      CREATE TABLE IF NOT EXISTS graph_projects(id TEXT PRIMARY KEY, title TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS graph_project_aliases(provider TEXT NOT NULL, external_id TEXT NOT NULL, project_id TEXT NOT NULL REFERENCES graph_projects(id), PRIMARY KEY(provider,external_id));
      CREATE TABLE IF NOT EXISTS graph_releases(id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES graph_projects(id), provider TEXT NOT NULL, external_id TEXT NOT NULL);
      CREATE UNIQUE INDEX IF NOT EXISTS graph_release_identity ON graph_releases(project_id,provider,external_id);
      CREATE TABLE IF NOT EXISTS graph_artifacts(sha256 TEXT PRIMARY KEY, size INTEGER NOT NULL, sha1 TEXT NOT NULL, sha512 TEXT NOT NULL, first_observed INTEGER NOT NULL);
      CREATE INDEX IF NOT EXISTS graph_artifacts_sha1 ON graph_artifacts(sha1);
      CREATE TABLE IF NOT EXISTS graph_release_artifacts(release_id TEXT NOT NULL REFERENCES graph_releases(id), sha256 TEXT NOT NULL REFERENCES graph_artifacts(sha256), PRIMARY KEY(release_id,sha256));
      CREATE TABLE IF NOT EXISTS graph_observations(id INTEGER PRIMARY KEY, target_kind TEXT NOT NULL, target_id TEXT NOT NULL, content_kind TEXT NOT NULL, file_name TEXT NOT NULL, sha256 TEXT NOT NULL REFERENCES graph_artifacts(sha256), claimed_release_id TEXT, source_match TEXT NOT NULL, observed_at INTEGER NOT NULL);
      CREATE INDEX IF NOT EXISTS graph_observations_release ON graph_observations(claimed_release_id);
      CREATE TABLE IF NOT EXISTS graph_locations(target_kind TEXT NOT NULL, target_id TEXT NOT NULL, content_kind TEXT NOT NULL, file_name TEXT NOT NULL, observation_id INTEGER NOT NULL REFERENCES graph_observations(id), PRIMARY KEY(target_kind,target_id,content_kind,file_name));
      CREATE TABLE IF NOT EXISTS graph_lineage(parent_sha256 TEXT NOT NULL, child_sha256 TEXT NOT NULL, relation TEXT NOT NULL, observation_id INTEGER NOT NULL, PRIMARY KEY(parent_sha256,child_sha256,observation_id));
      CREATE TABLE IF NOT EXISTS graph_project_observations(project_id TEXT NOT NULL REFERENCES graph_projects(id), observation_id INTEGER NOT NULL REFERENCES graph_observations(id), PRIMARY KEY(project_id,observation_id));
      INSERT OR IGNORE INTO graph_project_observations SELECT r.project_id,o.id FROM graph_observations o JOIN graph_releases r ON r.id=o.claimed_release_id;
      CREATE TABLE IF NOT EXISTS graph_project_links(id TEXT PRIMARY KEY, left_id TEXT NOT NULL REFERENCES graph_projects(id), right_id TEXT NOT NULL REFERENCES graph_projects(id), left_source TEXT NOT NULL, right_source TEXT NOT NULL, reason TEXT NOT NULL, active INTEGER NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, UNIQUE(left_id,right_id));
      CREATE INDEX IF NOT EXISTS graph_project_links_right ON graph_project_links(right_id,active);
      CREATE TABLE IF NOT EXISTS graph_project_link_events(id INTEGER PRIMARY KEY, link_id TEXT NOT NULL REFERENCES graph_project_links(id), action TEXT NOT NULL, reason TEXT NOT NULL, recorded_at INTEGER NOT NULL);
    ")?;
    Ok(())
}

#[derive(Debug, Clone, Serialize)]
pub struct FileHash {
    pub algorithm: String,
    pub value: String,
}
#[derive(Debug, Clone, Serialize)]
pub struct ArtifactIdentity {
    pub sha256: String,
    pub size: u64,
    pub hashes: Vec<FileHash>,
    pub evidence_class: String,
}
#[derive(Debug, Serialize)]
pub struct ArtifactObservation {
    pub observation_id: i64,
    pub target_kind: String,
    pub target_id: String,
    pub content_kind: String,
    pub file_name: String,
    pub artifact: ArtifactIdentity,
    pub release_id: Option<String>,
    pub provider_version_id: Option<String>,
    pub source_match: String,
    pub observed_at: i64,
    pub current: bool,
    pub previous_sha256: Option<String>,
}
#[derive(Debug, Serialize)]
pub struct ProjectIdentity {
    pub id: String,
    pub title: String,
    pub aliases: Vec<ProviderAlias>,
}
#[derive(Debug, Serialize)]
pub struct ProviderAlias {
    pub provider: String,
    pub project_id: String,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProviderProjectIdentity {
    pub provider: String,
    pub project_id: String,
    pub title: String,
    pub author: String,
    pub source_url: String,
    pub icon_url: Option<String>,
}
#[derive(Debug, Serialize)]
pub struct ProjectSourceLink {
    pub id: String,
    pub left: ProviderProjectIdentity,
    pub right: ProviderProjectIdentity,
    pub reason: String,
    pub confidence_class: String,
    pub active: bool,
    pub created_at: i64,
    pub updated_at: i64,
}
#[derive(Debug, Serialize)]
pub struct ReleaseIdentity {
    pub id: String,
    pub project_id: String,
    pub provider: String,
    pub provider_version_id: String,
    /// Only artifacts whose measured bytes match the recorded provider hash.
    pub artifacts: Vec<ArtifactIdentity>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use sha2::{Digest, Sha256, Sha512};

    fn artifact(bytes: &[u8]) -> ArtifactIdentity {
        let sha256 = format!("{:x}", Sha256::digest(bytes));
        ArtifactIdentity {
            sha256: sha256.clone(),
            size: bytes.len() as u64,
            evidence_class: "measured".into(),
            hashes: vec![
                FileHash {
                    algorithm: "sha256".into(),
                    value: sha256,
                },
                FileHash {
                    algorithm: "sha1".into(),
                    value: sha1_smol::Sha1::from(bytes).digest().to_string(),
                },
                FileHash {
                    algorithm: "sha512".into(),
                    value: format!("{:x}", Sha512::digest(bytes)),
                },
            ],
        }
    }
    fn source(value: &ArtifactIdentity) -> ContentFile {
        ContentFile {
            file_name: "same-name.jar".into(),
            provider: Some("curseforge".into()),
            project_id: Some("project-a".into()),
            version_id: Some("version-1".into()),
            title: Some("Exact mod".into()),
            sha1: Some(value.hashes[1].value.clone()),
            ..ContentFile::default()
        }
    }
    #[test]
    fn release_projection_excludes_modified_bytes_and_preserves_immutable_history() {
        let db = Db::open_in_memory().unwrap();
        let original = artifact(b"original");
        let changed = artifact(b"modified");
        let source = source(&original);
        for value in [&original, &changed, &original] {
            db.record_artifact_observation("instance", "one", "mods", &source, value)
                .unwrap();
        }
        let graph = db
            .project_artifact_graph("curseforge", "project-a")
            .unwrap();
        assert_eq!(graph.releases.len(), 1);
        assert_eq!(graph.releases[0].artifacts.len(), 1);
        assert_eq!(graph.releases[0].artifacts[0].sha256, original.sha256);
        assert_eq!(graph.observations.len(), 3);
        assert_eq!(
            graph.observations[0].previous_sha256.as_deref(),
            Some(changed.sha256.as_str())
        );
        assert_eq!(graph.observations[1].source_match, "modified");
        db.record_artifact_observation("instance", "one", "mods", &source, &original)
            .unwrap();
        assert_eq!(
            db.project_artifact_graph("curseforge", "project-a")
                .unwrap()
                .observations
                .len(),
            3
        );
        let mut conflict = original.clone();
        conflict.size += 1;
        assert!(db
            .record_artifact_observation("instance", "one", "mods", &source, &conflict)
            .is_err());
        assert_eq!(
            db.project_artifact_graph("curseforge", "project-a")
                .unwrap()
                .releases[0]
                .artifacts[0]
                .size,
            original.size
        );
        let mut invalid = original.clone();
        invalid.hashes[0].value = changed.sha256;
        assert!(db
            .record_artifact_observation("instance", "one", "mods", &source, &invalid)
            .is_err());
    }
    #[test]
    fn project_without_release_remains_visible_and_cannot_borrow_another_project() {
        let db = Db::open_in_memory().unwrap();
        let value = artifact(b"installed");
        let mut source = source(&value);
        source.version_id = None;
        db.record_artifact_observation("instance", "one", "mods", &source, &value)
            .unwrap();
        let graph = db
            .project_artifact_graph("curseforge", "project-a")
            .unwrap();
        assert!(graph.releases.is_empty());
        assert_eq!(graph.observations.len(), 1);
        assert_eq!(graph.observations[0].release_id, None);
        source.project_id = Some("project-b".into());
        db.record_artifact_observation("instance", "one", "mods", &source, &value)
            .unwrap();
        assert!(
            !db.project_artifact_graph("curseforge", "project-a")
                .unwrap()
                .observations[0]
                .current
        );
        assert!(
            db.project_artifact_graph("curseforge", "project-b")
                .unwrap()
                .observations[0]
                .current
        );
    }
    #[test]
    fn alias_reuses_project_but_provider_version_ids_remain_distinct() {
        let db = Db::open_in_memory().unwrap();
        let value = artifact(b"same exact bytes");
        let mut source = source(&value);
        db.record_artifact_observation("instance", "one", "mods", &source, &value)
            .unwrap();
        let id = db
            .project_artifact_graph("curseforge", "project-a")
            .unwrap()
            .project
            .unwrap()
            .id;
        db.0.lock()
            .unwrap()
            .execute(
                "INSERT INTO graph_project_aliases VALUES('modrinth','alias',?1)",
                [&id],
            )
            .unwrap();
        source.provider = Some("modrinth".into());
        source.project_id = Some("alias".into());
        db.record_artifact_observation("instance", "two", "mods", &source, &value)
            .unwrap();
        let graph = db.project_artifact_graph("modrinth", "alias").unwrap();
        assert_eq!(graph.project.unwrap().id, id);
        assert_eq!(graph.releases.len(), 2);
        assert_ne!(graph.releases[0].id, graph.releases[1].id);
        assert_eq!(graph.observations.len(), 2);
    }
    #[test]
    fn legacy_observations_migrate_idempotently_and_missing_hash_is_not_a_mismatch() {
        let db = Db::open_in_memory().unwrap();
        let value = artifact(b"legacy");
        let source = source(&value);
        db.record_artifact_observation("instance", "one", "mods", &source, &value)
            .unwrap();
        {
            let conn = db.0.lock().unwrap();
            conn.execute("DROP TABLE graph_project_observations", [])
                .unwrap();
            migrate_graph(&conn).unwrap();
            migrate_graph(&conn).unwrap();
        }
        assert_eq!(
            db.project_artifact_graph("curseforge", "project-a")
                .unwrap()
                .observations
                .len(),
            1
        );
        let partial = ArtifactIdentity {
            hashes: vec![value.hashes[0].clone()],
            ..value
        };
        db.record_artifact_observation("instance", "two", "mods", &source, &partial)
            .unwrap();
        assert_eq!(
            db.project_artifact_graph("curseforge", "project-a")
                .unwrap()
                .observations[0]
                .source_match,
            "unverified"
        );
    }
}
#[derive(Debug, Serialize)]
pub struct ProjectGraph {
    pub schema_version: u32,
    pub project: Option<ProjectIdentity>,
    pub releases: Vec<ReleaseIdentity>,
    pub observations: Vec<ArtifactObservation>,
    pub source_links: Vec<ProjectSourceLink>,
}

fn connected_projects(conn: &Connection, project: &str) -> Result<Vec<String>> {
    let mut query = conn.prepare("WITH RECURSIVE connected(id) AS (SELECT ?1 UNION SELECT CASE WHEN l.left_id=c.id THEN l.right_id ELSE l.left_id END FROM graph_project_links l JOIN connected c ON l.left_id=c.id OR l.right_id=c.id WHERE l.active=1) SELECT id FROM connected ORDER BY id")?;
    let members = query
        .query_map([project], |row| row.get(0))?
        .collect::<std::result::Result<Vec<_>, _>>()?;
    Ok(members)
}

fn validate_identity(artifact: &ArtifactIdentity) -> Result<()> {
    let hexadecimal = |value: &str, length| {
        value.len() == length
            && value
                .bytes()
                .all(|c| c.is_ascii_digit() || (b'a'..=b'f').contains(&c))
    };
    if !hexadecimal(&artifact.sha256, 64) {
        return Err(Error::other(
            "Artifact identity requires a lowercase SHA-256 digest.",
        ));
    }
    let mut algorithms = std::collections::BTreeSet::new();
    for hash in &artifact.hashes {
        let length = match hash.algorithm.as_str() {
            "sha256" => 64,
            "sha1" => 40,
            "sha512" => 128,
            _ => return Err(Error::other("Unsupported artifact hash algorithm.")),
        };
        if !algorithms.insert(&hash.algorithm) || !hexadecimal(&hash.value, length) {
            return Err(Error::other(
                "Artifact hashes must be unique, valid hexadecimal digests.",
            ));
        }
    }
    if !artifact
        .hashes
        .iter()
        .any(|hash| hash.algorithm == "sha256" && hash.value == artifact.sha256)
    {
        return Err(Error::other(
            "Artifact SHA-256 must match its FileHash identity.",
        ));
    }
    Ok(())
}

fn read_artifact(row: &rusqlite::Row<'_>, offset: usize) -> rusqlite::Result<ArtifactIdentity> {
    let sha256: String = row.get(offset)?;
    let mut hashes = vec![FileHash {
        algorithm: "sha256".into(),
        value: sha256.clone(),
    }];
    for (column, algorithm) in [(offset + 2, "sha1"), (offset + 3, "sha512")] {
        let value: String = row.get(column)?;
        if !value.is_empty() {
            hashes.push(FileHash {
                algorithm: algorithm.into(),
                value,
            });
        }
    }
    Ok(ArtifactIdentity {
        sha256,
        size: row.get(offset + 1)?,
        hashes,
        evidence_class: "measured".into(),
    })
}

impl Db {
    pub fn record_artifact_observation(
        &self,
        target_kind: &str,
        target_id: &str,
        kind: &str,
        source: &ContentFile,
        artifact: &ArtifactIdentity,
    ) -> Result<()> {
        validate_identity(artifact)?;
        let mut conn = self.0.lock().unwrap();
        let tx = conn.transaction()?;
        let now = chrono::Utc::now().timestamp_millis();
        let hash = |algorithm: &str| {
            artifact
                .hashes
                .iter()
                .find(|hash| hash.algorithm == algorithm)
                .map(|hash| hash.value.as_str())
                .unwrap_or("")
        };
        tx.execute(
            "INSERT OR IGNORE INTO graph_artifacts VALUES(?1,?2,?3,?4,?5)",
            params![
                artifact.sha256,
                artifact.size,
                hash("sha1"),
                hash("sha512"),
                now
            ],
        )?;
        let stored: (u64, String, String) = tx.query_row(
            "SELECT size,sha1,sha512 FROM graph_artifacts WHERE sha256=?1",
            [&artifact.sha256],
            |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
        )?;
        if stored.0 != artifact.size
            || [(&stored.1, hash("sha1")), (&stored.2, hash("sha512"))]
                .iter()
                .any(|(old, new)| !old.is_empty() && !new.is_empty() && old.as_str() != *new)
        {
            return Err(Error::other("Conflicting measurements for an immutable artifact. Existing identity was preserved."));
        }
        tx.execute("UPDATE graph_artifacts SET sha1=CASE WHEN sha1='' THEN ?2 ELSE sha1 END,sha512=CASE WHEN sha512='' THEN ?3 ELSE sha512 END WHERE sha256=?1",params![artifact.sha256,hash("sha1"),hash("sha512")])?;
        let mut release_id = None;
        let mut canonical_project = None;
        if let (Some(provider), Some(external_project)) = (&source.provider, &source.project_id) {
            let project_id: String = tx.query_row("SELECT project_id FROM graph_project_aliases WHERE provider=?1 AND external_id=?2",params![provider,external_project],|row|row.get(0)).optional()?.unwrap_or_else(||format!("{provider}:project:{external_project}"));
            tx.execute("INSERT INTO graph_projects VALUES(?1,?2) ON CONFLICT(id) DO UPDATE SET title=excluded.title",params![project_id,source.title.as_deref().unwrap_or(external_project)])?;
            tx.execute(
                "INSERT OR IGNORE INTO graph_project_aliases VALUES(?1,?2,?3)",
                params![provider, external_project, project_id],
            )?;
            canonical_project = Some(project_id.clone());
            if let Some(version) = &source.version_id {
                let id: String = tx.query_row("SELECT id FROM graph_releases WHERE project_id=?1 AND provider=?2 AND external_id=?3",params![project_id,provider,version],|row|row.get(0)).optional()?.unwrap_or_else(||format!("{project_id}:release:{provider}:{version}"));
                tx.execute(
                    "INSERT OR IGNORE INTO graph_releases VALUES(?1,?2,?3,?4)",
                    params![id, project_id, provider, version],
                )?;
                release_id = Some(id);
            }
        }
        // Recorded source metadata is a claim until its digest matches actual bytes.
        // A mismatch never becomes evidence that a modified file is an official release.
        let expected = [
            (source.sha1.as_deref(), hash("sha1")),
            (source.sha512.as_deref(), hash("sha512")),
        ];
        let missing = expected.iter().any(|(expected, actual)| {
            expected.is_some_and(|value| !value.is_empty()) && actual.is_empty()
        });
        let checks: Vec<bool> = expected
            .iter()
            .filter(|(_, actual)| !actual.is_empty())
            .filter_map(|(expected, actual)| {
                expected
                    .filter(|value| !value.is_empty())
                    .map(|value| value.eq_ignore_ascii_case(actual))
            })
            .collect();
        let source_match = if checks.iter().any(|matched| !matched) {
            "modified"
        } else if checks.is_empty() || missing {
            "unverified"
        } else {
            "verified"
        };
        if source_match == "verified" {
            if let Some(release) = &release_id {
                tx.execute(
                    "INSERT OR IGNORE INTO graph_release_artifacts VALUES(?1,?2)",
                    params![release, artifact.sha256],
                )?;
            }
        }
        let previous: Option<(String,Option<String>,String,Option<String>)> = tx.query_row("SELECT o.sha256,o.claimed_release_id,o.source_match,(SELECT project_id FROM graph_project_observations WHERE observation_id=o.id LIMIT 1) FROM graph_locations l JOIN graph_observations o ON o.id=l.observation_id WHERE l.target_kind=?1 AND l.target_id=?2 AND l.content_kind=?3 AND l.file_name=?4",params![target_kind,target_id,kind,source.file_name],|row|Ok((row.get(0)?,row.get(1)?,row.get(2)?,row.get(3)?))).optional()?;
        if previous
            .as_ref()
            .is_some_and(|(sha, release, matched, project)| {
                sha == &artifact.sha256
                    && release == &release_id
                    && matched == source_match
                    && project == &canonical_project
            })
        {
            tx.commit()?;
            return Ok(());
        }
        tx.execute("INSERT INTO graph_observations(target_kind,target_id,content_kind,file_name,sha256,claimed_release_id,source_match,observed_at) VALUES(?1,?2,?3,?4,?5,?6,?7,?8)",params![target_kind,target_id,kind,source.file_name,artifact.sha256,release_id,source_match,now])?;
        let observation = tx.last_insert_rowid();
        if let Some(project) = &canonical_project {
            tx.execute(
                "INSERT INTO graph_project_observations VALUES(?1,?2)",
                params![project, observation],
            )?;
        }
        if let Some((parent, _, _, _)) = previous.filter(|(sha, _, _, _)| sha != &artifact.sha256) {
            tx.execute(
                "INSERT OR IGNORE INTO graph_lineage VALUES(?1,?2,'same-path-replacement',?3)",
                params![parent, artifact.sha256, observation],
            )?;
        }
        tx.execute("INSERT INTO graph_locations VALUES(?1,?2,?3,?4,?5) ON CONFLICT(target_kind,target_id,content_kind,file_name) DO UPDATE SET observation_id=excluded.observation_id",params![target_kind,target_id,kind,source.file_name,observation])?;
        tx.commit()?;
        Ok(())
    }

    pub fn project_artifact_graph(&self, provider: &str, project: &str) -> Result<ProjectGraph> {
        let conn = self.0.lock().unwrap();
        let identity = conn.query_row("SELECT p.id,p.title FROM graph_projects p JOIN graph_project_aliases a ON a.project_id=p.id WHERE a.provider=?1 AND a.external_id=?2",[provider,project],|row|Ok((row.get::<_,String>(0)?,row.get::<_,String>(1)?))).optional()?;
        let Some((requested_id, _)) = identity else {
            return Ok(ProjectGraph {
                schema_version: 1,
                project: None,
                releases: vec![],
                observations: vec![],
                source_links: vec![],
            });
        };
        let members = connected_projects(&conn, &requested_id)?;
        let canonical = members[0].clone();
        let title = conn.query_row(
            "SELECT title FROM graph_projects WHERE id=?1",
            [&canonical],
            |row| row.get(0),
        )?;
        let mut all_aliases = Vec::new();
        let mut all_observations = Vec::new();
        let mut all_releases = Vec::new();
        let mut source_links = Vec::new();
        for id in &members {
            let aliases = conn.prepare("SELECT provider,external_id FROM graph_project_aliases WHERE project_id=?1 ORDER BY provider,external_id")?.query_map([&id],|row|Ok(ProviderAlias{provider:row.get(0)?,project_id:row.get(1)?}))?.collect::<std::result::Result<Vec<_>,_>>()?;
            let observations = conn.prepare("SELECT o.id,o.target_kind,o.target_id,o.content_kind,o.file_name,a.sha256,a.size,a.sha1,a.sha512,o.claimed_release_id,r.external_id,o.source_match,o.observed_at,EXISTS(SELECT 1 FROM graph_locations l WHERE l.observation_id=o.id),(SELECT parent_sha256 FROM graph_lineage WHERE observation_id=o.id LIMIT 1) FROM graph_project_observations p JOIN graph_observations o ON o.id=p.observation_id JOIN graph_artifacts a ON a.sha256=o.sha256 LEFT JOIN graph_releases r ON r.id=o.claimed_release_id WHERE p.project_id=?1 ORDER BY o.observed_at DESC,o.id DESC")?.query_map([&id],|row|Ok(ArtifactObservation{
            observation_id:row.get(0)?,target_kind:row.get(1)?,target_id:row.get(2)?,content_kind:row.get(3)?,file_name:row.get(4)?,artifact:read_artifact(row,5)?,release_id:row.get(9)?,provider_version_id:row.get(10)?,source_match:row.get(11)?,observed_at:row.get(12)?,current:row.get(13)?,previous_sha256:row.get(14)?
        }))?.collect::<std::result::Result<Vec<_>,_>>()?;
            let mut releases = conn.prepare("SELECT id,project_id,provider,external_id FROM graph_releases WHERE project_id=?1 ORDER BY provider,external_id")?.query_map([&id],|row|Ok(ReleaseIdentity {id:row.get(0)?,project_id:row.get(1)?,provider:row.get(2)?,provider_version_id:row.get(3)?,artifacts:vec![]}))?.collect::<std::result::Result<Vec<_>,_>>()?;
            for release in &mut releases {
                release.artifacts = conn.prepare("SELECT a.sha256,a.size,a.sha1,a.sha512 FROM graph_release_artifacts r JOIN graph_artifacts a ON a.sha256=r.sha256 WHERE r.release_id=?1 ORDER BY a.sha256")?.query_map([&release.id],|row|read_artifact(row,0))?.collect::<std::result::Result<Vec<_>,_>>()?;
            }
            all_aliases.extend(aliases);
            all_observations.extend(observations);
            all_releases.extend(releases);
            let mut links = conn.prepare("SELECT id,left_source,right_source,reason,active,created_at,updated_at FROM graph_project_links WHERE left_id=?1 OR right_id=?1 ORDER BY created_at,id")?;
            for row in links.query_map([id], |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, String>(2)?,
                    row.get::<_, String>(3)?,
                    row.get::<_, bool>(4)?,
                    row.get::<_, i64>(5)?,
                    row.get::<_, i64>(6)?,
                ))
            })? {
                let (id, left, right, reason, active, created_at, updated_at) = row?;
                source_links.push(ProjectSourceLink {
                    id,
                    left: serde_json::from_str(&left)?,
                    right: serde_json::from_str(&right)?,
                    reason,
                    confidence_class: "user_confirmed".into(),
                    active,
                    created_at,
                    updated_at,
                });
            }
        }
        all_aliases.sort_by(|a, b| (&a.provider, &a.project_id).cmp(&(&b.provider, &b.project_id)));
        all_observations
            .sort_by_key(|row| std::cmp::Reverse((row.observed_at, row.observation_id)));
        all_observations.dedup_by_key(|row| row.observation_id);
        all_releases.sort_by(|a, b| a.id.cmp(&b.id));
        source_links.sort_by(|a, b| a.id.cmp(&b.id));
        source_links.dedup_by(|a, b| a.id == b.id);
        Ok(ProjectGraph {
            schema_version: 1,
            project: Some(ProjectIdentity {
                id: canonical,
                title,
                aliases: all_aliases,
            }),
            releases: all_releases,
            observations: all_observations,
            source_links,
        })
    }

    /// Explicit associations change the graph projection only. Original provider records,
    /// releases, hashes and locations remain separate so unlinking is lossless.
    pub fn link_project_sources(
        &self,
        left: &ProviderProjectIdentity,
        right: &ProviderProjectIdentity,
        reason: &str,
    ) -> Result<()> {
        if left.provider == right.provider && left.project_id == right.project_id {
            return Err(Error::other("These are already the same provider project."));
        }
        if reason.trim().is_empty() {
            return Err(Error::other(
                "Explain why these pages represent the same project.",
            ));
        }
        let mut conn = self.0.lock().unwrap();
        let tx = conn.transaction()?;
        let mut pair = Vec::new();
        for source in [left, right] {
            let id: String = tx.query_row("SELECT project_id FROM graph_project_aliases WHERE provider=?1 AND external_id=?2",params![source.provider,source.project_id],|row|row.get(0)).optional()?.unwrap_or_else(||format!("{}:project:{}",source.provider,source.project_id));
            tx.execute("INSERT INTO graph_projects VALUES(?1,?2) ON CONFLICT(id) DO UPDATE SET title=excluded.title",params![id,source.title])?;
            tx.execute(
                "INSERT OR IGNORE INTO graph_project_aliases VALUES(?1,?2,?3)",
                params![source.provider, source.project_id, id],
            )?;
            pair.push((id, source));
        }
        pair.sort_by(|a, b| a.0.cmp(&b.0));
        if pair[0].0 == pair[1].0 {
            return Err(Error::other(
                "These provider pages already share an identity.",
            ));
        }
        let previous: Option<(String, bool, String)> = tx
            .query_row(
                "SELECT id,active,reason FROM graph_project_links WHERE left_id=?1 AND right_id=?2",
                params![pair[0].0, pair[1].0],
                |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
            )
            .optional()?;
        if previous
            .as_ref()
            .is_some_and(|(_, active, old)| *active && old == reason.trim())
        {
            tx.commit()?;
            return Ok(());
        }
        let id = previous
            .map(|p| p.0)
            .unwrap_or_else(|| uuid::Uuid::new_v4().to_string());
        let now = chrono::Utc::now().timestamp_millis();
        tx.execute("INSERT INTO graph_project_links VALUES(?1,?2,?3,?4,?5,?6,1,?7,?7) ON CONFLICT(id) DO UPDATE SET active=1,reason=excluded.reason,left_source=excluded.left_source,right_source=excluded.right_source,updated_at=excluded.updated_at",params![id,pair[0].0,pair[1].0,serde_json::to_string(pair[0].1)?,serde_json::to_string(pair[1].1)?,reason.trim(),now])?;
        tx.execute("INSERT INTO graph_project_link_events(link_id,action,reason,recorded_at) VALUES(?1,'link',?2,?3)",params![id,reason.trim(),now])?;
        tx.commit()?;
        Ok(())
    }

    pub fn unlink_project_source(
        &self,
        provider: &str,
        project: &str,
        link_id: &str,
    ) -> Result<()> {
        let mut conn = self.0.lock().unwrap();
        let tx = conn.transaction()?;
        let id: String = tx
            .query_row(
                "SELECT project_id FROM graph_project_aliases WHERE provider=?1 AND external_id=?2",
                params![provider, project],
                |row| row.get(0),
            )
            .optional()?
            .ok_or_else(|| Error::other("Project identity is not recorded."))?;
        let members = connected_projects(&tx, &id)?;
        let link: Option<(String, String, bool)> = tx
            .query_row(
                "SELECT left_id,right_id,active FROM graph_project_links WHERE id=?1",
                [link_id],
                |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
            )
            .optional()?;
        let Some((left, right, active)) = link else {
            return Err(Error::other("Source association was not found."));
        };
        if !members.contains(&left) && !members.contains(&right) {
            return Err(Error::other(
                "Source association does not belong to this project.",
            ));
        }
        if active {
            let now = chrono::Utc::now().timestamp_millis();
            tx.execute(
                "UPDATE graph_project_links SET active=0,updated_at=?2 WHERE id=?1",
                params![link_id, now],
            )?;
            tx.execute("INSERT INTO graph_project_link_events(link_id,action,reason,recorded_at) VALUES(?1,'unlink','Removed by user',?2)",params![link_id,now])?;
        }
        tx.commit()?;
        Ok(())
    }
}
