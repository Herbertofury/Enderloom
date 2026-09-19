//! Typed evidence nodes in the existing canonical library. Domain records remain
//! the single normalized representation; this graph links them to retained bytes.
use crate::tasks::{TaskHandle, TaskKind, TaskSpec};
use crate::{
    error::{Error, Result},
    state::AppState,
};
use base64::Engine;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use std::io::Read;
use std::sync::Arc;

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum EvidenceKind {
    SparkProfile,
    LogAnalysis,
    PackageInventory,
}
#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ConfidenceClass {
    Measured,
    Sampled,
    Inferred,
    ExternallyReported,
}
#[derive(Clone, Serialize, Deserialize)]
pub struct Producer {
    pub adapter: String,
    pub version: String,
}
#[derive(Clone, Serialize, Deserialize)]
pub struct Target {
    pub kind: String,
    pub id: String,
    pub snapshot_id: Option<String>,
}
#[derive(Clone, Serialize, Deserialize)]
pub struct RawArtifact {
    pub sha256: String,
    pub bytes: u64,
    pub path: String,
    /// original_package, original_profile, or redacted_analysis_input
    pub representation: String,
}
#[derive(Clone, Serialize, Deserialize)]
pub struct NormalizedReference {
    pub schema: String,
    pub key: String,
    pub sha256: String,
}
#[derive(Clone, Serialize, Deserialize)]
pub struct Provenance {
    pub operation: String,
    pub source_url: Option<String>,
    pub note: String,
}
#[derive(Clone, Serialize, Deserialize)]
pub struct EvidenceArtifact {
    pub schema_version: u32,
    pub id: String,
    pub kind: EvidenceKind,
    pub title: String,
    pub producer: Option<Producer>,
    pub target: Target,
    pub run_id: Option<String>,
    pub observed_at: Option<i64>,
    pub recorded_at: i64,
    pub raw: Option<RawArtifact>,
    pub missing_raw_reason: Option<String>,
    pub normalized: NormalizedReference,
    pub provenance: Provenance,
    pub confidence_class: ConfidenceClass,
    pub scope: String,
}
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
enum Relation {
    Comparison,
    Contradiction,
    Supports,
    Supersedes,
}
#[derive(Serialize, Deserialize)]
struct EvidenceLink {
    id: String,
    from: String,
    to: String,
    relation: Relation,
    reason: String,
    recorded_at: i64,
}

