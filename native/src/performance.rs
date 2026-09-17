//! Real startup captures in copied, disposable instances. No runtime estimate from static facts.
use crate::{commands::find_instance, config::Instance, error::{Error,Result}, state::AppState, tasks::{TaskKind,TaskSpec,TaskHandle}};
use serde_json::{json,Value};
use std::{io::{Read,Write}, path::Path, sync::{Arc,Mutex},time::{Duration,Instant}};

fn cancelled(task: &TaskHandle) -> Result<()> { if task.token().is_cancelled() { Err(Error::Cancelled) } else { Ok(()) } }

pub(crate) fn copy_tree(state: &AppState, from: &Path, to: &Path, task: &TaskHandle, depth: usize) -> Result<()> {
    cancelled(task)?;
    if state.files.symlink_metadata(from)?.file_type().is_symlink(){return Err(Error::other("Linked directories cannot be copied into a test sandbox"));}
    #[cfg(windows)] {use std::os::windows::fs::MetadataExt;if std::fs::symlink_metadata(from)?.file_attributes()&0x400!=0{return Err(Error::other("Linked directories cannot be copied into a test sandbox"));}}
    if depth > 24 { return Err(Error::other("Sandbox source nesting exceeds the copy safety limit")); }
    state.files.ensure_dir(to)?;
    for path in state.files.read_dir(from)? {
        cancelled(task)?;
        let name = path.file_name().unwrap().to_string_lossy().to_string();
        if depth == 0 && matches!(name.to_lowercase().as_str(),"saves"|"screenshots"|"logs"|"crash-reports"|".enderloom-workbench"|".enderloom-performance"|"session.lock") { continue; }
        let meta = state.files.symlink_metadata(&path)?;
        if meta.file_type().is_symlink() { return Err(Error::other("Linked content cannot be copied into a test sandbox")); }
        #[cfg(windows)] { use std::os::windows::fs::MetadataExt; if std::fs::symlink_metadata(&path)?.file_attributes() & 0x400 != 0 { return Err(Error::other("Linked content cannot be copied into a test sandbox")); } }
        let target = to.join(&name);
        if meta.is_dir() { copy_tree(state,&path,&target,task,depth+1)?; }
        else if meta.is_file() {
            task.stage(&format!("Copying {name}"));
            let mut input = state.files.open(&path)?;
            let before = input.metadata()?;
            let mut output = state.files.create(&target)?;
            let mut buffer = [0u8;64*1024];
            loop { cancelled(task)?; let n = input.read(&mut buffer)?; if n==0 { break; } output.write_all(&buffer[..n])?; }
            output.sync_all()?;
            let after = input.metadata()?;
            if before.len()!=after.len() || before.modified().ok()!=after.modified().ok() { return Err(Error::other("Source files changed while preparing the sandbox. Try again when the instance is idle.")); }
        }
    }
    Ok(())
}

pub(crate) async fn stop_owned(state: &AppState, sandbox: &str) -> Result<()> {
    {
        let mut registry = state.running.lock().unwrap();
        for (id,run) in registry.iter_mut().filter(|(_,r)|r.instance_id==sandbox) {
            if run.status.lock().unwrap().state=="running" { run.request_kill(id); }
        }
    }
    for _ in 0..100 {
        if !state.running.lock().unwrap().values().any(|r|r.instance_id==sandbox && r.status.lock().unwrap().state=="running") { return Ok(()); }
        tokio::time::sleep(Duration::from_millis(100)).await;
    }
    Err(Error::other("The test process has not stopped. Its sandbox is retained for recovery."))
}

pub async fn startup(state: &Arc<AppState>, instance_id: &str, seconds: u64) -> Result<Value> {
    startup_variant(state,instance_id,seconds,None,None).await
}

