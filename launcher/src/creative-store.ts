import { create } from "zustand";
import { api } from "./lib/api";
import type {
  CreativeLibrary,
  Installation,
  PerformanceReport,
} from "./lib/creative";

let loading: Promise<void> | undefined;
let writes: Promise<unknown> = Promise.resolve();
const activeScans = new Map<string, Promise<PerformanceReport>>();
export const useCreative = create<{
  library: CreativeLibrary;
  ready: boolean;
  error: string | null;
  scans: Record<string, PerformanceReport>;
  context: Record<string, Installation[]>;
  workbenchTarget: {
    instanceId: string;
    path: string;
    mode: "config" | "addons";
  } | null;
  serverFileTarget: { serverId: string; path: string } | null;
  load: () => Promise<void>;
  refresh: () => Promise<void>;
  act: (operation: string, payload: Record<string, unknown>) => Promise<void>;
  scan: (id: string, history?: boolean) => Promise<PerformanceReport>;
  loadLatest: (id: string) => Promise<void>;
  refreshContext: () => Promise<void>;
}>((set, get) => ({
  library: { schema: 1, favorites: {}, collections: {}, preferences: {} },
  ready: false,
  error: null,
  scans: {},
  context: {},
  workbenchTarget: null,
  serverFileTarget: null,
  load: async () => {
    if (get().ready) return;
    if (!loading)
      loading = get()
        .refresh()
        .finally(() => {
          loading = undefined;
        });
    return loading;
  },
  refresh: async () => {
    try {
      set({
        library: await api.getCreativeLibrary(),
        ready: true,
        error: null,
      });
    } catch (e) {
      set({ error: String(e) });
      throw e;
    }
  },
  act: (operation, payload) => {
    const run = writes
      .catch(() => {})
      .then(async () => {
        set({
          library: await api.creativeLibraryAction(operation, payload),
          ready: true,
          error: null,
        });
      });
    writes = run;
    return run;
  },
  scan: async (id, history = false) => {
    const key = `${id}:${history}`;
    const existing = activeScans.get(key);
    if (existing) return existing;
    const run = api
      .scanModInsights(id, history)
      .then((report) => {
        set((state) => ({ scans: { ...state.scans, [id]: report } }));
        return report;
      })
      .finally(() => {
        activeScans.delete(key);
      });
    activeScans.set(key, run);
    return run;
  },
  loadLatest: async (id) => {
    const report = await api.getLatestInspection(id);
    if (report) set((state) => ({ scans: { ...state.scans, [id]: report } }));
  },
  refreshContext: async () => set({ context: await api.getLibraryContext() }),
}));
