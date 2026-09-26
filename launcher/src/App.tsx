import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { AnimatePresence, motion } from "motion/react";

import { applyTheme, themeVars } from "./lib/accent";
import { api } from "./lib/api";
import { isLive } from "./lib/servers";
import { cn } from "./lib/cn";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { Sidebar } from "./components/Sidebar";
import { RecoveryBanner } from "./components/RecoveryBanner";
import { TitleBar } from "./components/TitleBar";
import { WindowFrame } from "./components/WindowFrame";
import { UpdateNotifications } from "./components/UpdateNotifications";
import { ContentInstallerProvider } from "./components/CurseForgeDownloadModal";
import { MinecraftNav } from "./components/MinecraftNav";
import { Toaster } from "sonner";
import { HomeView } from "./views/HomeView";
import { DiscoverView } from "./views/DiscoverView";
import { ProjectView } from "./views/ProjectView";
import { useStore } from "./store";
import { buildInstalledInstancesByProject } from "./lib/browse-index";
import { DEFERRED_VIEW_LOADERS } from "./lib/view-modules";
import type { Instance, ProjectSummary, View } from "./lib/types";

const Onboarding = lazy(() =>
  import("./components/onboarding/Onboarding").then((module) => ({
    default: module.Onboarding,
  })),
);
const CatalogInstallModal = lazy(() =>
  import("./components/CatalogInstallModal").then((module) => ({
    default: module.CatalogInstallModal,
  })),
);

const AccountsView = lazy(DEFERRED_VIEW_LOADERS.accounts!);
const InstanceView = lazy(DEFERRED_VIEW_LOADERS.instance!);
const InstancesView = lazy(DEFERRED_VIEW_LOADERS.instances!);
const ServerView = lazy(DEFERRED_VIEW_LOADERS.server!);
const ServersView = lazy(DEFERRED_VIEW_LOADERS.servers!);
const LogsView = lazy(DEFERRED_VIEW_LOADERS.logs!);
const ConversionView = lazy(DEFERRED_VIEW_LOADERS.convert!);
const SettingsView = lazy(DEFERRED_VIEW_LOADERS.settings!);
const StatsView = lazy(DEFERRED_VIEW_LOADERS.stats!);

const embedded = window.enderloomLauncher?.embedded === true;

