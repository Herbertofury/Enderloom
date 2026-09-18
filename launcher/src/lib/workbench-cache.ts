import { api } from "./api";
import type { WorkbenchLibrary } from "./workbench";
import type { ContentItem } from "./types";

type Session = {
  data?: WorkbenchLibrary;
  pending?: Promise<WorkbenchLibrary>;
  listeners: Set<(data: WorkbenchLibrary) => void>;
  used: number;
};
const sessions = new Map<string, Session>();
const modSessions = new Map<string, { data?: ContentItem[]; pending?: Promise<ContentItem[]>; used: number }>();
const key = (id: string, includeMods: boolean) => JSON.stringify([id, includeMods]);
function session(id: string, includeMods: boolean) {
  // Retain recently visited views, without keeping every profile forever.
  for (const [id, item] of sessions) if (!item.pending && Date.now() - item.used > 30 * 60_000) sessions.delete(id);
  const identity = key(id, includeMods);
  let item = sessions.get(identity);
  if (!item) { item = { listeners: new Set(), used: Date.now() }; sessions.set(identity, item); }
  item.used = Date.now();
  return item;
}
export function workbenchSnapshot(id: string, includeMods: boolean) {
  return session(id, includeMods).data ?? null;
}
export function scanWorkbenchShared(id: string, includeMods: boolean, onData: (data: WorkbenchLibrary) => void): Promise<WorkbenchLibrary> {
  const item = session(id, includeMods);
  item.listeners.add(onData);
  if (item.data) onData(item.data);
  if (!item.pending) {
    const publish = (data: WorkbenchLibrary) => {
      item.data = data;
      for (const listener of item.listeners) listener(data);
      return data;
    };
    item.pending = (async () => {
      // A warm view remains usable while its current bytes are rechecked.
      if (!item.data) publish(await api.scanWorkbench(id, includeMods, true));
      return publish(await api.scanWorkbench(id, includeMods));
    })().finally(() => { item.pending = undefined; });
  }
  return item.pending.finally(() => { item.listeners.delete(onData); });
}
export async function refreshWorkbenchAfterChange(id: string, includeMods: boolean, onData: (data: WorkbenchLibrary) => void) {
  // A pass that began before the mutation cannot stand in for the new scan.
  await session(id, includeMods).pending?.catch(() => {});
  return scanWorkbenchShared(id, includeMods, onData);
}
export function modSnapshot(id: string) { return modSessions.get(id)?.data ?? []; }
export function loadWorkbenchMods(id: string) {
  for (const [id, item] of modSessions) if (!item.pending && Date.now() - item.used > 30 * 60_000) modSessions.delete(id);
  let item = modSessions.get(id);
  if (!item) { item = { used: Date.now() }; modSessions.set(id, item); }
  const current = item;
  current.used = Date.now();
  current.pending ??= api.listInstanceContent(id, "mods", false).then(data => current.data = data).finally(() => { current.pending = undefined; });
  return current.pending;
}
