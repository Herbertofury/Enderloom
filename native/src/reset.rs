use std::path::{Path, PathBuf};

use serde::Serialize;

use crate::error::{Error, Result};

const RECOVERY_DIR: &str = "reset-recovery";
const LAST_RESET: &str = "last-reset.json";

#[derive(Debug, Clone, Serialize)]
pub struct ResetPlan {
    pub deep: bool,
    pub recoverable: bool,
    pub targets: Vec<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct ResetReport {
    pub deep: bool,
    pub recovery_dir: String,
    pub moved: Vec<String>,
}

fn target_names(deep: bool) -> Vec<&'static str> {
    let mut targets = vec![
        "instances",
        "media",
        "skins",
        "logs",
        "basalt.db",
        "basalt.db-wal",
        "basalt.db-shm",
    ];
    if deep {
        targets.extend(["versions", "libraries", "assets", "natives", "runtimes"]);
    }
    targets
}

fn validate_root(root: &Path) -> Result<PathBuf> {
    if !root.is_absolute() {
        return Err(Error::other(
            "The reset data root must be an absolute path.",
        ));
    }
    let root = root.canonicalize()?;
    if root.parent().is_none() {
        return Err(Error::other("Enderloom will not reset a drive root."));
    }
    let home = std::env::var_os("USERPROFILE")
        .or_else(|| std::env::var_os("HOME"))
        .map(PathBuf::from)
        .and_then(|path| path.canonicalize().ok());
    if home.as_deref() == Some(root.as_path()) {
        return Err(Error::other("Enderloom will not reset a home directory."));
    }
    if root.components().count() < 3 {
        return Err(Error::other("The reset data root is too broad."));
    }
    Ok(root)
}

pub fn plan(root: &Path, deep: bool) -> Result<ResetPlan> {
    let root = validate_root(root)?;
    let targets = target_names(deep)
        .into_iter()
        .filter(|name| root.join(name).exists())
        .map(str::to_string)
        .collect();
    Ok(ResetPlan {
        deep,
        recoverable: true,
        targets,
    })
}

fn rollback_moves(root: &Path, recovery: &Path, moved: &[String]) -> Vec<String> {
    let mut errors = Vec::new();
    for restored in moved.iter().rev() {
        let from = recovery.join(restored);
        let to = root.join(restored);
        if let Err(error) = std::fs::rename(&from, &to) {
            errors.push(format!("{restored}: {error}"));
        }
    }
    errors
}

fn move_failure(
    root: &Path,
    recovery: &Path,
    moved: &[String],
    message: impl Into<String>,
) -> Error {
    let message = message.into();
    let rollback_errors = rollback_moves(root, recovery, moved);
    if rollback_errors.is_empty() {
        let _ = std::fs::remove_dir_all(recovery);
        Error::other(format!("{message}; all earlier moves were restored"))
    } else {
        Error::other(format!(
            "{message}; rollback also needs recovery from {}: {}",
            recovery.display(),
            rollback_errors.join("; ")
        ))
    }
}

fn write_atomic(path: &Path, bytes: &[u8]) -> std::io::Result<()> {
    let file_name = path
        .file_name()
        .and_then(|name| name.to_str())
        .unwrap_or("reset-record");
    let nonce = uuid::Uuid::new_v4();
    let pending = path.with_file_name(format!(".{file_name}.pending-{nonce}"));
    let previous = path.with_file_name(format!(".{file_name}.previous-{nonce}"));
    std::fs::write(&pending, bytes)?;

    let had_previous = path.exists();
    if had_previous {
        if let Err(error) = std::fs::rename(path, &previous) {
            let _ = std::fs::remove_file(&pending);
            return Err(error);
        }
    }
    if let Err(error) = std::fs::rename(&pending, path) {
        if had_previous {
            let _ = std::fs::rename(&previous, path);
        }
        let _ = std::fs::remove_file(&pending);
        return Err(error);
    }
    if had_previous {
        let _ = std::fs::remove_file(previous);
    }
    Ok(())
}

pub fn apply(root: &Path, deep: bool) -> Result<ResetReport> {
    let root = validate_root(root)?;
    let recovery_root = root.join(RECOVERY_DIR);
    std::fs::create_dir_all(&recovery_root)?;
    let recovery = recovery_root.join(format!(
        "{}-{}",
        chrono::Utc::now().format("%Y%m%dT%H%M%SZ"),
        uuid::Uuid::new_v4()
    ));
    std::fs::create_dir(&recovery)?;

    let mut moved: Vec<String> = Vec::new();
    for name in target_names(deep) {
        let source = root.join(name);
        if !source.exists() {
            continue;
        }
        let destination = recovery.join(name);
        if let Err(error) = std::fs::rename(&source, &destination) {
            return Err(move_failure(
                &root,
                &recovery,
                &moved,
                format!("Could not quarantine {name} for reset: {error}"),
            ));
        }
        moved.push(name.to_string());
    }

    let report = ResetReport {
        deep,
        recovery_dir: recovery.display().to_string(),
        moved,
    };
    let manifest = match serde_json::to_vec_pretty(&report) {
        Ok(manifest) => manifest,
        Err(error) => {
            return Err(move_failure(
                &root,
                &recovery,
                &report.moved,
                format!("Could not serialize the reset recovery manifest: {error}"),
            ));
        }
    };
    if let Err(error) = write_atomic(&recovery.join("manifest.json"), &manifest) {
        return Err(move_failure(
            &root,
            &recovery,
            &report.moved,
            format!("Could not write the reset recovery manifest: {error}"),
        ));
    }
    if let Err(error) = write_atomic(&root.join(LAST_RESET), &manifest) {
        return Err(move_failure(
            &root,
            &recovery,
            &report.moved,
            format!("Could not publish the reset recovery record: {error}"),
        ));
    }
    Ok(report)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reset_moves_exact_targets_into_a_recovery_set() {
        let root =
            std::env::temp_dir().join(format!("enderloom-reset-test-{}", uuid::Uuid::new_v4()));
        std::fs::create_dir_all(root.join("instances/one")).unwrap();
        std::fs::create_dir_all(root.join("versions/v1")).unwrap();
        std::fs::write(root.join("basalt.db"), b"database").unwrap();
        std::fs::write(root.join("keep.txt"), b"keep").unwrap();

        let report = apply(&root, false).unwrap();
        assert!(!root.join("instances").exists());
        assert!(!root.join("basalt.db").exists());
        assert!(root.join("versions/v1").exists());
        assert!(root.join("keep.txt").exists());
        assert!(Path::new(&report.recovery_dir)
            .join("instances/one")
            .exists());
        assert!(Path::new(&report.recovery_dir).join("basalt.db").exists());
        assert!(root.join(LAST_RESET).exists());
        std::fs::remove_dir_all(root).ok();
    }
}
