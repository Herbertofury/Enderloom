//! CLI transport only: arguments, envelopes and shared-domain orchestration.
use crate::{
    capabilities,
    error::{Error, Result},
    service,
    state::AppState,
};
use clap::{Parser, Subcommand};
use serde_json::{json, Value};
use std::{
    io::{self, IsTerminal, Write},
    path::PathBuf,
    sync::{Arc, Mutex},
    time::Duration,
};
use tokio::io::AsyncReadExt;

#[derive(Parser, Debug)]
#[command(
    name = "enderloom",
    version,
    about = "Enderloom's shared launcher command interface"
)]
struct Cli {
    #[arg(long, global = true)]
    data_dir: Option<PathBuf>,
    #[arg(long, global = true, conflicts_with = "jsonl")]
    json: bool,
    #[arg(long, global = true)]
    jsonl: bool,
    #[arg(long, global = true)]
    quiet: bool,
    #[arg(long, global = true)]
    no_color: bool,
    #[arg(long, global = true)]
    non_interactive: bool,
    #[arg(long, global = true)]
    yes: bool,
    #[arg(long, global = true)]
    plan: bool,
    #[arg(short = 'v', long, global = true, action = clap::ArgAction::Count)]
    verbose: u8,
    #[arg(long, global = true)]
    trace_id: Option<String>,
    #[arg(long, global = true, default_value = "600s", value_parser = duration)]
    timeout: Duration,
    #[arg(long, global = true)]
    output: Option<PathBuf>,
    #[arg(short = 'L', long = "list")]
    legacy_list: bool,
    #[arg(short = 'l', long = "launch", action = clap::ArgAction::Append)]
    legacy_launch: Vec<String>,
    #[command(subcommand)]
    command: Option<Command>,
}

#[derive(Subcommand, Debug)]
enum Command {
    #[command(flatten)]
    Extra(crate::cli_commands::ExtraCommand),
    Capabilities,
    Schema,
    Instance {
        #[command(subcommand)]
        action: InstanceCommand,
    },
    Launch {
        selector: String,
        #[arg(long, conflicts_with = "detach")]
        wait: bool,
        #[arg(long)]
        detach: bool,
    },
    Process {
        #[command(subcommand)]
        action: ProcessCommand,
    },
    Logs {
        #[command(subcommand)]
        action: LogCommand,
    },
    /// Invoke a registered shared operation with a JSON object from a file or stdin.
    Operation {
        #[command(subcommand)]
        action: OperationCommand,
    },
}
#[derive(Subcommand, Debug)]
enum InstanceCommand {
    List,
    Show {
        selector: String,
    },
    #[command(flatten)]
    Extra(crate::cli_commands::InstanceCommand),
}
#[derive(Subcommand, Debug)]
enum ProcessCommand {
    List,
    Logs {
        run: String,
        #[arg(long)]
        follow: bool,
    },
}
#[derive(Subcommand, Debug)]
enum LogCommand {
    List {
        selector: String,
    },
    Show {
        selector: String,
        name: String,
        #[arg(long)]
        crash: bool,
    },
}
#[derive(Subcommand, Debug)]
enum OperationCommand {
    Run {
        id: String,
        #[arg(long, default_value = "-")]
        input: PathBuf,
    },
}

fn duration(value: &str) -> std::result::Result<Duration, String> {
    let (digits, factor) = if let Some(v) = value.strip_suffix("ms") {
        (v, 1)
    } else if let Some(v) = value.strip_suffix('s') {
        (v, 1000)
    } else if let Some(v) = value.strip_suffix('m') {
        (v, 60_000)
    } else if let Some(v) = value.strip_suffix('h') {
        (v, 3_600_000)
    } else {
        (value, 1000)
    };
    digits
        .parse::<u64>()
        .ok()
        .and_then(|v| v.checked_mul(factor))
        .filter(|v| *v > 0)
        .map(Duration::from_millis)
        .ok_or_else(|| "Use a positive duration such as 30s, 5m or 1h".into())
}