async fn startup_variant(state: &Arc<AppState>, instance_id: &str, seconds: u64, omitted: Option<&str>, parent: Option<tokio_util::sync::CancellationToken>) -> Result<Value> {
    if !(15..=900).contains(&seconds) { return Err(Error::other("Choose a recording duration from 15 to 900 seconds")); }
    let source = find_instance(state,instance_id)?;
    if parent.is_none() && crate::instance_ops::instance_busy(state,instance_id) { return Err(Error::other("Stop this instance and wait for its tasks before starting a controlled capture")); }
    let task = Arc::new(state.tasks.start_ipc(TaskKind::PerformanceTest,TaskSpec{title:"Startup capture".into(),instance_id:Some(instance_id.to_string()),subtitle:Some(source.name.clone()),..Default::default()})?);
    let id = uuid::Uuid::new_v4().to_string();
    let sandbox_id = uuid::Uuid::new_v4().to_string();
    let mut sandbox = source.clone();
    sandbox.id=sandbox_id.clone(); sandbox.dir=state.paths.instance_dir(&sandbox_id).display().to_string();
    sandbox.name=format!("[Performance] {}",source.name); sandbox.created_at=chrono::Utc::now(); sandbox.playtime_secs=0;sandbox.last_played_at=None;
    sandbox.logo=None;sandbox.import_source=None;sandbox.import_source_id=None;sandbox.pack_provider=None;sandbox.pack_project_id=None;sandbox.pack_version_id=None;
    sandbox.wrapper_command=None;sandbox.pre_launch_command=None;sandbox.post_exit_command=None;
    let mut record=json!({"id":id,"instance_id":instance_id,"instance_name":source.name,"sandbox_id":sandbox_id,"at":chrono::Utc::now().timestamp_millis(),"kind":"startup_capture","state":"preparing","seconds":seconds,
        "scenario":"Copied instance, no worlds or launch hooks; title-menu startup. The observation window begins after process spawn.","sampling_note":"Log milestones are observed through a 200 ms log poll, not a title-screen readiness probe.","milestones":{},"jfr":null,"error":null,"cleaned_up":false});
    state.db.library_put(&format!("runtime:{id}"),&record)?;
    record["omitted_file"]=json!(omitted);
    let forward=parent.map(|parent| { let child=task.token();tokio::spawn(async move { parent.cancelled().await;child.cancel(); }) });
    let result=capture(state,&source,&sandbox,seconds,&task,&mut record,omitted).await;
    if let Some(forward)=forward { forward.abort(); }
    if let Err(e)=&result { record["error"]=json!(e.to_string()); }
    record["state"]=json!(match &result { Ok(_) => "completed",Err(Error::Cancelled)=>"cancelled",Err(_)=>"failed" });
    let stopped=stop_owned(state,&sandbox_id).await;
    if let Ok(log) = crate::commands::logging_commands::redact_instance_log_core(state, &sandbox_id, "latest.log", false) {
        let tail: String = log.chars().rev().take(512 * 1024).collect::<String>().chars().rev().collect();
        match state.db.library_put(&format!("capture-log:{id}"), &json!(tail)) {
            Ok(()) => record["has_log"] = json!(true),
            Err(error) => record["log_error"] = json!(error.to_string()),
        }
    }
    if stopped.is_ok() {
        let cleanup=(||->Result<()> {
            // This UUID was generated here; never derive cleanup targets from request paths.
            state.db.delete_instance(&sandbox_id)?;
            state.files.remove_instance_dir(&sandbox_id)?;
            Ok(())
        })();
        record["cleaned_up"]=json!(cleanup.is_ok());
        if let Err(e)=cleanup { record["cleanup_error"]=json!(e.to_string()); }
    } else { record["cleanup_error"]=json!(stopped.err().unwrap().to_string()); }
    record["finished_at"]=json!(chrono::Utc::now().timestamp_millis());
    state.db.library_put(&format!("runtime:{id}"),&record)?;
    task.finish(&result);
    if let Some(sink)=state.tasks.event_sink() { sink("performance:finished",record.clone()); }
    // Failed/cancelled captures are real saved results, with no fabricated measurements.
    Ok(record)
}

