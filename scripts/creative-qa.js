"use strict";
const assert = require("assert/strict"),
  fs = require("fs"),
  os = require("os"),
  path = require("path"),
  crypto = require("crypto");
const { LauncherService } = require("../src/launcher-service");
const { seed, zip, write } = require("./workbench-fixtures");
const { seedCreative } = require("./creative-fixtures");
const root = path.resolve(__dirname, ".."),
  temporary = fs.mkdtempSync(path.join(os.tmpdir(), "enderloom-creative-qa-"));
process.env.ENDERLOOM_SERVICE_PATH = path.join(
  root,
  "native/target/debug/enderloom-service.exe",
);
let service = new LauncherService({
  rootDir: root,
  dataDir: path.join(temporary, "data"),
  resourcesDir: root,
});
let count = 0;
function ok(condition, message) {
  assert(condition, message);
  count++;
}
(async () => {
  const fixtures = await seed(service, temporary);
  await seedCreative(service, fixtures);
  const call = (command, args = {}) =>
    service.request(command, args, { timeoutMs: 120000 });
  const scan = await call("scan_mod_insights", {
    instanceId: fixtures.instance.id,
    history: true,
  });
  const local = scan.files.find(f => f.file_name === "regular-mod.jar");
  ok(local.source.mod_id === "regular" && local.title === "Regular Mod", "Local JAR metadata available before provider indexing");
  ok(local.source.icon_url.startsWith("data:image/png;base64,"), "Bundled mod icon available offline");
  const inventory = await call("list_instance_content", { instanceId: fixtures.instance.id, kind: "mods", reconcile: false });
  ok(inventory.find(f => f.file_name === "regular-mod.jar").source.mod_id === "regular", "Config ownership uses local installed mod IDs without provider lookup");
  const generated = scan.files.find(
    (f) => f.file_name === "verdant-machinery.jar",
  );
  ok(
    generated.inspection.status === "likely",
    "Corroborated default package and procedure signal",
  );
  ok(
    generated.inspection.evidence.length === 3,
    "Evidence is available for each detection signal",
  );
  ok(
    scan.files.find((f) => f.file_name === "old-workshop.jar").inspection
      .status === "declared",
    "Explicit legacy declaration detected in disabled JAR",
  );
  ok(
    scan.files.find((f) => f.file_name === "regular-mod.jar").inspection
      .status === "unknown",
    "A description mentioning MCreator is not a generator claim",
  );
  ok(
    scan.files
      .find((f) => f.file_name === "damaged.jar")
      .error.includes("Unreadable JAR"),
    "Corrupted archives surface actionable errors",
  );
  ok(
    scan.config_hashes["config/visuals.json"],
    "Config contents fingerprinted",
  );
  ok(!("fps" in generated.inspection), "No invented performance metric");
  ok(scan.duration_ms > 0, "Scan duration is measured");
  await call("set_generator_override", {
    sha256: generated.inspection.sha256,
    choice: "not_mcreator",
    note: "Reviewed custom toolchain",
  });
  let current = await call("scan_mod_insights", {
    instanceId: fixtures.instance.id,
  });
  ok(
    current.files.find((f) => f.file_name === generated.file_name).inspection
      .override.choice === "not_mcreator",
    "Exact-file override survives cached rescan",
  );
  const target = path.join(fixtures.instance.dir, "mods/verdant-machinery.jar");
  fs.writeFileSync(
    target,
    zip({
      "net/custom/Replacement.class": Buffer.from("cafebabe0000003d", "hex"),
    }),
  );
  current = await call("scan_mod_insights", {
    instanceId: fixtures.instance.id,
    history: true,
  });
  const replacement = current.files.find(
    (f) => f.file_name === generated.file_name,
  ).inspection;
  ok(
    replacement.sha256 !== generated.inspection.sha256,
    "Edited bytes invalidate detector cache",
  );
  ok(
    replacement.status === "unknown" && !replacement.override,
    "Override does not leak to a new file hash",
  );
  ok(
    current.fingerprint !== scan.fingerprint,
    "Mod changes invalidate scan fingerprint",
  );
  const beforeFingerprint = current.fingerprint;
  write(fixtures.instance.dir, "config/new.toml", "enabled=true");
  current = await call("scan_mod_insights", {
    instanceId: fixtures.instance.id,
    history: true,
  });
  ok(
    current.fingerprint !== beforeFingerprint,
    "Config changes invalidate scan fingerprint",
  );
  let lib = await call("get_creative_library");
  ok(Object.keys(lib.favorites).length === 6, "Seeded six canonical favorites");
  await call("creative_library_action", {
    operation: "save",
    payload: {
      favorite: {
        provider: "curseforge",
        project_id: "AANobbMI",
        kind: "mods",
        title: "Different provider same ID",
      },
    },
  });
  lib = await call("get_creative_library");
  ok(
    Object.keys(lib.favorites).length === 7,
    "Provider is part of canonical identity",
  );
  await call("creative_library_action", {
    operation: "edit",
    payload: {
      keys: ["modrinth:AANobbMI"],
      patch: { notes: "Keep this for pack two", tags: ["fast"] },
    },
  });
  await call("creative_library_action", {
    operation: "save",
    payload: {
      favorite: {
        provider: "modrinth",
        project_id: "AANobbMI",
        kind: "mods",
        title: "Updated project metadata",
      },
    },
  });
  lib = await call("get_creative_library");
  ok(
    lib.favorites["modrinth:AANobbMI"].notes === "Keep this for pack two",
    "Metadata refresh preserves notes",
  );
  await assert.rejects(
    call("creative_library_action", {
      operation: "edit",
      payload: { keys: ["modrinth:AANobbMI"], patch: { notes: 42 } },
    }),
  );
  count++;
  const history = await call("get_performance_history");
  ok(history.length === 3, "Only explicit performance scans create history");
  const sourceBytes = fs.readFileSync(
    path.join(fixtures.instance.dir, "config/visuals.json"),
  );
  const favoriteHash = crypto.createHash("sha256").update(sourceBytes).digest("hex");
  await call("creative_library_action", {operation:"save",payload:{favorite:{provider:"local",project_id:favoriteHash,title:"Visual settings",kind:"config",description:"config/visuals.json"}}});
  let context = await call("get_library_context");
  ok(context[`local:${favoriteHash}`].some(i=>i.instance_id===fixtures.instance.id && i.file_name==='config/visuals.json'), "Local favorites find their exact file without scanning every archive");
  fs.renameSync(path.join(fixtures.instance.dir, "config/visuals.json"), path.join(fixtures.instance.dir, "config/visuals.json.disabled"));
  context = await call("get_library_context");
  ok(context[`local:${favoriteHash}`].some(i=>i.instance_id===fixtures.instance.id && !i.enabled), "Favorite context follows disabled files");
  fs.writeFileSync(path.join(fixtures.instance.dir, "config/visuals.json.disabled"), '{"changed":true}');
  context = await call("get_library_context");
  ok(!(context[`local:${favoriteHash}`] || []).some(i=>i.instance_id===fixtures.instance.id), "A path hint cannot identify different file contents as the same favorite");
  fs.renameSync(path.join(fixtures.instance.dir, "config/visuals.json.disabled"), path.join(fixtures.instance.dir, "config/visuals.json"));
  fs.writeFileSync(path.join(fixtures.instance.dir, "config/visuals.json"), sourceBytes);
  const failed = await call("start_performance_capture", {
    instanceId: fixtures.instance.id,
    seconds: 15,
  });
  ok(
    failed.state === "failed" && failed.error,
    "Missing game assets fail honestly before launch",
  );
  ok(failed.cleaned_up, "Failed startup capture cleans the generated sandbox");
  ok(
    sourceBytes.equals(
      fs.readFileSync(path.join(fixtures.instance.dir, "config/visuals.json")),
    ),
    "Failed capture preserves source config",
  );
  await service.close();
  service = new LauncherService({
    rootDir: root,
    dataDir: path.join(temporary, "data"),
    resourcesDir: root,
  });
  const reopened = await call("get_creative_library");
  ok(
    reopened.favorites["modrinth:AANobbMI"].notes === "Keep this for pack two",
    "Library survives native service restart",
  );
  ok(
    (await call("get_runtime_captures")).some((r) => r.id === failed.id),
    "Runtime failures persist across restart",
  );
  const output = path.join(root, "output/playwright");
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(
    path.join(output, "creative-native-proof.json"),
    JSON.stringify(
      {
        passed: true,
        assertions: count,
        sourcePreserved: true,
        detector: scan.detector,
        hash: crypto
          .createHash("sha256")
          .update(fs.readFileSync(process.env.ENDERLOOM_SERVICE_PATH))
          .digest("hex"),
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ passed: true, assertions: count }));
})()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await service.close();
    console.log("Isolated QA data: " + temporary);
  });
