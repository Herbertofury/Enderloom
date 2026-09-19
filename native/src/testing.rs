//! Owned, rendered Minecraft sessions driven through HMC-Specifics. GUI and CLI use these operations.
use crate::{
    commands::find_instance,
    error::{Error, Result},
    state::AppState,
    tasks::{TaskKind, TaskSpec},
};
use serde_json::{json, Value};
use std::collections::HashMap;
use std::{
    io::{Read, Seek, SeekFrom},
    path::{Path, PathBuf},
    sync::{Arc, OnceLock},
    time::{Duration, Instant},
};
use tokio::{
    io::AsyncWriteExt,
    process::{Child, Command},
    sync::Mutex,
};

fn locks() -> &'static Mutex<HashMap<String, Arc<Mutex<()>>>> {
    static L: OnceLock<Mutex<HashMap<String, Arc<Mutex<()>>>>> = OnceLock::new();
    L.get_or_init(Default::default)
}
async fn lock(id: &str) -> Arc<Mutex<()>> {
    locks().lock().await.entry(id.into()).or_default().clone()
}
fn recorders() -> &'static Mutex<HashMap<String, Child>> {
    static R: OnceLock<Mutex<HashMap<String, Child>>> = OnceLock::new();
    R.get_or_init(Default::default)
}
fn error(message: impl Into<String>) -> Error {
    Error::other(message)
}
fn string<'a>(v: &'a Value, key: &str) -> Result<&'a str> {
    v[key]
        .as_str()
        .ok_or_else(|| error(format!("Missing {key}")))
}
fn now() -> i64 {
    chrono::Utc::now().timestamp_millis()
}
fn world_observation(state: &AppState, sandbox: &Path, launched_at: i64) -> Option<Value> {
    // Poll only the tail. An inherited report or an earlier menu sample must not
    // make this newly launched client's world appear ready.
    let mut file = state.files.open(sandbox.join("enderloom-telemetry.jsonl")).ok()?;
    let length = file.seek(SeekFrom::End(0)).ok()?;
    file.seek(SeekFrom::Start(length.saturating_sub(64 * 1024))).ok()?;
    let mut bytes = Vec::new(); file.take(64 * 1024).read_to_end(&mut bytes).ok()?;
    let sample = String::from_utf8_lossy(&bytes).lines().rev().find_map(|line|serde_json::from_str::<Value>(line).ok())?;
    let at = sample["at"].as_i64()?;
    (at >= launched_at && at <= now() && now()-at <= 5000
        && sample["dimension"].as_str().is_some_and(|id|id.contains(':'))
        && sample["position"].as_array().is_some_and(|coords|coords.len()==3&&coords.iter().all(|n|n.as_f64().is_some_and(f64::is_finite)))
        && sample.get("screen").is_some_and(Value::is_null)).then_some(sample)
}
fn dir(state: &AppState, id: &str) -> Result<PathBuf> {
    uuid::Uuid::parse_str(id).map_err(|_| error("Invalid test ID"))?;
    Ok(state.paths.root.join("testing-reports").join(id))
}
fn report(state: &AppState, id: &str) -> Result<Value> {
    state
        .db
        .library_get(&format!("test:{id}"))?
        .ok_or_else(|| error("Test report not found"))
}
fn save(state: &AppState, v: &Value) -> Result<()> {
    let id = string(v, "id")?;
    let folder = dir(state, id)?;
    state.files.ensure_dir(&folder)?;
    state
        .files
        .write_atomic(folder.join("report.json"), &serde_json::to_vec_pretty(v)?)?;
    state.db.library_put(&format!("test:{id}"), v)
}
pub fn list(state: &AppState) -> Result<Value> {
    let mut rows = state.db.library_list("test:")?;
    rows.sort_by_key(|v| std::cmp::Reverse(v["at"].as_i64().unwrap_or(0)));
    Ok(json!(rows.into_iter().map(|v|json!({"id":v["id"],"at":v["at"],"instance_id":v["instance_id"],"instance_name":v["instance_name"],"state":v["state"],"scenario_state":v["scenario_state"],"finished_at":v["finished_at"]})).collect::<Vec<_>>()))
}
pub fn get(state: &AppState, id: &str) -> Result<Value> {
    report(state, id)
}
pub async fn analyze(state: &AppState, id: &str) -> Result<Value> {
    let lock = lock(id).await;
    let _guard = lock.lock().await;
    analyze_inner(state, id).await
}
async fn analyze_inner(state: &AppState, id: &str) -> Result<Value> {
    let mut v = report(state, id)?;
    if !v["finished_at"].is_number() {
        return Err(error(
            "Finish the session before analyzing retained evidence",
        ));
    }
    if v["record_video"] == true && v["video_finalized"] != true {
        match finalize_video(state, id, &mut v).await {
            Ok(()) => { v.as_object_mut().unwrap().remove("video_finalization_error"); }
            Err(error) => v["video_finalization_error"] = json!(format!("Recording retained, but seekable playback could not be prepared: {error}")),
        }
    }
    let mut reports = Vec::new();
    let mut errors = Vec::new();
    for artifact in v["artifacts"]
        .as_array()
        .into_iter()
        .flatten()
        .filter(|a| a["kind"] == "spark" || a["kind"] == "log")
    {
        let name = string(artifact, "name")?;
        let path = dir(state, id)?.join(name);
        if state.files.metadata(&path)?.len() > 32 * 1024 * 1024 {
            errors.push(json!({"name":name,"error":"Artifact exceeds analysis limit"}));
            continue;
        }
        let bytes = state.files.read(&path)?;
        let parsed = if artifact["kind"] == "spark" {
            crate::testing_evidence::spark(&bytes, string(artifact, "label")?)
        } else {
            Ok(crate::testing_evidence::log(
                &String::from_utf8_lossy(&bytes),
                "Test latest.log",
            ))
        };
        match parsed {
            Ok(evidence) => reports.push(crate::evidence::save_testing_analysis(state, &v, evidence, &bytes, name)?),
            Err(e) => errors.push(json!({"name":name,"error":e.to_string()})),
        }
    }
    v["evidence"] = json!(reports);
    v["analysis_errors"] = json!(errors);
    save(state, &v)?;
    Ok(v)
}