async fn capture(state:&Arc<AppState>,source:&Instance,sandbox:&Instance,seconds:u64,task:&Arc<TaskHandle>,record:&mut Value,omitted:Option<&str>)->Result<()> {
    task.stage("Fingerprinting source files");
    let before=tokio::task::spawn_blocking({let state=state.clone();let source=source.clone();let task=task.clone();move||crate::creative::scan_instance(&state,&source.id,&task,true,false)}).await.map_err(|e|Error::other(e.to_string()))??;
    record["input_fingerprint"]=before["fingerprint"].clone(); record["environment"]=before["environment"].clone();
    let version_id=source.launch_version_id.as_deref().unwrap_or(&source.version_id);
    let version=crate::install::load_merged_version(state,version_id).await?;
    let settings=state.db.load_settings()?;
    let java=crate::java::find_for_major(&state.files,version.required_java_major(),source.java_path.as_deref().or(settings.java_path.as_deref())).await.ok_or_else(||Error::other("Install the instance's Java runtime before profiling"))?;
    if java.major<11 { return Err(Error::other("Startup Flight Recorder captures require Java 11 or newer")); }
    record["java"]=json!({"path":java.path,"major":java.major});
    tokio::task::spawn_blocking({let state=state.clone();let source=source.clone();let sandbox=sandbox.clone();let task=task.clone();move||copy_tree(&state,Path::new(&source.dir),Path::new(&sandbox.dir),&task,0)}).await.map_err(|e|Error::other(e.to_string()))??;
    cancelled(task)?;
    state.db.insert_instance(sandbox)?;
    let copied=tokio::task::spawn_blocking({let state=state.clone();let id=sandbox.id.clone();let task=task.clone();move||crate::creative::scan_instance(&state,&id,&task,true,false)}).await.map_err(|e|Error::other(e.to_string()))??;
    if before["fingerprint"]!=copied["fingerprint"] { return Err(Error::other("The source changed while the sandbox was being copied. No benchmark was launched.")); }
    if let Some(file)=omitted {
        validate_target(file)?;
        let path=Path::new(&sandbox.dir).join("mods").join(file);
        if !state.files.is_file(&path)? { return Err(Error::other("The selected mod is no longer enabled in this instance")); }
        state.files.rename(&path,path.with_file_name(format!("{file}.disabled")))?;
        record["target_sha256"]=before["files"].as_array().and_then(|files|files.iter().find(|v|v["file_name"].as_str()==Some(file))).map(|v|v["inspection"]["sha256"].clone()).unwrap_or(Value::Null);
    }
    record["state"]=json!("running");state.db.library_put(&format!("runtime:{}",record["id"].as_str().unwrap()),record)?;
    let timing=Arc::new(Mutex::new((None::<Instant>,serde_json::Map::<String,Value>::new())));
    let events=state.tasks.event_sink().ok_or_else(||Error::other("No launcher event channel"))?;
    let sink=Arc::new({let timing=timing.clone();move |event:&str,payload:Value| {
        {
            let mut time=timing.lock().unwrap();
            if event=="process:spawned" { time.0=Some(Instant::now()); }
            if event=="process:log" {
                if let Some(start)=time.0 { if let Some(lines)=payload["lines"].as_array() { for line in lines.iter().filter_map(Value::as_str) {
                    for (key,matched) in [("resource_reload",line.contains("Reloading ResourceManager")),("audio_initialized",line.contains("OpenAL initialized")),("texture_atlas_created",line.contains("Created:")&&line.contains("atlas"))] {
                        if matched { time.1.entry(key.to_string()).or_insert_with(||json!({"elapsed_ms":start.elapsed().as_millis(),"evidence":line})); }
                    }
                } } }
            }
        }
        events(event,payload);
    }});
    let mut launch=sandbox.clone();
    launch.java_path=Some(java.path.clone());
    let original=crate::launch::instance_jvm_template(&settings,&launch);
    launch.jvm_args=Some(format!("{original} -XX:StartFlightRecording=name=Enderloom,settings=profile,duration={seconds}s,filename=enderloom-startup.jfr,dumponexit=true"));launch.jvm_args_mode=Some("replace".into());
    let mut safe_settings=settings;
    safe_settings.wrapper_command.clear();safe_settings.pre_launch_command.clear();safe_settings.post_exit_command.clear();safe_settings.game_args.clear();safe_settings.fullscreen=false;safe_settings.discord_rpc=false;
    task.stage("Launching isolated Minecraft client");
    // Do not drop a launch future on cancellation; let it return its owned process for cleanup.
    let running=crate::launch::launch_profile_instance(sink,state,&launch,safe_settings).await?;
    record["running_id"]=json!(running);
    state.db.library_put(&format!("runtime:{}",record["id"].as_str().unwrap()),record)?;
    let began=timing.lock().unwrap().0.unwrap_or_else(Instant::now);
    loop {
        cancelled(task)?;
        let elapsed=began.elapsed().as_secs();
        task.stage("Recording startup in the sandbox");task.progress(elapsed.min(seconds),seconds,0,0);
        let status=state.running.lock().unwrap().get(&running).map(|r|r.status.lock().unwrap().clone()).ok_or_else(||Error::other("Startup process disappeared"))?;
        if status.state!="running" { record["exit_code"]=json!(status.exit_code); return Err(Error::other(format!("Minecraft exited during capture (code {:?})",status.exit_code))); }
        if elapsed>=seconds+3 { break; }
        tokio::time::sleep(Duration::from_millis(250)).await;
    }
    record["milestones"]=Value::Object(timing.lock().unwrap().1.clone());
    let recording=Path::new(&sandbox.dir).join("enderloom-startup.jfr");
    if !state.files.is_file(&recording)? { return Err(Error::other("The JVM did not produce a Flight Recorder file")); }
    let dest=state.paths.root.join("performance-recordings").join(format!("{}.jfr",record["id"].as_str().unwrap()));
    state.files.ensure_dir(dest.parent().unwrap())?;
    let mut input=state.files.open(&recording)?;state.files.copy_reader_into_sync(&mut input,&dest)?;
    record["recording_path"]=json!(dest.display().to_string());
    record["recording_sha256"]=json!(crate::creative::file_hash(state,&dest,Some(task))?);
    task.stage("Reading Flight Recorder measurements");
    let jfr=if Path::new(&java.path).is_absolute() { Path::new(&java.path).with_file_name(if cfg!(windows){"jfr.exe"}else{"jfr"}) } else { std::path::PathBuf::from(if cfg!(windows){"jfr.exe"}else{"jfr"}) };
    let mut command=tokio::process::Command::new(jfr);
    command.args(["print","--json","--events","jdk.CPULoad,jdk.GCHeapSummary,jdk.GCPhasePause,jdk.GarbageCollection"]).arg(&dest).kill_on_drop(true);
    #[cfg(windows)] command.creation_flags(0x08000000);
    let output=tokio::time::timeout(Duration::from_secs(60),command.output()).await.map_err(|_|Error::other("Flight Recorder analysis timed out"))??;
    if output.status.success() {
        let data:Value=serde_json::from_slice(&output.stdout)?;
        record["jfr"]=summarize_jfr(&data);
    } else { record["jfr_error"]=json!("The runtime's jfr reader could not parse this capture. The original recording is retained."); }
    cancelled(task)?;
    Ok(())
}