fn now() -> i64 {
    chrono::Utc::now().timestamp_millis()
}
fn hash(bytes: &[u8]) -> String {
    format!("{:x}", Sha256::digest(bytes))
}
fn required<'a>(args: &'a Value, key: &str) -> Result<&'a str> {
    args[key]
        .as_str()
        .filter(|v| !v.trim().is_empty())
        .ok_or_else(|| Error::other(format!("Missing {key}")))
}
fn source_url(value: &Value) -> Option<String> {
    let mut url = reqwest::Url::parse(value.as_str()?).ok()?;
    if !matches!(url.scheme(), "http" | "https") {
        return None;
    }
    let _ = url.set_username("");
    let _ = url.set_password(None);
    url.set_query(None);
    url.set_fragment(None);
    Some(url.into())
}
pub fn record(state: &AppState, evidence: &EvidenceArtifact) -> Result<Value> {
    state.db.library_put_immutable(
        &format!("evidence-artifact:{}", evidence.id),
        &serde_json::to_value(evidence)?,
    )
}
fn reference(state: &AppState, schema: &str, key: String) -> Result<NormalizedReference> {
    let value = state
        .db
        .library_get(&key)?
        .ok_or_else(|| Error::other("Normalized evidence is missing"))?;
    Ok(NormalizedReference {
        schema: schema.into(),
        key,
        sha256: hash(&serde_json::to_vec(&value)?),
    })
}
fn retain(state: &AppState, bytes: &[u8], representation: &str) -> Result<RawArtifact> {
    let sha256 = hash(bytes);
    let path = state
        .paths
        .root
        .join("evidence-artifacts")
        .join(&sha256)
        .join("source");
    state.files.ensure_dir(path.parent().unwrap())?;
    if state.files.is_file(&path)? {
        if hash(&state.files.read(&path)?) != sha256 {
            return Err(Error::other(
                "Retained evidence failed its integrity check; the original record was preserved",
            ));
        }
    } else {
        state.files.write_atomic(&path, bytes)?;
    }
    Ok(RawArtifact {
        sha256,
        bytes: bytes.len() as u64,
        path: path.to_string_lossy().into(),
        representation: representation.into(),
    })
}
fn redact_report(state: &AppState, value: &mut Value) {
    match value {
        Value::String(text) => {
            *text = crate::commands::logging_commands::redact_text_core(state, text)
        }
        Value::Array(values) => {
            for value in values {
                redact_report(state, value);
            }
        }
        Value::Object(values) => {
            for value in values.values_mut() {
                redact_report(state, value);
            }
        }
        _ => {}
    }
}
pub fn save_performance(state: &AppState, args: &Value) -> Result<Value> {
    let instance_id = required(args, "instanceId")?;
    crate::commands::find_instance(state, instance_id)?;
    let mut report = args["report"].clone();
    // An imported profile does not establish a Testing Lab execution identity.
    if let Some(fields) = report.as_object_mut() {
        fields.remove("test_id");
    }
    let kind = match report["kind"].as_str() {
        Some("spark") => EvidenceKind::SparkProfile,
        Some("log") => EvidenceKind::LogAnalysis,
        _ => return Err(Error::other("Invalid performance evidence kind")),
    };
    if matches!(kind, EvidenceKind::LogAnalysis) {
        redact_report(state, &mut report);
    }
    let raw = if let Some(encoded) = args["source"]["data"].as_str() {
        let mut bytes = base64::engine::general_purpose::STANDARD
            .decode(encoded)
            .map_err(|_| Error::other("Invalid evidence source encoding"))?;
        let representation = if matches!(kind, EvidenceKind::LogAnalysis) {
            bytes = crate::commands::logging_commands::redact_text_core(
                state,
                &String::from_utf8(bytes)
                    .map_err(|_| Error::other("Log analysis input must be UTF-8"))?,
            )
            .into_bytes();
            "redacted_analysis_input"
        } else {
            "original_profile"
        };
        let artifact = retain(state, &bytes, representation)?;
        if matches!(kind, EvidenceKind::SparkProfile)
            && report["sha256"]
                .as_str()
                .is_some_and(|h| !h.eq_ignore_ascii_case(&artifact.sha256))
        {
            return Err(Error::other(
                "Profile source SHA-256 does not match the analyzed report",
            ));
        }
        report["sha256"] = json!(artifact.sha256);
        Some(artifact)
    } else {
        None
    };
    let id = uuid::Uuid::new_v4().to_string();
    report["id"] = json!(id);
    report["instance_id"] = json!(instance_id);
    report["at"] = json!(now());
    report["evidence_id"] = json!(format!("performance:{id}"));
    report["url"] = json!(source_url(&report["url"]));
    state
        .db
        .library_put_immutable(&format!("evidence:{id}"), &report)?;
    register_performance(state, &report, raw, false)?;
    Ok(report)
}
fn register_performance(
    state: &AppState,
    report: &Value,
    raw: Option<RawArtifact>,
    legacy: bool,
) -> Result<Value> {
    let id = required(report, "id")?;
    let spark = report["kind"] == "spark";
    let test = report["test_id"]
        .as_str()
        .map(|id| state.db.library_get(&format!("test:{id}")))
        .transpose()?
        .flatten();
    let note = if let Some(test) = &test {
        format!("Testing Lab run {} · Minecraft {} · {} {} · {}. Exact installed mods, versions and scenarios are retained in that run's report.",test["id"].as_str().unwrap_or_default(),test["minecraft"].as_str().unwrap_or("unknown"),test["loader"].as_str().unwrap_or("unknown"),test["loader_version"].as_str().unwrap_or("unknown"),test["mode"].as_str().unwrap_or("runtime mode not recorded"))
    } else {
        "Instance selected at import. Imported samples and reported log events do not establish that the current installed mod set produced them.".into()
    };
    record(state,&EvidenceArtifact {
        schema_version:1,id:format!("performance:{id}"),kind:if spark {EvidenceKind::SparkProfile} else {EvidenceKind::LogAnalysis},
        title:report["title"].as_str().unwrap_or("Imported evidence").into(),
        producer:if legacy {None} else {Some(Producer{adapter:if test.is_some() {"enderloom-native-testing-evidence"} else if spark {"enderloom-spark-protobuf"} else {"enderloom-log-symptoms"}.into(),version:"1".into()})},
        target:Target{kind:"instance".into(),id:required(report,"instance_id")?.into(),snapshot_id:test.as_ref().and_then(|t|t["input_fingerprint"].as_str()).map(str::to_owned)},
        run_id:test.as_ref().and_then(|t|t["id"].as_str()).map(str::to_owned).or_else(||if legacy {None} else {Some(id.into())}),observed_at:report["at"].as_i64(),recorded_at:now(),
        missing_raw_reason:if raw.is_none() {Some(if legacy {"This older report did not retain its analysis input. Reimport the source to verify it."} else {"No source bytes were supplied with this report."}.into())} else {None},raw,
        normalized:reference(state,"performance-report-1",format!("evidence:{id}"))?,
        provenance:Provenance{operation:if legacy {"migrate_performance_evidence"} else if test.is_some() {"analyze_testing_report"} else {"save_performance_evidence"}.into(),source_url:source_url(&report["url"]),note},
        confidence_class:if legacy {ConfidenceClass::ExternallyReported} else if spark {ConfidenceClass::Sampled} else {ConfidenceClass::Inferred},
        scope:if spark {"Profiler sample attribution. Sample percentages are not FPS loss or causal proof."} else {"Recognized symptoms in a redacted log. Findings are not measured per-mod frame loss."}.into(),
    })
}
pub fn save_testing_analysis(
    state: &AppState,
    test: &Value,
    mut report: Value,
    bytes: &[u8],
    name: &str,
) -> Result<Value> {
    let test_id = required(test, "id")?;
    if report["kind"] == "log" {
        redact_report(state, &mut report);
    }
    let redacted;
    let bytes = if report["kind"] == "log" {
        redacted = crate::commands::logging_commands::redact_text_core(
            state,
            &String::from_utf8_lossy(bytes),
        );
        redacted.as_bytes()
    } else {
        bytes
    };
    let raw = retain(
        state,
        bytes,
        if report["kind"] == "log" {
            "redacted_analysis_input"
        } else {
            "original_profile"
        },
    )?;
    let id = format!(
        "test-{test_id}-{}",
        hash(&serde_json::to_vec(&json!([
            name,
            raw.sha256,
            "native-testing-evidence-1"
        ]))?)
    );
    report["id"] = json!(id);
    report["evidence_id"] = json!(format!("performance:{id}"));
    report["test_id"] = json!(test_id);
    report["at"] = test["finished_at"].clone();
    report["instance_id"] = test["instance_id"].clone();
    report["sha256"] = json!(raw.sha256);
    for key in ["minecraft", "loader", "loader_version"] {
        report[key] = test[key].clone();
    }
    let stable = state
        .db
        .library_put_immutable(&format!("evidence:{id}"), &report)?;
    register_performance(state, &stable, Some(raw), false)?;
    if let Some(task)=test["task_id"].as_str(){state.tasks.attach_evidence(task,stable["evidence_id"].as_str().unwrap())?;}
    Ok(stable)
}
pub fn performance_reports(state: &AppState, instance_id: &str) -> Result<Value> {
    let mut reports: Vec<Value> = state
        .db
        .library_list("evidence:")?
        .into_iter()
        .filter(|r| r["instance_id"] == instance_id)
        .collect();
    for r in &mut reports {
        let id = format!("performance:{}", required(r, "id")?);
        if state
            .db
            .library_get(&format!("evidence-artifact:{id}"))?
            .is_none()
        {
            register_performance(state, r, None, true)?;
        }
        r["evidence_id"] = json!(id);
    }
    reports.sort_by_key(|r| std::cmp::Reverse(r["at"].as_i64().unwrap_or_default()));
    Ok(json!(reports))
}
pub fn conversion(state: &AppState, snapshot: &Value, run_id: Option<&str>) -> Result<()> {
    let snapshot_id = required(snapshot, "id")?;
    for input in snapshot["inputs"]
        .as_array()
        .ok_or_else(|| Error::other("Missing conversion inputs"))?
    {
        let sha = required(input, "sha256")?;
        record(state,&EvidenceArtifact {
            schema_version:1,id:format!("conversion:{snapshot_id}:{sha}"),kind:EvidenceKind::PackageInventory,
            title:required(input,"label")?.into(),producer:Some(Producer{adapter:required(snapshot,"adapter")?.into(),version:"1".into()}),
            target:Target{kind:"project".into(),id:required(snapshot,"project_id")?.into(),snapshot_id:Some(snapshot_id.into())},
            run_id:run_id.map(str::to_owned),observed_at:input["measured_at"].as_i64(),recorded_at:now(),
            raw:Some(RawArtifact{sha256:sha.into(),bytes:input["bytes"].as_u64().unwrap_or_default(),path:required(input,"retained_path")?.into(),representation:"original_package".into()}),missing_raw_reason:None,
            normalized:reference(state,"package-inventory-1",format!("conversion-inventory:{}:{sha}",required(snapshot,"adapter")?))?,
            provenance:Provenance{operation:"start_conversion_intake".into(),source_url:None,note:format!("{} input; target and checkpoint are recorded in immutable snapshot {snapshot_id}",required(input,"role")?)},
            confidence_class:ConfidenceClass::Measured,scope:snapshot["scope"].as_str().unwrap_or_default().into(),
        })?;
    }
    Ok(())
}
fn read(state: &AppState, id: &str) -> Result<EvidenceArtifact> {
    serde_json::from_value(
        state
            .db
            .library_get(&format!("evidence-artifact:{id}"))?
            .ok_or_else(|| Error::other("Evidence was not found"))?,
    )
    .map_err(Into::into)
}
pub fn get(state: &AppState, id: &str) -> Result<Value> {
    let mut value = serde_json::to_value(read(state, id)?)?;
    value["links"] = json!(state
        .db
        .library_list("evidence-link:")?
        .into_iter()
        .filter(|r| r["from"] == id || r["to"] == id)
        .collect::<Vec<_>>());
    value["freshness"] = cached_freshness(state, &read(state, id)?)?;
    Ok(value)
}