pub async fn scenario(state: &Arc<AppState>, id: &str, scenario: &Value) -> Result<Value> {
    let steps = scenario["steps"]
        .as_array()
        .filter(|a| !a.is_empty() && a.len() <= 128)
        .ok_or_else(|| error("A scenario needs 1–128 steps"))?;
    // Validate the complete plan before any game action.
    for step in steps {
        let actions = ["command", "screenshot", "waitSeconds"]
            .iter()
            .filter(|k| step[**k].is_null() == false)
            .count();
        if actions != 1 {
            return Err(error(
                "Each scenario step needs exactly one command, screenshot or waitSeconds",
            ));
        }
        if !step["command"].is_null() && !step["command"].is_string()
            || !step["screenshot"].is_null() && !step["screenshot"].is_string()
            || !step["waitSeconds"].is_null() && !step["waitSeconds"].is_u64()
        {
            return Err(error("Scenario actions have an invalid value type"));
        }
        if step["screenshot"]
            .as_str()
            .is_some_and(|s| s.is_empty() || s.len() > 120)
            || step["command"].as_str().is_some_and(str::is_empty)
        {
            return Err(error("Scenario labels and commands cannot be empty"));
        }
        if !step["expect"].is_null() && !step["expect"].is_string()
            || !step["timeoutSeconds"].is_null() && !step["timeoutSeconds"].is_u64()
        {
            return Err(error("Invalid assertion or timeout"));
        }
        if step["waitSeconds"].is_number() && !step["waitSeconds"].as_u64().is_some_and(|n| n <= 60)
        {
            return Err(error("Each scenario wait is at most 60 seconds"));
        }
        if step["timeoutSeconds"].as_u64().unwrap_or(10) > 120 {
            return Err(error("Scenario assertion timeouts are at most 120 seconds"));
        }
        if let Some(c) = step["command"].as_str() {
            if c.len() > 4096 || c.contains(['\n', '\r', '\0']) {
                return Err(error("Invalid scenario command"));
            }
        }
    }
    {
        let l = lock(id).await;
        let _guard = l.lock().await;
        let mut v = report(state, id)?;
        if v["state"] != "running" {
            return Err(error("Start a test before running a scenario"));
        }
        v["scenario"] = scenario.clone();
        v["scenario_state"] = json!("running");
        v["scenario_started_at"] = json!(now());
        save(state, &v)?;
    }
    let test = report(state, id)?;
    let task = state.tasks.start_ipc(
        TaskKind::PerformanceTest,
        TaskSpec {
            title: "Run Minecraft scenario".into(),
            instance_id: Some(string(&test, "instance_id")?.into()),
            subtitle: scenario["name"].as_str().map(str::to_owned),
            ..Default::default()
        },
    )?;
    let work:Result<()> = async {
        for (index,step) in steps.iter().enumerate() {if task.token().is_cancelled(){return Err(Error::Cancelled);}task.stage(&format!("Step {} / {}",index+1,steps.len()));task.progress(index as u64,steps.len() as u64,0,0);if report(state,id)?["state"]!="running"{return Err(error("Test session ended during the scenario"));}
            if let Some(c)=step["command"].as_str(){let r=command(state,id,c,step["expect"].as_str(),step["timeoutSeconds"].as_u64().unwrap_or(10)).await?;if r["status"]=="failed"{return Err(error(format!("Scenario assertion failed: {c}")));}}
            else if let Some(label)=step["screenshot"].as_str(){screenshot(state,id,label).await?;}
            else if let Some(seconds)=step["waitSeconds"].as_u64(){let token=task.token();tokio::select!{_=tokio::time::sleep(Duration::from_secs(seconds))=>{},_=token.cancelled()=>return Err(Error::Cancelled)}}
            else {return Err(error("Invalid scenario step"));}
        } Ok(())
    }.await;
    {
        let l = lock(id).await;
        let _guard = l.lock().await;
        let mut v = report(state, id)?;
        v["scenario_state"] = json!(if work.is_ok() { "passed" } else { "failed" });
        v["scenario_finished_at"] = json!(now());
        if let Err(e) = &work {
            v["scenario_error"] = json!(e.to_string());
        }
        save(state, &v)?;
    }
    let result = if scenario["keepOpen"] == true && work.is_ok() {
        report(state, id)
    } else {
        finish(
            state,
            id,
            if work.is_ok() {
                "completed"
            } else if matches!(&work, Err(Error::Cancelled)) {
                "cancelled"
            } else {
                "failed"
            },
        )
        .await
    };
    if result.is_err() {
        task.finish(&result);
    } else {
        task.finish(&work);
    }
    result
}

fn adapter(version: &str, loader: &str) -> Result<(&'static str, &'static str)> {
    match (version,loader) {
        ("1.21.1","neoforge")=>Ok(("hmc-specifics-1.21.1-neoforge-latest.jar","2b1c84042cc22e75c7ee3a2bb605bd2b50a8f7497381c582dc526c50aa1d5d2c")),
        ("1.21.1","fabric")=>Ok(("hmc-specifics-1.21.1-fabric-latest.jar","0058999c1b4215c4204649522e647393264dd5fe17c819ca4145ef2b6d65abd4")),
        ("1.21.1","forge")=>Ok(("hmc-specifics-1.21.1-forge-latest.jar","93a92d31f59fa1db7e882303c4d920f8ae8b4d4b0ca7391523a87af3ed6d8088")),
        _=>Err(error("Interactive testing currently has pinned adapters for Minecraft 1.21.1 with NeoForge, Forge or Fabric. Other versions can use startup captures."))
    }
}