if (window.enderloomLauncher?.selfTest) {
  const testWindow = window as Window & {
    __enderloomBrowseTest?: {
      openSeededProject: (
        seed: ProjectSummary,
      ) => Promise<{ elapsedMs: number; heading: string; timedOut: boolean }>;
      benchmarkInstalledIndex: () => {
        legacyMs: number;
        indexedMs: number;
        speedup: number;
        equivalent: boolean;
      };
      reset: () => void;
    };
  };

  testWindow.__enderloomBrowseTest = {
    openSeededProject: (seed) =>
      new Promise((resolve) => {
        const started = performance.now();
        let settled = false;
        let timer = 0;
        let observer: MutationObserver | null = null;
        const finish = (heading: string, timedOut: boolean) => {
          if (settled) return;
          settled = true;
          if (timer) window.clearTimeout(timer);
          observer?.disconnect();
          resolve({
            elapsedMs: performance.now() - started,
            heading,
            timedOut,
          });
        };
        const inspectCommittedDom = () => {
          const heading = document.querySelector("h1")?.textContent?.trim() ?? "";
          if (heading !== seed.title) return false;
          queueMicrotask(() => finish(heading, false));
          return true;
        };

        // requestAnimationFrame can be throttled for an embedded WebContentsView in Xvfb
        // even when React has already committed the visible project. Observe the real DOM
        // commit instead so this runtime check measures Enderloom, not CI compositor policy.
        observer = new MutationObserver(() => {
          inspectCommittedDom();
        });
        observer.observe(document.documentElement, {
          childList: true,
          subtree: true,
          characterData: true,
        });

        const state = useStore.getState();
        useStore.setState({
          catalogInstallRequest: null,
          settings: state.settings
            ? { ...state.settings, onboarded: true }
            : state.settings,
        });
        useStore.getState().openProject("modrinth", seed.id, "mods", seed.title, seed);
        inspectCommittedDom();
        timer = window.setTimeout(() => {
          finish(document.querySelector("h1")?.textContent?.trim() ?? "", true);
        }, 2_000);
      }),
    benchmarkInstalledIndex: () => {
      const instanceCount = 1_000;
      const sourcesPerInstance = 64;
      const visibleProjects = Array.from({ length: 40 }, (_, index) => `project-${index * 7}`);
      const instances = Array.from({ length: instanceCount }, (_, index) => ({
        id: `instance-${index}`,
        name: `Instance ${index}`,
      })) as unknown as Instance[];
      const contentSources: Record<
        string,
        Record<string, { file_name: string; version_id: string | null }>
      > = {};

      for (let instanceIndex = 0; instanceIndex < instanceCount; instanceIndex += 1) {
        const sourceMap: Record<string, { file_name: string; version_id: string | null }> = {};
        for (let sourceIndex = 0; sourceIndex < sourcesPerInstance; sourceIndex += 1) {
          const projectId = `project-${(instanceIndex * 17 + sourceIndex * 13) % 800}`;
          sourceMap[projectId] = {
            file_name: `${projectId}.jar`,
            version_id: `v-${sourceIndex}`,
          };
        }
        contentSources[`${instances[instanceIndex].id}:mods`] = sourceMap;
      }

      const legacy = () =>
        visibleProjects.map((projectId) =>
          instances
            .filter(
              (instance) =>
                !!contentSources[`${instance.id}:mods`]?.[projectId],
            )
            .map((instance) => instance.id),
        );

      const expected = legacy();
      const cycles = 80;
      let legacyChecksum = 0;
      const legacyStarted = performance.now();
      for (let cycle = 0; cycle < cycles; cycle += 1) {
        for (const matches of legacy()) legacyChecksum += matches.length;
      }
      const legacyMs = performance.now() - legacyStarted;

      const indexedStarted = performance.now();
      const index = buildInstalledInstancesByProject(instances, contentSources, "mods");
      let indexedChecksum = 0;
      for (let cycle = 0; cycle < cycles; cycle += 1) {
        for (const projectId of visibleProjects) {
          indexedChecksum += index.get(projectId)?.length ?? 0;
        }
      }
      const indexedMs = performance.now() - indexedStarted;
      const actual = visibleProjects.map((projectId) =>
        (index.get(projectId) ?? []).map((instance) => instance.id),
      );

      return {
        legacyMs,
        indexedMs,
        speedup: legacyMs / Math.max(indexedMs, 0.001),
        equivalent:
          legacyChecksum === indexedChecksum &&
          JSON.stringify(expected) === JSON.stringify(actual),
      };
    },
    reset: () => {
      useStore.setState({
        view: "home",
        viewStack: [],
        projectRef: null,
        catalogInstallRequest: null,
      });
    },
  };
}

const VIEWS: Record<View, React.ComponentType> = {
  home: HomeView,
  instances: InstancesView,
  accounts: AccountsView,
  settings: SettingsView,
  instance: InstanceView,
  servers: ServersView,
  server: ServerView,
  discover: DiscoverView,
  convert: ConversionView,
  project: ProjectView,
  stats: StatsView,
  logs: LogsView,
};

