"use strict";
// Fabric fixture actually executes a Java entrypoint in Minecraft. It is never installed to a user profile.
const assert = require("assert/strict"),
  fs = require("fs"),
  os = require("os"),
  path = require("path");
const { spawnSync } = require("child_process");
const { LauncherService } = require("../src/launcher-service");
const { zip, write } = require("./workbench-fixtures");
if (!process.argv.includes("--live-account"))
  throw Error("Pass --live-account for real Fabric comparison acceptance");
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
let instance;
const temporary = fs.mkdtempSync(
  path.join(os.tmpdir(), "enderloom-paired-qa-"),
);
(async () => {
  const before = await service.request("list_instances"),
    settings = await service.request("get_settings");
  assert((await service.request("list_accounts")).some((a) => a.active));
  const versions = await service.request("list_loader_versions", {
    loader: "fabric",
    gameVersion: "1.20.1",
  });
  const loaderVersion = versions[0];
  assert(loaderVersion, "No Fabric version");
  instance = await service.request("create_instance", {
    name: `Paired startup acceptance ${Date.now()}`,
    versionId: "1.20.1",
    loader: "fabric",
    loaderVersion,
  });
  await service.request("update_instance", {
    instanceId: instance.id,
    name: instance.name,
    versionId: "1.20.1",
    loader: "fabric",
    loaderVersion,
    minMemoryMb: 512,
    maxMemoryMb: 2048,
    javaPath: null,
    jvmArgs: null,
    jvmArgsMode: null,
    envVars: null,
    envVarsMode: null,
  });
  await service.request(
    "install_instance",
    { instanceId: instance.id },
    { timeoutMs: 600000 },
  );
  const api = write(
    temporary,
    "net/fabricmc/api/ModInitializer.java",
    "package net.fabricmc.api; public interface ModInitializer { void onInitialize(); }",
  );
  const source = write(
    temporary,
    "qa/StartupMarker.java",
    'package qa; public final class StartupMarker implements net.fabricmc.api.ModInitializer { public void onInitialize(){ System.out.println("ENDERLOOM_PAIRED_FIXTURE_EXECUTED"); try{Thread.sleep(1800);}catch(InterruptedException e){Thread.currentThread().interrupt();} } }',
  );
  const compile = spawnSync(
    "javac",
    ["--release", "17", "-d", path.join(temporary, "classes"), api, source],
    { windowsHide: true, encoding: "utf8" },
  );
  assert.equal(compile.status, 0, compile.stderr);
  const target = write(
    instance.dir,
    "mods/startup-fixture.jar",
    zip({
      "fabric.mod.json": JSON.stringify({
        schemaVersion: 1,
        id: "enderloom_paired_fixture",
        version: "1.0",
        name: "Enderloom paired acceptance fixture",
        environment: "client",
        entrypoints: { main: ["qa.StartupMarker"] },
        depends: {
          fabricloader: ">=0.14.0",
          minecraft: "1.20.1",
          java: ">=17",
        },
      }),
      "qa/StartupMarker.class": fs.readFileSync(
        path.join(temporary, "classes/qa/StartupMarker.class"),
      ),
    }),
  );
  const bytes = fs.readFileSync(target);
  const dependency = write(
    instance.dir,
    "mods/dependent-fixture.jar",
    zip({
      "fabric.mod.json": JSON.stringify({
        schemaVersion: 1,
        id: "dependent_fixture",
        version: "1.0",
        depends: { enderloom_paired_fixture: "*" },
      }),
    }),
  );
  await assert.rejects(
    service.request("compare_mod_startup", {
      instanceId: instance.id,
      fileName: "startup-fixture.jar",
      seconds: 15,
      repeats: 1,
    }),
    /required dependents/i,
  );
  // This exact file was created above inside this disposable instance.
  fs.unlinkSync(dependency);
  console.log(
    "Launching an actual Fabric pair; target entrypoint sleeps 1.8 seconds only in the with-target copy.",
  );
  const comparison = await service.request(
    "compare_mod_startup",
    {
      instanceId: instance.id,
      fileName: "startup-fixture.jar",
      seconds: 15,
      repeats: 2,
    },
    { timeoutMs: 360000 },
  );
  const output = path.join(root, "output/playwright/performance-live");
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(
    path.join(output, "comparison.json"),
    JSON.stringify(comparison, null, 2),
  );
  assert.equal(comparison.state, "completed", comparison.error);
  assert.equal(comparison.pairs.length, 2);
  assert.equal(comparison.pairs[0].order, "AB");
  assert.equal(comparison.pairs[1].order, "BA");
  const captures = await service.request("get_runtime_captures");
  for (const pair of comparison.pairs) {
    const withTarget = captures.find((c) => c.id === pair.with_capture),
      without = captures.find((c) => c.id === pair.without_capture);
    assert(withTarget.cleaned_up && without.cleaned_up);
    assert.equal(withTarget.input_fingerprint, without.input_fingerprint);
    const log = await service.request("get_logs", {
      runningId: withTarget.running_id,
    });
    assert(
      log.some((l) => l.line.includes("ENDERLOOM_PAIRED_FIXTURE_EXECUTED")),
      "Target code did not actually run",
    );
    const absent = await service.request("get_logs", {
      runningId: without.running_id,
    });
    assert(
      !absent.some((l) => l.line.includes("ENDERLOOM_PAIRED_FIXTURE_EXECUTED")),
      "Target executed in omitted variant",
    );
  }
  assert(bytes.equals(fs.readFileSync(target)), "Original mod changed");
  await service.request("delete_instance", { instanceId: instance.id });
  instance = null;
  assert.deepEqual(await service.request("list_instances"), before);
  assert.deepEqual(await service.request("get_settings"), settings);
  console.log(
    "PASS dependency rejection, actual Fabric with/without executions, AB/BA pairs, measured deltas, saved evidence, cleanup and unchanged source.",
  );
})()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (instance)
      await service
        .request("delete_instance", { instanceId: instance.id })
        .catch(() => {});
    await service.close();
    console.log("Fixture Java sources: " + temporary);
  });