#[derive(Clone)]
pub(super) struct Output {
    json: bool,
    jsonl: bool,
    quiet: bool,
    command: String,
    trace_id: String,
    log_run: Arc<Mutex<Option<String>>>,
}
fn sanitize(value: &mut Value) {
    match value {
        Value::String(text) => *text = crate::diagnose::redact::redact_credentials(text, &[]),
        Value::Array(values) => values.iter_mut().for_each(sanitize),
        Value::Object(values) => {
            for (key, value) in values {
                let normalized = key.to_ascii_lowercase().replace(['_', '-'], "");
                if [
                    "accesstoken",
                    "refreshtoken",
                    "password",
                    "apikey",
                    "cookie",
                    "authorization",
                    "clientsecret",
                ]
                .iter()
                .any(|suffix| normalized.ends_with(suffix))
                {
                    *value = Value::String("[redacted]".into());
                } else {
                    sanitize(value);
                }
            }
        }
        _ => {}
    }
}
impl Output {
    fn envelope(&self, ok: bool) -> Value {
        json!({"schema_version":1,"command":self.command,"ok":ok,"trace_id":self.trace_id,"core_version":env!("CARGO_PKG_VERSION")})
    }
    fn event(&self, event: &str, mut payload: Value) {
        if event == "process:log" {
            let run = self.log_run.lock().unwrap();
            if run.as_deref() != payload["running_id"].as_str() {
                return;
            }
            if !self.json && !self.jsonl && !self.quiet {
                sanitize(&mut payload);
                if let Some(lines) = payload["lines"].as_array() {
                    let mut stdout = io::stdout().lock();
                    for line in lines {
                        let _ = writeln!(stdout, "{}", line.as_str().unwrap_or(""));
                    }
                }
            }
        }
        if !self.jsonl {
            return;
        }
        sanitize(&mut payload);
        let mut envelope = self.envelope(true);
        envelope["type"] = json!("event");
        envelope["event"] = json!(event);
        envelope["payload"] = payload;
        let mut stdout = io::stdout().lock();
        let _ = writeln!(stdout, "{envelope}");
    }
    fn finish(
        &self,
        result: std::result::Result<Value, (i32, String)>,
        file: Option<&PathBuf>,
    ) -> i32 {
        let (code, mut envelope) = match result {
            Ok(mut value) => {
                sanitize(&mut value);
                let failed_launch = self.command == "launch"
                    && (value["state"] == "crashed"
                        || value["exit_code"].as_i64().is_some_and(|code| code != 0));
                let failed_assertion = self.command.starts_with("test ") && (value["status"]=="failed" || value["scenario_state"]=="failed");
                let failed_test = self.command.starts_with("test ") && (value["state"]=="failed" || value["state"]=="timed_out" || value["state"]=="interrupted");
                let code=if failed_assertion {7}else if failed_test {8}else if failed_launch {5}else{0};
                let mut e = self.envelope(code==0);
                if code!=0 {
                    e["error"] = json!({"code":code,"message":if failed_assertion{"Test assertion failed; see the saved timeline"}else if failed_test{"Test did not complete; see its retained evidence"}else{"Minecraft exited unsuccessfully; see result and persisted logs"}});
                }
                e["result"] = value;
                (code, e)
            }
            Err((code, message)) => {
                let mut e = self.envelope(false);
                e["error"] = json!({"code":code,"message":crate::diagnose::redact::redact_credentials(&message,&[])});
                (code, e)
            }
        };
        if self.jsonl {
            envelope["type"] = json!("result");
        }
        let rendered = if self.jsonl {
            envelope.to_string()
        } else {
            serde_json::to_string_pretty(&envelope).unwrap()
        };
        if let Some(file) = file {
            if let Err(error) = std::fs::write(file, &rendered) {
                eprintln!("Could not write result file: {error}");
                return 3;
            }
        }
        if self.json || self.jsonl {
            println!("{rendered}");
        } else if code != 0 {
            eprintln!(
                "{}",
                envelope["error"]["message"]
                    .as_str()
                    .unwrap_or("Command failed")
            );
        } else if !self.quiet {
            println!(
                "{}",
                serde_json::to_string_pretty(&envelope["result"]).unwrap()
            );
        }
        code
    }
}

