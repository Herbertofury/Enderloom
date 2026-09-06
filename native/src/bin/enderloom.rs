fn main() {
    let arguments: Vec<String> = std::env::args().collect();
    if let Some(supervision) = basalt_launcher_lib::supervisor_args(&arguments) {
        basalt_launcher_lib::supervise(supervision)
    }
    // The existing domain dispatcher has a large debug-build future. Windows'
    // 1 MiB executable entry stack is smaller than the service worker stack.
    let worker = std::thread::Builder::new()
        .name("enderloom-cli".into())
        .stack_size(8 * 1024 * 1024)
        .spawn(move || {
            let runtime = tokio::runtime::Builder::new_multi_thread()
                .enable_all()
                .thread_stack_size(8 * 1024 * 1024)
                .build()
                .expect("CLI runtime");
            let code = runtime.block_on(basalt_launcher_lib::cli_headless::run(arguments));
            // A cancelled redirected stdin read must not keep the console alive.
            runtime.shutdown_background();
            code
        });
    let code = worker
        .ok()
        .and_then(|worker| worker.join().ok())
        .unwrap_or(3);
    std::process::exit(code);
}
