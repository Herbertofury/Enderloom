use std::path::{Path, PathBuf};

use rusqlite::{params, OptionalExtension, Transaction};

use crate::{config::Instance, error::Result, files::FileManager};

use super::{Db, ExternalInstanceLink};

fn record_playtime_tx(
    tx: &Transaction<'_>,
    instance_id: &str,
    started_at: i64,
    ended_at: i64,
    crashed: bool,
) -> Result<()> {
    let ended_at = ended_at.max(started_at);
    let played_secs = ended_at.saturating_sub(started_at);
    let snapshot = tx
        .query_row(
            "SELECT name, version_id, loader FROM instances WHERE id = ?1",
            params![instance_id],
            |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, Option<String>>(2)?,
                ))
            },
        )
        .ok();
    let (name, version_id, loader) = match snapshot {
        Some(values) => values,
        None => (instance_id.to_string(), String::new(), None),
    };
    tx.execute(
        "INSERT INTO play_sessions
            (instance_id, instance_name, started_at, ended_at, played_secs,
             crashed, version_id, loader)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![
            instance_id,
            name,
            started_at,
            ended_at,
            played_secs,
            crashed as i64,
            version_id,
            loader,
        ],
    )?;
    tx.execute(
        "UPDATE instances
         SET playtime_secs = playtime_secs + ?2, last_played_at = ?3
         WHERE id = ?1",
        params![instance_id, played_secs, ended_at],
    )?;
    Ok(())
}

impl Db {
    pub fn instance_pack_provider(&self, instance_id: &str) -> Result<Option<String>> {
        let conn = self.0.lock().unwrap();
        Ok(conn
            .query_row(
                "SELECT pack_provider FROM instances WHERE id = ?1",
                params![instance_id],
                |row| row.get(0),
            )
            .optional()?
            .flatten())
    }