fn data_root(cli: &Cli) -> Result<PathBuf> {
    if let Some(root) = cli
        .data_dir
        .clone()
        .or_else(|| std::env::var_os("ENDERLOOM_DATA_DIR").map(PathBuf::from))
    {
        if !root.is_absolute() {
            return Err(Error::other("--data-dir must be an absolute path"));
        }
        return Ok(root);
    }
    #[cfg(windows)]
    let base = std::env::var_os("APPDATA").map(PathBuf::from);
    #[cfg(target_os = "macos")]
    let base =
        std::env::var_os("HOME").map(|h| PathBuf::from(h).join("Library/Application Support"));
    #[cfg(all(not(windows), not(target_os = "macos")))]
    let base = std::env::var_os("XDG_CONFIG_HOME")
        .map(PathBuf::from)
        .or_else(|| std::env::var_os("HOME").map(|h| PathBuf::from(h).join(".config")));
    base.map(|b| b.join("Enderloom").join("launcher"))
        .ok_or_else(|| Error::other("Specify --data-dir for this environment"))
}

pub(super) enum Domain {
    Local {
        state: Arc<AppState>,
        _logs: crate::logging::LogState,
        request_scope: String,
    },
    Remote {
        client: tokio::sync::Mutex<crate::control_ipc::Client>,
        output: Output,
        request_scope: String,
    },
}

impl Domain {
    fn request_scope(&self) -> &str {
        match self {
            Self::Local { request_scope, .. } | Self::Remote { request_scope, .. } => request_scope,
        }
    }
}

async fn owned_tasks(domain: &Domain) -> Result<Vec<Value>> {
    let tasks = invoke(domain, "list_tasks", json!({})).await?;
    Ok(tasks
        .as_array()
        .ok_or_else(|| Error::other("Invalid task registry"))?
        .iter()
        .filter(|task| task["request_scope"].as_str() == Some(domain.request_scope()))
        .cloned()
        .collect())
}

async fn finish_owned_tasks(domain: &Domain) -> Result<()> {
    loop {
        let tasks = owned_tasks(domain).await?;
        if !tasks.iter().any(|task| task["state"] == "running") {
            if tasks.iter().any(|task| task["state"] == "cancelled") {
                return Err(Error::Cancelled);
            }
            if let Some(task) = tasks.iter().find(|task| task["state"] == "failed") {
                return Err(Error::other(format!(
                    "Task {} failed: {}",
                    task["id"].as_str().unwrap_or("unknown"),
                    task["error"]
                        .as_str()
                        .unwrap_or("Inspect the task and its preserved logs")
                )));
            }
            return Ok(());
        }
        tokio::time::sleep(Duration::from_millis(100)).await;
    }
}

#[derive(Default)]
struct ExecutionScope {
    domain: Mutex<Option<Arc<Domain>>>,
    owned_run: Mutex<Option<String>>,
}
impl ExecutionScope {
    async fn cancel_owned_work(&self, root: &std::path::Path, output: &Output) -> Result<()> {
        let run = self.owned_run.lock().unwrap().clone();
        let domain = self.domain.lock().unwrap().clone();
        let Some(domain) = domain else { return Ok(()) };
        // Use a separate connection: the interrupted request may still be finishing
        // on its original socket, and its partial response must not be reused.
        let cleanup;
        let domain = if matches!(domain.as_ref(), Domain::Remote { .. }) {
            cleanup = Domain::Remote {
                client: tokio::sync::Mutex::new(
                    crate::control_ipc::Client::connect(root)
                        .await?
                        .ok_or_else(|| Error::other("Service owner disconnected before cleanup"))?,
                ),
                output: output.clone(),
                request_scope: domain.request_scope().to_string(),
            };
            &cleanup
        } else {
            domain.as_ref()
        };
        for task in owned_tasks(domain).await? {
            if task["state"] == "running" {
                invoke(domain, "cancel_task", json!({"taskId":task["id"]})).await?;
            }
        }
        // The native terminal state is the acknowledgement that rollback has
        // completed. Never substitute a cancellation request for completion.
        loop {
            let tasks = owned_tasks(domain).await?;
            if !tasks.iter().any(|task| task["state"] == "running") {
                if !tasks.is_empty() {
                    output.event("task:cleanup", json!({"tasks":tasks,"settled":true}));
                }
                break;
            }
            tokio::time::sleep(Duration::from_millis(100)).await;
        }
        let Some(run) = run else { return Ok(()) };
        invoke(domain, "kill_instance", json!({"runningId":run})).await?;
        loop {
            let rows = invoke(domain, "list_running", json!({})).await?;
            let current = rows
                .as_array()
                .and_then(|rows| rows.iter().find(|row| row["running_id"] == run));
            if !current.is_some_and(|row| row["state"] == "running" || row["state"] == "stopping") {
                output.event(
                    "launch:cleanup",
                    json!({"running_id":run,"stopped":true,"result":current}),
                );
                return Ok(());
            }
            tokio::time::sleep(Duration::from_millis(100)).await;
        }
    }
}