#[derive(Clone, Serialize, Deserialize)]
struct DependencyState {
    kind: String,
    id: String,
    state: String,
    reason: String,
    expected: Option<String>,
    actual: Option<String>,
}
fn dependency(
    kind: &str,
    id: &str,
    state: &str,
    reason: impl Into<String>,
    expected: Option<String>,
    actual: Option<String>,
) -> DependencyState {
    DependencyState {
        kind: kind.into(),
        id: id.into(),
        state: state.into(),
        reason: reason.into(),
        expected,
        actual,
    }
}
fn freshness_state(dependencies: &[DependencyState]) -> &'static str {
    if dependencies.iter().any(|d| d.state == "changed") {
        "stale"
    } else if dependencies.iter().any(|d| d.state != "unchanged") {
        "unknown"
    } else {
        "current"
    }
}
fn project_dependency(state: &AppState, evidence: &EvidenceArtifact) -> Result<DependencyState> {
    let project = state
        .db
        .library_get(&format!("conversion-project:{}", evidence.target.id))?;
    let current = if let Some(id) = project.as_ref().and_then(|p| p["snapshot_id"].as_str()) {
        state.db.library_get(&format!("conversion-snapshot:{id}"))?
    } else {
        None
    };
    let expected = evidence.raw.as_ref().map(|r| r.sha256.clone());
    let present = current
        .as_ref()
        .and_then(|v| v["inputs"].as_array())
        .is_some_and(|inputs| {
            inputs
                .iter()
                .any(|i| i["sha256"].as_str() == expected.as_deref())
        });
    Ok(dependency(
        "project_input",
        &evidence.target.id,
        if current.is_none() {
            "unknown"
        } else if present {
            "unchanged"
        } else {
            "changed"
        },
        if current.is_none() {
            "The project's current checkpoint is unavailable."
        } else if present {
            "The exact package still belongs to the current project. Adding unrelated references does not invalidate its inventory."
        } else {
            "This package is no longer an input to the project's current checkpoint. Its historical inventory is preserved."
        },
        expected,
        current.and_then(|c| c["id"].as_str().map(str::to_owned)),
    ))
}
fn cached_freshness(state: &AppState, evidence: &EvidenceArtifact) -> Result<Value> {
    let Some(mut cached) = state
        .db
        .library_get(&format!("evidence-freshness:{}", evidence.id))?
    else {
        return Ok(Value::Null);
    };
    let mut dependencies: Vec<DependencyState> =
        serde_json::from_value(cached["dependencies"].clone())?;
    if evidence.target.kind == "project" {
        let current = project_dependency(state, evidence)?;
        if let Some(old) = dependencies.iter_mut().find(|d| d.kind == "project_input") {
            *old = current;
        }
    } else if let Some(scan) = state
        .db
        .library_get(&format!("latest-scan:{}", evidence.target.id))?
    {
        // A lightweight list-only inspection has no fingerprint and cannot
        // validate or invalidate a full run context.
        if let Some(actual) = scan["fingerprint"].as_str().filter(|s| !s.is_empty()) {
            if scan["at"].as_i64().unwrap_or_default()
                > cached["checked_at"].as_i64().unwrap_or_default()
            {
                if let Some(old) = dependencies
                    .iter_mut()
                    .find(|d| d.kind == "instance_inputs")
                {
                    if old.actual.as_deref() != Some(actual) {
                        old.state = "changed".into();
                        old.actual = Some(actual.into());
                        old.reason="A newer complete inspection found different instance inputs. Recheck this evidence against the current files.".into();
                        cached["needs_recheck"] = json!(true);
                    }
                }
            }
        }
    }
    cached["state"] = json!(freshness_state(&dependencies));
    cached["dependencies"] = json!(dependencies);
    Ok(cached)
}
pub async fn check_freshness(state: &Arc<AppState>, id: String) -> Result<Value> {
    let evidence = read(state, &id)?;
    let task = state.tasks.start_ipc(
        TaskKind::PerformanceScan,
        TaskSpec {
            title: "Check evidence inputs".into(),
            instance_id: (evidence.target.kind == "instance").then(|| evidence.target.id.clone()),
            project_id: (evidence.target.kind == "project").then(|| evidence.target.id.clone()),
            ..Default::default()
        },
    )?;
    let state = state.clone();
    tokio::task::spawn_blocking(move || {
        let result = freshness(&state, &evidence, &task);
        task.finish(&result);
        result
    })
    .await
    .map_err(|e| Error::other(e.to_string()))?
}
fn freshness(state: &AppState, evidence: &EvidenceArtifact, task: &TaskHandle) -> Result<Value> {
    task.stage("Checking retained source and analysis integrity");
    let integrity = verify_inner(state, &evidence.id, Some(task))?;
    let mut dependencies = Vec::new();
    for (key, label) in [
        ("raw", "retained_source"),
        ("normalized", "normalized_record"),
    ] {
        let status = integrity[key]["state"].as_str().unwrap_or("unknown");
        dependencies.push(dependency(
            label,
            &evidence.id,
            if status == "verified" {
                "unchanged"
            } else if status == "changed" {
                "changed"
            } else {
                "unknown"
            },
            format!("{}: {}", label.replace('_', " "), status.replace('_', " ")),
            None,
            integrity[key]["actual_sha256"].as_str().map(str::to_owned),
        ));
    }
    dependencies.push(match &evidence.producer {
        Some(p) if matches!(p.adapter.as_str(),"package-inventory-1"|"enderloom-spark-protobuf"|"enderloom-log-symptoms"|"enderloom-native-testing-evidence")=>dependency("producer",&p.adapter,if p.version=="1"{"unchanged"}else{"changed"},if p.version=="1"{"The recorded adapter version is still supported."}else{"The adapter version differs from the installed analyzer; reanalyze the retained input."},Some(p.version.clone()),Some("1".into())),
        Some(p)=>dependency("producer",&p.adapter,"unknown","The recorded adapter is not available in this build.",Some(p.version.clone()),None),
        None=>dependency("producer","unknown","unknown","The original adapter version was not recorded.",None,None)
    });
    if task.token().is_cancelled() {
        return Err(Error::Cancelled);
    }
    if evidence.target.kind == "project" {
        dependencies.push(project_dependency(state, evidence)?);
    } else if let Some(expected) = &evidence.target.snapshot_id {
        task.stage("Comparing the tested mods, configs, content and launch settings");
        match crate::creative::scan_instance(state, &evidence.target.id, task, true, false) {
            Ok(scan) => {
                let actual = scan["fingerprint"].as_str().unwrap_or_default().to_string();
                let same = &actual == expected;
                dependencies.push(dependency("instance_inputs",&evidence.target.id,if same{"unchanged"}else{"changed"},if same{"The full current input fingerprint matches the tested instance."}else{"Mods, configs, content or launch settings differ from the tested input fingerprint."},Some(expected.clone()),Some(actual)));
                if !same {
                    if let Some(run) = &evidence.run_id {
                        if let Some(test) = state.db.library_get(&format!("test:{run}"))? {
                            for (key, kind) in [
                                ("config_hashes", "config"),
                                ("environment", "launch_setting"),
                            ] {
                                let before = test[key].as_object();
                                let after = scan[key].as_object();
                                let keys: std::collections::BTreeSet<_> = before
                                    .into_iter()
                                    .flat_map(|m| m.keys())
                                    .chain(after.into_iter().flat_map(|m| m.keys()))
                                    .collect();
                                for name in keys {
                                    let a = before.and_then(|m| m.get(name));
                                    let b = after.and_then(|m| m.get(name));
                                    if a != b {
                                        dependencies.push(dependency(
                                            kind,
                                            name,
                                            "changed",
                                            format!(
                                                "{} {} {}",
                                                kind.replace('_', " "),
                                                name,
                                                if a.is_none() {
                                                    "was added"
                                                } else if b.is_none() {
                                                    "was removed"
                                                } else {
                                                    "changed"
                                                }
                                            ),
                                            a.map(Value::to_string),
                                            b.map(Value::to_string),
                                        ));
                                    }
                                }
                            }
                            let mods=|value:&Value,key:&str|->std::collections::BTreeMap<String,Value>{value[key].as_array().into_iter().flatten().filter_map(|m|m["file_name"].as_str().map(|name|(name.into(),json!([m["enabled"],m["inspection"]["sha256"],m["error"]])))).collect()};
                            let before = mods(&test, "mods");
                            let after = mods(&scan, "files");
                            let keys: std::collections::BTreeSet<_> =
                                before.keys().chain(after.keys()).collect();
                            for name in keys {
                                if before.get(name) != after.get(name) {
                                    dependencies.push(dependency("mod",name,"changed",format!("Mod {name} was added, removed, enabled/disabled or changed bytes."),before.get(name).map(Value::to_string),after.get(name).map(Value::to_string)));
                                }
                            }
                        }
                    }
                }
            }
            Err(Error::Cancelled) => return Err(Error::Cancelled),
            Err(error) => dependencies.push(dependency(
                "instance_inputs",
                &evidence.target.id,
                "unknown",
                format!("Could not inspect the current instance: {error}"),
                Some(expected.clone()),
                None,
            )),
        }
    } else {
        dependencies.push(dependency("instance_inputs",&evidence.target.id,"unknown","This imported report has no recorded test-input fingerprint. Its applicability to the current installed mods cannot be established.",None,None));
    }
    if task.token().is_cancelled() {
        return Err(Error::Cancelled);
    }
    let result = json!({"evidence_id":evidence.id,"checked_at":now(),"state":freshness_state(&dependencies),"dependencies":dependencies,"needs_recheck":false,"scope":"Applicability to recorded input dependencies. Current inputs do not prove runtime or semantic parity."});
    state
        .db
        .library_put(&format!("evidence-freshness:{}", evidence.id), &result)?;
    Ok(result)
}
pub fn list(state: &AppState, args: &Value) -> Result<Value> {
    let kind = required(args, "targetKind")?;
    let id = required(args, "targetId")?;
    if kind == "instance" {
        performance_reports(state, id)?;
    }
    let mut records: Vec<_> = state
        .db
        .library_list("evidence-artifact:")?
        .into_iter()
        .filter(|r| r["target"]["kind"] == kind && r["target"]["id"] == id)
        .collect();
    records.sort_by_key(|r| std::cmp::Reverse(r["recorded_at"].as_i64().unwrap_or_default()));
    Ok(json!(records))
}
pub fn link(state: &AppState, args: &Value) -> Result<Value> {
    let from = required(args, "from")?;
    let to = required(args, "to")?;
    let reason = required(args, "reason")?;
    if from == to {
        return Err(Error::other("Choose two different evidence records"));
    }
    read(state, from)?;
    read(state, to)?;
    let relation: Relation = serde_json::from_value(args["relation"].clone())?;
    let id = hash(&serde_json::to_vec(&json!([from, to, &relation, reason]))?);
    let link = EvidenceLink {
        id: id.clone(),
        from: from.into(),
        to: to.into(),
        relation,
        reason: reason.into(),
        recorded_at: now(),
    };
    state
        .db
        .library_put_immutable(&format!("evidence-link:{id}"), &serde_json::to_value(link)?)
}
pub fn verify(state: &AppState, id: &str) -> Result<Value> {
    verify_inner(state,id,None)
}
fn verify_inner(state: &AppState, id: &str, task: Option<&TaskHandle>) -> Result<Value> {
    let evidence = read(state, id)?;
    let raw = match &evidence.raw {
        None => json!({"state":"not_retained","reason":evidence.missing_raw_reason}),
        Some(raw) => match state.files.open(&raw.path) {
            Err(error) => json!({"state":"unavailable","reason":error.to_string()}),
            Ok(mut file) => {
                let mut hasher = Sha256::new();
                let mut buf = [0u8; 65536];
                let mut size = 0u64;
                loop {
                    if task.is_some_and(|t|t.token().is_cancelled()) {return Err(Error::Cancelled);}
                    let n = file.read(&mut buf)?;
                    if n == 0 {
                        break;
                    }
                    hasher.update(&buf[..n]);
                    size += n as u64;
                }
                let actual = format!("{:x}", hasher.finalize());
                json!({"state":if actual==raw.sha256 && size==raw.bytes {"verified"} else {"changed"},"expected_sha256":raw.sha256,"actual_sha256":actual,"bytes":size})
            }
        },
    };
    let normalized = state.db.library_get(&evidence.normalized.key)?;
    let normalized_state = match normalized {
        Some(v) if hash(&serde_json::to_vec(&v)?) == evidence.normalized.sha256 => "verified",
        Some(_) => "changed",
        None => "missing",
    };
    let result = json!({"evidence_id":id,"checked_at":now(),"raw":raw,"normalized":{"state":normalized_state},"scope":"Integrity of retained bytes and normalized record; not runtime or semantic acceptance."});
    state.db.library_put_immutable(
        &format!("evidence-verification:{}", uuid::Uuid::new_v4()),
        &result,
    )
}
