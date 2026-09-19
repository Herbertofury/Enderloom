use rusqlite::{params, OptionalExtension};
use serde_json::Value;
use crate::error::Result;
use super::Db;

// User library, exact-file inspection cache and immutable reports survive cache clearing.
impl Db {
    /// An evidence node is never rewritten by a retry or a concurrent importer.
    pub fn library_put_immutable(&self, key: &str, value: &Value) -> Result<Value> {
        let conn = self.0.lock().unwrap();
        conn.execute_batch("CREATE TABLE IF NOT EXISTS creative_library (key TEXT PRIMARY KEY, body TEXT NOT NULL)")?;
        conn.execute("INSERT OR IGNORE INTO creative_library(key,body) VALUES (?1,?2)", params![key, value.to_string()])?;
        let body: String = conn.query_row("SELECT body FROM creative_library WHERE key=?1", [key], |r| r.get(0))?;
        Ok(serde_json::from_str(&body)?)
    }
    pub fn library_get(&self, key: &str) -> Result<Option<Value>> {
        let conn = self.0.lock().unwrap();
        conn.execute_batch("CREATE TABLE IF NOT EXISTS creative_library (key TEXT PRIMARY KEY, body TEXT NOT NULL)")?;
        let body: Option<String> = conn.query_row("SELECT body FROM creative_library WHERE key=?1", [key], |r| r.get(0)).optional()?;
        body.map(|s| serde_json::from_str(&s).map_err(Into::into)).transpose()
    }

    pub fn library_put(&self, key: &str, value: &Value) -> Result<()> {
        let conn = self.0.lock().unwrap();
        conn.execute_batch("CREATE TABLE IF NOT EXISTS creative_library (key TEXT PRIMARY KEY, body TEXT NOT NULL)")?;
        conn.execute("INSERT INTO creative_library(key,body) VALUES (?1,?2) ON CONFLICT(key) DO UPDATE SET body=excluded.body", params![key, value.to_string()])?;
        Ok(())
    }

    pub fn library_list(&self, prefix: &str) -> Result<Vec<Value>> {
        let conn = self.0.lock().unwrap();
        conn.execute_batch("CREATE TABLE IF NOT EXISTS creative_library (key TEXT PRIMARY KEY, body TEXT NOT NULL)")?;
        let mut stmt = conn.prepare("SELECT body FROM creative_library WHERE substr(key,1,length(?1))=?1 ORDER BY key DESC")?;
        let rows = stmt.query_map([prefix], |r| r.get::<_, String>(0))?;
        rows.map(|r| Ok(serde_json::from_str(&r?)?)).collect()
    }
}