pub(super) async fn invoke(domain: &Domain, command: &str, args: Value) -> Result<Value> {
    match domain {
        Domain::Local {
            state,
            request_scope,
            ..
        } => {
            crate::tasks::request_scoped(Some(request_scope.clone()), async {
                service::dispatch(state, command, &args).await
            })
            .await
        }
        Domain::Remote {
            client,
            output,
            request_scope,
        } => {
            client
                .lock()
                .await
                .request(command, args, request_scope, &|event, payload| {
                    output.event(event, payload)
                })
                .await
        }
    }
}

pub(super) async fn selected(domain: &Domain, selector: &str) -> Result<Value> {
    let rows = invoke(domain, "list_instances", json!({})).await?;
    let instance =
        crate::cli::resolve_instance_from(serde_json::from_value(rows.clone())?, selector)?;
    rows.as_array()
        .and_then(|rows| {
            rows.iter()
                .find(|row| row["id"].as_str() == Some(&instance.id))
        })
        .cloned()
        .ok_or_else(|| Error::other("Instance not found"))
}

async fn execute(cli: &Cli, output: &Output, scope: &ExecutionScope) -> Result<Value> {
    if matches!(cli.command, Some(Command::Capabilities)) {
        return Ok(serde_json::to_value(capabilities::all())?);
    }
    if matches!(cli.command, Some(Command::Schema)) {
        return Ok(
            json!({"result_schema":1,"event_schema":1,"service_protocol":1,"exit_codes":{"success":0,"usage":2,"preflight":3,"compatibility":4,"launch":5,"timeout":6,"assertion":7,"instrumentation":8,"regression":9,"cancelled":10,"partial":11}}),
        );
    }
    let root = data_root(cli)?;
    let request_scope = uuid::Uuid::new_v4().to_string();
    let mut attempts = 0;
    let persistent_test = !cli.plan && (matches!(&cli.command,
        Some(Command::Extra(crate::cli_commands::ExtraCommand::Test { action: crate::cli_commands::TestCommand::Start {..} })))
        || matches!(&cli.command, Some(Command::Operation { action: OperationCommand::Run { id, .. } }) if id == "start_testing_session"));
    let mut daemon_started=false;
    let domain = loop {
        if let Some(client) = crate::control_ipc::Client::connect(&root).await? {
            output.event("service:attached", json!({"owner_pid":client.owner_pid}));
            break Domain::Remote {
                client: tokio::sync::Mutex::new(client),
                output: output.clone(),
                request_scope: request_scope.clone(),
            };
        }
        if persistent_test && !daemon_started {
            let service_path=std::env::current_exe()?.with_file_name(if cfg!(windows){"enderloom-service.exe"}else{"enderloom-service"});
            if !service_path.is_file(){return Err(Error::other("Install enderloom-service beside the CLI to run persistent test sessions"));}
            let mut command=std::process::Command::new(service_path);
            command.arg("--data-dir").arg(&root).arg("--test-daemon").stdin(std::process::Stdio::null()).stdout(std::process::Stdio::null()).stderr(std::process::Stdio::null());
            #[cfg(windows)] {use std::os::windows::process::CommandExt;command.creation_flags(0x08000000);}
            command.spawn()?; daemon_started=true;
        }
        if persistent_test {
            attempts+=1;if attempts>100{return Err(Error::other("The test service did not become ready"));}
            tokio::time::sleep(Duration::from_millis(100)).await;continue;
        }
        match service::bootstrap(root.clone()) {
            Ok(state) => {
                let events = output.clone();
                service::attach_runtime_events(
                    &state,
                    Arc::new(move |event, payload| events.event(event, payload)),
                );
                let logs = crate::logging::init_service(
                    &state.files,
                    if cli.verbose > 0 { "debug" } else { "warn" },
                    !cli.quiet,
                    Arc::new(|_| {}),
                )?;
                state.attach_service_logs(&logs);
                break Domain::Local {
                    state,
                    _logs: logs,
                    request_scope: request_scope.clone(),
                };
            }
            Err(error) if attempts >= 25 => return Err(error),
            Err(_) => {
                attempts += 1;
                tokio::time::sleep(Duration::from_millis(40)).await;
            }
        }
    };
    let domain = Arc::new(domain);
    *scope.domain.lock().unwrap() = Some(domain.clone());
    if cli.legacy_list {
        return invoke(&domain, "list_instances", json!({})).await;
    }
    let legacy;
    let command = if let Some(selector) = cli.legacy_launch.first() {
        legacy = Command::Launch {
            selector: selector.clone(),
            wait: true,
            detach: false,
        };
        &legacy
    } else {
        cli.command.as_ref().ok_or_else(|| Error::other("Choose a command; use --help. The desktop wrapper opens the GUI when no command is supplied."))?
    };
    let result = match command {
        Command::Extra(action) => action.execute(&domain, cli.yes, cli.plan).await,
        Command::Instance {
            action: InstanceCommand::Extra(action),
        } => action.execute(&domain, cli.yes, cli.plan).await,
        Command::Capabilities | Command::Schema => unreachable!(),
        Command::Instance {
            action: InstanceCommand::List,
        } => invoke(&domain, "list_instances", json!({})).await,
        Command::Instance {
            action: InstanceCommand::Show { selector },
        } => selected(&domain, selector).await,
        Command::Process {
            action: ProcessCommand::List,
        } => invoke(&domain, "list_running", json!({})).await,
        Command::Logs {
            action: LogCommand::List { selector },
        } => {
            let instance = selected(&domain, selector).await?;
            invoke(
                &domain,
                "list_instance_logs",
                json!({"instanceId":instance["id"]}),
            )
            .await
        }
        Command::Logs {
            action:
                LogCommand::Show {
                    selector,
                    name,
                    crash,
                },
        } => {
            let instance = selected(&domain, selector).await?;
            invoke(&domain,"search_instance_log",json!({"instanceId":instance["id"],"name":name,"crash":crash,"query":"","limit":20_000})).await
        }
        Command::Launch {
            selector, detach, ..
        } => {
            let instance = selected(&domain, selector).await?;
            let run = invoke(
                &domain,
                "launch_instance",
                json!({"instanceId":instance["id"]}),
            )
            .await?;
            *output.log_run.lock().unwrap() = run.as_str().map(str::to_owned);
            if !*detach {
                *scope.owned_run.lock().unwrap() = run.as_str().map(str::to_owned);
            }
            output.event(
                "launch:started",
                json!({"running_id":run,"instance_id":instance["id"]}),
            );
            if *detach {
                return Ok(json!({"running_id":run,"instance_id":instance["id"],"detached":true}));
            }
            let run_id = run
                .as_str()
                .ok_or_else(|| Error::other("Launcher returned an invalid run ID"))?;
            loop {
                let rows = invoke(&domain, "list_running", json!({})).await?;
                let current = rows.as_array().and_then(|rows| {
                    rows.iter()
                        .find(|row| row["running_id"] == run || row["id"] == run)
                });
                if let Some(current) = current {
                    if current["state"]
                        .as_str()
                        .is_some_and(|s| s != "running" && s != "stopping")
                    {
                        return Ok(current.clone());
                    }
                } else {
                    return Err(Error::other(format!(
                        "Run {run_id} disappeared before its exit was observed"
                    )));
                }
                tokio::time::sleep(Duration::from_millis(200)).await;
            }
        }
        Command::Process {
            action: ProcessCommand::Logs { run, follow },
        } => {
            *output.log_run.lock().unwrap() = Some(run.clone());
            loop {
                let rows = invoke(&domain, "list_running", json!({})).await?;
                let current = rows.as_array().and_then(|rows| {
                    rows.iter().find(|row| {
                        row["running_id"].as_str() == Some(run) || row["id"].as_str() == Some(run)
                    })
                });
                if current.is_none() {
                    return Err(Error::other(
                        "Run not found; use logs list/show for persisted instance logs",
                    ));
                }
                let lines = invoke(&domain, "get_logs", json!({"runningId":run})).await?;
                if !*follow
                    || current.is_some_and(|r| r["state"] != "running" && r["state"] != "stopping")
                {
                    return Ok(lines);
                }
                tokio::time::sleep(Duration::from_millis(200)).await;
            }
        }
        Command::Operation {
            action: OperationCommand::Run { id, input },
        } => {
            let entry = capabilities::find(id)
                .ok_or_else(|| Error::other(format!("Unknown operation {id}; see capabilities")))?;
            if entry.cli_route.is_none() {
                return Err(Error::other("This operation has no reviewed CLI route"));
            }
            if entry.classification == "destructive" && !cli.yes && !cli.plan {
                return Err(Error::other(
                    "This operation requires --yes, or --plan to inspect its supported plan",
                ));
            }
            let args = read_input(input).await?;
            if id == "reset_launcher" {
                let plan = invoke(&domain, "prepare_reset", args.clone()).await?;
                if cli.plan {
                    return Ok(plan);
                }
                if matches!(domain.as_ref(), Domain::Remote { .. }) {
                    return Err(Error::other("The running desktop/service owns this reset target. Its reset plan is available with --plan; close that owner before applying the offline reset."));
                }
                scope.domain.lock().unwrap().take();
                drop(domain);

                return Ok(serde_json::to_value(crate::reset::apply(
                    &root,
                    args["deep"].as_bool().unwrap_or(false),
                )?)?);
            }
            let target = if cli.plan {
                entry.plan_command.as_deref().ok_or_else(|| {
                    Error::other("This operation does not expose a plan; no mutation was performed")
                })?
            } else {
                entry
                    .service_command
                    .as_deref()
                    .ok_or_else(|| Error::other("No service operation is available"))?
            };
            invoke(&domain, target, args).await
        }
    }?;
    finish_owned_tasks(&domain).await?;
    Ok(result)
}