fn validate_target(file:&str)->Result<()> {
    if file.is_empty() || !file.to_lowercase().ends_with(".jar") || file.contains(['/', '\\', ':', '\0']) || file==".." { return Err(Error::other("Choose an enabled mod JAR from this instance")); }
    Ok(())
}

// Required dependency declarations come from local metadata, not the project's popularity or generator.
fn local_dependencies(state:&AppState,path:&Path)->Result<(Vec<String>,Vec<String>)> {
    let mut archive=zip::ZipArchive::new(state.files.open(path)?).map_err(|e|Error::other(e.to_string()))?;
    let mut ids=Vec::new();let mut requires=Vec::new();
    for name in ["fabric.mod.json","quilt.mod.json","META-INF/mods.toml","META-INF/neoforge.mods.toml","mcmod.info"] {
        let Ok(mut entry)=archive.by_name(name) else {continue};
        if entry.size()>2*1024*1024 { return Err(Error::other("Dependency metadata exceeds inspection limits")); }
        let mut text=String::new();(&mut entry).take(2*1024*1024+1).read_to_string(&mut text)?;
        if name.ends_with(".toml") {
            let data:toml::Value=toml::from_str(&text).map_err(|e|Error::other(format!("Invalid dependency metadata: {e}")))?;
            if let Some(mods)=data.get("mods").and_then(toml::Value::as_array) { for m in mods { if let Some(id)=m.get("modId").and_then(toml::Value::as_str) { ids.push(id.to_string()); } } }
            if let Some(deps)=data.get("dependencies").and_then(toml::Value::as_table) { for list in deps.values().filter_map(toml::Value::as_array) { for d in list {
                if d.get("mandatory").and_then(toml::Value::as_bool)==Some(true) || d.get("type").and_then(toml::Value::as_str)==Some("required") {
                    if let Some(id)=d.get("modId").and_then(toml::Value::as_str) {requires.push(id.to_string());}
                }
            } } }
        } else {
            let data:Value=serde_json::from_str(&text)?;
            if name=="fabric.mod.json" { if let Some(id)=data["id"].as_str(){ids.push(id.to_string());} if let Some(deps)=data["depends"].as_object(){requires.extend(deps.keys().cloned());} }
            if name=="quilt.mod.json" { if let Some(id)=data["quilt_loader"]["id"].as_str(){ids.push(id.to_string());} if let Some(deps)=data["quilt_loader"]["depends"].as_array(){for d in deps {if d["optional"]!=true { if let Some(id)=d["id"].as_str(){requires.push(id.to_string());} }}} }
            if name=="mcmod.info" { let mods=data.as_array().or_else(||data["modList"].as_array());if let Some(mods)=mods {for m in mods {if let Some(id)=m["modid"].as_str(){ids.push(id.to_string());} if let Some(deps)=m["requiredMods"].as_array(){for d in deps.iter().filter_map(Value::as_str){requires.push(d.split('@').next().unwrap_or(d).to_string());}}}} }
        }
    }
    Ok((ids,requires))
}

