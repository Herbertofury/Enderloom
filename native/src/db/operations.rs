use rusqlite::params;

use crate::{error::Result, tasks::TaskKind};

use super::{Db, PendingOperation};

impl Db {
    pub fn save_task(&self, task: &crate::tasks::Task) -> Result<()> {
        let conn = self.0.lock().unwrap();
        conn.execute("INSERT INTO task_history(id,state,body,started_at) VALUES(?1,?2,?3,?4) ON CONFLICT(id) DO UPDATE SET state=excluded.state,body=excluded.body WHERE COALESCE(json_extract(task_history.body,'$.revision'),0)<=COALESCE(json_extract(excluded.body,'$.revision'),0)",params![task.id,serde_json::to_value(task.state)?.as_str().unwrap_or("unknown"),serde_json::to_string(task)?,task.started_at])?;
        Ok(())
    }
    pub fn load_task_history(&self) -> Result<Vec<crate::tasks::Task>> {
        let conn = self.0.lock().unwrap();
        let mut stmt = conn.prepare("SELECT id,body FROM task_history ORDER BY started_at,rowid")?;
        let mut tasks = Vec::new();
        for row in stmt.query_map([], |row| Ok((row.get::<_, String>(0)?,row.get::<_, String>(1)?)))? {
            let (id,body) = row?;
            match serde_json::from_str(&body) {
                Ok(task) => tasks.push(task),
                Err(error) => tracing::error!(%error,task_id=%id,"Unreadable task history record preserved; remaining records are still available"),
            }
        }
        Ok(tasks)
    }
    pub fn update_task(&self, task: &crate::tasks::Task) -> Result<()> {
        // A delayed progress write must never recreate history explicitly cleared by the user.
        self.0.lock().unwrap().execute("UPDATE task_history SET state=?2,body=?3 WHERE id=?1 AND COALESCE(json_extract(body,'$.revision'),0)<=?4",params![task.id,serde_json::to_value(task.state)?.as_str().unwrap_or("unknown"),serde_json::to_string(task)?,task.revision])?;
        Ok(())
    }
    pub fn begin_operation(&self, op: &PendingOperation) -> Result<()> {
        let conn = self.0.lock().unwrap();
        conn.execute(
            "INSERT OR REPLACE INTO pending_operations
                (id, kind, instance_id, title, payload, started_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![
                op.id,
                op.kind.as_str(),
                op.instance_id,
                op.title,
                op.payload,
                op.started_at
            ],
        )?;
        Ok(())
    }

    pub fn end_operation(&self, id: &str) -> Result<()> {
        let conn = self.0.lock().unwrap();
        conn.execute("DELETE FROM pending_operations WHERE id = ?1", params![id])?;
        Ok(())
    }

    pub fn pending_operations(&self) -> Result<Vec<PendingOperation>> {
        let conn = self.0.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, kind, instance_id, title, payload, started_at
             FROM pending_operations ORDER BY started_at",
        )?;
        let rows = stmt.query_map([], |row| {
            let raw_kind: String = row.get(1)?;
            let kind = TaskKind::parse(&raw_kind).ok_or_else(|| {
                rusqlite::Error::FromSqlConversionFailure(
                    1,
                    rusqlite::types::Type::Text,
                    std::io::Error::new(
                        std::io::ErrorKind::InvalidData,
                        format!("unknown pending operation kind: {raw_kind}"),
                    )
                    .into(),
                )
            })?;
            Ok(PendingOperation {
                id: row.get(0)?,
                kind,
                instance_id: row.get(2)?,
                title: row.get(3)?,
                payload: row.get(4)?,
                started_at: row.get(5)?,
            })
        })?;
        Ok(rows.collect::<std::result::Result<Vec<_>, _>>()?)
    }

    pub fn clear_pending_operations(&self) -> Result<()> {
        let conn = self.0.lock().unwrap();
        conn.execute("DELETE FROM pending_operations", [])?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use crate::tasks::TaskKind;

    use super::*;

    #[test]
    fn pending_operations_round_trip_typed_kinds() {
        let db = Db::open_in_memory().unwrap();
        db.begin_operation(&PendingOperation {
            id: "op-1".into(),
            kind: TaskKind::ContentInstall,
            instance_id: Some("instance-1".into()),
            title: "Install".into(),
            payload: None,
            started_at: 1,
        })
        .unwrap();

        let operations = db.pending_operations().unwrap();
        assert_eq!(operations[0].kind, TaskKind::ContentInstall);
    }

    #[test]
    fn pending_operations_accept_legacy_kind_names() {
        let db = Db::open_in_memory().unwrap();
        db.0.lock()
            .unwrap()
            .execute(
                "INSERT INTO pending_operations
                    (id, kind, title, started_at)
                 VALUES ('legacy', 'ModpackInstall', 'Legacy pack', 1)",
                [],
            )
            .unwrap();

        let operations = db.pending_operations().unwrap();
        assert_eq!(operations[0].kind, TaskKind::ModpackInstall);
    }
}
