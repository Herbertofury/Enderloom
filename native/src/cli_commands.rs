//! Typed command adapters. Validation and mutations remain in shared operations.
use crate::{
    cli_headless::{invoke, read_input, selected, Domain},
    error::{Error, Result},
};
use clap::Subcommand;
use serde_json::{json, Value};
use std::path::PathBuf;

#[derive(Subcommand, Debug)]
pub(super) enum ExtraCommand {
    /// Minecraft test sessions, evidence and automation (no launcher window required).
    Test {
        #[command(subcommand)]
        action: TestCommand,
    },
    App {
        #[command(subcommand)]
        action: AppCommand,
    },
    Settings {
        #[command(subcommand)]
        action: SettingsCommand,
    },
    Java {
        #[command(subcommand)]
        action: JavaCommand,
    },
    Auth {
        #[command(subcommand)]
        action: AuthCommand,
    },
    Task {
        #[command(subcommand)]
        action: TaskCommand,
    },
    Version {
        #[command(subcommand)]
        action: VersionCommand,
    },
    Loader {
        #[command(subcommand)]
        action: LoaderCommand,
    },
}
#[derive(Subcommand, Debug)]
pub(super) enum TestCommand {
    Start { selector: String, #[arg(long)] record_video: bool, #[arg(long, default_value="900")] max_seconds: u64, #[arg(long)] world: Option<String> },
    /// Execute a bounded JSON scenario in an existing test; failed assertions stop the scenario.
    Run { id: String, #[arg(long)] input: PathBuf },
    Analyze { id: String },
    List,
    Report { id: String },
    Command { id: String, command: String, #[arg(long)] expect: Option<String>, #[arg(long,default_value="10")] timeout_seconds: u64 },
    Screenshot { id: String, label: String },
    Finish { id: String },
    Artifact { id: String, name: String },
}
#[derive(Subcommand, Debug)]
pub(super) enum AppCommand {
    Info,
    Paths,
    /// Collect actual host, Java and launcher observations for troubleshooting.
    Doctor,
    Network {
        #[command(subcommand)]
        action: NetworkCommand,
    },
}
#[derive(Subcommand, Debug)]
pub(super) enum NetworkCommand {
    Test { url: Option<String> },
}
#[derive(Subcommand, Debug)]
pub(super) enum SettingsCommand {
    Get {
        key: Option<String>,
    },
    /// Merge a JSON settings object. Use a file or stdin to keep secrets out of argv.
    Set {
        #[arg(long, default_value = "-")]
        input: PathBuf,
    },
}
#[derive(Subcommand, Debug)]
pub(super) enum JavaCommand {
    List,
    Install {
        major: u32,
        #[arg(long)]
        instance: Option<String>,
    },
    Status {
        selector: String,
    },
}
#[derive(Subcommand, Debug)]
pub(super) enum AuthCommand {
    List,
    Use { account: String },
    Remove { account: String },
}
#[derive(Subcommand, Debug)]
pub(super) enum TaskCommand {
    List,
    Show { id: String },
    Cancel { id: String },
    Resume { id: String },
    ClearFinished,
}
#[derive(Subcommand, Debug)]
pub(super) enum VersionCommand {
    List {
        #[arg(long, conflicts_with = "installed")]
        snapshots: bool,
        #[arg(long)]
        installed: bool,
    },
}
#[derive(Subcommand, Debug)]
pub(super) enum LoaderCommand {
    Versions { loader: String, mc_version: String },
}

#[derive(Subcommand, Debug)]
pub(super) enum InstanceCommand {
    Install {
        selector: String,
    },
    Duplicate {
        selector: String,
    },
    Repair {
        selector: String,
    },
    Create {
        name: String,
        #[arg(long)]
        version: String,
        #[arg(long, requires = "loader_version")]
        loader: Option<String>,
        #[arg(long, requires = "loader")]
        loader_version: Option<String>,
    },
    /// Merge an instance settings JSON object, preserving omitted settings.
    Edit {
        selector: String,
        #[arg(long, default_value = "-")]
        input: PathBuf,
    },
    Delete {
        selector: String,
    },
    Note {
        selector: String,
        text: String,
    },
    Favorite {
        selector: String,
        #[arg(long)]
        remove: bool,
    },
    Group {
        #[command(subcommand)]
        action: GroupCommand,
    },
    Tag {
        #[command(subcommand)]
        action: TagCommand,
    },
}
#[derive(Subcommand, Debug)]
pub(super) enum GroupCommand {
    List,
    Create {
        name: String,
    },
    Rename {
        id: String,
        name: String,
    },
    Delete {
        id: String,
    },
    Assign {
        selector: String,
        id: String,
    },
    Unassign {
        selector: String,
    },
    Reorder {
        #[arg(required = true)]
        ids: Vec<String>,
    },
    OrderInstances {
        #[arg(long)]
        group: Option<String>,
        #[arg(required = true)]
        instances: Vec<String>,
    },
}
#[derive(Subcommand, Debug)]
pub(super) enum TagCommand {
    List,
    Create {
        name: String,
    },
    Rename {
        id: String,
        name: String,
    },
    Delete {
        id: String,
    },
    Assign {
        selector: String,
        id: String,
    },
    Unassign {
        selector: String,
        id: String,
    },
    Reorder {
        #[arg(required = true)]
        ids: Vec<String>,
    },
}

fn confirmed(yes: bool) -> Result<()> {
    if !yes {
        return Err(Error::other(
            "This operation requires --yes; no mutation was performed",
        ));
    }
    Ok(())
}
fn merge_known(target: &mut Value, patch: &Value, path: &str) -> Result<()> {
    let values = patch
        .as_object()
        .ok_or_else(|| Error::other("Input must be a JSON object"))?;
    let object = target
        .as_object_mut()
        .ok_or_else(|| Error::other("Settings are not an object"))?;
    for (key, value) in values {
        let next = object.get_mut(key).ok_or_else(|| {
            Error::other(format!(
                "Unknown setting {path}{key}; use the get/show command to inspect current settings"
            ))
        })?;
        if value.is_object() && next.is_object() {
            merge_known(next, value, &format!("{path}{key}."))?;
        } else {
            *next = value.clone();
        }
    }
    Ok(())
}

impl ExtraCommand {
    pub fn route(&self) -> &'static str {
        match self {
            Self::Test { action } => match action {
                TestCommand::Run {..} => "test run", TestCommand::Analyze {..} => "test analyze",
                TestCommand::Start {..} => "test start", TestCommand::List => "test list", TestCommand::Report {..} => "test report",
                TestCommand::Command {..} => "test command", TestCommand::Screenshot {..} => "test screenshot", TestCommand::Finish {..} => "test finish", TestCommand::Artifact {..} => "test artifact",
            },
            Self::App {
                action: AppCommand::Info,
            } => "app info",
            Self::App {
                action: AppCommand::Paths,
            } => "app paths",
            Self::App {
                action: AppCommand::Doctor,
            } => "app doctor",
            Self::App { .. } => "app network test",
            Self::Settings {
                action: SettingsCommand::Get { .. },
            } => "settings get",
            Self::Settings { .. } => "settings set",
            Self::Java {
                action: JavaCommand::List,
            } => "java list",
            Self::Java {
                action: JavaCommand::Install { .. },
            } => "java install",
            Self::Java { .. } => "java status",
            Self::Auth {
                action: AuthCommand::List,
            } => "auth list",
            Self::Auth {
                action: AuthCommand::Use { .. },
            } => "auth use",
            Self::Auth { .. } => "auth remove",
            Self::Task {
                action: TaskCommand::List,
            } => "task list",
            Self::Task {
                action: TaskCommand::Show { .. },
            } => "task show",
            Self::Task {
                action: TaskCommand::Cancel { .. },
            } => "task cancel",
            Self::Task { action: TaskCommand::Resume { .. } } => "task resume",
            Self::Task { .. } => "task clear-finished",
            Self::Version { .. } => "version list",
            Self::Loader { .. } => "loader versions",
        }
    }
    pub async fn execute(&self, domain: &Domain, yes: bool, plan: bool) -> Result<Value> {
        if plan
            && !matches!(
                self,
                Self::Settings {
                    action: SettingsCommand::Set { .. }
                }
            )
        {
            return Err(Error::other(
                "This route does not expose a plan; no mutation was performed",
            ));
        }
        let (command, args) = match self {
            Self::Test { action } => match action {
                TestCommand::Start { selector,record_video,max_seconds,world } => ("start_testing_session",json!({"instanceId":selected(domain,selector).await?["id"],"recordVideo":record_video,"maxSeconds":max_seconds,"worldName":world})),
                TestCommand::Run { id,input } => ("run_testing_scenario",json!({"testId":id,"scenario":read_input(input).await?})),
                TestCommand::Analyze { id } => ("analyze_testing_report",json!({"testId":id})),
                TestCommand::List => ("get_testing_reports",json!({})),
                TestCommand::Report { id } => ("get_testing_report",json!({"testId":id})),
                TestCommand::Command { id,command,expect,timeout_seconds } => ("testing_command",json!({"testId":id,"command":command,"expect":expect,"timeoutSeconds":timeout_seconds})),
                TestCommand::Screenshot { id,label } => ("testing_screenshot",json!({"testId":id,"label":label})),
                TestCommand::Finish { id } => ("finish_testing_session",json!({"testId":id})),
                TestCommand::Artifact { id,name } => ("get_testing_artifact",json!({"testId":id,"name":name})),
            },
            Self::App {
                action: AppCommand::Info,
            } => ("get_app_info", json!({})),
            Self::App {
                action: AppCommand::Paths,
            } => ("get_data_locations", json!({})),
            Self::App {
                action: AppCommand::Doctor,
            } => {
                return Ok(json!({
                    "app":invoke(domain,"get_app_info",json!({})).await?,
                    "system":invoke(domain,"get_system_stats",json!({})).await?,
                    "java":invoke(domain,"list_javas",json!({})).await?,
                    "interrupted_operations":invoke(domain,"recover_interrupted",json!({})).await?
                }))
            }
            Self::App {
                action:
                    AppCommand::Network {
                        action: NetworkCommand::Test { url },
                    },
            } => ("test_network", json!({"url":url})),
            Self::Settings {
                action: SettingsCommand::Get { key },
            } => {
                let value = invoke(domain, "get_settings", json!({})).await?;
                return match key {
                    None => Ok(value),
                    Some(key) => value
                        .get(key)
                        .cloned()
                        .ok_or_else(|| Error::other(format!("Unknown setting {key}"))),
                };
            }
            Self::Settings {
                action: SettingsCommand::Set { input },
            } => {
                let patch = read_input(input).await?;
                let before = invoke(domain, "get_settings", json!({})).await?;
                let mut after = before.clone();
                merge_known(&mut after, &patch, "")?;
                // Validate the same typed settings and memory constraints before
                // reporting a plan. The service validates again before saving.
                serde_json::from_value::<crate::config::LauncherSettings>(after.clone())?
                    .memory_limits()?;
                if plan {
                    return Ok(
                        json!({"operation":"update_settings","before":before,"after":after,"applied":false}),
                    );
                }
                invoke(domain, "update_settings", json!({"settings":after})).await?;
                return invoke(domain, "get_settings", json!({})).await;
            }
            Self::Java {
                action: JavaCommand::List,
            } => ("list_javas", json!({})),
            Self::Java {
                action: JavaCommand::Install { major, instance },
            } => {
                let instance_id = if let Some(selector) = instance {
                    selected(domain, selector).await?["id"].clone()
                } else {
                    Value::Null
                };
                (
                    "install_java_runtime",
                    json!({"major":major,"instanceId":instance_id}),
                )
            }
            Self::Java {
                action: JavaCommand::Status { selector },
            } => (
                "get_java_status",
                json!({"instanceId":selected(domain,selector).await?["id"]}),
            ),
            Self::Auth {
                action: AuthCommand::List,
            } => ("list_accounts", json!({})),
            Self::Auth {
                action: AuthCommand::Use { account },
            }
            | Self::Auth {
                action: AuthCommand::Remove { account },
            } => {
                let remove = matches!(
                    self,
                    Self::Auth {
                        action: AuthCommand::Remove { .. }
                    }
                );
                if remove {
                    confirmed(yes)?;
                }
                let accounts = invoke(domain, "list_accounts", json!({})).await?;
                let rows = accounts
                    .as_array()
                    .ok_or_else(|| Error::other("Invalid account list"))?;
                let exact = rows.iter().find(|a| a["id"].as_str() == Some(account));
                let id = if let Some(exact) = exact {
                    exact["id"].clone()
                } else {
                    let matches: Vec<_> = rows
                        .iter()
                        .filter(|a| {
                            a["name"]
                                .as_str()
                                .is_some_and(|n| n.eq_ignore_ascii_case(account))
                        })
                        .collect();
                    if matches.len() != 1 {
                        return Err(Error::other(
                            "Account is missing or ambiguous; use an exact ID from auth list",
                        ));
                    }
                    matches[0]["id"].clone()
                };
                (
                    if remove {
                        "remove_account"
                    } else {
                        "set_active_account"
                    },
                    json!({"accountId":id}),
                )
            }
            Self::Task {
                action: TaskCommand::List,
            } => ("list_tasks", json!({})),
            Self::Task {
                action: TaskCommand::Show { id },
            } => {
                return Ok(invoke(domain, "get_task_detail", json!({"taskId":id})).await?["task"].clone());
            }
            Self::Task {
                action: TaskCommand::Cancel { id },
            } => {
                let result = invoke(domain, "cancel_task", json!({"taskId":id})).await?;
                if result != true {
                    return Err(Error::other("Task is not cancellable or no longer exists"));
                }
                return Ok(json!({"task_id":id,"cancellation_requested":true}));
            }
            Self::Task {
                action: TaskCommand::ClearFinished,
            } => {
                confirmed(yes)?;
                ("clear_finished_tasks", json!({}))
            }
            Self::Task { action: TaskCommand::Resume { id } } => ("resume_task",json!({"taskId":id})),
            Self::Version {
                action:
                    VersionCommand::List {
                        snapshots,
                        installed,
                    },
            } => (
                if *installed {
                    "list_installed_versions"
                } else {
                    "list_versions"
                },
                json!({"includeSnapshots":snapshots}),
            ),
            Self::Loader {
                action: LoaderCommand::Versions { loader, mc_version },
            } => (
                "list_loader_versions",
                json!({"loader":loader,"gameVersion":mc_version}),
            ),
        };
        invoke(domain, command, args).await
    }
}

impl InstanceCommand {
    pub fn route(&self) -> &'static str {
        match self {
            Self::Install { .. } => "instance install",
            Self::Duplicate { .. } => "instance duplicate",
            Self::Repair { .. } => "instance repair",
            Self::Create { .. } => "instance create",
            Self::Edit { .. } => "instance edit",
            Self::Delete { .. } => "instance delete",
            Self::Note { .. } => "instance note",
            Self::Favorite { .. } => "instance favorite",
            Self::Group { action } => action.route(),
            Self::Tag { action } => action.route(),
        }
    }
    pub async fn execute(&self, domain: &Domain, yes: bool, plan: bool) -> Result<Value> {
        if plan {
            return Err(Error::other(
                "This instance route does not expose a plan; no mutation was performed",
            ));
        }
        let (command, args) = match self {
            Self::Install { selector }
            | Self::Duplicate { selector }
            | Self::Repair { selector } => {
                let command = match self {
                    Self::Install { .. } => "install_instance",
                    Self::Duplicate { .. } => "duplicate_instance",
                    _ => "repair_instance",
                };
                (
                    command,
                    json!({"instanceId":selected(domain,selector).await?["id"]}),
                )
            }
            Self::Create {
                name,
                version,
                loader,
                loader_version,
            } => (
                "create_instance",
                json!({"name":name,"versionId":version,"loader":loader,"loaderVersion":loader_version}),
            ),
            Self::Edit { selector, input } => {
                let instance = selected(domain, selector).await?;
                let patch = read_input(input).await?;
                let mut settings = json!({});
                let fields = [
                    ("name", "name"),
                    ("versionId", "version_id"),
                    ("minMemoryMb", "min_memory_mb"),
                    ("maxMemoryMb", "max_memory_mb"),
                    ("javaPath", "java_path"),
                    ("loader", "loader"),
                    ("loaderVersion", "loader_version"),
                    ("jvmArgs", "jvm_args"),
                    ("jvmArgsMode", "jvm_args_mode"),
                    ("envVars", "env_vars"),
                    ("envVarsMode", "env_vars_mode"),
                ];
                for (cli, field) in fields {
                    settings[cli] = instance[field].clone();
                }
                merge_known(&mut settings, &patch, "")?;
                let mut typed = instance.clone();
                for (cli, field) in fields {
                    typed[field] = settings[cli].clone();
                }
                // Optional service strings must not silently turn a wrong JSON
                // type into null and clear an existing instance override.
                serde_json::from_value::<crate::config::Instance>(typed)?;
                settings["instanceId"] = instance["id"].clone();
                ("update_instance", settings)
            }
            Self::Delete { selector } => {
                confirmed(yes)?;
                (
                    "delete_instance",
                    json!({"instanceId":selected(domain,selector).await?["id"]}),
                )
            }
            Self::Note { selector, text } => (
                "set_instance_notes",
                json!({"instanceId":selected(domain,selector).await?["id"],"notes":text}),
            ),
            Self::Favorite { selector, remove } => (
                "set_instance_favorite",
                json!({"instanceId":selected(domain,selector).await?["id"],"favorite":!remove}),
            ),
            Self::Group { action } => return action.execute(domain, yes).await,
            Self::Tag { action } => return action.execute(domain, yes).await,
        };
        invoke(domain, command, args).await
    }
}
impl GroupCommand {
    fn route(&self) -> &'static str {
        match self {
            Self::List => "instance group list",
            Self::Create { .. } => "instance group create",
            Self::Rename { .. } => "instance group rename",
            Self::Delete { .. } => "instance group delete",
            Self::Assign { .. } => "instance group assign",
            Self::Unassign { .. } => "instance group unassign",
            Self::Reorder { .. } => "instance group reorder",
            Self::OrderInstances { .. } => "instance group order-instances",
        }
    }
    async fn execute(&self, domain: &Domain, yes: bool) -> Result<Value> {
        let (command, args) = match self {
            Self::List => {
                return Ok(
                    invoke(domain, "get_instance_organization", json!({})).await?["groups"].clone(),
                )
            }
            Self::Create { name } => ("create_instance_group", json!({"name":name})),
            Self::Rename { id, name } => {
                ("rename_instance_group", json!({"groupId":id,"name":name}))
            }
            Self::Delete { id } => {
                confirmed(yes)?;
                ("delete_instance_group", json!({"groupId":id}))
            }
            Self::Assign { selector, id } => (
                "move_instance_to_group",
                json!({"instanceId":selected(domain,selector).await?["id"],"groupId":id}),
            ),
            Self::Unassign { selector } => (
                "move_instance_to_group",
                json!({"instanceId":selected(domain,selector).await?["id"],"groupId":null}),
            ),
            Self::Reorder { ids } => ("reorder_instance_groups", json!({"groupIds":ids})),
            Self::OrderInstances { group, instances } => {
                let mut ids = Vec::new();
                for selector in instances {
                    ids.push(selected(domain, selector).await?["id"].clone());
                }
                (
                    "reorder_group_instances",
                    json!({"groupId":group,"instanceIds":ids}),
                )
            }
        };
        invoke(domain, command, args).await
    }
}
impl TagCommand {
    fn route(&self) -> &'static str {
        match self {
            Self::List => "instance tag list",
            Self::Create { .. } => "instance tag create",
            Self::Rename { .. } => "instance tag rename",
            Self::Delete { .. } => "instance tag delete",
            Self::Assign { .. } => "instance tag assign",
            Self::Unassign { .. } => "instance tag unassign",
            Self::Reorder { .. } => "instance tag reorder",
        }
    }
    async fn execute(&self, domain: &Domain, yes: bool) -> Result<Value> {
        let (command, args) = match self {
            Self::List => {
                return Ok(
                    invoke(domain, "get_instance_organization", json!({})).await?["tags"].clone(),
                )
            }
            Self::Create { name } => ("create_instance_tag", json!({"name":name})),
            Self::Rename { id, name } => ("rename_instance_tag", json!({"tagId":id,"name":name})),
            Self::Delete { id } => {
                confirmed(yes)?;
                ("delete_instance_tag", json!({"tagId":id}))
            }
            Self::Assign { selector, id } | Self::Unassign { selector, id } => (
                "set_instance_tag",
                json!({"instanceId":selected(domain,selector).await?["id"],"tagId":id,"enabled":matches!(self,Self::Assign{..})}),
            ),
            Self::Reorder { ids } => ("reorder_instance_tags", json!({"tagIds":ids})),
        };
        invoke(domain, command, args).await
    }
}
