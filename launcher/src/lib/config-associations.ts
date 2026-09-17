import type { ContentItem } from "./types";
import type { WorkbenchEntry } from "./workbench";

export interface ConfigAssociation {
  id: string;
  title: string;
  reason: string;
  confidence: "matched" | "suggested" | "manual" | "unassigned";
  mod?: ContentItem;
}
const normalize = (v: string) => v.toLowerCase().replace(/[^a-z0-9]/g, "");
export function createConfigAssociator(mods: ContentItem[]) {
  const byIdentity = new Map<string, ContentItem>();
  for (const mod of mods) {
    const id = mod.source?.mod_id || mod.file_name;
    const existing = byIdentity.get(id);
    if (!existing || (!existing.enabled && mod.enabled)) byIdentity.set(id, mod);
  }
  const owners = [...byIdentity.values()];
  const byName = new Map<string, Set<ContentItem>>();
  for (const mod of owners) for (const name of [mod.source?.mod_id, mod.source?.title]) {
    if (!name) continue;
    const key = normalize(name), items = byName.get(key) ?? new Set<ContentItem>();
    items.add(mod); byName.set(key, items);
  }
  return (entry: WorkbenchEntry, override?: string) => configAssociation(entry, owners, override, byName);
}
export function configAssociation(
  entry: WorkbenchEntry,
  mods: ContentItem[],
  override?: string,
  byName?: Map<string, Set<ContentItem>>,
): ConfigAssociation {
  const identity = (m: ContentItem) => m.source?.mod_id || m.file_name;
  const owned = (
    m: ContentItem,
    reason: string,
    confidence: ConfigAssociation["confidence"] = "matched",
  ): ConfigAssociation => ({
    id: identity(m),
    title: m.source?.title || m.source?.mod_id || m.file_name,
    reason,
    confidence,
    mod: m,
  });
  if (override && override !== "auto") {
    if (override === "unassigned")
      return {
        id: "unassigned",
        title: "Unassigned & shared",
        reason: "You marked this file as shared or unassigned.",
        confidence: "manual",
      };
    const mod = mods.find((m) => identity(m) === override);
    return mod
      ? owned(mod, "Assigned by you.", "manual")
      : {
          id: override,
          title: override,
          reason: "Your assigned mod is no longer installed.",
          confidence: "manual",
        };
  }
  const path = entry.path.toLowerCase().replace(/\.disabled$/, "");
  if (path === "options.txt")
    return {
      id: "minecraft",
      title: "Minecraft",
      reason: "Minecraft’s global client settings file.",
      confidence: "matched",
    };
  const self =
    entry.mod &&
    mods.find(
      (m) =>
        `mods/${m.file_name.toLowerCase()}`.replace(/\.disabled$/, "") === path,
    );
  if (self) return owned(self, "The installed mod file itself.");
  // A world named "Create" does not make all of its server configs Create's.
  const parts = path.split("/");
  if (parts[0] === 'saves' && parts[2] === 'serverconfig') parts.splice(0, 3);
  const file = parts.pop()!.replace(/\.[^.]+$/, "");
  const scope = /(?:^|\/)(?:defaultconfigs|serverconfig)\//.test(path)
    ? "Server settings"
    : /(?:^|[-_.])client(?:$|[-_.])/.test(file)
      ? "Client settings"
      : "Config";
  const names = [
    ...parts.filter(
      (p) => !["config", "defaultconfigs", "saves", "serverconfig"].includes(p),
    ),
    file.replace(
      /[-_.](client|common|server|config|settings|options)(?:[-_.].*)?$/,
      "",
    ),
    file,
  ];
  const conventions: Record<string, string[]> = {
    tacz: ["tacz"],
    pointblank: ["pointblank", "vicspointblank"],
    kubejs: ["kubejs"],
    scripts: ["crafttweaker"],
    optionsof: ["optifine"],
    optionsshaders: ["optifine"],
  };
  const possible = byName ? [...new Set(names.flatMap(name => [...(byName.get(normalize(name)) ?? []), ...(conventions[name] ?? []).flatMap(id => [...(byName.get(id) ?? [])])]))] : mods;
  const candidates = possible
    .flatMap((mod) => {
      const id = normalize(mod.source?.mod_id || "");
      const title = normalize(mod.source?.title || "");
      const byId = id && names.some((n) => normalize(n) === id);
      const conventional =
        id &&
        Object.entries(conventions).some(
          ([folder, ids]) => names.includes(folder) && ids.includes(id),
        );
      const byTitle =
        title.length > 3 && names.some((n) => normalize(n) === title);
      if (!byId && !conventional && !byTitle) return [];
      return [
        {
          mod,
          score: byId ? 3 : conventional ? 2 : 1,
          reason: `${scope} · ${byId ? "filename or folder matches installed mod ID" : conventional ? "known mod folder convention" : "filename or folder matches project title"}.`,
        },
      ];
    })
    .sort((a, b) => b.score - a.score);
  if (
    candidates.length &&
    (candidates.length === 1 || candidates[0].score > candidates[1].score)
  ) {
    const top = candidates[0];
    return owned(
      top.mod,
      top.reason,
      top.score === 1 ? "suggested" : "matched",
    );
  }
  return {
    id: "unassigned",
    title: "Unassigned & shared",
    reason: candidates.length
      ? "More than one installed mod matches. Choose the owner below."
      : "No unambiguous installed mod match. This may be shared, custom, or left by a removed mod.",
    confidence: "unassigned",
  };
}