pub async fn compare(state:&Arc<AppState>,instance_id:&str,file:&str,seconds:u64,repeats:u64)->Result<Value> {
    validate_target(file)?;
    if repeats==0 || repeats>100 || !(15..=900).contains(&seconds) { return Err(Error::other("Choose 1–100 pairs and a 15–900 second capture window")); }
    let source=find_instance(state,instance_id)?;
    if crate::instance_ops::instance_busy(state,instance_id) {return Err(Error::other("The source instance must be idle before comparison"));}
    let target=Path::new(&source.dir).join("mods").join(file);
    let target_hash=crate::creative::file_hash(state,&target,None)?;
    let (ids,_)=local_dependencies(state,&target)?;
    if ids.is_empty() {return Err(Error::other("This JAR has no supported mod identity. Dependency-safe comparison is unavailable."));}
    let mut dependents=Vec::new();
    for path in state.files.read_dir(Path::new(&source.dir).join("mods"))? {
        if path==target || !path.file_name().is_some_and(|v|v.to_string_lossy().to_lowercase().ends_with(".jar")){continue;}
        let (_,requires)=local_dependencies(state,&path)?;
        if requires.iter().any(|r|ids.contains(r)){dependents.push(path.file_name().unwrap().to_string_lossy().to_string());}
    }
    if let Some(tracked)=state.db.content_file(instance_id,"mods",file)? { if let Some(project)=tracked.project_id {dependents.extend(crate::search::resolve::dependents_of(state,crate::search::resolve::Target::Instance(instance_id),crate::search::ContentKind::Mod,&project));} }
    if !dependents.is_empty(){return Err(Error::other(format!("Removing this mod would break required dependents: {}. Test the dependency group together instead.",dependents.join(", "))));}
    let task=state.tasks.start_ipc(TaskKind::PerformanceComparison,TaskSpec{title:format!("Compare {file}"),instance_id:Some(instance_id.to_string()),total:repeats*2,..Default::default()})?;
    let id=uuid::Uuid::new_v4().to_string();
    let mut result=json!({"id":id,"instance_id":instance_id,"instance_name":source.name,"file_name":file,"target_sha256":target_hash,"at":chrono::Utc::now().timestamp_millis(),"state":"running","requested_pairs":repeats,"seconds":seconds,"pairs":[],"captures":[],"error":null,
        "method":"Paired startup captures from fresh copies; alternating AB/BA order. Required local and provider dependencies checked. Compare observed startup milestones, never FPS or whole-session mod cost."});
    state.db.library_put(&format!("comparison:{id}"),&result)?;
    let measured:Result<()>=async {
        let mut fingerprint=None::<String>;
        for pair in 0..repeats {
            let mut with=None;let mut without=None;
            for omit in if pair%2==0 {[false,true]}else{[true,false]} {
                cancelled(&task)?;
                task.stage(&format!("Pair {} / {} · {} target",pair+1,repeats,if omit{"without"}else{"with"}));
                let capture=startup_variant(state,instance_id,seconds,omit.then_some(file),Some(task.token())).await?;
                result["captures"].as_array_mut().unwrap().push(json!(capture["id"]));
                if capture["state"]=="cancelled" {return Err(Error::Cancelled);}
                if capture["state"]!="completed" {return Err(Error::other(format!("A capture failed; this pair cannot establish a mod impact: {}",capture["error"])));}
                let current=capture["input_fingerprint"].as_str().unwrap_or("");
                if let Some(expected)=&fingerprint {if expected!=current{return Err(Error::other("Source files or environment changed between captures; comparison invalidated"));}}
                else { fingerprint=Some(current.to_string());result["input_fingerprint"]=json!(current); }
                if omit {without=Some(capture);}else{with=Some(capture);}
                task.progress(result["captures"].as_array().unwrap().len() as u64,repeats*2,0,0);
                state.db.library_put(&format!("comparison:{id}"),&result)?;
            }
            let (with,without)=(with.unwrap(),without.unwrap());let mut deltas=serde_json::Map::new();
            for key in ["resource_reload","audio_initialized","texture_atlas_created"] {
                if let (Some(a),Some(b))=(with["milestones"][key]["elapsed_ms"].as_f64(),without["milestones"][key]["elapsed_ms"].as_f64()) {deltas.insert(key.into(),json!(a-b));}
            }
            if deltas.is_empty(){return Err(Error::other("Neither capture produced matching supported startup milestones. No impact can be reported."));}
            result["pairs"].as_array_mut().unwrap().push(json!({"index":pair+1,"order":if pair%2==0{"AB"}else{"BA"},"with_capture":with["id"],"without_capture":without["id"],"delta_ms":deltas}));
            state.db.library_put(&format!("comparison:{id}"),&result)?;
        }
        Ok(())
    }.await;
    result["state"]=json!(match &measured{Ok(_)=>"completed",Err(Error::Cancelled)=>"cancelled",Err(_)=>"invalid"});
    if let Err(error)=&measured{result["error"]=json!(error.to_string());}
    let mut statistics=serde_json::Map::new();
    if measured.is_ok() {for key in ["resource_reload","audio_initialized","texture_atlas_created"] {
        let values=result["pairs"].as_array().unwrap().iter().filter_map(|p|p["delta_ms"][key].as_f64()).collect::<Vec<_>>();
        if values.is_empty(){continue;}let mean=values.iter().sum::<f64>()/values.len() as f64;
        let sd=if values.len()>1{Some((values.iter().map(|v|(v-mean).powi(2)).sum::<f64>()/(values.len()-1)as f64).sqrt())}else{None};
        statistics.insert(key.into(),json!({"pairs":values.len(),"mean_delta_ms":mean,"sample_std_dev_ms":sd,"min_delta_ms":values.iter().copied().reduce(f64::min),"max_delta_ms":values.iter().copied().reduce(f64::max)}));
    }}
    result["statistics"]=Value::Object(statistics);result["finished_at"]=json!(chrono::Utc::now().timestamp_millis());
    state.db.library_put(&format!("comparison:{id}"),&result)?;task.finish(&measured);
    if let Some(sink)=state.tasks.event_sink(){sink("performance:comparison",result.clone());}
    Ok(result)
}

