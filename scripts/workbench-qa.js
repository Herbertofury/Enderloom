"use strict";
const assert = require("assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { LauncherService } = require("../src/launcher-service");
const { seed, zip, write } = require("./workbench-fixtures");
const rootDir = path.resolve(__dirname, "..");
const temporary = fs.mkdtempSync(
  path.join(os.tmpdir(), "enderloom-workbench-qa-"),
);
const service = new LauncherService({
  rootDir,
  dataDir: path.join(temporary, "data"),
  resourcesDir: rootDir,
});
const hash = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
let checks = 0;
function verify(value, message) {
  assert(value, message);
  checks++;
}
async function rejects(promise, pattern) {
  await assert.rejects(promise, pattern);
  checks++;
}
(async () => {
  const { instance, second, original, helldivers } = await seed(
    service,
    temporary,
  );
  const action = (operation, payload, id = instance.id) =>
    service.request("workbench_action", { instanceId: id, operation, payload });
  const scan = () =>
    service.request("scan_instance_workbench", { instanceId: instance.id });
  let library = await scan();
  verify(
    library.entries.some(
      (e) => e.path === "saves/Creative/serverconfig/building.toml",
    ),
    "Forge world configs discovered",
  );
  verify(
    library.entries
      .find((e) => e.path === "config/broken.json")
      .issues.some((i) => i.severity === "error"),
    "corrupt JSON flagged",
  );
  verify(
    library.entries.find((e) => e.path === "mods/cloth-config.jar").config,
    "config helper mod appears in Config",
  );
  verify(
    library.recipes.find((r) => r.id === "tacz").folder === "tacz",
    "TaCZ 1.1.4 metadata routes to modern folder",
  );
  verify(
    fs
      .readFileSync(path.join(instance.dir, "tacz/Helldivers.zip"))
      .equals(fs.readFileSync(helldivers)),
    "addon ZIP stays intact",
  );
  await rejects(
    action("install", { source: helldivers, recipe: "tacz" }),
    /already exists/,
  );
  write(
    instance.dir,
    "mods/tacz.jar",
    zip({ "fabric.mod.json": '{"id":"tacz","version":"1.1.3"}' }),
  );
  library = await scan();
  verify(
    library.recipes.find((r) => r.id === "tacz").folder ===
      "config/tacz/custom",
    "older TaCZ path detected",
  );
  verify(
    library.entries
      .find((e) => e.path === "tacz/Helldivers.zip")
      .issues.some((i) => /expects/.test(i.message)),
    "wrong folder warning after TaCZ change",
  );
  await action("install", { source: helldivers, recipe: "tacz" });
  library = await scan();
  const shared = library.entries.find(
    (e) => e.path === "config/tacz/custom/Helldivers.zip",
  );
  verify(
    shared.config && shared.addon,
    "one record is available in Config and Addons",
  );
  let mod = library.entries.find((e) => e.path === "mods/workshop.jar");
  verify(
    mod.record.origin === "ai_assisted" && mod.modified,
    "declared AI patch differs from actual upstream original",
  );
  verify(
    mod.record.original_hash === hash(fs.readFileSync(original)),
    "upstream original byte identity preserved",
  );
  await rejects(
    service.request("apply_content_update", {
      instanceId: instance.id,
      kind: "mods",
      fileName: "workshop.jar",
      manualDownloads: [],
      downloadsDir: path.join(temporary, "downloads"),
    }),
    /protected local work/,
  );
  const document = await action("read", { path: "config/visuals.json" });
  await service.request("toggle_instance_content", {
    instanceId: instance.id,
    kind: "mods",
    fileName: "workshop.jar",
  });
  library = await scan();
  verify(
    library.entries.filter((e) => /mods\/workshop.jar/.test(e.path)).length ===
      1 &&
      library.entries.find((e) => e.path === "mods/workshop.jar.disabled")
        .record.origin === "ai_assisted",
    "ordinary Mods toggle retains one provenance record",
  );
  await service.request("toggle_instance_content", {
    instanceId: instance.id,
    kind: "mods",
    fileName: "workshop.jar",
  });
  library = await scan();
  verify(
    library.entries.find((e) => e.path === "mods/workshop.jar").record
      .original_hash === hash(fs.readFileSync(original)),
    "ordinary re-enable retains upstream baseline",
  );
  const overwrite = write(
    temporary,
    "downloads/workshop.jar",
    zip({ "fabric.mod.json": '{"id":"workshop","version":"2.0.0"}' }),
  );
  await rejects(
    service.request("add_instance_content", {
      instanceId: instance.id,
      kind: "mods",
      sources: [overwrite],
    }),
    /protected local work/,
  );
  await rejects(
    action("save", {
      path: document.path,
      expectedHash: document.hash,
      text: "{bad",
    }),
    /Line/,
  );
  verify(
    hash(fs.readFileSync(path.join(instance.dir, document.path))) ===
      document.hash,
    "invalid save leaves original unchanged",
  );
  const edited = document.text.replace("48", "72");
  await action("save", {
    path: document.path,
    expectedHash: document.hash,
    text: edited,
    note: "More particles",
  });
  library = await scan();
  let config = library.entries.find((e) => e.path === document.path);
  verify(
    config.modified && config.record.revisions.length === 2,
    "save preserves old and new revisions",
  );
  const blob = path.join(
    instance.dir,
    ".enderloom-workbench/blobs",
    document.hash,
  );
  verify(
    fs.readFileSync(blob, "utf8") === document.text,
    "saved baseline has exact original bytes",
  );
  await rejects(
    action("save", {
      path: document.path,
      expectedHash: document.hash,
      text: edited,
    }),
    /changed since/,
  );
  write(instance.dir, document.path, edited.replace("72", "90"));
  library = await scan();
  config = library.entries.find((e) => e.path === document.path);
  verify(
    config.record.revisions.at(-1).note === "External edit detected",
    "external edits are recorded",
  );
  verify(
    fs.readFileSync(blob, "utf8") === document.text,
    "backup is independent from external mutations",
  );
  await action("restore", {
    path: document.path,
    expectedHash: config.hash,
    hash: document.hash,
  });
  verify(
    fs.readFileSync(path.join(instance.dir, document.path), "utf8") ===
      document.text,
    "restore returns exact original",
  );
  await action("save_preset", {
    path: document.path,
    expectedHash: document.hash,
    name: "Evergreen visuals",
  });
  library = await scan();
  const preset = library.presets[0];
  await action(
    "apply_preset",
    { path: preset.path, presetId: preset.id, expectedHash: "" },
    second.id,
  );
  verify(
    fs.readFileSync(path.join(second.dir, preset.path), "utf8") ===
      document.text,
    "global preset reaches a separate instance",
  );
  const mismatch = await service.request("create_instance", {
    name: "Wrong version",
    versionId: "1.21",
    loader: null,
    loaderVersion: null,
  });
  await rejects(
    action(
      "apply_preset",
      { path: preset.path, presetId: preset.id, expectedHash: "" },
      mismatch.id,
    ),
    /another Minecraft version/,
  );
  library = await scan();
  const addon = library.entries.find((e) => e.path === shared.path);
  const disabled = await action("toggle", {
    path: addon.path,
    expectedHash: addon.hash,
  });
  verify(disabled.path.endsWith(".disabled"), "addon disabled by rename");
  library = await scan();
  verify(
    library.entries.find((e) => e.path === disabled.path).record
      .original_hash === addon.hash,
    "toggle retains provenance identity",
  );
  await action("toggle", { path: disabled.path, expectedHash: addon.hash });
  await rejects(
    action("read", { path: "../options.txt" }),
    /valid|relative|Choose a config/,
  );
  await rejects(
    action("read", { path: ".enderloom-workbench/library.json" }),
    /Choose a config/,
  );
  const unsafe = write(
    temporary,
    "downloads/unsafe.zip",
    zip({ "../escape.json": "{}" }),
  );
  await rejects(
    action("install", { source: unsafe, recipe: "custom", folder: "extras" }),
    /unsafe path/,
  );
  const corrupt = write(
    temporary,
    "downloads/corrupt.zip",
    Buffer.from("not a zip"),
  );
  await rejects(
    action("install", { source: corrupt, recipe: "pointblank" }),
    /Damaged ZIP/,
  );
  const outside = path.join(temporary, "outside");
  fs.mkdirSync(outside);
  write(outside, "secret.json", "{}");
  fs.symlinkSync(outside, path.join(instance.dir, "config/linked"), "junction");
  await rejects(
    action("read", { path: "config/linked/secret.json" }),
    /Linked/,
  );
  library = await scan();
  verify(
    library.warnings.some((w) => /Linked/.test(w)),
    "scan reports linked folder without following it",
  );
  fs.unlinkSync(path.join(instance.dir, "config/linked"));
  await action("metadata", {
    path: "config/visuals.json",
    sourceUrl: "https://example.com/original",
    origin: "patch",
    provider: "",
    projectId: "",
  });
  await service.close();
  await service.start();
  library = await scan();
  verify(
    library.entries.find((e) => e.path === "config/visuals.json").record
      .origin === "patch",
    "history persists through native service restart",
  );
  verify(
    library.presets.length === 1,
    "global presets persist through native service restart",
  );
  const lastPatch = zip({
    "fabric.mod.json": '{"id":"workshop","version":"1.0.2"}',
  });
  write(instance.dir, "mods/workshop.jar", lastPatch);
  await service.request("delete_instance_content", {
    instanceId: instance.id,
    kind: "mods",
    fileName: "workshop.jar",
  });
  library = await scan();
  const removed = library.entries.find((e) => e.path === "mods/workshop.jar");
  verify(
    !removed.exists &&
      removed.record.revisions.at(-1).note === "Before removal from Mods",
    "ordinary deletion preserves the latest external patch",
  );
  await action("restore", {
    path: removed.path,
    expectedHash: "",
    hash: removed.record.revisions.at(-1).hash,
  });
  verify(
    fs.readFileSync(path.join(instance.dir, removed.path)).equals(lastPatch),
    "removed patch is recoverable without losing the upstream original",
  );
  console.log(
    JSON.stringify(
      {
        passed: true,
        checks,
        tested: [
          "native file operations",
          "version-aware ZIP installs",
          "shared Config/Addons records",
          "originals and AI labels",
          "update protection",
          "validation",
          "external changes",
          "restore",
          "global presets",
          "traversal and junction rejection",
          "restart persistence",
        ],
      },
      null,
      2,
    ),
  );
})()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await service.close();
    const resolved = path.resolve(temporary);
    if (
      resolved.startsWith(path.resolve(os.tmpdir()) + path.sep) &&
      path.basename(resolved).startsWith("enderloom-workbench-qa-")
    )
      fs.rmSync(resolved, { recursive: true, force: true });
  });