pub(super) async fn read_input(input: &std::path::Path) -> Result<Value> {
    let mut text = String::new();
    if input.as_os_str() == "-" {
        if io::stdin().is_terminal() {
            return Err(Error::other(
                "Pipe a JSON object to stdin, or use --input FILE",
            ));
        }
        tokio::io::stdin().read_to_string(&mut text).await?;
    } else {
        text = tokio::fs::read_to_string(input).await?;
    }
    let args = if text.trim().is_empty() {
        json!({})
    } else {
        serde_json::from_str(&text)?
    };
    if !args.is_object() {
        return Err(Error::other("Input must be a JSON object"));
    }
    Ok(args)
}

fn parse_arguments(arguments: &[String]) -> std::result::Result<Cli, i32> {
    let machine = arguments.iter().any(|a| a == "--json");
    let jsonl = arguments.iter().any(|a| a == "--jsonl");
    let parsed = Cli::try_parse_from(arguments);
    match parsed {
        Ok(cli) => Ok(cli),
        Err(error)
            if matches!(
                error.kind(),
                clap::error::ErrorKind::DisplayHelp | clap::error::ErrorKind::DisplayVersion
            ) =>
        {
            if machine || jsonl {
                return Err(Output {
                    json: machine,
                    jsonl,
                    quiet: false,
                    command: "help".into(),
                    trace_id: uuid::Uuid::new_v4().to_string(),
                    log_run: Arc::default(),
                }
                .finish(Ok(json!({"text":error.to_string()})), None));
            }
            let _ = error.print();
            Err(0)
        }
        Err(error) => Err(Output {
            json: machine,
            jsonl,
            quiet: false,
            command: "parse".into(),
            trace_id: uuid::Uuid::new_v4().to_string(),
            log_run: Arc::default(),
        }
        .finish(Err((2, error.to_string())), None)),
    }
}

