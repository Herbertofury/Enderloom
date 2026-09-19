//! Durable task provenance lives in task_history, alongside progress, never in a second job store.
use super::*;
use crate::error::{Error, Result};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskTarget {
    pub kind: String,
    pub id: String,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Attempt {
    pub id: String,
    pub number: u32,
    pub started_at: Option<i64>,
    pub finished_at: Option<i64>,
    pub state: TaskState,
    pub stage: String,
    pub error: Option<String>,
    pub checkpoint_id: Option<String>,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Blocker {
    pub code: String,
    pub reason: String,
    pub recovery: String,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessReference {
    pub run_id: String,
    pub pid: u32,
    pub role: String,
    pub attempt: u32,
    pub observed_at: i64,
    pub stopped_at: Option<i64>,
}
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum CleanupState {
    Owned,
    Removed,
    Retained,
    NeedsReview,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CleanupResource {
    pub kind: String,
    pub id: String,
    pub path: String,
    pub attempt: u32,
    pub state: CleanupState,
    pub reason: String,
    pub updated_at: i64,
}
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(default)]
pub struct TaskDetails {
    pub schema_version: u32,
    pub operation: String,
    pub target: Option<TaskTarget>,
    pub parent_task_id: Option<String>,
    pub attempts: Vec<Attempt>,
    pub history_note: Option<String>,
    pub checkpoint_id: Option<String>,
    pub cancellation_requested_at: Option<i64>,
    pub blocker: Option<Blocker>,
    pub run_ids: Vec<String>,
    pub processes: Vec<ProcessReference>,
    pub produced_evidence: Vec<String>,
    pub cleanup: Vec<CleanupResource>,
    pub archived: bool,
}
pub(super) fn checkpoint_id(checkpoint: &TaskCheckpoint) -> Result<String> {
    Ok(format!(
        "sha256:{:x}",
        Sha256::digest(serde_json::to_vec(checkpoint)?)
    ))
}
pub(super) fn initialize(task: &mut Task, legacy: bool) {
    task.details.schema_version = 2;
    if task.details.operation.is_empty() {
        task.details.operation = format!("task:{}", task.kind.as_str());
    }
    if task.details.target.is_none() {
        task.details.target = task
            .instance_id
            .as_ref()
            .map(|id| ("instance", id))
            .or_else(|| task.server_id.as_ref().map(|id| ("server", id)))
            .or_else(|| task.project_id.as_ref().map(|id| ("project", id)))
            .map(|(kind, id)| TaskTarget {
                kind: kind.into(),
                id: id.clone(),
            });
    }
    if legacy {
        task.details.history_note = Some("Migrated progress record. Earlier attempts, process ownership and evidence links were not recorded and have not been inferred.".into());
    }
    task.details.checkpoint_id = task.checkpoint.as_ref().and_then(|c| checkpoint_id(c).ok());
    task.details.attempts.push(Attempt {
        id: if legacy {
            format!("{}:legacy:{}", task.id, task.attempt)
        } else {
            uuid::Uuid::new_v4().to_string()
        },
        number: task.attempt,
        started_at: if legacy && task.attempt > 1 {
            None
        } else {
            Some(task.started_at)
        },
        finished_at: task.finished_at,
        state: task.state,
        stage: task.stage.clone(),
        error: task.error.clone(),
        checkpoint_id: task.details.checkpoint_id.clone(),
    });
}
pub(super) fn sync_attempt(task: &mut Task) {
    if let Some(attempt) = task
        .details
        .attempts
        .last_mut()
        .filter(|a| a.number == task.attempt)
    {
        attempt.finished_at = task.finished_at;
        attempt.state = task.state;
        attempt.stage = task.stage.clone();
        attempt.error = task.error.clone();
        attempt.checkpoint_id = task.details.checkpoint_id.clone();
    }
}
pub(super) fn block(task: &mut Task, code: &str, reason: &str) {
    task.details.blocker = Some(Blocker {
        code: code.into(),
        reason: reason.into(),
        recovery: if task.checkpoint.is_some() {
            "Resume revalidates the original inputs and reuses verified completed work. Review the error before retrying.".into()
        } else {
            "No safe automatic resume checkpoint was recorded. Review owned resources and rerun the original operation when ready.".into()
        },
    });
}

impl Tasks {
    pub fn detail(&self, id: &str) -> Result<Value> {
        let list = self.inner.lock().unwrap();
        let task = list
            .iter()
            .find(|t| t.id == id)
            .ok_or_else(|| Error::other("Task was not found"))?;
        let parent = task
            .details
            .parent_task_id
            .as_ref()
            .and_then(|p| list.iter().find(|t| &t.id == p));
        let children = list
            .iter()
            .filter(|t| t.details.parent_task_id.as_deref() == Some(id))
            .collect::<Vec<_>>();
        Ok(json!({"task":task,"parent":parent,"children":children}))
    }
    /// Commit metadata before publishing it, including after the work has settled.
    fn annotate(&self, id: &str, apply: impl FnOnce(&mut Task) -> Result<()>) -> Result<()> {
        let next = {
            let mut list = self.inner.lock().unwrap();
            let current = list
                .iter_mut()
                .find(|t| t.id == id)
                .ok_or_else(|| Error::other("Task was not found"))?;
            let mut next = current.clone();
            apply(&mut next)?;
            next.revision += 1;
            self.db.update_task(&next)?;
            *current = next.clone();
            next
        };
        if !next.details.archived {
            if let Some(sink) = self.event_sink() {
                sink("task:update", serde_json::to_value(next)?);
            }
        }
        Ok(())
    }
    pub fn attach_evidence(&self, id: &str, evidence: &str) -> Result<()> {
        if self
            .db
            .library_get(&format!("evidence-artifact:{evidence}"))?
            .is_none()
        {
            return Err(Error::other(
                "Produced evidence must exist before it is linked",
            ));
        }
        self.annotate(id, |t| {
            if !t.details.produced_evidence.iter().any(|e| e == evidence) {
                t.details.produced_evidence.push(evidence.into());
            }
            Ok(())
        })
    }
    pub fn record_process(&self, id: &str, run_id: &str, pid: u32, role: &str) -> Result<()> {
        self.annotate(id, |t| {
            if !t.details.run_ids.iter().any(|r| r == run_id) {
                t.details.run_ids.push(run_id.into());
            }
            if !t
                .details
                .processes
                .iter()
                .any(|p| p.run_id == run_id && p.pid == pid && p.role == role)
            {
                t.details.processes.push(ProcessReference {
                    run_id: run_id.into(),
                    pid,
                    role: role.into(),
                    attempt: t.attempt,
                    observed_at: chrono::Utc::now().timestamp(),
                    stopped_at: None,
                });
            }
            Ok(())
        })
    }
    pub fn cleanup_result(
        &self,
        id: &str,
        resource_id: &str,
        removed: bool,
        reason: &str,
    ) -> Result<()> {
        self.annotate(id, |t| {
            let resource = t
                .details
                .cleanup
                .iter_mut()
                .find(|r| r.id == resource_id)
                .ok_or_else(|| Error::other("Resource is not owned by this task"))?;
            resource.state = if removed {
                CleanupState::Removed
            } else {
                CleanupState::Retained
            };
            resource.reason = reason.into();
            resource.updated_at = chrono::Utc::now().timestamp();
            Ok(())
        })
    }
    pub fn process_stopped(&self, id: &str, run_id: &str) -> Result<()> {
        self.annotate(id, |t| {
            for p in &mut t.details.processes {
                if p.run_id == run_id && p.stopped_at.is_none() {
                    p.stopped_at = Some(chrono::Utc::now().timestamp());
                }
            }
            Ok(())
        })
    }
}
impl TaskHandle {
    pub fn bind_run(&self, run_id: &str) -> Result<()> {
        self.tasks.annotate(&self.id, |t| {
            if t.attempt != self.attempt {
                return Err(Error::other("Task attempt is no longer active"));
            }
            if !t.details.run_ids.iter().any(|r| r == run_id) {
                t.details.run_ids.push(run_id.into());
            }
            Ok(())
        })
    }
    /// This is an ownership receipt, never permission to delete an arbitrary path.
    /// The domain's existing UUID/sandbox validation remains the cleanup authority.
    pub fn own_resource(&self, kind: &str, id: &str, path: &std::path::Path) -> Result<()> {
        self.tasks.annotate(&self.id,|t|{
            if t.attempt!=self.attempt||t.state!=TaskState::Running{return Err(Error::other("Task attempt is no longer active"));}
            if !t.details.cleanup.iter().any(|r|r.id==id){t.details.cleanup.push(CleanupResource{
                kind:kind.into(),id:id.into(),path:path.display().to_string(),attempt:self.attempt,state:CleanupState::Owned,
                reason:"Reserved by this task; domain cleanup verifies ownership before removing it.".into(),updated_at:chrono::Utc::now().timestamp(),
            });}Ok(())
        })
    }
    pub fn produced_evidence(&self, id: &str) -> Result<()> {
        self.tasks.attach_evidence(&self.id, id)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    fn owner() -> Arc<Tasks> {
        let tasks = Arc::new(Tasks::new(crate::db::Db::open_in_memory().unwrap()));
        tasks.set_event_sink(Arc::new(|_, _| {}));
        tasks
    }
    fn start(tasks: &Arc<Tasks>, parent: Option<&str>) -> TaskHandle {
        tasks
            .start_ipc(
                TaskKind::PerformanceScan,
                TaskSpec {
                    title: "Task fixture".into(),
                    parent_task_id: parent.map(str::to_owned),
                    ..Default::default()
                },
            )
            .unwrap()
    }
    #[test]
    fn descendant_cancellation_and_late_child_guard() {
        let tasks = owner();
        let parent = start(&tasks, None);
        let child = start(&tasks, Some(parent.id()));
        let grandchild = start(&tasks, Some(child.id()));
        let unrelated = start(&tasks, None);
        assert!(tasks.cancel(parent.id()));
        assert!(parent.token().is_cancelled());
        assert!(child.token().is_cancelled());
        assert!(grandchild.token().is_cancelled());
        assert!(!unrelated.token().is_cancelled());
        assert!(tasks
            .start_ipc(
                TaskKind::PerformanceScan,
                TaskSpec {
                    parent_task_id: Some(parent.id().into()),
                    ..Default::default()
                }
            )
            .is_err());
        assert_eq!(
            tasks.detail(parent.id()).unwrap()["children"]
                .as_array()
                .unwrap()
                .len(),
            1
        );
        let persisted = tasks.db.load_task_history().unwrap();
        assert!(persisted
            .iter()
            .find(|t| t.id == child.id())
            .unwrap()
            .details
            .cancellation_requested_at
            .is_some());
    }
    #[test]
    fn attempts_keep_prior_failure_and_reject_stale_progress() {
        let tasks = owner();
        let old = start(&tasks, None);
        old.checkpoint(TaskCheckpoint::ModInspection {
            instance_id: "example".into(),
            history: true,
        })
        .unwrap();
        old.stage("Inspecting original bytes");
        old.fail("Changed input");
        let original = tasks.detail(old.id()).unwrap()["task"].clone();
        let (_, new) = tasks.resume_ipc(old.id()).unwrap();
        old.stage("Late progress");
        assert!(old.bind_run("stale-run").is_err());
        new.bind_run("current-run").unwrap();
        new.succeed();
        let completed = tasks.detail(old.id()).unwrap()["task"].clone();
        assert_eq!(
            completed["details"]["attempts"][0],
            original["details"]["attempts"][0]
        );
        assert_eq!(
            completed["details"]["attempts"].as_array().unwrap().len(),
            2
        );
        assert_ne!(
            completed["details"]["attempts"][0]["id"],
            completed["details"]["attempts"][1]["id"]
        );
        assert_eq!(
            completed["details"]["checkpoint_id"],
            original["details"]["checkpoint_id"]
        );
        assert_eq!(completed["details"]["run_ids"], json!(["current-run"]));
        tasks.clear_finished();
        assert!(tasks.list().is_empty());
        let restarted = Tasks::new(tasks.db.clone());
        assert!(restarted.list().is_empty());
        assert_eq!(
            restarted.detail(old.id()).unwrap()["task"]["details"]["attempts"],
            completed["details"]["attempts"]
        );
    }
    #[test]
    fn restart_retains_owned_resources_and_process_identity_without_deleting() {
        let tasks = owner();
        let task = start(&tasks, None);
        task.bind_run("test-run").unwrap();
        task.own_resource(
            "instance_sandbox",
            "owned-id",
            std::path::Path::new("untouched-fixture"),
        )
        .unwrap();
        tasks
            .record_process(task.id(), "minecraft-run", 12345, "minecraft")
            .unwrap();
        let restarted = Tasks::new(tasks.db.clone());
        let detail = restarted.detail(task.id()).unwrap();
        assert_eq!(detail["task"]["state"], "interrupted");
        assert_eq!(
            detail["task"]["details"]["cleanup"][0]["state"],
            "needs_review"
        );
        assert_eq!(detail["task"]["details"]["processes"][0]["pid"], 12345);
        assert!(detail["task"]["details"]["processes"][0]["stopped_at"].is_null());
        assert!(restarted
            .cleanup_result(task.id(), "not-owned", true, "fake")
            .is_err());
        restarted
            .cleanup_result(task.id(), "owned-id", true, "Domain verified cleanup")
            .unwrap();
        assert_eq!(
            restarted.detail(task.id()).unwrap()["task"]["details"]["cleanup"][0]["state"],
            "removed"
        );
    }
}
