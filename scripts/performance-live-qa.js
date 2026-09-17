"use strict";
// Explicit live-account test. Creates its own vanilla source and only removes generated instances.
const assert = require("assert/strict"),
  fs = require("fs"),
  path = require("path"),
  crypto = require("crypto");
const { LauncherService } = require("../src/launcher-service");
if (!process.argv.includes("--live-account"))
  throw Error("Pass --live-account to use the signed-in Minecraft account");
const root = path.resolve(__dirname, ".."),
  data =
    process.env.ENDERLOOM_DATA_DIR ||
    path.join(process.env.APPDATA, "Enderloom", "launcher");
process.env.ENDERLOOM_SERVICE_PATH = path.join(
  root,
  "native/target/debug/enderloom-service.exe",
);
const service = new LauncherService({
  rootDir: root,
  dataDir: data,
  resourcesDir: root,
});
let source;
(async () => {
  const before = await service.request("list_instances"),
    settings = await service.request("get_settings");
  assert(
    (await service.request("list_accounts")).some((a) => a.active),
    "Sign in to Minecraft first",
  );
  source = await service.request("create_instance", {
    name: `Performance live acceptance ${Date.now()}`,
    versionId: "1.20.1",
    loader: null,
    loaderVersion: null,
  });
  await service.request("update_instance", {
    instanceId: source.id,
    name: source.name,
    versionId: "1.20.1",
    minMemoryMb: 512,
    maxMemoryMb: 2048,
    loader: null,
    loaderVersion: null,
    javaPath: null,
    jvmArgs: null,
    jvmArgsMode: null,
    envVars: null,
    envVarsMode: null,
  });
  await service.request(
    "install_instance",
    { instanceId: source.id },
    { timeoutMs: 600000 },
  );
  fs.mkdirSync(path.join(source.dir, "config"), { recursive: true });
  fs.writeFileSync(
    path.join(source.dir, "config/source-sentinel.json"),
    '{"preserve":true}',
  );
  const sentinel = fs.readFileSync(
    path.join(source.dir, "config/source-sentinel.json"),
  );
  const reports = path.join(root, "output/playwright/performance-live");
  fs.mkdirSync(reports, { recursive: true });
  console.log(
    "Running a real 30-second Minecraft startup capture in a separate copied instance.",
  );
  const capture = await service.request(
    "start_performance_capture",
    { instanceId: source.id, seconds: 30 },
    { timeoutMs: 240000 },
  );
  fs.writeFileSync(
    path.join(reports, "capture.json"),
    JSON.stringify(capture, null, 2),
  );
  assert.equal(capture.state, "completed", capture.error);
  assert.equal(capture.cleaned_up, true, capture.cleanup_error);
  assert.equal(capture.has_log, true, "Test log must survive sandbox cleanup");
  const retainedLog = await service.request("get_capture_log", { captureId: capture.id });
  assert(retainedLog.includes("OpenAL") || retainedLog.includes("Reloading ResourceManager"), "Captured Minecraft log must contain real runtime evidence");
  assert(
    capture.milestones.texture_atlas_created,
    "No measured texture-atlas milestone",
  );
  assert(
    capture.jfr && capture.jfr.cpu_samples > 0,
    capture.jfr_error || "No actual JFR CPU data",
  );
  assert(capture.jfr.max_observed_heap_bytes > 0, "No actual JFR heap data");
  assert(fs.existsSync(capture.recording_path), "Recording was not retained");
  assert.equal(
    crypto
      .createHash("sha256")
      .update(fs.readFileSync(capture.recording_path))
      .digest("hex"),
    capture.recording_sha256,
  );
  assert(
    sentinel.equals(
      fs.readFileSync(path.join(source.dir, "config/source-sentinel.json")),
    ),
    "Live config changed",
  );
  assert(
    !fs.existsSync(path.join(path.dirname(source.dir), capture.sandbox_id)),
    "Sandbox remains",
  );
  console.log(
    "Actual startup and JFR capture passed. Exercising cancellation of a second owned sandbox.",
  );
  const pending = service.request(
    "start_performance_capture",
    { instanceId: source.id, seconds: 60 },
    { timeoutMs: 240000 },
  );
  let task;
  for (let i = 0; i < 200; i++) {
    const tasks = await service.request("list_tasks");
    task = tasks.find(
      (t) =>
        t.kind === "performance_test" &&
        t.state === "running" &&
        t.instance_id === source.id,
    );
    if (task && task.stage.includes("Recording")) break;
    await new Promise((r) => setTimeout(r, 100));
  }
  assert(task, "No cancellable task");
  await service.request("cancel_task", { taskId: task.id });
  const cancelled = await pending;
  assert.equal(cancelled.state, "cancelled", cancelled.error);
  assert(cancelled.cleaned_up);
  fs.writeFileSync(
    path.join(reports, "cancelled.json"),
    JSON.stringify(cancelled, null, 2),
  );
  assert(
    sentinel.equals(
      fs.readFileSync(path.join(source.dir, "config/source-sentinel.json")),
    ),
  );
  await service.request("delete_instance", { instanceId: source.id });
  source = null;
  assert.deepEqual(
    await service.request("list_instances"),
    before,
    "Existing profiles changed",
  );
  assert.deepEqual(
    await service.request("get_settings"),
    settings,
    "Global settings changed",
  );
  console.log(
    "PASS real Minecraft launch, timestamped milestones, real JFR CPU/heap/GC, retained recording, cancellation, sandbox cleanup and unchanged existing profiles/settings.",
  );
})()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (source)
      await service
        .request("delete_instance", { instanceId: source.id })
        .catch(() => {});
    await service.close();
  });