pub async fn start(state: &Arc<AppState>, args: &Value) -> Result<Value> {
    let source = find_instance(state, string(args, "instanceId")?)?;
    if crate::instance_ops::instance_busy(state, &source.id) {
        return Err(error(
            "Stop the source instance and finish its tasks before testing",
        ));
    }
    let (filename, sha) = adapter(&source.version_id, source.loader.as_deref().unwrap_or(""))?;
    let record_video = args["recordVideo"].as_bool().unwrap_or(false);
    let world = args["worldName"].as_str().filter(|s| !s.is_empty());
    if world.is_some_and(|s| s == "." || s == ".." || s.contains(['/', '\\', ':', '\0', '"'])) {
        return Err(error(
            "Select one world folder from this instance’s saves directory",
        ));
    }
    let seconds = args["maxSeconds"].as_u64().unwrap_or(900);
    if !(30..=1800).contains(&seconds) {
        return Err(error("Test sessions last 30–1800 seconds"));
    }
    if record_video {
        recorder_available().await?;
    }
    let task = Arc::new(state.tasks.start_ipc(
        TaskKind::PerformanceTest,
        TaskSpec {
            title: "Prepare interactive test".into(),
            instance_id: Some(source.id.clone()),
            ..Default::default()
        },
    )?);
    let id = uuid::Uuid::new_v4().to_string();
    let sandbox_id = uuid::Uuid::new_v4().to_string();
    let mut sandbox = source.clone();
    sandbox.id = sandbox_id.clone();
    sandbox.dir = state.paths.instance_dir(&sandbox_id).display().to_string();
    sandbox.name = format!("[Testing] {}", source.name);
    sandbox.created_at = chrono::Utc::now();
    sandbox.playtime_secs = 0;
    sandbox.last_played_at = None;
    sandbox.logo = None;
    sandbox.import_source = None;
    sandbox.import_source_id = None;
    sandbox.pack_provider = None;
    sandbox.pack_project_id = None;
    sandbox.pack_version_id = None;
    sandbox.wrapper_command = None;
    sandbox.pre_launch_command = None;
    sandbox.post_exit_command = None;
    let folder = dir(state, &id)?;
    let mut v = json!({"id":id,"at":now(),"instance_id":source.id,"instance_name":source.name,"sandbox_id":sandbox_id,"state":"preparing","mode":"rendered-client","record_video":record_video,"max_seconds":seconds,"minecraft":source.version_id,"loader":source.loader,"loader_version":source.loader_version,"steps":[],"artifacts":[],"report_dir":folder,"scope":"A controlled session. Only successful assertions establish coverage; sample shares are not causal mod impact.","adapter":{"name":"HMC-Specifics","source":"https://github.com/headlesshq/hmc-specifics","release":"1.21.1-latest","sha256":sha},"probe_version":"1.0.1","fps_note":"Minecraft-reported FPS sampled once per second. This is not individual frame time or a 1% low measurement."});
    save(state, &v)?;
    let result:Result<()> = async {
        task.stage("Fingerprinting and copying an isolated test instance");
        let scan=tokio::task::spawn_blocking({let state=state.clone(); let task=task.clone(); let source=source.clone(); let sandbox=sandbox.clone(); move|| {
            let scan=crate::creative::scan_instance(&state,&source.id,&task,true,false)?;
            crate::performance::copy_tree(&state,Path::new(&source.dir),Path::new(&sandbox.dir),&task,0)?;
            state.db.insert_instance(&sandbox)?;
            let copied=crate::creative::scan_instance(&state,&sandbox.id,&task,true,false)?;
            if scan["fingerprint"]!=copied["fingerprint"] { return Err(error("Source changed while copying; test cancelled")); }
            Ok(scan)
        }}).await.map_err(|e|error(e.to_string()))??;
        v["input_fingerprint"]=scan["fingerprint"].clone(); v["environment"]=scan["environment"].clone(); v["mods"]=scan["files"].clone(); v["config_hashes"]=scan["config_hashes"].clone();
        if let Some(world)=world {
            let from=Path::new(&source.dir).join("saves").join(world);
            if !state.files.is_file(from.join("level.dat"))? {return Err(error("The selected test world does not contain level.dat"));}
            crate::performance::copy_tree(state,&from,&Path::new(&sandbox.dir).join("saves").join(world),&task,0)?;
            v["world"]=json!({"name":world,"level_dat_sha256":crate::creative::file_hash(state,&from.join("level.dat"),Some(&task))?});
        }
        if task.token().is_cancelled(){return Err(Error::Cancelled);}
        task.stage("Installing the verified in-game command adapter");
        let cache=state.paths.root.join("testing-tools"); state.files.ensure_dir(&cache)?;
        let jar=cache.join(filename);
        if !state.files.is_file(&jar)? || crate::creative::file_hash(state,&jar,Some(&task))?!=sha {
            let mut response=state.network.get(format!("https://github.com/headlesshq/hmc-specifics/releases/download/1.21.1-latest/{filename}")).timeout(Duration::from_secs(120)).send().await?.error_for_status()?;
            let mut bytes=Vec::new(); while let Some(chunk)=response.chunk().await? { if bytes.len()+chunk.len()>32*1024*1024 {return Err(error("Adapter exceeds download limit"));} if task.token().is_cancelled(){return Err(Error::Cancelled);} bytes.extend_from_slice(&chunk); }
            use sha2::{Sha256,Digest}; if format!("{:x}",Sha256::digest(&bytes))!=sha {return Err(error("Adapter checksum changed; update the pinned adapter before testing"));}
            state.files.write_atomic(&jar,&bytes)?;
        }
        let mods=Path::new(&sandbox.dir).join("mods"); state.files.ensure_dir(&mods)?;
        // A preexisting adapter could conflict with the pinned version. Retain it disabled only in this copy.
        for p in state.files.read_dir(&mods)? { if p.file_name().is_some_and(|n|n.to_string_lossy().starts_with("hmc-specifics")&&n.to_string_lossy().ends_with(".jar")) { let disabled=p.with_extension("jar.enderloom-disabled"); if state.files.exists(&disabled)? {return Err(error("Conflicting disabled command adapter in source"));} state.files.rename(&p,disabled)?; } }
        state.files.write_atomic(mods.join(filename),&state.files.read(&jar)?)?;
        let probe=Path::new(&sandbox.dir).join("enderloom-probe.jar"); state.files.write_atomic(&probe,include_bytes!("../../tools/minecraft-probe/dist/enderloom-probe.jar"))?;
        v["probe_sha256"]=json!(crate::creative::file_hash(state,&probe,Some(&task))?);
        // Avoid pause-on-focus-loss and surprise full screen in the disposable copy only.
        let options=Path::new(&sandbox.dir).join("options.txt");
        let old=if state.files.is_file(&options)? {String::from_utf8_lossy(&state.files.read(&options)?).into_owned()}else{String::new()};
        let mut lines=old.lines().filter(|l|!l.starts_with("pauseOnLostFocus:")&&!l.starts_with("fullscreen:")).map(str::to_owned).collect::<Vec<_>>(); lines.extend(["pauseOnLostFocus:false".into(),"fullscreen:false".into()]);
        state.files.write_atomic(&options,format!("{}\n",lines.join("\n")).as_bytes())?;
        let mut settings=state.db.load_settings()?;
        let original=crate::launch::instance_jvm_template(&settings,&sandbox);
        sandbox.jvm_args=Some(format!("{original} -Dhmc.jline.enabled=false -Dhmc.account.refresh.enabled=false -javaagent:enderloom-probe.jar")); sandbox.jvm_args_mode=Some("replace".into());
        settings.wrapper_command.clear(); settings.pre_launch_command.clear(); settings.post_exit_command.clear(); settings.game_args.clear(); settings.fullscreen=false; settings.discord_rpc=false;
        if let Some(world)=world {settings.game_args=format!("--quickPlaySingleplayer \"{world}\"");}
        v["effective_options_sha256"]=json!(crate::creative::file_hash(state,&options,Some(&task))?);
        v["display_settings"]=json!(lines.iter().filter_map(|line|line.split_once(':')).filter(|(key,_)|matches!(*key,"renderDistance"|"simulationDistance"|"maxFps"|"enableVsync"|"fullscreen"|"graphicsMode"|"guiScale"|"pauseOnLostFocus")).map(|(k,v)|(k.to_string(),json!(v))).collect::<serde_json::Map<String,Value>>());
        let version=crate::install::load_merged_version(state,sandbox.launch_version_id.as_deref().unwrap_or(&sandbox.version_id)).await?;
        v["java"]=json!(crate::java::find_for_major(&state.files,version.required_java_major(),sandbox.java_path.as_deref().or(settings.java_path.as_deref())).await);
        task.stage("Launching the rendered Minecraft test client");
        let sink=state.tasks.event_sink().ok_or_else(||error("No event channel"))?;
        let launched_at=now(); v["launched_at"]=json!(launched_at); v["requested_world"]=json!(world);
        let run=crate::launch::launch_profile_instance(sink,state,&sandbox,settings).await?; v["running_id"]=json!(run); save(state,&v)?;
        let began=Instant::now();
        loop { if task.token().is_cancelled(){return Err(Error::Cancelled);} let text=logs(state,&v)?;
            if text.contains("HMC-Specifics initialized!"){break;}
            ensure_running(state,&v)?;
            if began.elapsed()>Duration::from_secs(240){return Err(error("Minecraft command adapter did not become ready within 240 seconds"));}
            tokio::time::sleep(Duration::from_millis(300)).await;
        }
        v["adapter_ready_at"]=json!(now());
        if world.is_some() {
            task.stage("Waiting for the player to enter the requested world"); save(state,&v)?;
            loop {
                if task.token().is_cancelled(){return Err(Error::Cancelled);}
                ensure_running(state,&v)?;
                if let Some(observation)=world_observation(state,Path::new(&sandbox.dir),launched_at) {
                    v["world_ready_at"]=json!(now());v["ready_observation"]=observation;break;
                }
                if began.elapsed()>Duration::from_secs(240){return Err(error("The command adapter started, but the requested world did not produce a fresh player observation within 240 seconds"));}
                tokio::time::sleep(Duration::from_millis(300)).await;
            }
        }
        v["state"]=json!("running"); v["ready_at"]=json!(now());
        v["deadline_at"]=json!(now()+seconds as i64*1000);
        if record_video {
            // Wait for the real game window, never capture the entire desktop.
            let (video,target)=start_recorder(state,&v,task.token()).await?; v["video_path"]=json!(video);v["recording_target"]=target;
        }
        save(state,&v)?; Ok(())
    }.await;
    task.finish(&result);
    if let Err(e) = result {
        v["state"] = json!("failed");
        v["error"] = json!(e.to_string());
        save(state, &v)?;
        return finish(state, &id, "failed").await;
    }
    // A disconnected client cannot leave a test or recording running indefinitely.
    tokio::spawn({
        let state = state.clone();
        let id = id.clone();
        async move {
            tokio::time::sleep(Duration::from_secs(seconds)).await;
            if report(&state, &id).is_ok_and(|v| v["state"] == "running") {
                let _ = finish(&state, &id, "timed_out").await;
            }
        }
    });
    Ok(v)
}

