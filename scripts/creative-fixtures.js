"use strict";
const fs = require("fs"),
  path = require("path");
const { zip, write } = require("./workbench-fixtures");
async function seedCreative(service, fixtures) {
  const dir = fixtures.instance.dir;
  write(
    dir,
    "mods/verdant-machinery.jar",
    zip({
      "META-INF/mods.toml":
        'modLoader="javafml"\nloaderVersion="[47,)"\nlicense="MIT"\n[[mods]]\nmodId="verdant"\nversion="1.2.0"\ndisplayName="Verdant Machinery"\n',
      "net/mcreator/verdant/network/VerdantModVariables.class": Buffer.from(
        "cafebabe0000003d",
        "hex",
      ),
      "net/mcreator/verdant/procedures/BloomProcedure.class": Buffer.from(
        "cafebabe0000003d",
        "hex",
      ),
      "assets/verdant/textures/block/machine.png": Buffer.alloc(48 * 1024, 1),
    }),
  );
  write(
    dir,
    "mods/old-workshop.jar.disabled",
    zip({
      "net/mcreator/old/OldModElements.class": Buffer.from(
        "cafebabe00000034",
        "hex",
      ),
      "META-INF/MANIFEST.MF":
        "Manifest-Version: 1.0\nCreated-By: MCreator 1.9\n",
    }),
  );
  write(
    dir,
    "mods/regular-mod.jar",
    zip({
      "assets/regular/icon.png": Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jZ1kAAAAASUVORK5CYII=", "base64"),
      "net/example/Regular.class": Buffer.from("cafebabe0000003d", "hex"),
      "META-INF/MANIFEST.MF": "Manifest-Version: 1.0\nCreated-By: OpenJDK\n",
      "fabric.mod.json":
        '{"schemaVersion":1,"id":"regular","version":"1.0","name":"Regular Mod","icon":"assets/regular/icon.png","description":"MCreator is mentioned here, but is not the generator."}',
    }),
  );
  write(dir, "mods/damaged.jar", Buffer.from("This is not a ZIP archive"));
  const projects = [
    [
      "modrinth",
      "AANobbMI",
      "Sodium",
      "mods",
      "A modern rendering engine for Minecraft.",
      "CaffeineMC",
    ],
    [
      "modrinth",
      "YL57xq9U",
      "Iris Shaders",
      "mods",
      "Beautiful worlds, with a shader pipeline to match.",
      "Iris Team",
    ],
    [
      "modrinth",
      "P7dR8mSH",
      "Fabric API",
      "mods",
      "The essential library for your Fabric mod collection.",
      "FabricMC",
    ],
    [
      "modrinth",
      "J1fpUo8G",
      "Complementary Reimagined",
      "shaderpacks",
      "A familiar Minecraft world, with a little more wonder.",
      "EminGTR",
    ],
    [
      "curseforge",
      "287701",
      "Waystones",
      "mods",
      "Find your way home, wherever your adventure goes.",
      "BlayTheNinth",
    ],
    [
      "curseforge",
      "342584",
      "Supplementaries",
      "mods",
      "Thoughtful details for a world that feels alive.",
      "MehVahdJukaar",
    ],
  ];
  for (const [
    provider,
    project_id,
    title,
    kind,
    description,
    author,
  ] of projects)
    await service.request("creative_library_action", {
      operation: "save",
      payload: {
        favorite: { provider, project_id, title, kind, description, author },
      },
    });
  const lib = await service.request("creative_library_action", {
    operation: "collection",
    payload: { name: "A cozier overworld" },
  });
  const collection = Object.keys(lib.collections)[0];
  await service.request("creative_library_action", {
    operation: "edit",
    payload: {
      keys: ["curseforge:287701", "curseforge:342584"],
      patch: { collections: [collection], tags: ["cozy", "survival"] },
    },
  });
  await service.request("creative_library_action", {
    operation: "edit",
    payload: {
      keys: ["modrinth:AANobbMI"],
      patch: { pinned: true, tags: ["performance"] },
    },
  });
  return { collection };
}
module.exports = { seedCreative };