pub async fn cleanup_capture(state:&Arc<AppState>,id:&str)->Result<Value> {
    let mut record=state.db.library_get(&format!("runtime:{id}"))?.ok_or_else(||Error::other("Capture not found"))?;
    let sandbox=record["sandbox_id"].as_str().ok_or_else(||Error::other("Capture has no owned sandbox"))?.to_string();
    uuid::Uuid::parse_str(&sandbox).map_err(|_|Error::other("Invalid owned sandbox identity"))?;
    if state.tasks.list().iter().any(|t| t.kind==TaskKind::PerformanceTest && t.state==crate::tasks::TaskState::Running && t.instance_id.as_deref()==record["instance_id"].as_str()){return Err(Error::other("Cancel the active capture before cleaning its sandbox"));}
    stop_owned(state,&sandbox).await?;state.db.delete_instance(&sandbox)?;state.files.remove_instance_dir(&sandbox)?;
    record["cleaned_up"]=json!(true);record["cleanup_error"]=Value::Null;
    if record["state"]=="running"||record["state"]=="preparing"{record["state"]=json!("interrupted");}
    state.db.library_put(&format!("runtime:{id}"),&record)?;Ok(record)
}

pub(crate) fn summarize_jfr(data:&Value)->Value {
    let mut cpu=Vec::new();let mut heap=Vec::new();let mut pauses=Vec::new();let mut collections=0u64;
    if let Some(events)=data["recording"]["events"].as_array() { for e in events {
        let v=&e["values"];
        match e["type"].as_str().unwrap_or("") {
            "jdk.CPULoad"=> { if let (Some(user),Some(system))=(v["jvmUser"].as_f64(),v["jvmSystem"].as_f64()) { cpu.push((user+system)*100.0); } }
            "jdk.GCHeapSummary"=> { if let Some(n)=v["heapUsed"].as_u64() { heap.push(n); } }
            "jdk.GCPhasePause"=> { if let Some(n)=v["duration"].as_str().and_then(|s|s.strip_prefix("PT")).and_then(|s|s.strip_suffix('S')).and_then(|s|s.parse::<f64>().ok()) { pauses.push(n*1000.0); } }
            "jdk.GarbageCollection"=>collections+=1,_=>{}
        }
    } }
    json!({"cpu_samples":cpu.len(),"mean_jvm_cpu_percent":if cpu.is_empty(){None}else{Some(cpu.iter().sum::<f64>()/cpu.len() as f64)},
        "heap_samples":heap.len(),"max_observed_heap_bytes":heap.iter().max(),"gc_collections":collections,"gc_pause_events":pauses.len(),
        "total_gc_pause_ms":if pauses.is_empty(){None}else{Some(pauses.iter().sum::<f64>())},"max_gc_pause_ms":pauses.iter().copied().reduce(f64::max),
        "scope":"JVM-wide JFR measurements from the fixed capture window. Heap values are observed samples. These are not per-mod attribution or FPS/TPS measurements."})
}