fn ensure_running(state: &AppState, v: &Value) -> Result<()> {
    let registry = state.running.lock().unwrap();
    let run = registry
        .get(string(v, "running_id")?)
        .ok_or_else(|| error("Test process is unavailable"))?;
    if run.instance_id != string(v, "sandbox_id")? || run.status.lock().unwrap().state != "running"
    {
        return Err(error("This test process has exited"));
    }
    Ok(())
}
fn logs(state: &AppState, v: &Value) -> Result<String> {
    let registry = state.running.lock().unwrap();
    let run = registry
        .get(string(v, "running_id")?)
        .ok_or_else(|| error("Test process is unavailable"))?;
    let text = run
        .logs
        .lock()
        .unwrap()
        .iter()
        .map(|l| l.line.clone())
        .collect::<Vec<_>>()
        .join("\n");
    Ok(text)
}
async fn send(state: &AppState, v: &Value, line: &str) -> Result<()> {
    if line.is_empty() || line.len() > 4096 || line.contains(['\n', '\r', '\0']) {
        return Err(error("Send one command of at most 4096 characters"));
    }
    ensure_running(state, v)?;
    if let Some(action) = line.strip_prefix('@') {
        if !matches!(
            action,
            "attack" | "use" | "automation on" | "automation off"
        ) && !action.starts_with("move ")
        {
            return Err(error(
                "Use @attack, @use, @automation on/off, or @move direction milliseconds",
            ));
        }
        return state.files.write_atomic(
            state
                .paths
                .instance_dir(string(v, "sandbox_id")?)
                .join("enderloom-probe-command.txt"),
            format!("{}\n{action}", uuid::Uuid::new_v4()).as_bytes(),
        );
    }
    let tx = state
        .running
        .lock()
        .unwrap()
        .get(string(v, "running_id")?)
        .and_then(|r| r.input.clone())
        .ok_or_else(|| {
            error("This recovered process cannot accept commands; finish it and start a fresh test")
        })?;
    tx.send(line.into())
        .await
        .map_err(|_| error("Minecraft command pipe closed"))
}

