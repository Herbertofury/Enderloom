"use strict";
const fs = require("fs");
const path = require("path");

function zip(entries) {
  let offset = 0;
  const locals = [],
    central = [];
  for (const [name, content] of Object.entries(entries)) {
    const file = Buffer.from(name),
      data = Buffer.from(content);
    let crc = 0xffffffff;
    for (const byte of data) {
      crc ^= byte;
      for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
    crc = (crc ^ 0xffffffff) >>> 0;
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50);
    local.writeUInt16LE(20, 4);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(file.length, 26);
    const dir = Buffer.alloc(46);
    dir.writeUInt32LE(0x02014b50);
    dir.writeUInt16LE(20, 4);
    dir.writeUInt16LE(20, 6);
    dir.writeUInt32LE(crc, 16);
    dir.writeUInt32LE(data.length, 20);
    dir.writeUInt32LE(data.length, 24);
    dir.writeUInt16LE(file.length, 28);
    dir.writeUInt32LE(offset, 42);
    locals.push(local, file, data);
    central.push(dir, file);
    offset += local.length + file.length + data.length;
  }
  const directory = Buffer.concat(central),
    end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50);
  end.writeUInt16LE(Object.keys(entries).length, 8);
  end.writeUInt16LE(Object.keys(entries).length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, directory, end]);
}
function write(root, relative, bytes) {
  const dest = path.join(root, relative);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, bytes);
  return dest;
}
async function seed(service, root) {
  const instance = await service.request("create_instance", {
    name: "Evergreen · creative workshop",
    versionId: "1.20.1",
    loader: "forge",
    loaderVersion: "47.3.0",
  });
  const second = await service.request("create_instance", {
    name: "Evergreen · survival",
    versionId: "1.20.1",
    loader: null,
    loaderVersion: null,
  });
  const settings = await service.request("get_settings");
  await service.request("update_settings", {
    settings: {
      ...settings,
      onboarded: true,
      auto_update_checks: false,
      show_suggestions: false,
      discord_rpc: false,
      request_timeout_secs: 5,
      max_retries: 0,
    },
  });
  write(
    instance.dir,
    "config/visuals.json",
    '{\n  "ambient_particles": true,\n  "particle_distance": 48,\n  "color_theme": "evergreen",\n  "advanced": {"preserve": true}\n}\n',
  );
  write(
    instance.dir,
    "config/sodium-options.json",
    '{"quality":"fancy","render_distance":12}\n',
  );
  write(
    instance.dir,
    "config/waystones-common.toml",
    "teleportation_cost = 0\nallow_global_waystones = true\n",
  );
  write(instance.dir, "config/jei-client.toml", "cheat_mode = false\n");
  write(instance.dir, "config/broken.json", '{"quality": }');
  write(
    instance.dir,
    "defaultconfigs/worldgen.toml",
    "[world]\nextra_structures = true\n",
  );
  write(
    instance.dir,
    "saves/Creative/serverconfig/building.toml",
    "reach = 5\n",
  );
  write(instance.dir, "options.txt", "fov:0.0\nrenderDistance:12\n");
  write(
    instance.dir,
    "mods/tacz.jar",
    zip({
      "META-INF/mods.toml":
        '[[mods]]\nmodId="tacz"\nversion="1.1.4"\ndisplayName="Timeless and Classics Zero"\n',
    }),
  );
  write(
    instance.dir,
    "mods/pointblank.jar",
    zip({
      "fabric.mod.json":
        '{"id":"pointblank","version":"1.6.7","name":"Point Blank"}',
    }),
  );
  write(
    instance.dir,
    "mods/cloth-config.jar",
    zip({
      "fabric.mod.json":
        '{"id":"cloth_config","version":"11.1.136","name":"Cloth Config"}',
    }),
  );
  const original = write(
    root,
    "downloads/original.jar",
    zip({
      "fabric.mod.json":
        '{"id":"workshop","version":"1.0.0","name":"Workshop Original"}',
    }),
  );
  const mod = write(
    instance.dir,
    "mods/workshop.jar",
    zip({
      "fabric.mod.json":
        '{"id":"workshop","version":"1.0.1","name":"Workshop AI patch"}',
    }),
  );
  const doom = write(
    root,
    "downloads/Doom-1.3.5.zip",
    zip({ "doom/pack.json": '{"name":"QA Doom"}' }),
  );
  const helldivers = write(
    root,
    "downloads/Helldivers.zip",
    zip({ "helldivers/pack.json": '{"name":"QA Helldivers"}' }),
  );
  const action = (operation, payload) =>
    service.request("workbench_action", {
      instanceId: instance.id,
      operation,
      payload,
    });
  await action("install", {
    source: doom,
    recipe: "pointblank",
    title: "Doom · Point Blank",
    origin: "unknown",
  });
  await action("install", {
    source: helldivers,
    recipe: "tacz",
    title: "Helldivers · Escalation of Freedom",
    origin: "unknown",
  });
  await action("track", {
    path: "mods/workshop.jar",
    title: "Workshop · AI-assisted patch",
    origin: "ai_assisted",
    originalSource: original,
    notes:
      "Fixture: AI-assisted balancing patch. Original linked and preserved.",
  });
  return { instance, second, original, mod, doom, helldivers };
}
module.exports = { zip, write, seed };
