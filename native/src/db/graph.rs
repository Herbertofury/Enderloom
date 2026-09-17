use rusqlite::{params, Connection, OptionalExtension};
use serde::Serialize;
use crate::{db::ContentFile, error::Result};
use super::Db;

pub(super) fn migrate_graph(conn: &Connection) -> Result<()> {
    conn.execute_batch("
      CREATE TABLE IF NOT EXISTS graph_projects(id TEXT PRIMARY KEY, title TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS graph_project_aliases(provider TEXT NOT NULL, external_id TEXT NOT NULL, project_id TEXT NOT NULL REFERENCES graph_projects(id), PRIMARY KEY(provider,external_id));
      CREATE TABLE IF NOT EXISTS graph_releases(id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES graph_projects(id), provider TEXT NOT NULL, external_id TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS graph_artifacts(sha256 TEXT PRIMARY KEY, size INTEGER NOT NULL, sha1 TEXT NOT NULL, sha512 TEXT NOT NULL, first_observed INTEGER NOT NULL);
      CREATE INDEX IF NOT EXISTS graph_artifacts_sha1 ON graph_artifacts(sha1);
      CREATE TABLE IF NOT EXISTS graph_release_artifacts(release_id TEXT NOT NULL REFERENCES graph_releases(id), sha256 TEXT NOT NULL REFERENCES graph_artifacts(sha256), PRIMARY KEY(release_id,sha256));
      CREATE TABLE IF NOT EXISTS graph_observations(id INTEGER PRIMARY KEY, target_kind TEXT NOT NULL, target_id TEXT NOT NULL, content_kind TEXT NOT NULL, file_name TEXT NOT NULL, sha256 TEXT NOT NULL REFERENCES graph_artifacts(sha256), claimed_release_id TEXT, source_match TEXT NOT NULL, observed_at INTEGER NOT NULL);
      CREATE INDEX IF NOT EXISTS graph_observations_release ON graph_observations(claimed_release_id);
      CREATE TABLE IF NOT EXISTS graph_locations(target_kind TEXT NOT NULL, target_id TEXT NOT NULL, content_kind TEXT NOT NULL, file_name TEXT NOT NULL, observation_id INTEGER NOT NULL REFERENCES graph_observations(id), PRIMARY KEY(target_kind,target_id,content_kind,file_name));
      CREATE TABLE IF NOT EXISTS graph_lineage(parent_sha256 TEXT NOT NULL, child_sha256 TEXT NOT NULL, relation TEXT NOT NULL, observation_id INTEGER NOT NULL, PRIMARY KEY(parent_sha256,child_sha256,observation_id));
    ")?;
    Ok(())
}

#[derive(Debug, Clone, Serialize)]
pub struct FileHash { pub algorithm: String, pub value: String }
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
pub struct ProviderAlias { pub provider: String, pub project_id: String }
#[derive(Debug, Serialize)]
pub struct ProjectGraph {
    pub schema_version: u32,
    pub project: Option<ProjectIdentity>,
    pub observations: Vec<ArtifactObservation>,
}

impl Db {
    pub fn record_artifact_observation(&self, target_kind: &str, target_id: &str, kind: &str, source: &ContentFile, artifact: &ArtifactIdentity) -> Result<()> {
        let mut conn = self.0.lock().unwrap();
        let tx = conn.transaction()?;
        let now = chrono::Utc::now().timestamp_millis();
        let hash = |algorithm: &str| artifact.hashes.iter().find(|hash| hash.algorithm == algorithm).map(|hash| hash.value.as_str()).unwrap_or("");
        tx.execute("INSERT OR IGNORE INTO graph_artifacts VALUES(?1,?2,?3,?4,?5)", params![artifact.sha256,artifact.size,hash("sha1"),hash("sha512"),now])?;
        let mut release_id = None;
        if let (Some(provider),Some(external_project)) = (&source.provider,&source.project_id) {
            let project_id = format!("{provider}:project:{external_project}");
            tx.execute("INSERT INTO graph_projects VALUES(?1,?2) ON CONFLICT(id) DO UPDATE SET title=excluded.title",params![project_id,source.title.as_deref().unwrap_or(external_project)])?;
            tx.execute("INSERT OR IGNORE INTO graph_project_aliases VALUES(?1,?2,?3)",params![provider,external_project,project_id])?;
            if let Some(version) = &source.version_id {
                let id = format!("{project_id}:release:{version}");
                tx.execute("INSERT OR IGNORE INTO graph_releases VALUES(?1,?2,?3,?4)",params![id,project_id,provider,version])?;
                release_id = Some(id);
            }
        }
        // Recorded source metadata is a claim until its digest matches actual bytes.
        // A mismatch never becomes evidence that a modified file is an official release.
        let expected = [(source.sha1.as_deref(),hash("sha1")),(source.sha512.as_deref(),hash("sha512"))];
        let checks: Vec<bool> = expected.iter().filter_map(|(expected,actual)| expected.filter(|value| !value.is_empty()).map(|value| value.eq_ignore_ascii_case(actual))).collect();
        let source_match = if checks.is_empty() { "unverified" } else if checks.iter().all(|matched| *matched) { "verified" } else { "modified" };
        if source_match == "verified" {
            if let Some(release) = &release_id { tx.execute("INSERT OR IGNORE INTO graph_release_artifacts VALUES(?1,?2)",params![release,artifact.sha256])?; }
        }
        let previous: Option<(String,Option<String>,String)> = tx.query_row("SELECT o.sha256,o.claimed_release_id,o.source_match FROM graph_locations l JOIN graph_observations o ON o.id=l.observation_id WHERE l.target_kind=?1 AND l.target_id=?2 AND l.content_kind=?3 AND l.file_name=?4",params![target_kind,target_id,kind,source.file_name],|row|Ok((row.get(0)?,row.get(1)?,row.get(2)?))).optional()?;
        if previous.as_ref().is_some_and(|(sha,release,matched)| sha==&artifact.sha256 && release==&release_id && matched==source_match) { tx.commit()?; return Ok(()); }
        tx.execute("INSERT INTO graph_observations(target_kind,target_id,content_kind,file_name,sha256,claimed_release_id,source_match,observed_at) VALUES(?1,?2,?3,?4,?5,?6,?7,?8)",params![target_kind,target_id,kind,source.file_name,artifact.sha256,release_id,source_match,now])?;
        let observation = tx.last_insert_rowid();
        if let Some((parent,_,_)) = previous.filter(|(sha,_,_)| sha != &artifact.sha256) {
            tx.execute("INSERT OR IGNORE INTO graph_lineage VALUES(?1,?2,'same-path-replacement',?3)",params![parent,artifact.sha256,observation])?;
        }
        tx.execute("INSERT INTO graph_locations VALUES(?1,?2,?3,?4,?5) ON CONFLICT(target_kind,target_id,content_kind,file_name) DO UPDATE SET observation_id=excluded.observation_id",params![target_kind,target_id,kind,source.file_name,observation])?;
        tx.commit()?;
        Ok(())
    }

    pub fn project_artifact_graph(&self, provider: &str, project: &str) -> Result<ProjectGraph> {
        let conn = self.0.lock().unwrap();
        let identity = conn.query_row("SELECT p.id,p.title FROM graph_projects p JOIN graph_project_aliases a ON a.project_id=p.id WHERE a.provider=?1 AND a.external_id=?2",[provider,project],|row|Ok((row.get::<_,String>(0)?,row.get::<_,String>(1)?))).optional()?;
        let Some((id,title)) = identity else { return Ok(ProjectGraph {schema_version:1,project:None,observations:vec![]}); };
        let aliases = conn.prepare("SELECT provider,external_id FROM graph_project_aliases WHERE project_id=?1 ORDER BY provider,external_id")?.query_map([&id],|row|Ok(ProviderAlias{provider:row.get(0)?,project_id:row.get(1)?}))?.collect::<std::result::Result<Vec<_>,_>>()?;
        let observations = conn.prepare("SELECT o.id,o.target_kind,o.target_id,o.content_kind,o.file_name,a.sha256,a.size,a.sha1,a.sha512,o.claimed_release_id,r.external_id,o.source_match,o.observed_at,EXISTS(SELECT 1 FROM graph_locations l WHERE l.observation_id=o.id),(SELECT parent_sha256 FROM graph_lineage WHERE observation_id=o.id LIMIT 1) FROM graph_observations o JOIN graph_artifacts a ON a.sha256=o.sha256 JOIN graph_releases r ON r.id=o.claimed_release_id WHERE r.project_id=?1 ORDER BY o.observed_at DESC,o.id DESC")?.query_map([&id],|row|Ok(ArtifactObservation{
            observation_id:row.get(0)?,target_kind:row.get(1)?,target_id:row.get(2)?,content_kind:row.get(3)?,file_name:row.get(4)?,artifact:ArtifactIdentity{sha256:row.get(5)?,size:row.get(6)?,hashes:vec![FileHash{algorithm:"sha256".into(),value:row.get(5)?},FileHash{algorithm:"sha1".into(),value:row.get(7)?},FileHash{algorithm:"sha512".into(),value:row.get(8)?}],evidence_class:"measured".into()},release_id:row.get(9)?,provider_version_id:row.get(10)?,source_match:row.get(11)?,observed_at:row.get(12)?,current:row.get(13)?,previous_sha256:row.get(14)?
        }))?.collect::<std::result::Result<Vec<_>,_>>()?;
        Ok(ProjectGraph{schema_version:1,project:Some(ProjectIdentity{id,title,aliases}),observations})
    }
}