pub async fn command(
    state: &Arc<AppState>,
    id: &str,
    line: &str,
    expect: Option<&str>,
    timeout: u64,
) -> Result<Value> {
    if timeout > 120 {
        return Err(error("A command wait must be at most 120 seconds"));
    }
    let lock = lock(id).await;
    let _guard = lock.lock().await;
    let mut v = report(state, id)?;
    if v["state"] != "running" {
        return Err(error("This test is not running"));
    }
    let before = logs(state, &v)?;
    let at = now();
    send(state, &v, line).await?;
    let began = Instant::now();
    let mut output: String;
    let mut matched = expect.is_none();
    loop {
        tokio::time::sleep(Duration::from_millis(250)).await;
        let all = logs(state, &v)?;
        output = if all.starts_with(&before) {
            all[before.len()..].trim().into()
        } else {
            all.lines()
                .rev()
                .take(150)
                .collect::<Vec<_>>()
                .into_iter()
                .rev()
                .collect::<Vec<_>>()
                .join("\n")
        };
        if let Some(expected) = expect {
            matched = output.contains(expected);
            if matched {
                break;
            }
        } else if began.elapsed() >= Duration::from_millis(700) {
            break;
        }
        if began.elapsed() >= Duration::from_secs(timeout.max(1)) {
            break;
        }
        if ensure_running(state, &v).is_err() {
            break;
        }
    }
    // Persist useful evidence, with output bounded per action.
    let output = crate::commands::logging_commands::redact_text_core(state, &output);
    let step = json!({"at":at,"command":line,"expected":expect,"matched":matched,"status":if expect.is_none(){"sent"}else if matched{"passed"}else{"failed"},"output":output.chars().take(24000).collect::<String>(),"duration_ms":began.elapsed().as_millis()});
    v["steps"]
        .as_array_mut()
        .ok_or_else(|| error("Invalid test steps"))?
        .push(step.clone());
    save(state, &v)?;
    Ok(step)
}

pub async fn screenshot(state: &Arc<AppState>, id: &str, label: &str) -> Result<Value> {
    if label.is_empty() || label.len() > 120 {
        return Err(error("Use a screenshot label of 1–120 characters"));
    }
    let lock = lock(id).await;
    let _guard = lock.lock().await;
    let mut v = report(state, id)?;
    ensure_running(state, &v)?;
    let folder = state
        .paths
        .instance_dir(string(&v, "sandbox_id")?)
        .join("screenshots");
    let before = if state.files.metadata(&folder).is_ok_and(|m| m.is_dir()) {
        state.files.read_dir(&folder)?
    } else {
        vec![]
    };
    send(state, &v, "key f2").await?;
    for _ in 0..40 {
        tokio::time::sleep(Duration::from_millis(250)).await;
        if !state.files.metadata(&folder).is_ok_and(|m| m.is_dir()) {
            continue;
        }
        for p in state.files.read_dir(&folder)? {
            if !before.contains(&p) && p.extension().is_some_and(|x| x == "png") {
                let name = format!("screenshot-{}.png", uuid::Uuid::new_v4());
                let dest = dir(state, id)?.join(&name);
                let mut bytes = Vec::new();
                state
                    .files
                    .open(&p)?
                    .take(24 * 1024 * 1024 + 1)
                    .read_to_end(&mut bytes)?;
                if bytes.len() > 24 * 1024 * 1024 {
                    return Err(error("Screenshot exceeds the 24 MiB limit"));
                }
                if image::load_from_memory(&bytes).is_err() {
                    continue;
                }
                state.files.write_atomic(&dest, &bytes)?;
                let artifact = json!({"kind":"image","name":name,"label":label,"path":dest,"at":now(),"sha256":crate::creative::file_hash(state,&dest,None)?});
                v["artifacts"]
                    .as_array_mut()
                    .unwrap()
                    .push(artifact.clone());
                save(state, &v)?;
                return Ok(artifact);
            }
        }
    }
    Err(error(
        "Minecraft did not produce a screenshot within 10 seconds",
    ))
}