function App() {
  const view = useStore((s) => s.view);
  const ready = useStore((s) => s.ready);
  const error = useStore((s) => s.error);
  const init = useStore((s) => s.init);
  const banner = useStore((s) =>
    s.selectedInstanceId ? (s.media[s.selectedInstanceId]?.accent ?? null) : null,
  );
  const settings = useStore((s) => s.settings);
  const servers = useStore((s) => s.servers);
  const serverRunning = useStore((s) => s.serverRunning);
  const catalogInstallRequest = useStore((s) => s.catalogInstallRequest);
  const dismissCatalogInstall = useStore((s) => s.dismissCatalogInstall);
  const hasContextHeader = useStore((s) => s.viewStack.length > 0);

  const [maximized, setMaximized] = useState(false);
  const [closing, setClosing] = useState(false);
  const closeApproved = useRef(false);
  const onboarding = useStore((s) => s.ready && s.settings?.onboarded === false);

  useEffect(() => {
    init();
  }, [init]);

  const stopServersAndClose = async () => {
    const running = Object.values(useStore.getState().serverRunning).filter(isLive);
    await Promise.allSettled(running.map((info) => api.stopServer(info.server_id)));
    closeApproved.current = true;
    await getCurrentWindow().destroy();
  };

  useEffect(() => {
    const win = getCurrentWindow();
    const sync = () => win.isMaximized().then(setMaximized);
    sync();
    const unlisten = win.onResized(sync);
    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  useEffect(() => {
    const win = getCurrentWindow();
    const unlisten = win.onCloseRequested((event) => {
      if (closeApproved.current) return;
      const state = useStore.getState();
      const running = Object.values(state.serverRunning).filter(isLive);
      if (running.length === 0) return;
      if (state.settings?.server_shutdown === "leave") return;
      event.preventDefault();
      if (state.settings?.server_shutdown === "stop") {
        void stopServersAndClose();
        return;
      }
      setClosing(true);
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  useEffect(() => {
    applyTheme(themeVars(settings, onboarding ? null : banner));
  }, [settings, banner, onboarding]);


  const Current = VIEWS[view];
  const immersive = view === "project";

  return (
    <ContentInstallerProvider>
    <div
      className={cn(
        "flex h-full w-full overflow-hidden bg-void text-content",
        !embedded && !maximized && "rounded-xl border border-border-soft",
      )}
    >
      <WindowFrame enabled={!embedded && !maximized} />
      <Toaster
        theme="dark"
        position="bottom-left"
        offset={16}
        gap={8}
        visibleToasts={4}
        toastOptions={{
          classNames: {
            toast:
              "!bg-surface !border !border-border !text-content !rounded-xl !shadow-2xl !font-sans",
            title: "!text-[13px] !font-medium !text-content",
            description: "!text-[11px] !text-content-muted",
            success: "!border-ok/40",
            error: "!border-danger/40",
            closeButton: "!bg-surface-2 !border-border !text-content-faint",
          },
        }}
      />
      <UpdateNotifications />
      {catalogInstallRequest && (
        <Suspense fallback={null}>
          <CatalogInstallModal
            request={catalogInstallRequest}
            onClose={dismissCatalogInstall}
          />
        </Suspense>
      )}
      {!ready ? (
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          <TitleBar />
          <div className="grid flex-1 place-items-center pt-9">
            <img
              src="./logo.png"
              alt=""
              draggable={false}
              className="size-12 animate-pulse object-contain opacity-60"
            />
          </div>
        </div>
      ) : onboarding ? (
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          <TitleBar />
          <Suspense
            fallback={
              <div className="grid flex-1 place-items-center">
                <img
                  src="./logo.png"
                  alt=""
                  draggable={false}
                  className="size-12 animate-pulse object-contain opacity-60"
                />
              </div>
            }
          >
            <Onboarding />
          </Suspense>
        </div>
      ) : (
        <>
      <Sidebar />
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <TitleBar immersive={immersive} />
        <main className={cn("flex min-h-0 min-w-0 flex-1 flex-col", (!embedded || hasContextHeader) && "pt-9")}>
        <MinecraftNav />
        <RecoveryBanner />
        {error ? (
          <div className="grid flex-1 place-items-center px-8 text-center">
            <div>
              <div className="font-display text-lg font-semibold text-danger">
                Failed to start
              </div>
              <p className="mt-1 max-w-md text-sm text-content-muted">{error}</p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="sync" initial={false}>
            <motion.div
              key={view}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: view === "discover" || view === "project" ? 0.06 : 0.15 }}
              className="flex min-h-0 flex-1 flex-col"
            >
              <Suspense fallback={<div className="flex-1" />}>
                <Current />
              </Suspense>
            </motion.div>
          </AnimatePresence>
        )}
        </main>
      </div>
        </>
      )}

      <ConfirmDialog
        open={closing}
        tone="warn"
        title="Servers are still running"
        description={Object.values(serverRunning)
          .filter(isLive)
          .map(
            (info) =>
              servers.find((server) => server.id === info.server_id)?.name ?? info.server_id,
          )
          .join(", ")}
        confirmLabel="Stop them and close"
        cancelLabel="Keep playing"
        onCancel={() => setClosing(false)}
        onConfirm={stopServersAndClose}
      />
    </div>
    </ContentInstallerProvider>
  );
}

export default App;