/// Help, version and invalid command syntax do not need a runtime or worker pool.
pub fn early_exit(arguments: &[String]) -> Option<i32> {
    parse_arguments(arguments).err()
}

pub async fn run(arguments: Vec<String>) -> i32 {
    let cli = match parse_arguments(&arguments) {
        Ok(cli) => cli,
        Err(code) => return code,
    };
    let command = match &cli.command {
        Some(Command::Extra(action)) => action.route(),
        Some(Command::Instance {
            action: InstanceCommand::Extra(action),
        }) => action.route(),
        Some(Command::Capabilities) => "capabilities",
        Some(Command::Schema) => "schema",
        Some(Command::Instance {
            action: InstanceCommand::List,
        }) => "instance list",
        Some(Command::Instance { .. }) => "instance show",
        Some(Command::Launch { .. }) => "launch",
        Some(Command::Process {
            action: ProcessCommand::List,
        }) => "process list",
        Some(Command::Process { .. }) => "process logs",
        Some(Command::Logs {
            action: LogCommand::List { .. },
        }) => "logs list",
        Some(Command::Logs { .. }) => "logs show",
        Some(Command::Operation { .. }) => "operation run",
        None if cli.legacy_list => "instance list",
        None => "launch",
    };
    let mut output = Output {
        json: cli.json,
        jsonl: cli.jsonl,
        quiet: cli.quiet,
        command: command.into(),
        trace_id: cli
            .trace_id
            .clone()
            .unwrap_or_else(|| uuid::Uuid::new_v4().to_string()),
        log_run: Arc::default(),
    };
    if let Some(Command::Process {
        action: ProcessCommand::Logs { run, .. },
    }) = &cli.command
    {
        *output.log_run.lock().unwrap() = Some(run.clone());
    }
    if (cli.legacy_launch.len() > 1 && !cli.legacy_list)
        || (cli.command.is_some() && (cli.legacy_list || !cli.legacy_launch.is_empty()))
    {
        return output.finish(
            Err((
                2,
                "Use one subcommand or the legacy flags, and only one launch selector".into(),
            )),
            cli.output.as_ref(),
        );
    }
    if cli.command.is_none() && !cli.legacy_list && cli.legacy_launch.is_empty() {
        return output.finish(Err((2,"Choose a command; use --help. Run enderloom.cmd without arguments to open the desktop app.".into())),cli.output.as_ref());
    }
    if cli.plan
        && !matches!(
            cli.command,
            Some(Command::Operation { .. })
                | Some(Command::Extra(_))
                | Some(Command::Instance {
                    action: InstanceCommand::Extra(_)
                })
        )
    {
        return output.finish(
            Err((
                2,
                "--plan is supported by registered operation routes with plan metadata".into(),
            )),
            cli.output.as_ref(),
        );
    }
    let result = {
        let scope = ExecutionScope::default();
        let work = execute(&cli, &output, &scope);
        tokio::pin!(work);
        let mut interrupted = false;
        let mut result = tokio::select! {
            biased;
            result = &mut work => result.map_err(|error| (if matches!(error, Error::Cancelled) {10} else {3}, error.to_string())),
            _ = tokio::time::sleep(cli.timeout) => {
                interrupted = true;
                Err((6, "Command timed out; persisted evidence is retained".into()))
            },
            signal = tokio::signal::ctrl_c() => {
                interrupted = true;
                Err((10, if let Err(error) = signal {format!("Cancellation signal failed: {error}")} else {"Command cancelled; persisted evidence is retained".into()}))
            }
        };
        if interrupted {
            if let Ok(root) = data_root(&cli) {
                let cleanup = tokio::time::timeout(Duration::from_secs(10), async {
                    let cleanup = scope.cancel_owned_work(&root, &output);
                    tokio::pin!(cleanup);
                    // Keep the domain future alive while its cancellation token
                    // is acknowledged, so native rollback/finalization can run.
                    tokio::select! {
                        result=&mut cleanup=>result,
                        _=&mut work=>cleanup.await,
                    }
                })
                .await;
                let failure = match cleanup {
                    Ok(Ok(())) => None,
                    Ok(Err(error)) => Some(error.to_string()),
                    Err(_) => Some("owned work did not settle within 10 seconds".into()),
                };
                if let (Some(failure), Err((_, message))) = (failure, &mut result) {
                    message.push_str(&format!(
                        ". Cleanup needs attention: {failure}; inspect task list and process list"
                    ));
                }
            }
        }
        result
    };
    if cli.legacy_list && !cli.json && !cli.jsonl && !cli.quiet {
        if let Ok(value) = &result {
            if let Ok(instances) =
                serde_json::from_value::<Vec<crate::config::Instance>>(value.clone())
            {
                print!("{}", crate::cli::instance_list_text(&instances));
                output.quiet = true;
            }
        }
    }
    output.finish(result, cli.output.as_ref())
}
