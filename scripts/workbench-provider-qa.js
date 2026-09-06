"use strict";
// Live provider acceptance: real upstream bytes, service hash identity and rollback.
const assert = require("assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { LauncherService } = require("../src/launcher-service");
const { zip, write } = require("./workbench-fixtures");
const rootDir = path.resolve(__dirname, "..");
const temporary = fs.mkdtempSync(
  path.join(os.tmpdir(), "enderloom-workbench-provider-"),
);
const service = new LauncherService({
  rootDir,
  dataDir: path.join(temporary, "data"),
  resourcesDir: rootDir,
});
const sha256 = (bytes) =>
  crypto.createHash("sha256").update(bytes).digest("hex");

(async () => {
  const instance = await service.request("create_instance", {
    name: "Workbench provider acceptance",
    versionId: "1.20.1",
    loader: "fabric",
    loaderVersion: "0.16.14",
  });
  const versions = (
    await service.request("list_project_versions", {
      provider: "modrinth",
      projectId: "sodium",
      kind: "mods",
      gameVersion: "1.20.1",
      loader: "fabric",
    })
  ).filter((v) => v.compatible && v.channel === "release");
  assert(
    versions.length >= 2,
    "Live upstream must expose at least two compatible stable versions",
  );
  const oldest = versions.at(-1),
    latest = versions[0];
  async function download(version) {
    const file = version.files.find((f) => f.primary) || version.files[0];
    const response = await fetch(file.url, {
      signal: AbortSignal.timeout(30000),
    });
    assert(response.ok, `Download failed: HTTP ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.equal(
      crypto.createHash("sha1").update(bytes).digest("hex"),
      file.sha1,
    );
    return {
      bytes,
      source: write(temporary, `downloads/${version.id}.jar`, bytes),
    };
  }
  const oldFile = await download(oldest),
    newFile = await download(latest);
  const action = (operation, payload) =>
    service.request("workbench_action", {
      instanceId: instance.id,
      operation,
      payload,
    });
  const installed = await action("install", {
    source: oldFile.source,
    recipe: "custom",
    folder: "mods",
    provider: "modrinth",
    projectId: "sodium",
    origin: "original",
  });
  const check = async () => {
    const library = await service.request("check_workbench_updates", {
      instanceId: instance.id,
    });
    return library.entries.find((e) => e.path === installed.path);
  };
  let entry = await check();
  assert.equal(entry.record.update.status, "available");
  assert.equal(entry.record.update.installed_version_id, oldest.id);
  assert.equal(entry.record.update.version_id, latest.id);
  await action("replace", {
    path: installed.path,
    expectedHash: entry.hash,
    source: newFile.source,
  });
  entry = await check();
  assert.equal(entry.record.update.status, "current");
  assert.equal(entry.record.update.installed_version_id, latest.id);
  await action("restore", {
    path: installed.path,
    expectedHash: entry.hash,
    hash: sha256(oldFile.bytes),
  });
  entry = await check();
  assert.equal(
    entry.record.update.status,
    "available",
    "Rollback must clear stale replacement version identity",
  );
  assert.equal(entry.record.update.installed_version_id, oldest.id);
  assert(
    fs
      .readFileSync(path.join(instance.dir, installed.path))
      .equals(oldFile.bytes),
  );
  // An externally installed exact upstream release overrides the older recorded ID.
  write(instance.dir, installed.path, newFile.bytes);
  entry = await check();
  assert.equal(entry.record.update.status, "current");
  assert.equal(entry.record.update.installed_version_id, latest.id);
  const unlinked = await action("install", {
    source: write(
      temporary,
      "downloads/unknown.jar",
      zip({ "fabric.mod.json": '{"id":"unknown","version":"1"}' }),
    ),
    recipe: "custom",
    folder: "mods",
    provider: "modrinth",
    projectId: "sodium",
  });
  const library = await service.request("check_workbench_updates", {
    instanceId: instance.id,
  });
  assert.equal(
    library.entries.find((e) => e.path === unlinked.path).record.update.status,
    "unverified",
  );
  console.log(
    JSON.stringify(
      {
        passed: true,
        provider: "modrinth",
        originalVersion: oldest.id,
        replacementVersion: latest.id,
        checksumIdentity: true,
        availableToCurrent: true,
        restoredOriginalVersion: true,
        externalReplacementIdentity: true,
        unknownIsUnverified: true,
      },
      null,
      2,
    ),
  );
})()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await service.close();
    const resolved = path.resolve(temporary);
    if (
      resolved.startsWith(path.resolve(os.tmpdir()) + path.sep) &&
      path.basename(resolved).startsWith("enderloom-workbench-provider-")
    ) {
      fs.rmSync(resolved, { recursive: true, force: true });
    }
  });