pub async fn finish(state: &Arc<AppState>, id: &str, status: &str) -> Result<Value> {
    let lock = lock(id).await;
    let _guard = lock.lock().await;
    let mut v = report(state, id)?;
    if v["finished_at"].is_number() && v["cleaned_up"] == true {
        return Ok(v);
    }
    if let Some(mut child) = recorders().lock().await.remove(id) {
        if let Some(mut input) = child.stdin.take() {
            let _ = input.write_all(b"q\n").await;
        }
        match tokio::time::timeout(Duration::from_secs(15), child.wait()).await {
            Ok(Ok(status)) if status.success() => {}
            Ok(Ok(status)) => v["video_error"] = json!(format!("Recording encoder exited with {status}; playback may be incomplete. See recorder.log.")),
            Ok(Err(error)) => v["video_error"] = json!(format!("Recording encoder could not be checked: {error}")),
            Err(_) => {
                let _ = child.kill().await;
                v["video_error"] = json!("Recording encoder did not finish normally");
            }
        }
    }
    let sandbox = string(&v, "sandbox_id")?.to_owned();
    let was_running = ensure_running(state, &v).is_ok();
    // Disconnect the integrated server first so Minecraft can finish world saving before exit.
    if was_running {
        let last_spark = v["steps"]
            .as_array()
            .into_iter()
            .flatten()
            .rev()
            .filter_map(|s| s["command"].as_str())
            .find(|c| c.starts_with("/spark profiler "))
            .unwrap_or("");
        if last_spark.contains(" start") {
            let _ = send(state, &v, "/spark profiler stop --save-to-file").await;
            for _ in 0..60 {
                tokio::time::sleep(Duration::from_millis(250)).await;
                if logs(state, &v).is_ok_and(|l| l.contains("Profiler stopped & save complete!")) {
                    break;
                }
            }
        }
        let _ = send(state, &v, "/spark profiler cancel").await;
        tokio::time::sleep(Duration::from_millis(500)).await;
        let _ = send(state, &v, "disconnect").await;
        let began = Instant::now();
        while began.elapsed() < Duration::from_secs(15) {
            tokio::time::sleep(Duration::from_millis(250)).await;
            let telemetry = state
                .paths
                .instance_dir(&sandbox)
                .join("enderloom-telemetry.jsonl");
            if let Ok(text) = state.files.read(&telemetry) {
                if String::from_utf8_lossy(&text)
                    .lines()
                    .last()
                    .and_then(|l| serde_json::from_str::<Value>(l).ok())
                    .is_some_and(|s| s["dimension"].is_null())
                {
                    break;
                }
            }
            if ensure_running(state, &v).is_err() {
                break;
            }
        }
    }
    let _ = send(state, &v, "quit").await;
    for _ in 0..100 {
        if ensure_running(state, &v).is_err() {
            break;
        }
        tokio::time::sleep(Duration::from_millis(100)).await;
    }
    let stop = crate::performance::stop_owned(state, &sandbox).await;
    let source = state.paths.instance_dir(&sandbox);
    let folder = dir(state, id)?;
    if let Ok(log) = crate::commands::logging_commands::redact_instance_log_core(
        state,
        &sandbox,
        "latest.log",
        false,
    ) {
        state
            .files
            .write_atomic(folder.join("latest.log"), log.as_bytes())?;
        v["artifacts"].as_array_mut().unwrap().push(json!({"kind":"log","name":"latest.log","label":"Redacted Minecraft log","path":folder.join("latest.log"),"at":now()}));
    }
    if let Ok(raw) = logs(state, &v) {
        let redacted = crate::commands::logging_commands::redact_text_core(state, &raw);
        state
            .files
            .write_atomic(folder.join("console.log"), redacted.as_bytes())?;
    }
    let crashes = source.join("crash-reports");
    if let Ok(paths) = state.files.read_dir(&crashes) {
        for path in paths.into_iter().take(20) {
            if path.extension().is_some_and(|e| e == "txt")
                && state.files.symlink_metadata(&path).is_ok_and(|m| {
                    m.is_file() && !m.file_type().is_symlink() && m.len() <= 2 * 1024 * 1024
                })
            {
                let text = String::from_utf8_lossy(&state.files.read(&path)?).into_owned();
                let redacted = crate::commands::logging_commands::redact_text_core(state, &text);
                let name = format!("crash-{}", path.file_name().unwrap().to_string_lossy());
                let dest = folder.join(&name);
                state.files.write_atomic(&dest, redacted.as_bytes())?;
                v["artifacts"].as_array_mut().unwrap().push(json!({"kind":"log","name":name,"label":"Minecraft crash report","path":dest,"at":now()}));
            }
        }
    }
    for (name, key) in [
        ("enderloom-loaded-mods.json", "loaded_mods"),
        ("enderloom-environment.json", "runtime_environment"),
    ] {
        if let Ok(data) = state.files.read(source.join(name)) {
            if let Ok(value) = serde_json::from_slice::<Value>(&data) {
                v[key] = value;
            }
        }
    }
    collect(
        state,
        &source.join("config").join("spark"),
        &folder,
        &mut v,
        0,
    )?;
    collect(state, &source.join("spark"), &folder, &mut v, 0)?;
    let telemetry = source.join("enderloom-telemetry.jsonl");
    if state.files.is_file(&telemetry)? {
        let data = state.files.read(&telemetry)?;
        state
            .files
            .write_atomic(folder.join("telemetry.jsonl"), &data)?;
        let from = v["scenario_started_at"]
            .as_i64()
            .unwrap_or(v["ready_at"].as_i64().unwrap_or(0));
        let to = v["scenario_finished_at"].as_i64().unwrap_or(now());
        v["measurement_window"] = json!({"from":from,"to":to,"scope":if v["scenario_started_at"].is_number(){"scripted scenario"}else{"interactive session"}});
        let samples = String::from_utf8_lossy(&data)
            .lines()
            .filter_map(|l| serde_json::from_str::<Value>(l).ok())
            .filter(|s| s["at"].as_i64().is_some_and(|at| at >= from && at <= to))
            .collect::<Vec<_>>();
        let mut dimensions = serde_json::Map::new();
        for sample in &samples {
            if let (Some(d), Some(fps)) = (sample["dimension"].as_str(), sample["fps"].as_f64()) {
                let values = dimensions.entry(d.to_string()).or_insert_with(|| json!([]));
                values.as_array_mut().unwrap().push(json!(fps));
            }
        }
        for values in dimensions.values_mut() {
            let numbers = values
                .as_array()
                .unwrap()
                .iter()
                .filter_map(Value::as_f64)
                .collect::<Vec<_>>();
            *values = json!({"samples":numbers.len(),"mean_fps":numbers.iter().sum::<f64>()/numbers.len() as f64,"min_reported_fps":numbers.iter().cloned().reduce(f64::min),"max_reported_fps":numbers.iter().cloned().reduce(f64::max)});
        }
        v["fps_by_dimension"] = json!(dimensions);
        v["telemetry_samples"] = json!(samples.len());
        v["last_observation"] = samples.last().cloned().unwrap_or(Value::Null);
        let mut frame_groups: HashMap<String, Vec<f64>> = HashMap::new();
        for sample in &samples {
            if let (Some(d), Some(values)) =
                (sample["dimension"].as_str(), sample["frame_ms"].as_array())
            {
                frame_groups.entry(d.into()).or_default().extend(
                    values
                        .iter()
                        .filter_map(Value::as_f64)
                        .filter(|v| v.is_finite() && *v > 0.0),
                );
            }
        }
        let summaries:serde_json::Map<String,Value>=frame_groups.into_iter().filter(|(_,v)|!v.is_empty()).map(|(d,mut values)| {
            values.sort_by(f64::total_cmp); let n=values.len(); let slow=((n as f64*0.01).ceil() as usize).max(1);let slow_mean=values[n-slow..].iter().sum::<f64>()/slow as f64;
            let percentile=|p:f64|values[((n-1)as f64*p).ceil()as usize];
            (d,json!({"frames":n,"mean_frame_ms":values.iter().sum::<f64>()/n as f64,"p95_frame_ms":percentile(0.95),"p99_frame_ms":percentile(0.99),"max_frame_ms":values[n-1],"one_percent_low_fps":1000.0/slow_mean,"hitches_over_50ms":values.iter().filter(|&&v|v>50.0).count(),"hitches_over_100ms":values.iter().filter(|&&v|v>100.0).count(),"hitches_over_250ms":values.iter().filter(|&&v|v>250.0).count()}))
        }).collect();
        v["frame_times"] = json!(summaries);
        v["frame_time_note"]=json!("Intervals between NeoForge RenderFrameEvent.Post callbacks, including frame limiting, focus throttling, capture overhead and transitions. 1% low is 1000 / mean of slowest 1% intervals. Dimension boundaries have one-second resolution.");
    }
    if let Some(video) = v["video_path"].as_str() {
        let path = PathBuf::from(video);
        if state.files.is_file(&path)? && state.files.metadata(&path)?.len() > 1000 {
            let artifact = json!({"kind":"video","name":"recording.mp4","label":"Test playback · 30 fps capture","path":path,"at":now(),"sha256":crate::creative::file_hash(state,&path,None)?});
            v["artifacts"].as_array_mut().unwrap().push(artifact);
        }
    }
    v["state"] = json!(if status == "completed" && !was_running {
        "interrupted"
    } else {
        status
    });
    v["finished_at"] = json!(now());
    if let Err(e) = stop {
        v["cleanup_error"] = json!(e.to_string());
    } else {
        let cleanup = (|| -> Result<()> {
            state.db.delete_instance(&sandbox)?;
            state.files.remove_instance_dir(&sandbox)?;
            Ok(())
        })();
        v["cleaned_up"] = json!(cleanup.is_ok());
        if let Err(e) = cleanup {
            v["cleanup_error"] = json!(e.to_string());
        }
    }
    save(state, &v)?;
    analyze_inner(state, id).await
}

