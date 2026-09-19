import type { ContentItem } from "./types";
import type { WorkbenchEntry } from "./workbench";

export interface ConfigAssociation {
  id: string;
  title: string;
  reason: string;
  confidence: "matched" | "suggested" | "manual" | "unassigned";
  file_name?: string | null;
  mod?: ContentItem;
}
// Ownership comes from the native resolver shared with project context and CLI.
// Only an explicit correction is projected optimistically during its save.
export function createConfigAssociator(mods: ContentItem[]) {
  const byIdentity = new Map<string, ContentItem>();
  for (const mod of mods) {
    const id = mod.source?.mod_id || mod.file_name, previous = byIdentity.get(id);
    if (!previous || (!previous.enabled && mod.enabled)) byIdentity.set(id, mod);
  }
  const owners = [...byIdentity.values()];
  return (entry: WorkbenchEntry, override?: string) => configAssociation(entry, owners, override);
}
export function configAssociation(entry: WorkbenchEntry, mods: ContentItem[], override?: string): ConfigAssociation {
  const automatic = (override === undefined ? entry.owner : entry.automatic_owner) ?? entry.automatic_owner ?? { id: "unassigned", title: "Unassigned & shared", reason: "Reading installed mod identities…", confidence: "unassigned" as const };
  if (override && override !== "auto") {
    if (override === "unassigned") return { id: override, title: "Unassigned & shared", reason: "You marked this file as shared or unassigned.", confidence: "manual" };
    const mod = mods.find(m => (m.source?.mod_id || m.file_name) === override);
    return { id: override, title: mod?.source?.title || override, reason: mod ? "Assigned by you." : "Your assigned mod is no longer installed.", confidence: "manual", mod };
  }
  return { ...automatic, mod: mods.find(m => m.file_name === automatic.file_name) ?? mods.find(m => (m.source?.mod_id || m.file_name) === automatic.id) };
}