    pub fn list_instances(&self, files: &FileManager) -> Result<Vec<Instance>> {
        let paths = files.paths();
        let conn = self.0.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, name, version_id, created_at, min_memory_mb, max_memory_mb,
                    java_path, last_played_at, playtime_secs, loader, loader_version,
                    launch_version_id, pack_provider, pack_project_id, pack_version_id,
                    jvm_args, jvm_args_mode, env_vars, env_vars_mode,
                    import_source, import_source_id, banner_id, notes,
                    wrapper_command, pre_launch_command, post_exit_command,
                    external_dir
             FROM instances ORDER BY created_at",
        )?;
        let rows = stmt.query_map([], |row| {
            let id: String = row.get(0)?;
            let created_at: String = row.get(3)?;
            let external_dir: Option<String> = row.get(26)?;
            Ok(Instance {
                dir: external_dir
                    .filter(|value| !value.trim().is_empty())
                    .map(PathBuf::from)
                    .unwrap_or_else(|| paths.instance_dir(&id))
                    .display()
                    .to_string(),
                logo: crate::meta::media::instance_logo(files, &id),
                id,
                name: row.get(1)?,
                version_id: row.get(2)?,
                created_at: chrono::DateTime::parse_from_rfc3339(&created_at)
                    .map(|dt| dt.with_timezone(&chrono::Utc))
                    .unwrap_or_else(|_| chrono::Utc::now()),
                min_memory_mb: row.get(4)?,
                max_memory_mb: row.get(5)?,
                java_path: row.get(6)?,
                last_played_at: row.get(7)?,
                playtime_secs: row.get(8)?,
                loader: row.get(9)?,
                loader_version: row.get(10)?,
                launch_version_id: row.get(11)?,
                pack_provider: row.get(12)?,
                pack_project_id: row.get(13)?,
                pack_version_id: row.get(14)?,
                jvm_args: row.get(15)?,
                jvm_args_mode: row.get(16)?,
                env_vars: row.get(17)?,
                env_vars_mode: row.get(18)?,
                import_source: row.get(19)?,
                import_source_id: row.get(20)?,
                banner_id: row.get(21)?,
                notes: row.get(22)?,
                wrapper_command: row.get(23)?,
                pre_launch_command: row.get(24)?,
                post_exit_command: row.get(25)?,
            })
        })?;
        Ok(rows.collect::<std::result::Result<Vec<_>, _>>()?)
    }

    pub fn set_instance_launch_tools(
        &self,
        instance_id: &str,
        wrapper: Option<&str>,
        pre_launch: Option<&str>,
        post_exit: Option<&str>,
    ) -> Result<()> {
        let conn = self.0.lock().unwrap();
        conn.execute(
            "UPDATE instances
             SET wrapper_command = ?2, pre_launch_command = ?3, post_exit_command = ?4
             WHERE id = ?1",
            params![instance_id, wrapper, pre_launch, post_exit],
        )?;
        Ok(())
    }

    pub fn set_instance_notes(&self, instance_id: &str, notes: Option<&str>) -> Result<()> {
        let conn = self.0.lock().unwrap();
        conn.execute(
            "UPDATE instances SET notes = ?2 WHERE id = ?1",
            params![instance_id, notes],
        )?;
        Ok(())
    }

    pub fn link_instance_pack(
        &self,
        instance_id: &str,
        provider: &str,
        project_id: &str,
        version_id: &str,
        pack_files: &[String],
    ) -> Result<()> {
        let mut conn = self.0.lock().unwrap();
        let transaction = conn.transaction()?;
        transaction.execute(
            "UPDATE instances
             SET pack_provider = ?2, pack_project_id = ?3, pack_version_id = ?4
             WHERE id = ?1",
            params![instance_id, provider, project_id, version_id],
        )?;
        transaction.execute(
            "UPDATE content_files SET origin = 'user'
             WHERE instance_id = ?1 AND origin = 'pack'",
            params![instance_id],
        )?;
        {
            let mut mark = transaction.prepare(
                "UPDATE content_files SET origin = 'pack'
                 WHERE instance_id = ?1 AND file_name = ?2",
            )?;
            for file_name in pack_files {
                mark.execute(params![instance_id, file_name])?;
            }
        }
        transaction.commit()?;
        Ok(())
    }

    pub fn unlink_instance_pack(&self, instance_id: &str) -> Result<()> {
        let conn = self.0.lock().unwrap();
        conn.execute(
            "UPDATE instances
             SET pack_provider = NULL, pack_project_id = NULL, pack_version_id = NULL
             WHERE id = ?1",
            params![instance_id],
        )?;
        conn.execute(
            "UPDATE content_files SET origin = 'user'
             WHERE instance_id = ?1 AND origin = 'pack'",
            params![instance_id],
        )?;
        Ok(())
    }

    pub fn insert_instance(&self, instance: &Instance) -> Result<()> {
        let conn = self.0.lock().unwrap();
        conn.execute(
            "INSERT OR REPLACE INTO instances
                (id, name, version_id, created_at, min_memory_mb, max_memory_mb,
                 java_path, last_played_at, playtime_secs, loader, loader_version,
                 launch_version_id, pack_provider, pack_project_id, pack_version_id,
                 jvm_args, jvm_args_mode, env_vars, env_vars_mode,
                 import_source, import_source_id, banner_id, notes)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15,
                     ?16, ?17, ?18, ?19, ?20, ?21, ?22, ?23)",
            params![
                instance.id,
                instance.name,
                instance.version_id,
                instance.created_at.to_rfc3339(),
                instance.min_memory_mb,
                instance.max_memory_mb,
                instance.java_path,
                instance.last_played_at,
                instance.playtime_secs,
                instance.loader,
                instance.loader_version,
                instance.launch_version_id,
                instance.pack_provider,
                instance.pack_project_id,
                instance.pack_version_id,
                instance.jvm_args,
                instance.jvm_args_mode,
                instance.env_vars,
                instance.env_vars_mode,
                instance.import_source,
                instance.import_source_id,
                instance.banner_id,
                instance.notes,
            ],
        )?;
        Ok(())
    }

    pub fn insert_external_instance(
        &self,
        instance: &Instance,
        external_dir: &Path,
        external_real_dir: &Path,
        external_root: &Path,
    ) -> Result<()> {
        let mut conn = self.0.lock().unwrap();
        let transaction = conn.transaction()?;
        transaction.execute(
            "INSERT INTO instances
                (id, name, version_id, created_at, min_memory_mb, max_memory_mb,
                 java_path, last_played_at, playtime_secs, loader, loader_version,
                 launch_version_id, pack_provider, pack_project_id, pack_version_id,
                 jvm_args, jvm_args_mode, env_vars, env_vars_mode,
                 import_source, import_source_id, banner_id, notes,
                 external_dir, external_real_dir, external_root, external_seen_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15,
                     ?16, ?17, ?18, ?19, ?20, ?21, ?22, ?23, ?24, ?25, ?26, ?27)",
            params![
                instance.id,
                instance.name,
                instance.version_id,
                instance.created_at.to_rfc3339(),
                instance.min_memory_mb,
                instance.max_memory_mb,
                instance.java_path,
                instance.last_played_at,
                instance.playtime_secs,
                instance.loader,
                instance.loader_version,
                instance.launch_version_id,
                instance.pack_provider,
                instance.pack_project_id,
                instance.pack_version_id,
                instance.jvm_args,
                instance.jvm_args_mode,
                instance.env_vars,
                instance.env_vars_mode,
                instance.import_source,
                instance.import_source_id,
                instance.banner_id,
                instance.notes,
                external_dir.display().to_string(),
                external_real_dir.display().to_string(),
                external_root.display().to_string(),
                chrono::Utc::now().timestamp(),
            ],
        )?;
        transaction.commit()?;
        Ok(())
    }

    pub fn external_instance_dirs(&self) -> Result<Vec<(String, PathBuf)>> {
        let conn = self.0.lock().unwrap();
        let mut statement = conn.prepare(
            "SELECT id, external_dir FROM instances
             WHERE external_dir IS NOT NULL AND external_dir <> ''",
        )?;
        let rows = statement.query_map([], |row| {
            Ok((
                row.get::<_, String>(0)?,
                PathBuf::from(row.get::<_, String>(1)?),
            ))
        })?;
        Ok(rows.collect::<std::result::Result<Vec<_>, _>>()?)
    }

    pub fn external_instance_real_dirs(&self) -> Result<Vec<PathBuf>> {
        let conn = self.0.lock().unwrap();
        let mut statement = conn.prepare(
            "SELECT external_real_dir FROM instances
             WHERE external_real_dir IS NOT NULL AND external_real_dir <> ''",
        )?;
        let rows = statement.query_map([], |row| row.get::<_, String>(0))?;
        Ok(rows
            .collect::<std::result::Result<Vec<_>, _>>()?
            .into_iter()
            .map(PathBuf::from)
            .collect())
    }

    pub fn external_instance_links(&self) -> Result<Vec<ExternalInstanceLink>> {
        let conn = self.0.lock().unwrap();
        let mut statement = conn.prepare(
            "SELECT id, import_source, import_source_id, external_root
             FROM instances
             WHERE external_dir IS NOT NULL AND external_dir <> ''
               AND import_source IS NOT NULL AND import_source_id IS NOT NULL
               AND external_root IS NOT NULL AND external_root <> ''",
        )?;
        let rows = statement.query_map([], |row| {
            Ok(ExternalInstanceLink {
                instance_id: row.get(0)?,
                source: row.get(1)?,
                source_id: row.get(2)?,
                root: PathBuf::from(row.get::<_, String>(3)?),
            })
        })?;
        Ok(rows.collect::<std::result::Result<Vec<_>, _>>()?)
    }

    #[allow(clippy::too_many_arguments)]
    pub fn refresh_external_instance(
        &self,
        instance_id: &str,
        version_id: &str,
        loader: Option<&str>,
        loader_version: Option<&str>,
        pack_provider: Option<&str>,
        pack_project_id: Option<&str>,
        pack_version_id: Option<&str>,
        external_dir: &Path,
        external_real_dir: &Path,
        last_played_at: Option<i64>,
    ) -> Result<()> {
        let conn = self.0.lock().unwrap();
        let changed = conn.execute(
            "UPDATE instances SET
                launch_version_id = CASE
                    WHEN version_id <> ?2
                      OR COALESCE(loader, '') <> COALESCE(?3, '')
                      OR COALESCE(loader_version, '') <> COALESCE(?4, '')
                    THEN NULL ELSE launch_version_id END,
                version_id = ?2, loader = ?3, loader_version = ?4,
                pack_provider = ?5, pack_project_id = ?6, pack_version_id = ?7,
                external_dir = ?8, external_real_dir = ?9,
                last_played_at = COALESCE(?10, last_played_at), external_seen_at = ?11
             WHERE id = ?1 AND external_dir IS NOT NULL",
            params![
                instance_id,
                version_id,
                loader,
                loader_version,
                pack_provider,
                pack_project_id,
                pack_version_id,
                external_dir.display().to_string(),
                external_real_dir.display().to_string(),
                last_played_at,
                chrono::Utc::now().timestamp(),
            ],
        )?;
        if changed == 0 {
            return Err(crate::error::Error::NotFound(format!(
                "external instance {instance_id}"
            )));
        }
        Ok(())
    }

    pub fn instance_is_external(&self, instance_id: &str) -> Result<bool> {
        let conn = self.0.lock().unwrap();
        Ok(conn.query_row(
            "SELECT external_dir IS NOT NULL AND external_dir <> ''
             FROM instances WHERE id = ?1",
            params![instance_id],
            |row| row.get(0),
        )?)
    }

    #[allow(clippy::too_many_arguments)]
    pub fn update_instance_settings(
        &self,
        instance_id: &str,
        name: &str,
        min_memory_mb: Option<u32>,
        max_memory_mb: Option<u32>,
        java_path: Option<String>,
        loader: Option<String>,
        loader_version: Option<String>,
        version_id: &str,
        jvm_args: Option<String>,
        jvm_args_mode: Option<String>,
        env_vars: Option<String>,
        env_vars_mode: Option<String>,
        reset_launch_version: bool,
    ) -> Result<()> {
        let conn = self.0.lock().unwrap();
        if reset_launch_version {
            conn.execute(
                "UPDATE instances
                 SET name = ?2, min_memory_mb = ?3, max_memory_mb = ?4, java_path = ?5,
                     loader = ?6, loader_version = ?7, version_id = ?8,
                     jvm_args = ?9, jvm_args_mode = ?10, env_vars = ?11, env_vars_mode = ?12,
                     launch_version_id = NULL
                 WHERE id = ?1",
                params![
                    instance_id,
                    name,
                    min_memory_mb,
                    max_memory_mb,
                    java_path,
                    loader,
                    loader_version,
                    version_id,
                    jvm_args,
                    jvm_args_mode,
                    env_vars,
                    env_vars_mode
                ],
            )?;
        } else {
            conn.execute(
                "UPDATE instances
                 SET name = ?2, min_memory_mb = ?3, max_memory_mb = ?4, java_path = ?5,
                     loader = ?6, loader_version = ?7, version_id = ?8,
                     jvm_args = ?9, jvm_args_mode = ?10, env_vars = ?11, env_vars_mode = ?12
                 WHERE id = ?1",
                params![
                    instance_id,
                    name,
                    min_memory_mb,
                    max_memory_mb,
                    java_path,
                    loader,
                    loader_version,
                    version_id,
                    jvm_args,
                    jvm_args_mode,
                    env_vars,
                    env_vars_mode
                ],
            )?;
        }
        Ok(())
    }

    pub fn set_instance_java_path(&self, instance_id: &str, java_path: &str) -> Result<()> {
        let conn = self.0.lock().unwrap();
        let changed = conn.execute(
            "UPDATE instances SET java_path = ?2 WHERE id = ?1",
            params![instance_id, java_path],
        )?;
        if changed == 0 {
            return Err(crate::error::Error::NotFound(format!(
                "instance {instance_id}"
            )));
        }
        Ok(())
    }

    pub fn imported_sources(&self, source: &str) -> Result<Vec<String>> {
        let conn = self.0.lock().unwrap();
        let mut statement = conn.prepare(
            "SELECT import_source_id FROM instances
             WHERE import_source = ?1 AND import_source_id IS NOT NULL",
        )?;
        let rows = statement.query_map([source], |row| row.get::<_, String>(0))?;
        Ok(rows.collect::<std::result::Result<Vec<_>, _>>()?)
    }

    pub fn delete_instance(&self, instance_id: &str) -> Result<()> {
        let mut conn = self.0.lock().unwrap();
        let transaction = conn.transaction()?;
        for table in [
            "content_files",
            "content_updates",
            "world_datapacks",
            "pending_operations",
            "active_runs",
            "instance_tag_memberships",
        ] {
            transaction.execute(
                &format!("DELETE FROM {table} WHERE instance_id = ?1"),
                params![instance_id],
            )?;
        }
        transaction.execute("DELETE FROM instances WHERE id = ?1", params![instance_id])?;
        transaction.commit()?;
        Ok(())
    }

    pub fn set_launch_version(&self, instance_id: &str, launch_version_id: &str) -> Result<()> {
        let conn = self.0.lock().unwrap();
        conn.execute(
            "UPDATE instances SET launch_version_id = ?2 WHERE id = ?1",
            params![instance_id, launch_version_id],
        )?;
        Ok(())
    }

    pub fn set_modpack_version(&self, instance: &Instance, launch_version_id: &str) -> Result<()> {
        let conn = self.0.lock().unwrap();
        let changed = conn.execute(
            "UPDATE instances SET version_id = ?2, loader = ?3, loader_version = ?4,
                    launch_version_id = ?5, pack_provider = ?6, pack_project_id = ?7,
                    pack_version_id = ?8 WHERE id = ?1",
            params![
                instance.id,
                instance.version_id,
                instance.loader,
                instance.loader_version,
                launch_version_id,
                instance.pack_provider,
                instance.pack_project_id,
                instance.pack_version_id,
            ],
        )?;
        if changed == 0 {
            return Err(crate::error::Error::NotFound(format!(
                "instance {}",
                instance.id
            )));
        }
        Ok(())
    }

    pub fn finalize_active_run(
        &self,
        running_id: &str,
        ended_at: i64,
        crashed: bool,
    ) -> Result<bool> {
        let mut conn = self.0.lock().unwrap();
        let tx = conn.transaction()?;
        let run = tx
            .query_row(
                "SELECT instance_id, started_at FROM active_runs WHERE running_id = ?1",
                params![running_id],
                |row| Ok((row.get::<_, String>(0)?, row.get::<_, i64>(1)?)),
            )
            .optional()?;
        let Some((instance_id, started_at)) = run else {
            return Ok(false);
        };
        record_playtime_tx(&tx, &instance_id, started_at, ended_at, crashed)?;
        tx.execute(
            "DELETE FROM active_runs WHERE running_id = ?1",
            params![running_id],
        )?;
        tx.commit()?;
        Ok(true)
    }
}