async fn finalize_video(state: &AppState, id: &str, report: &mut Value) -> Result<()> {
    let folder = dir(state, id)?;
    let source = folder.join("recording.mp4");
    if !state.files.is_file(&source)? || state.files.metadata(&source)?.len() < 1000 { return Ok(()); }
    let pending = folder.join("playback.pending.mp4");
    let playback = folder.join("playback.mp4");
    // Retain the crash-recoverable capture. Stream-copy its packets into an
    // indexed MP4 so the browser knows the full duration before playback starts.
    let mut command = Command::new("ffmpeg");
    command.kill_on_drop(true).args(["-hide_banner", "-loglevel", "error", "-nostdin", "-i"])
        .arg(&source).args(["-map", "0:v:0", "-c", "copy", "-an", "-movflags", "+faststart", "-y"]).arg(&pending)
        .stdout(std::process::Stdio::null()).stderr(std::process::Stdio::piped());
    #[cfg(windows)]
    command.creation_flags(0x08000000);
    let output = tokio::time::timeout(Duration::from_secs(90), command.output()).await
        .map_err(|_| error("Video finalization timed out; use Analyze Spark & logs to retry"))??;
    if !output.status.success() {
        return Err(error(format!("{}", String::from_utf8_lossy(&output.stderr).trim())));
    }
    let source_hash = crate::creative::file_hash(state, &source, None)?;
    let playback_hash = crate::creative::file_hash(state, &pending, None)?;
    state.files.rename(&pending, &playback)?;
    let artifact = json!({"kind":"video","name":"playback.mp4","label":"Test playback · 30 fps capture","path":playback,"at":now(),"sha256":playback_hash});
    let artifacts = report["artifacts"].as_array_mut().ok_or_else(||error("Report has no artifact list"))?;
    artifacts.retain(|entry| !(entry["kind"]=="video" && matches!(entry["name"].as_str(),Some("recording.mp4"|"playback.mp4"))));
    artifacts.push(artifact);
    report["video_finalized"] = json!(true);
    report["video_finalization"] = json!({"method":"stream_copy_faststart","source_sha256":source_hash,"playback_sha256":playback_hash});
    Ok(())
}

