#[tokio::main]
async fn main() {
    let arguments: Vec<String> = std::env::args().collect();
    if let Some(supervision) = basalt_launcher_lib::supervisor_args(&arguments) {
        basalt_launcher_lib::supervise(supervision)
    }
    if arguments.iter().any(|argument| argument == "--apply-reset") {
        let root = arguments
            .iter()
            .position(|argument| argument == "--data-dir")
            .and_then(|index| arguments.get(index + 1))
            .map(std::path::PathBuf::from);
        let Some(root) = root else {
            eprintln!("ENDERLOOM_RESET_FATAL --data-dir is required");
            std::process::exit(2);
        };
        match basalt_launcher_lib::reset::apply(
            &root,
            arguments.iter().any(|argument| argument == "--deep"),
        ) {
            Ok(report) => {
                println!("{}", serde_json::to_string(&report).unwrap_or_default());
                return;
            }
            Err(error) => {
                eprintln!("ENDERLOOM_RESET_FATAL {error}");
                std::process::exit(1);
            }
        }
    }

    if let Err(error) = basalt_launcher_lib::service::run().await {
        eprintln!("ENDERLOOM_SERVICE_FATAL {error}");
        std::process::exit(1);
    }
}
