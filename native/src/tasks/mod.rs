use std::{
    collections::HashMap,
    path::PathBuf,
    sync::{Arc, Mutex},
    time::{Duration, Instant},
};

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};
use tokio_util::sync::CancellationToken;

const EMIT_INTERVAL: Duration = Duration::from_millis(100);

pub type EventSink = Arc<dyn Fn(&str, serde_json::Value) + Send + Sync>;

tokio::task_local! { static REQUEST_SCOPE: String; }

pub(crate) async fn request_scoped<T>(
    scope: Option<String>,
    work: impl std::future::Future<Output = T>,
) -> T {
    match scope {
        Some(scope) => REQUEST_SCOPE.scope(scope, work).await,
        None => work.await,
    }
}

#[derive(Clone)]
enum EventTarget {
    Tauri(AppHandle),
    Ipc(EventSink),
}

impl EventTarget {
    fn emit<T: Serialize>(&self, event: &str, payload: &T) {
        match self {
            Self::Tauri(app) => {
                let _ = app.emit(event, payload);
            }
            Self::Ipc(sink) => match serde_json::to_value(payload) {
                Ok(payload) => sink(event, payload),
                Err(error) => tracing::warn!(%error, event, "could not serialize IPC event"),
            },
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TaskKind {
    GameInstall,
    JavaInstall,
    LoaderInstall,
    ModpackInstall,
    ModpackUpgrade,
    ContentInstall,
    ContentUpdate,
    WorldImport,
    InstanceImport,
    AppUpdate,
    InstanceRepair,
    InstanceDuplicate,
    SnapshotCreate,
    SnapshotRestore,
    StorageScan,
    PerformanceScan,
    ConversionIntake,
    PerformanceTest,
    PerformanceComparison,
    DatapackInstall,
    DataMove,
    ServerInstall,
    ServerImport,
}

impl TaskKind {
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::GameInstall => "game_install",
            Self::JavaInstall => "java_install",
            Self::LoaderInstall => "loader_install",
            Self::ModpackInstall => "modpack_install",
            Self::ModpackUpgrade => "modpack_upgrade",
            Self::ContentInstall => "content_install",
            Self::ContentUpdate => "content_update",
            Self::WorldImport => "world_import",
            Self::InstanceImport => "instance_import",
            Self::AppUpdate => "app_update",
            Self::InstanceRepair => "instance_repair",
            Self::InstanceDuplicate => "instance_duplicate",
            Self::SnapshotCreate => "snapshot_create",
            Self::SnapshotRestore => "snapshot_restore",
            Self::StorageScan => "storage_scan",
            Self::PerformanceScan => "performance_scan",
            Self::ConversionIntake => "conversion_intake",
            Self::PerformanceTest => "performance_test",
            Self::PerformanceComparison => "performance_comparison",
            Self::DatapackInstall => "datapack_install",
            Self::DataMove => "data_move",
            Self::ServerInstall => "server_install",
            Self::ServerImport => "server_import",
        }
    }

    pub fn parse(value: &str) -> Option<Self> {
        match value {
            "performance_scan" | "PerformanceScan" => Some(Self::PerformanceScan),
            "conversion_intake" | "ConversionIntake" => Some(Self::ConversionIntake),
            "performance_test" | "PerformanceTest" => Some(Self::PerformanceTest),
            "performance_comparison" | "PerformanceComparison" => Some(Self::PerformanceComparison),
            "game_install" | "GameInstall" => Some(Self::GameInstall),
            "java_install" | "JavaInstall" => Some(Self::JavaInstall),
            "loader_install" | "LoaderInstall" => Some(Self::LoaderInstall),
            "modpack_install" | "ModpackInstall" => Some(Self::ModpackInstall),
            "modpack_upgrade" | "ModpackUpgrade" => Some(Self::ModpackUpgrade),
            "content_install" | "ContentInstall" => Some(Self::ContentInstall),
            "content_update" | "ContentUpdate" => Some(Self::ContentUpdate),
            "world_import" | "WorldImport" => Some(Self::WorldImport),
            "instance_import" | "InstanceImport" => Some(Self::InstanceImport),
            "app_update" | "AppUpdate" => Some(Self::AppUpdate),
            "instance_repair" | "InstanceRepair" => Some(Self::InstanceRepair),
            "instance_duplicate" | "InstanceDuplicate" => Some(Self::InstanceDuplicate),
            "snapshot_create" | "SnapshotCreate" => Some(Self::SnapshotCreate),
            "snapshot_restore" | "SnapshotRestore" => Some(Self::SnapshotRestore),
            "storage_scan" | "StorageScan" => Some(Self::StorageScan),
            "datapack_install" | "DatapackInstall" => Some(Self::DatapackInstall),
            "data_move" | "DataMove" => Some(Self::DataMove),
            "server_install" | "ServerInstall" => Some(Self::ServerInstall),
            "server_import" | "ServerImport" => Some(Self::ServerImport),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TaskState {
    Running,
    Succeeded,
    Failed,
    Cancelled,
    Interrupted,
}

impl TaskState {
    pub fn is_finished(&self) -> bool {
        matches!(
            self,
            TaskState::Succeeded
                | TaskState::Failed
                | TaskState::Cancelled
                | TaskState::Interrupted
        )
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "operation", rename_all = "snake_case")]
pub enum TaskCheckpoint {
    ModInspection { instance_id: String, history: bool },
    ConversionIntake { request: crate::conversion::Request },
}

fn first_attempt() -> u32 {
    1
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Task {
    pub id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub request_scope: Option<String>,
    pub kind: TaskKind,
    pub title: String,
    pub subtitle: Option<String>,
    pub icon_url: Option<String>,
    pub instance_id: Option<String>,
    pub server_id: Option<String>,
    pub project_id: Option<String>,
    pub state: TaskState,
    pub stage: String,
    pub completed: u64,
    pub total: u64,
    pub downloaded_bytes: u64,
    pub total_bytes: u64,
    pub error: Option<String>,
    pub retries: u64,
    pub retry_note: Option<String>,
    pub started_at: i64,
    pub finished_at: Option<i64>,
    #[serde(default)]
    pub checkpoint: Option<TaskCheckpoint>,
    #[serde(default = "first_attempt")]
    pub attempt: u32,
    #[serde(default)]
    pub revision: u64,
}

#[derive(Debug, Clone, Default)]
pub struct TaskSpec {
    pub title: String,
    pub subtitle: Option<String>,
    pub icon_url: Option<String>,
    pub instance_id: Option<String>,
    pub server_id: Option<String>,
    pub project_id: Option<String>,
    pub total: u64,
    pub total_bytes: u64,
}

fn is_recoverable(kind: TaskKind) -> bool {
    matches!(
        kind,
        TaskKind::ModpackInstall
            | TaskKind::ContentInstall
            | TaskKind::ContentUpdate
            | TaskKind::WorldImport
    )
}

pub struct Tasks {
    inner: Mutex<Vec<Task>>,
    tokens: Mutex<HashMap<String, CancellationToken>>,
    db: crate::db::Db,
    event_sink: Mutex<Option<EventSink>>,
}

impl Tasks {
    pub fn new(db: crate::db::Db) -> Self {
        let mut history = db.load_task_history().unwrap_or_else(|error| {
            tracing::error!(%error,"Could not read task history; stored records were preserved");
            Vec::new()
        });
        for task in &mut history {
            if task.state == TaskState::Running {
                task.state = TaskState::Interrupted;
                task.revision += 1;
                task.error = Some("Enderloom closed before this operation finished.".into());
                if let Err(error) = db.save_task(task) {
                    tracing::error!(%error,task_id=%task.id,"Could not record interrupted task");
                }
            }
        }
        Self {
            inner: Mutex::new(history),
            tokens: Mutex::new(HashMap::new()),
            db,
            event_sink: Mutex::new(None),
        }
    }

    pub fn set_event_sink(&self, sink: EventSink) {
        *self.event_sink.lock().unwrap() = Some(sink);
    }

    pub fn event_sink(&self) -> Option<EventSink> {
        self.event_sink.lock().unwrap().clone()
    }

    pub fn cancel(&self, id: &str) -> bool {
        let token = self.tokens.lock().unwrap().get(id).cloned();
        match token {
            Some(token) => {
                token.cancel();
                true
            }
            None => false,
        }
    }

    pub fn list(&self) -> Vec<Task> {
        self.inner.lock().unwrap().clone()
    }

    pub fn has_active(&self, instance_id: &str, kind: TaskKind) -> bool {
        self.inner.lock().unwrap().iter().any(|task| {
            task.instance_id.as_deref() == Some(instance_id)
                && task.kind == kind
                && task.state == TaskState::Running
        })
    }

    pub fn clear_finished(&self) {
        let mut list = self.inner.lock().unwrap();
        if let Err(error) = self.db.clear_finished_task_history() {
            tracing::error!(%error,"Could not clear task history");
            return;
        }
        list.retain(|t| !t.state.is_finished() || t.state == TaskState::Interrupted);
    }

    pub fn start(
        self: &Arc<Self>,
        app: &AppHandle,
        kind: TaskKind,
        spec: TaskSpec,
    ) -> crate::error::Result<TaskHandle> {
        self.start_with_target(EventTarget::Tauri(app.clone()), kind, spec)
    }

    pub fn start_ipc(
        self: &Arc<Self>,
        kind: TaskKind,
        spec: TaskSpec,
    ) -> crate::error::Result<TaskHandle> {
        let sink = self
            .event_sink
            .lock()
            .unwrap()
            .clone()
            .ok_or_else(|| crate::error::Error::other("IPC task event sink is unavailable"))?;
        self.start_with_target(EventTarget::Ipc(sink), kind, spec)
    }

    fn start_with_target(
        self: &Arc<Self>,
        target: EventTarget,
        kind: TaskKind,
        spec: TaskSpec,
    ) -> crate::error::Result<TaskHandle> {
        let task = Task {
            id: uuid::Uuid::new_v4().to_string(),
            request_scope: REQUEST_SCOPE.try_with(Clone::clone).ok(),
            kind,
            title: spec.title,
            subtitle: spec.subtitle,
            icon_url: spec.icon_url,
            instance_id: spec.instance_id,
            server_id: spec.server_id,
            project_id: spec.project_id,
            state: TaskState::Running,
            stage: "preparing".to_string(),
            completed: 0,
            total: spec.total,
            downloaded_bytes: 0,
            total_bytes: spec.total_bytes,
            error: None,
            retries: 0,
            retry_note: None,
            started_at: chrono::Utc::now().timestamp(),
            finished_at: None,
            checkpoint: None,
            attempt: 1,
            revision: 1,
        };

        let id = task.id.clone();
        if is_recoverable(kind) {
            self.db.begin_operation(&crate::db::PendingOperation {
                id: id.clone(),
                kind,
                instance_id: task.instance_id.clone(),
                title: task.title.clone(),
                payload: None,
                started_at: task.started_at,
            })?;
        }

        self.db.save_task(&task)?;
        {
            let mut list = self.inner.lock().unwrap();
            list.push(task.clone());
        }
        let token = CancellationToken::new();
        self.tokens
            .lock()
            .unwrap()
            .insert(id.clone(), token.clone());

        target.emit("task:update", &task);

        Ok(TaskHandle {
            id,
            attempt: task.attempt,
            target,
            tasks: Arc::clone(self),
            last_emit: Mutex::new(Instant::now()),
            token,
            written: Mutex::new(Vec::new()),
            last_persist: Mutex::new(Instant::now()),
        })
    }

    pub fn resume_ipc(
        self: &Arc<Self>,
        id: &str,
    ) -> crate::error::Result<(TaskCheckpoint, TaskHandle)> {
        let sink = self
            .event_sink()
            .ok_or_else(|| crate::error::Error::other("Task event sink is unavailable"))?;
        let mut list = self.inner.lock().unwrap();
        let task = list
            .iter_mut()
            .find(|t| t.id == id)
            .ok_or_else(|| crate::error::Error::other("Task was not found"))?;
        if task.state == TaskState::Running || task.state == TaskState::Succeeded {
            return Err(crate::error::Error::other(
                "This task is already running or complete",
            ));
        }
        let checkpoint = task.checkpoint.clone().ok_or_else(|| {
            crate::error::Error::other(
                "This operation has no safe resume checkpoint. Its recorded history is preserved.",
            )
        })?;
        let mut next = task.clone();
        next.state = TaskState::Running;
        next.error = None;
        next.finished_at = None;
        next.stage = "resuming".into();
        next.attempt += 1;
        next.revision += 1;
        next.request_scope = REQUEST_SCOPE.try_with(Clone::clone).ok();
        self.db.save_task(&next)?;
        *task = next.clone();
        let token = CancellationToken::new();
        self.tokens.lock().unwrap().insert(id.into(), token.clone());
        drop(list);
        let target = EventTarget::Ipc(sink);
        target.emit("task:update", &next);
        Ok((
            checkpoint,
            TaskHandle {
                id: id.into(),
                attempt: next.attempt,
                target,
                tasks: Arc::clone(self),
                last_emit: Mutex::new(Instant::now()),
                token,
                written: Mutex::new(Vec::new()),
                last_persist: Mutex::new(Instant::now()),
            },
        ))
    }

    fn mutate<F>(&self, id: &str, attempt: u32, apply: F) -> Option<Task>
    where
        F: FnOnce(&mut Task),
    {
        let mut list = self.inner.lock().unwrap();
        let task = list.iter_mut().find(|t| t.id == id)?;
        if task.state.is_finished() || task.attempt != attempt {
            return None;
        }
        apply(task);
        task.revision += 1;
        Some(task.clone())
    }
}

pub struct TaskHandle {
    id: String,
    attempt: u32,
    target: EventTarget,
    tasks: Arc<Tasks>,
    last_emit: Mutex<Instant>,
    token: CancellationToken,
    written: Mutex<Vec<PathBuf>>,
    last_persist: Mutex<Instant>,
}

impl TaskHandle {
    pub fn id(&self) -> &str { &self.id }
    pub fn checkpoint(&self, checkpoint: TaskCheckpoint) -> crate::error::Result<()> {
        let mut list = self.tasks.inner.lock().unwrap();
        let task = list
            .iter_mut()
            .find(|t| t.id == self.id)
            .ok_or_else(|| crate::error::Error::other("Task no longer exists"))?;
        if task.state != TaskState::Running || task.attempt != self.attempt {
            return Err(crate::error::Error::other(
                "Task attempt is no longer active",
            ));
        }
        let mut next = task.clone();
        next.checkpoint = Some(checkpoint);
        next.revision += 1;
        self.tasks.db.save_task(&next)?;
        *task = next;
        Ok(())
    }

    fn persist(&self, task: &Task, force: bool) {
        let mut last = self.last_persist.lock().unwrap();
        if force || last.elapsed() >= Duration::from_secs(1) {
            if let Err(error) = self.tasks.db.update_task(task) {
                tracing::error!(%error,task_id=%self.id,"Could not checkpoint task progress");
            } else {
                *last = Instant::now();
            }
        }
    }
    pub fn token(&self) -> CancellationToken {
        self.token.clone()
    }

    pub fn written(&self) -> &Mutex<Vec<PathBuf>> {
        &self.written
    }

    fn should_emit(&self) -> bool {
        let mut last = self.last_emit.lock().unwrap();
        if last.elapsed() >= EMIT_INTERVAL {
            *last = Instant::now();
            true
        } else {
            false
        }
    }

    fn force_emit(&self) {
        *self.last_emit.lock().unwrap() = Instant::now();
    }

    pub fn stage(&self, stage: &str) {
        if let Some(task) = self.tasks.mutate(&self.id, self.attempt, |t| {
            t.stage = stage.to_string();
        }) {
            self.force_emit();
            self.persist(&task, false);
            self.target.emit("task:update", &task);
        }
    }

    pub fn set_total(&self, total: u64, total_bytes: u64) {
        if let Some(task) = self.tasks.mutate(&self.id, self.attempt, |t| {
            t.total = total;
            t.total_bytes = total_bytes;
        }) {
            self.force_emit();
            self.persist(&task, true);
            self.target.emit("task:update", &task);
        }
    }

    pub fn progress(&self, completed: u64, total: u64, downloaded_bytes: u64, total_bytes: u64) {
        let mut cleared_retry = false;
        let updated = self.tasks.mutate(&self.id, self.attempt, |t| {
            t.completed = completed;
            t.total = total;
            t.downloaded_bytes = downloaded_bytes;
            t.total_bytes = total_bytes;
            if t.retry_note.is_some() {
                t.retry_note = None;
                cleared_retry = true;
            }
        });
        if let Some(task) = updated {
            self.persist(&task, false);
            if cleared_retry {
                self.force_emit();
                self.target.emit("task:update", &task);
            } else if self.should_emit() {
                self.target.emit("task:update", &task);
            }
        }
    }

    pub fn note_retry(&self, attempt: u32, max: u32, reason: &str) {
        if let Some(task) = self.tasks.mutate(&self.id, self.attempt, |t| {
            t.retries += 1;
            t.retry_note = Some(format!("Retrying {attempt} of {max}: {reason}"));
        }) {
            self.force_emit();
            self.persist(&task, true);
            self.target.emit("task:update", &task);
        }
    }

    fn settle(&self, state: TaskState, error: Option<String>) {
        let mut list = self.tasks.inner.lock().unwrap();
        let Some(task) = list.iter_mut().find(|t| t.id == self.id) else {
            return;
        };
        if task.state.is_finished() || task.attempt != self.attempt {
            return;
        }
        task.state = state;
        task.revision += 1;
        task.error = error;
        task.finished_at = Some(chrono::Utc::now().timestamp());
        if state == TaskState::Succeeded && task.total > 0 {
            task.completed = task.total;
            task.downloaded_bytes = task.total_bytes;
        }
        task.stage = match state {
            TaskState::Succeeded => "done".to_string(),
            TaskState::Failed => "failed".to_string(),
            TaskState::Cancelled => "cancelled".to_string(),
            _ => task.stage.clone(),
        };
        let snapshot = task.clone();
        self.persist(&snapshot, true);
        self.tasks.tokens.lock().unwrap().remove(&self.id);
        if let Err(error) = self.tasks.db.end_operation(&self.id) {
            tracing::warn!(task_id = %self.id, %error, "could not clear the recovery journal");
        }
        drop(list);
        self.target.emit("task:update", &snapshot);
    }

    pub fn succeed(&self) {
        self.settle(TaskState::Succeeded, None);
    }

    pub fn cancelled(&self) {
        self.settle(TaskState::Cancelled, None);
    }

    pub fn fail(&self, error: impl std::fmt::Display) {
        self.settle(TaskState::Failed, Some(error.to_string()));
    }

    pub fn finish<T>(&self, result: &crate::error::Result<T>) {
        match result {
            Ok(_) => self.succeed(),
            Err(crate::error::Error::Cancelled) => self.cancelled(),
            Err(e) => self.fail(e),
        }
    }
}

impl Drop for TaskHandle {
    fn drop(&mut self) {
        self.settle(TaskState::Failed, Some("The operation stopped before completion. Its checkpoint and history were preserved.".into()));
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn test_db() -> crate::db::Db {
        crate::db::Db::open_in_memory().unwrap()
    }

    fn task(id: &str, state: TaskState) -> Task {
        Task {
            request_scope: None,
            id: id.into(),
            kind: TaskKind::ContentInstall,
            title: id.into(),
            subtitle: None,
            icon_url: None,
            instance_id: None,
            server_id: None,
            project_id: None,
            state,
            stage: "x".into(),
            completed: 0,
            total: 0,
            downloaded_bytes: 0,
            total_bytes: 0,
            error: None,
            retries: 0,
            retry_note: None,
            started_at: 0,
            finished_at: None,
            checkpoint: None,
            attempt: 1,
            revision: 1,
        }
    }

    #[test]
    fn finished_states_are_terminal() {
        assert!(TaskState::Succeeded.is_finished());
        assert!(TaskState::Failed.is_finished());
        assert!(TaskState::Cancelled.is_finished());
        assert!(!TaskState::Running.is_finished());
    }

    #[test]
    fn task_kind_parses_current_and_legacy_names() {
        assert_eq!(
            TaskKind::parse("modpack_install"),
            Some(TaskKind::ModpackInstall)
        );
        assert_eq!(
            TaskKind::parse("ModpackInstall"),
            Some(TaskKind::ModpackInstall)
        );
        assert_eq!(
            TaskKind::parse("modpack_upgrade"),
            Some(TaskKind::ModpackUpgrade)
        );
        assert_eq!(
            TaskKind::parse("instance_repair"),
            Some(TaskKind::InstanceRepair)
        );
        assert_eq!(
            TaskKind::parse("InstanceDuplicate"),
            Some(TaskKind::InstanceDuplicate)
        );
        assert_eq!(
            TaskKind::parse("snapshot_restore"),
            Some(TaskKind::SnapshotRestore)
        );
        assert_eq!(TaskKind::parse("unknown"), None);
    }

    #[test]
    fn clear_finished_keeps_running_tasks() {
        let tasks = Tasks::new(test_db());
        {
            let mut list = tasks.inner.lock().unwrap();
            list.push(task("a", TaskState::Succeeded));
            list.push(task("b", TaskState::Running));
            list.push(task("c", TaskState::Failed));
        }
        tasks.clear_finished();
        let ids: Vec<String> = tasks.list().into_iter().map(|t| t.id).collect();
        assert_eq!(ids, vec!["b"]);
    }

    #[test]
    fn history_survives_restart_without_a_finished_task_cap() {
        let db = test_db();
        for id in 0..75 {
            db.save_task(&task(&id.to_string(), TaskState::Succeeded))
                .unwrap();
        }
        db.save_task(&task("interrupted", TaskState::Running))
            .unwrap();
        let tasks = Tasks::new(db);
        assert_eq!(tasks.list().len(), 76);
        assert_eq!(tasks.list().last().unwrap().state, TaskState::Interrupted);
    }

    #[test]
    fn mutate_ignores_finished_tasks() {
        let tasks = Tasks::new(test_db());
        {
            let mut list = tasks.inner.lock().unwrap();
            list.push(task("done", TaskState::Succeeded));
        }
        let result = tasks.mutate("done", 1, |t| t.stage = "changed".into());
        assert!(result.is_none());
        assert_eq!(tasks.list()[0].stage, "x");
    }
}