fn collect(state: &AppState, from: &Path, to: &Path, v: &mut Value, depth: usize) -> Result<()> {
    if depth > 4 || !state.files.metadata(from).is_ok_and(|m| m.is_dir()) {
        return Ok(());
    }
    for path in state.files.read_dir(from)? {
        let meta = state.files.symlink_metadata(&path)?;
        if meta.file_type().is_symlink() {
            continue;
        }
        if meta.is_dir() {
            collect(state, &path, to, v, depth + 1)?;
        } else if path
            .extension()
            .is_some_and(|e| e == "sparkprofile" || e == "sparkheap" || e == "sparkhealth")
            && meta.len() <= 32 * 1024 * 1024
        {
            let name = format!(
                "{}-{}",
                uuid::Uuid::new_v4(),
                path.file_name().unwrap().to_string_lossy()
            );
            let dest = to.join(&name);
            state.files.write_atomic(&dest, &state.files.read(&path)?)?;
            v["artifacts"].as_array_mut().unwrap().push(json!({"kind":"spark","name":name,"label":path.file_name().unwrap().to_string_lossy(),"path":dest,"at":now(),"sha256":crate::creative::file_hash(state,&dest,None)?}));
        }
    }
    Ok(())
}

pub fn artifact(state: &AppState, id: &str, name: &str) -> Result<Value> {
    use base64::Engine;
    let v = report(state, id)?;
    if !v["artifacts"]
        .as_array()
        .is_some_and(|a| a.iter().any(|a| a["name"] == name))
        || name.contains(['/', '\\', ':'])
    {
        return Err(error("Artifact does not belong to this test"));
    }
    let p = dir(state, id)?.join(name);
    if state.files.metadata(&p)?.len() > 32 * 1024 * 1024 {
        return Err(error("Open large recordings from their report path"));
    }
    Ok(json!({"data":base64::engine::general_purpose::STANDARD.encode(state.files.read(p)?)}))
}
async fn recorder_available() -> Result<()> {
    if !cfg!(windows) {
        return Err(error("Window recording currently requires Windows; screenshots and CLI controls remain available"));
    }
    let mut cmd = Command::new("ffmpeg");
    cmd.arg("-version");
    #[cfg(windows)]
    cmd.creation_flags(0x08000000);
    let output = cmd.output().await.map_err(|_| {
        error("Install FFmpeg and make it available on PATH to enable optional window recording")
    })?;
    if !output.status.success() {
        return Err(error("FFmpeg is unavailable"));
    }
    Ok(())
}
async fn start_recorder(state: &AppState, v: &Value, token: tokio_util::sync::CancellationToken) -> Result<(PathBuf, Value)> {
    let pid = state
        .running
        .lock()
        .unwrap()
        .get(string(v, "running_id")?)
        .ok_or_else(|| error("No game process"))?
        .pid;
    let began = Instant::now();
    let mut window = None;
    while window.is_none() && began.elapsed() < Duration::from_secs(90) {
        if token.is_cancelled() { return Err(Error::Cancelled); }
        ensure_running(state,v)?;
        let mut cmd = Command::new("powershell.exe");
        cmd.kill_on_drop(true).args(["-NoProfile","-NonInteractive","-Command",&format!("[Console]::OutputEncoding=[System.Text.Encoding]::UTF8; (Get-Process -Id {pid} -ErrorAction Stop).MainWindowHandle.ToInt64()")]);
        #[cfg(windows)]
        cmd.creation_flags(0x08000000);
        let output = tokio::select! {
            _ = token.cancelled() => return Err(Error::Cancelled),
            result = tokio::time::timeout(Duration::from_secs(5), cmd.output()) => result.map_err(|_|error("The game-window lookup timed out"))??,
        };
        window = String::from_utf8_lossy(&output.stdout).trim().parse::<u64>().ok().filter(|handle| *handle > 0);
        if window.is_none() {
            tokio::time::sleep(Duration::from_millis(500)).await;
        }
    }
    // A zero HWND means desktop to gdigrab. Never allow it or fall back to a
    // title shared with another running Minecraft instance.
    let window = window.ok_or_else(||error("The owned Minecraft process has no capturable window"))?;
    ensure_running(state,v)?;
    let path = dir(state, string(v, "id")?)?.join("recording.mp4");
    let mut cmd = Command::new("ffmpeg");
    cmd.args([
        "-hide_banner",
        "-loglevel",
        "warning",
        "-f",
        "gdigrab",
        "-framerate",
        "30",
        "-i",
        &format!("hwnd={window}"),
        "-an",
        "-vf",
        "scale=trunc(iw/2)*2:trunc(ih/2)*2",
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-crf",
        "24",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+frag_keyframe+empty_moov+default_base_moof",
        "-t",
        &v["max_seconds"].to_string(),
        "-y",
    ])
    .arg(&path)
    .stdin(std::process::Stdio::piped())
    .stdout(std::process::Stdio::null())
    .stderr(std::process::Stdio::from(
        state
            .files
            .create(dir(state, string(v, "id")?)?.join("recorder.log"))?,
    ))
    .kill_on_drop(true);
    #[cfg(windows)]
    cmd.creation_flags(0x08000000);
    let mut child = cmd.spawn()?;
    tokio::select! {
        _ = token.cancelled() => { let _=child.kill().await; return Err(Error::Cancelled); }
        _ = tokio::time::sleep(Duration::from_millis(800)) => {}
    }
    if child.try_wait()?.is_some() {
        return Err(error(
            "Recording failed to start; see recorder.log in this report",
        ));
    }
    recorders()
        .lock()
        .await
        .insert(string(v, "id")?.into(), child);
    Ok((path,json!({"method":"window_handle","pid":pid,"hwnd":window,"fps":30,"audio":false})))
}

