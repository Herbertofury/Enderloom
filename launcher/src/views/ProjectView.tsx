import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Loader2,
  Package,
  RefreshCw,
  SquareArrowOutUpRight,
  TriangleAlert,
  X,
} from "lucide-react";

import { openUrl } from "@tauri-apps/plugin-opener";

import { cn } from "../lib/cn";
import { api } from "../lib/api";
import {
  loadProjectDetails,
  loadProjectMirrors,
  peekProjectDetails,
  peekProjectMirrors,
  projectDetailsFromSummary,
} from "../lib/project-cache";
import type {
  Changelog,
  ContentKind,
  ProjectDetails,
  ProjectMirror,
  ProjectSummary,
  ProjectVersion,
  VersionFile,
} from "../lib/types";
import { useContentInstaller } from "../lib/contentInstaller";
import { Markdown } from "../components/project/Markdown";
import { ProjectHero } from "../components/project/ProjectHero";
import { ProjectSidebar } from "../components/project/ProjectSidebar";
import { useActiveProjectIds } from "../lib/useTasks";
import { serverPackFile } from "../lib/servers";
import type { InstallTarget } from "../lib/target";
import { useStore } from "../store";

const VersionBrowser = lazy(() =>
  import("../components/project/VersionBrowser").then((module) => ({
    default: module.VersionBrowser,
  })),
);
const ProjectGallery = lazy(() =>
  import("../components/project/ProjectGallery").then((module) => ({
    default: module.ProjectGallery,
  })),
);
const GetServerModal = lazy(() =>
  import("../components/GetServerModal").then((module) => ({
    default: module.GetServerModal,
  })),
);
const InstanceTargetPicker = lazy(() =>
  import("../components/InstanceTargetPicker").then((module) => ({
    default: module.InstanceTargetPicker,
  })),
);

interface PendingInstall {
  key: string;
  projectId: string;
  versionId: string | null;
}

type Tab = "description" | "versions" | "gallery";

interface ProviderSurfaceState {
  open: boolean;
  visible: boolean;
  provider: string;
  projectKey: string;
  url: string;
  title: string;
  loading: boolean;
  canBack: boolean;
  canForward: boolean;
  error: { code: number; description: string; url: string } | null;
  promoted?: boolean;
  tabId?: string;
  promotedUrl?: string;
}

function githubSourceFrom(details: Array<ProjectDetails | null>): string | null {
  for (const project of details) {
    const source = project?.links.find((link) => link.label.toLowerCase() === "view source");
    if (!source) continue;
    try {
      const url = new URL(source.url);
      if (url.protocol === "https:" && /(^|\.)github\.com$/i.test(url.hostname)) {
        return url.toString();
      }
    } catch {
      // Provider supplied an invalid source URL; do not create a guessed GitHub tab.
    }
  }
  return null;
}

export function ProjectView() {
  const projectRef = useStore((s) => s.projectRef);
  const hasCurseForgeAccess = useStore(
    (s) => !!s.settings?.curseforge_api_key || s.bundledCurseforgeKey,
  );
  const storeKind = useStore((s) => s.searchKind);
  const kind: ContentKind = storeKind ?? "mods";
  const instance = useStore((s) =>
    s.instances.find((i) => i.id === (s.detailInstanceId ?? s.discoverTargetId)),
  );
  const instances = useStore((s) => s.instances);
  const setDiscoverTarget = useStore((s) => s.setDiscoverTarget);
  const setDiscoverServer = useStore((s) => s.setDiscoverServer);
  const serverId = useStore((s) => s.discoverServerId);
  const servers = useStore((s) => s.servers);
  const serverSoftware = useStore((s) => s.serverSoftware);
  const refreshServerContentSources = useStore((s) => s.refreshServerContentSources);
  const server = servers.find((entry) => entry.id === serverId) ?? null;
  const contentServers = useMemo(
    () =>
      servers.filter(
        (entry) =>
          entry.available &&
          !!serverSoftware.find((spec) => spec.id === entry.flavor)?.content_dir,
      ),
    [servers, serverSoftware],
  );
  const destination: InstallTarget | null = server
    ? {
        id: server.id,
        name: server.name,
        version_id: server.version_id,
        loader: server.flavor,
        isServer: true,
      }
    : instance
      ? {
          id: instance.id,
          name: instance.name,
          version_id: instance.version_id,
          loader: instance.loader,
          isServer: false,
        }
      : null;
  const activeProjects = useActiveProjectIds();
  const openProject = useStore((s) => s.openProject);
  const openInstance = useStore((s) => s.openInstance);
  const packInstance = useStore((s) =>
    s.searchKind === "modpacks" && s.projectRef
      ? (s.instances.find((i) => i.pack_project_id === s.projectRef?.id) ?? null)
      : null,
  );
  const sourcesMap = useStore(
    (s) => s.contentSources[`${s.discoverServerId ?? instance?.id}:${s.searchKind}`],
  );
  const refreshContentSources = useStore((s) => s.refreshContentSources);

  const initialCached = projectRef
    ? peekProjectDetails(projectRef.provider, projectRef.id)
    : null;
  const initialDetails =
    initialCached ??
    (projectRef?.seed ? projectDetailsFromSummary(projectRef.provider, projectRef.seed) : null);

  const [tab, setTab] = useState<Tab>("description");
  const [details, setDetails] = useState<ProjectDetails | null>(initialDetails);
  const [detailsComplete, setDetailsComplete] = useState(initialCached !== null);
  const [mirrors, setMirrors] = useState<ProjectMirror[]>(() =>
    projectRef ? (peekProjectMirrors(projectRef.provider, projectRef.id, kind) ?? []) : [],
  );
  const [mirrorDetails, setMirrorDetails] = useState<ProjectDetails[]>([]);
  const [providerSurface, setProviderSurface] = useState<{
    provider: "github";
    url: string;
  } | null>(null);
  const [providerSurfaceState, setProviderSurfaceState] =
    useState<ProviderSurfaceState | null>(null);
  const providerPaneRef = useRef<HTMLDivElement>(null);
  const [versions, setVersions] = useState<ProjectVersion[] | null>(null);
  const [loading, setLoading] = useState(initialDetails === null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [installing, setInstalling] = useState<string | null>(null);
  const [installed, setInstalled] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [changelogs, setChangelogs] = useState<Record<string, Changelog | "loading">>({});
  const [resolvedProjects, setResolvedProjects] = useState<
    Record<string, ProjectSummary | null>
  >({});
  const [needsTarget, setNeedsTarget] = useState<PendingInstall | null>(null);
  const [serverPack, setServerPack] = useState<{
    version: ProjectVersion;
    file: VersionFile;
    fileId: string | null;
  } | null>(null);
  const [pickingTarget, setPickingTarget] = useState(false);

  const isPack = kind === "modpacks";
  const canResolveProviderMirror =
    projectRef?.provider !== "modrinth" || hasCurseForgeAccess;
  const loader = kind === "mods" ? (destination?.loader ?? null) : null;
  const contentInstaller = useContentInstaller();

  useEffect(() => {
    if (serverId) void refreshServerContentSources(serverId);
    else if (instance && storeKind) void refreshContentSources(instance.id, storeKind);
  }, [instance?.id, serverId, storeKind, refreshContentSources, refreshServerContentSources]);

  useEffect(() => {
    if (!projectRef) return;
    let live = true;
    const cached = peekProjectDetails(projectRef.provider, projectRef.id);
    const seed =
      cached ??
      (projectRef.seed ? projectDetailsFromSummary(projectRef.provider, projectRef.seed) : null);

    setLoading(seed === null);
    setDetails(seed);
    setDetailsComplete(cached !== null);
    setMirrors(peekProjectMirrors(projectRef.provider, projectRef.id, kind) ?? []);
    setMirrorDetails([]);
    setProviderSurface(null);
    setVersions(null);
    setInstalled(new Set());
    setTab("description");
    setError(null);
    setNotice(null);
    setExpandedId(null);
    setChangelogs({});
    setResolvedProjects({});

    const detailRequest = loadProjectDetails(projectRef.provider, projectRef.id);
    detailRequest
      .then((value) => {
        if (!live) return;
        setDetails(value);
        setDetailsComplete(true);
        setError(null);
      })
      .catch((cause) => {
        if (live) setError(String(cause));
      })
      .finally(() => {
        if (live) setLoading(false);
      });

    if (canResolveProviderMirror) {
      void loadProjectMirrors(projectRef.provider, projectRef.id, kind)
        .then((value) => {
          if (live) setMirrors(value);
        })
        .catch(() => {});
    }

    return () => {
      live = false;
    };
  }, [projectRef?.provider, projectRef?.id, kind, canResolveProviderMirror]);

  useEffect(() => {
    let live = true;
    if (mirrors.length === 0) {
      setMirrorDetails([]);
      return () => {
        live = false;
      };
    }

    void Promise.all(
      mirrors.map((mirror) =>
        loadProjectDetails(mirror.provider, mirror.project.id).catch(() => null),
      ),
    ).then((resolved) => {
      if (live) setMirrorDetails(resolved.filter((value): value is ProjectDetails => value !== null));
    });

    return () => {
      live = false;
    };
  }, [mirrors]);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    void window.enderloomLauncher
      ?.listen<ProviderSurfaceState>("provider-surface-state", (state) => {
        setProviderSurfaceState(state);
      })
      .then((stop) => {
        unlisten = stop;
      });
    return () => unlisten?.();
  }, []);

  useEffect(
    () => () => {
      void window.enderloomLauncher?.providerSurface({ action: "dispose" }).catch(() => {});
    },
    [],
  );

  const syncProviderSurfaceBounds = useCallback(() => {
    const element = providerPaneRef.current;
    if (!element || !providerSurface) return;
    const rect = element.getBoundingClientRect();
    void window.enderloomLauncher
      ?.providerSurface({
        action: "layout",
        rect: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        },
      })
      .catch(() => {});
  }, [providerSurface]);

  useEffect(() => {
    if (!projectRef) return;
    const bridge = window.enderloomLauncher;
    if (!bridge) return;

    if (!providerSurface) {
      void bridge.providerSurface({ action: "hide" }).catch(() => {});
      return;
    }

    const element = providerPaneRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    // Key embedded source surfaces by the canonical source URL, not whichever
    // Modrinth/CurseForge mirror is currently selected. That preserves the live
    // GitHub page/history while switching provider mirrors for the same project.
    const projectKey = `${providerSurface.provider}:${providerSurface.url
      .replace(/\.git\/?$/i, "")
      .replace(/\/+$/, "")
      .toLowerCase()}`;
    void bridge
      .providerSurface({
        action: "open",
        provider: providerSurface.provider,
        projectKey,
        url: providerSurface.url,
        rect: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        },
      })
      .then((state) => setProviderSurfaceState(state))
      .catch((cause) => setError(String(cause)));

    const observer = new ResizeObserver(syncProviderSurfaceBounds);
    observer.observe(element);
    window.addEventListener("resize", syncProviderSurfaceBounds);
    const frame = requestAnimationFrame(syncProviderSurfaceBounds);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", syncProviderSurfaceBounds);
    };
  }, [
    projectRef?.provider,
    projectRef?.id,
    providerSurface,
    syncProviderSurfaceBounds,
  ]);

  const providerCommand = useCallback(
    (action: "back" | "forward" | "reload" | "promote" | "external" | "copy-url") => {
      void window.enderloomLauncher
        ?.providerSurface({
          action,
          url: providerSurface?.url,
        })
        .then((state) => setProviderSurfaceState(state))
        .catch((cause) => setError(String(cause)));
    },
    [providerSurface?.url],
  );

  useEffect(() => {
    setVersions(null);
  }, [destination?.id, destination?.version_id, loader]);

  useEffect(() => {
    if (versions !== null || !projectRef) return;
    let live = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const loadVersions = () => {
      void api
        .listProjectVersions(
          projectRef.provider,
          projectRef.id,
          kind,
          destination?.version_id ?? "",
          loader,
        )
        .then((v) => live && setVersions(v))
        .catch((e) => {
          if (live) {
            setVersions([]);
            setError(String(e));
          }
        });
    };

    // Keep the project-open critical path dedicated to the visible description/details.
    // Versions still prewarm shortly after paint, and load immediately if the user asks
    // for them or a modpack needs server-pack metadata in the hero.
    if (tab === "versions" || isPack) {
      loadVersions();
    } else {
      timer = setTimeout(loadVersions, 450);
    }

    return () => {
      live = false;
      if (timer) clearTimeout(timer);
    };
  }, [
    versions,
    tab,
    isPack,
    projectRef?.provider,
    projectRef?.id,
    destination?.id,
    destination?.version_id,
    kind,
    loader,
  ]);

  const heroServerVersion = useMemo(
    () =>
      (versions ?? []).find(
        (version) => version.server_pack_file_id || serverPackFile(version.files),
      ) ?? null,
    [versions],
  );

  const githubSource = useMemo(
    () => githubSourceFrom([details, ...mirrorDetails]),
    [details, mirrorDetails],
  );

  if (!projectRef) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-sm text-content-muted">
        <Package className="size-6 text-content-faint" />
        No project selected.
      </div>
    );
  }

  const busyProject = installing !== null || activeProjects.has(projectRef.id);

  const installedEntry = busyProject
    ? null
    : isPack
      ? packInstance
        ? { file_name: packInstance.name, version_id: packInstance.pack_version_id }
        : null
      : (sourcesMap?.[projectRef.id] ?? null);

  const installPack = async (versionId: string | null) => {
    setInstalling(versionId ?? "latest");
    setError(null);
    setNotice(null);
    try {
      let vid = versionId;
      if (!vid) {
        const created = await contentInstaller.installLatestPack(
          projectRef.provider,
          projectRef.id,
          details?.title ?? projectRef.title ?? "Modpack",
          details?.icon_url ?? null,
        );
        if (created) setNotice(`Created instance ${created.name}`);
        return;
      }
      const created = await contentInstaller.installPack(
        projectRef.provider,
        projectRef.id,
        vid,
        details?.title ?? projectRef.title ?? "Modpack",
        details?.icon_url ?? null,
      );
      if (created) setNotice(`Created instance ${created.name}`);
    } catch (e) {
      setError(String(e));
    } finally {
      setInstalling(null);
    }
  };

  const doInstall = async (target: PendingInstall, into: InstallTarget) => {
    setInstalling(target.key);
    setError(null);
    setNotice(null);
    try {
      const files = await contentInstaller.installContent({
        provider: projectRef.provider,
        projectId: target.projectId,
        instanceId: into.isServer ? null : into.id,
        serverId: into.isServer ? into.id : null,
        kind,
        gameVersion: into.version_id,
        loader: kind === "mods" ? into.loader : null,
        versionId: target.versionId,
        title: details?.title ?? projectRef.title ?? "Content",
        iconUrl: details?.icon_url ?? null,
      });
      if (!files) return;
      setInstalled((prev) => new Set(prev).add(target.key));
      setNotice(
        files.length > 1
          ? `Installed ${files[0]?.title ?? "the file"} and ${files.length - 1} more into ${into.name}`
          : `Installed ${files[0]?.title ?? "the file"} into ${into.name}`,
      );
    } catch (e) {
      setError(String(e));
    } finally {
      setInstalling(null);
    }
  };

  const openServerPack = async (version: ProjectVersion) => {
    setError(null);
    try {
      const local = serverPackFile(version.files);
      const file = local
        ? local
        : version.server_pack_file_id
          ? await api.getServerPackFile(projectRef.id, version.server_pack_file_id, version.id)
          : null;
      if (!file) {
        setError("This version does not publish a server pack.");
        return;
      }
      setServerPack({ version, file, fileId: version.server_pack_file_id });
    } catch (cause) {
      setError(String(cause));
    }
  };

  const beginInstall = async (
    target: PendingInstall,
    into: InstallTarget | null = destination,
  ) => {
    if (isPack) {
      await installPack(target.versionId);
      return;
    }
    if (!into) {
      setNeedsTarget(target);
      return;
    }
    await doInstall(target, into);
  };

  const install = (versionId: string | null) =>
    beginInstall({ key: versionId ?? "latest", projectId: projectRef.id, versionId });

  const toggleExpand = async (v: ProjectVersion) => {
    if (expandedId === v.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(v.id);

    const unresolved = v.dependencies
      .map((d) => d.project_id)
      .filter((id) => !(id in resolvedProjects));
    if (unresolved.length > 0) {
      setResolvedProjects((prev) => {
        const next = { ...prev };
        unresolved.forEach((id) => (next[id] = null));
        return next;
      });
      api
        .resolveProjects(projectRef.provider, unresolved)
        .then((results) =>
          setResolvedProjects((prev) => {
            const next = { ...prev };
            results.forEach((r) => (next[r.id] = r));
            return next;
          }),
        )
        .catch(() => {});
    }

    if (changelogs[v.id]) return;
    if (v.changelog) {
      setChangelogs((prev) => ({ ...prev, [v.id]: { body: v.changelog!, format: "markdown" } }));
      return;
    }
    setChangelogs((prev) => ({ ...prev, [v.id]: "loading" }));
    try {
      const changelog = await api.getVersionChangelog(projectRef.provider, projectRef.id, v.id);
      setChangelogs((prev) => ({ ...prev, [v.id]: changelog }));
    } catch {
      setChangelogs((prev) => ({ ...prev, [v.id]: { body: "", format: "markdown" } }));
    }
  };

  const gallery = details?.gallery ?? [];
  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "description", label: "Description" },
    { id: "versions", label: "Versions" },
    ...(gallery.length > 0 ? [{ id: "gallery" as Tab, label: "Gallery" }] : []),
  ];

  return (
    <div className="-mt-9 flex min-h-0 flex-1 flex-col">
      <ProjectHero
        details={details}
        provider={projectRef.provider}
        loading={loading}
        isPack={isPack}
        installedLabel={installedEntry && !isPack ? "Installed" : null}
        installedNote={
          isPack && packInstance && !busyProject ? `Installed as ${packInstance.name}` : null
        }
        installing={busyProject}
        instances={instances}
        target={instance ?? null}
        onSelectTarget={(picked) => setDiscoverTarget(picked?.id ?? null)}
        servers={kind === "mods" ? contentServers : []}
        selectedServerId={serverId}
        onSelectServer={setDiscoverServer}
        showTargetPicker={!isPack}
        onInstall={() => install(null)}
        onGetServer={
          heroServerVersion ? () => void openServerPack(heroServerVersion) : undefined
        }
        onOpenInstalled={() =>
          isPack && packInstance ? openInstance(packInstance.id) : setTab("versions")
        }
      />

      <div className="flex items-center gap-1 border-b border-border-soft px-6 py-2">
        <button
          type="button"
          onClick={() => setProviderSurface(null)}
          className={cn(
            "rounded-lg px-2.5 py-1.5 text-xs font-semibold capitalize transition-colors",
            !providerSurface
              ? "bg-surface-3 text-content"
              : "text-content-muted hover:bg-surface-3 hover:text-content",
          )}
        >
          {projectRef.provider}
        </button>
        {mirrors.map((mirror) => (
          <button
            key={`${mirror.provider}:${mirror.project.id}`}
            type="button"
            onClick={() => {
              setProviderSurface(null);
              openProject(
                mirror.provider,
                mirror.project.id,
                kind,
                mirror.project.title,
                mirror.project,
              );
            }}
            title={`Same project on ${mirror.provider} · ${mirror.confidence}% identity confidence`}
            className="rounded-lg px-2.5 py-1.5 text-xs font-medium capitalize text-content-muted transition-colors hover:bg-surface-3 hover:text-content"
          >
            {mirror.provider}
          </button>
        ))}
        {githubSource && (
          <button
            type="button"
            draggable
            onDragStart={(event) => {
              const dragUrl =
                providerSurface?.provider === "github" && providerSurfaceState?.url
                  ? providerSurfaceState.url
                  : githubSource;
              event.dataTransfer.effectAllowed = "copy";
              event.dataTransfer.setData("application/x-enderloom-provider-page", dragUrl);
              event.dataTransfer.setData("text/uri-list", dragUrl);
              event.dataTransfer.setData("text/plain", dragUrl);
            }}
            onClick={() => {
              if (typeof window.enderloomLauncher?.providerSurface === "function") {
                setProviderSurface({ provider: "github", url: githubSource });
              } else {
                void openUrl(githubSource);
              }
            }}
            title="Verified source repository · drag to the top tab strip to promote it"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
              providerSurface?.provider === "github"
                ? "bg-surface-3 text-content"
                : "text-content-muted hover:bg-surface-3 hover:text-content",
            )}
          >
            <span aria-hidden className="text-[10px] font-black tracking-tight text-content-faint">GH</span>
            GitHub
          </button>
        )}
        {providerSurface && (
          <div className="ml-auto flex items-center gap-1">
            {providerSurfaceState?.loading && (
              <Loader2 className="mr-1 size-3.5 animate-spin text-content-faint" />
            )}
            <button
              type="button"
              onClick={() => providerCommand("back")}
              disabled={!providerSurfaceState?.canBack}
              title="Back"
              aria-label="Back in provider page"
              className="rounded-md p-1.5 text-content-muted hover:bg-surface-3 hover:text-content disabled:opacity-30"
            >
              <ArrowLeft className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => providerCommand("forward")}
              disabled={!providerSurfaceState?.canForward}
              title="Forward"
              aria-label="Forward in provider page"
              className="rounded-md p-1.5 text-content-muted hover:bg-surface-3 hover:text-content disabled:opacity-30"
            >
              <ArrowRight className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => providerCommand("reload")}
              title={providerSurfaceState?.loading ? "Stop" : "Reload"}
              aria-label={providerSurfaceState?.loading ? "Stop provider page" : "Reload provider page"}
              className="rounded-md p-1.5 text-content-muted hover:bg-surface-3 hover:text-content"
            >
              <RefreshCw className={cn("size-3.5", providerSurfaceState?.loading && "animate-spin")} />
            </button>
            <button
              type="button"
              onClick={() => providerCommand("promote")}
              title="Open current provider page in a normal Enderloom tab"
              aria-label="Open provider page in new tab"
              className="rounded-md p-1.5 text-content-muted hover:bg-surface-3 hover:text-content"
            >
              <SquareArrowOutUpRight className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => providerCommand("external")}
              title="Open current provider page in your default browser"
              aria-label="Open provider page in your browser"
              className="rounded-md p-1.5 text-content-muted hover:bg-surface-3 hover:text-content"
            >
              <ExternalLink className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => providerCommand("copy-url")}
              title="Copy current provider page URL"
              aria-label="Copy provider page URL"
              className="rounded-md p-1.5 text-[10px] font-black text-content-muted hover:bg-surface-3 hover:text-content"
            >
              URL
            </button>
            <button
              type="button"
              onClick={() => setProviderSurface(null)}
              title="Close provider page"
              aria-label="Close provider page"
              className="rounded-md p-1.5 text-content-muted hover:bg-surface-3 hover:text-content"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-1 border-b border-border-soft px-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setProviderSurface(null);
              setTab(t.id);
            }}
            className={cn(
              "relative px-4 py-2.5 text-sm font-medium transition-colors",
              !providerSurface && tab === t.id
                ? "text-content"
                : "text-content-faint hover:text-content-muted",
            )}
          >
            {t.label}
            {!providerSurface && tab === t.id && (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-(--accent) transition-colors duration-500" />
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="mx-6 mt-3 flex items-start gap-2 rounded-lg border border-warn/30 bg-warn/10 px-3 py-2 text-xs text-warn">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
          <span className="wrap-break-word">{error}</span>
        </div>
      )}
      {notice && (
        <div className="mx-6 mt-3 rounded-lg border border-ok/30 bg-ok/10 px-3 py-2 text-xs text-ok">
          {notice}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto">
        {providerSurface ? (
          <div
            ref={providerPaneRef}
            className="relative h-full min-h-[240px] bg-void"
            aria-label={`${providerSurface.provider} project page`}
          >
            {providerSurfaceState?.error && (
              <div className="absolute inset-0 grid place-items-center px-6">
                <div className="w-full max-w-xl rounded-2xl border border-warn/30 bg-surface-2 p-5 text-center shadow-xl">
                  <TriangleAlert className="mx-auto size-6 text-warn" />
                  <div className="mt-3 text-sm font-semibold text-content">
                    Could not load {providerSurface.provider}
                  </div>
                  <p className="mt-1 break-words text-xs leading-5 text-content-muted">
                    {providerSurfaceState.error.description || "The provider page could not be loaded."}
                  </p>
                  <p className="mt-1 truncate text-[11px] text-content-faint">
                    {providerSurfaceState.error.url || providerSurface.url}
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => providerCommand("reload")}
                      className="rounded-lg bg-surface-3 px-3 py-2 text-xs font-semibold text-content hover:bg-surface-4"
                    >
                      Retry
                    </button>
                    <button
                      type="button"
                      onClick={() => providerCommand("external")}
                      className="rounded-lg border border-border-soft px-3 py-2 text-xs font-medium text-content-muted hover:bg-surface-3 hover:text-content"
                    >
                      Open in your browser
                    </button>
                    <button
                      type="button"
                      onClick={() => providerCommand("copy-url")}
                      className="rounded-lg border border-border-soft px-3 py-2 text-xs font-medium text-content-muted hover:bg-surface-3 hover:text-content"
                    >
                      Copy URL
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : !details ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-content-muted">
            <Loader2 className="size-4 animate-spin" />
            Loading project
          </div>
        ) : tab === "description" ? (
          <div className="mx-auto flex max-w-5xl items-start gap-6 px-6 py-6">
            <div className="min-w-0 flex-1">
              {!detailsComplete ? (
                <div className="space-y-3">
                  {details.description ? (
                    <p className="max-w-3xl text-sm leading-6 text-content-muted">
                      {details.description}
                    </p>
                  ) : null}
                  <div className="inline-flex items-center gap-2 text-xs text-content-faint">
                    <Loader2 className="size-3 animate-spin" />
                    Refreshing complete project details
                  </div>
                </div>
              ) : details.body.trim() ? (
                <Markdown body={details.body} format={details.body_format} />
              ) : (
                <p className="text-sm text-content-faint">
                  This project has no description.
                </p>
              )}
            </div>
            <ProjectSidebar
              details={details}
              instanceVersion={destination?.version_id ?? null}
              instanceLoader={loader}
            />
          </div>
        ) : tab === "versions" ? (
          <div className="mx-auto max-w-4xl px-6 py-4">
            {versions === null ? (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-content-muted">
                <Loader2 className="size-4 animate-spin" />
                Loading versions
              </div>
            ) : (
              <Suspense fallback={<div className="py-8" />}>
                <VersionBrowser
                versions={versions}
                kind={kind}
                isPack={isPack}
                instanceVersion={destination?.version_id ?? null}
                instanceLoader={loader}
                hasInstance={!!destination}
                installedVersionId={installedEntry?.version_id ?? null}
                onGetServer={(version) => void openServerPack(version)}
                installingKey={installing ?? contentInstaller.installingVersionId}
                installedKeys={installed}
                resolvedProjects={resolvedProjects}
                changelogs={changelogs}
                websiteUrl={details?.website_url ?? null}
                provider={projectRef.provider}
                expandedId={expandedId}
                onExpand={toggleExpand}
                onInstall={(versionId) => install(versionId)}
                onInstallDependency={(dep) =>
                  beginInstall({ key: `dep:${dep.id}`, projectId: dep.id, versionId: null })
                }
                onOpenProject={(projectId) =>
                  openProject(projectRef.provider, projectId, kind)
                }
                onChooseInstance={() => setPickingTarget(true)}
                />
              </Suspense>
            )}
          </div>
        ) : tab === "gallery" ? (
          <Suspense fallback={<div className="flex-1" />}>
            <ProjectGallery images={gallery} />
          </Suspense>
        ) : null}
      </div>

      {serverPack && (
        <Suspense fallback={null}>
          <GetServerModal
            open
            title={details?.title ?? projectRef.title ?? "Modpack"}
            version={serverPack.version}
            file={serverPack.file}
            fileId={serverPack.fileId}
            projectId={projectRef.id}
            onClose={() => setServerPack(null)}
          />
        </Suspense>
      )}

      {(needsTarget || pickingTarget) && (
        <Suspense fallback={null}>
          <InstanceTargetPicker
            instances={instances}
            selected={null}
            modalFor={details?.title ?? "this project"}
            onSelect={(picked) => {
              const target = needsTarget;
              setNeedsTarget(null);
              setPickingTarget(false);
              if (picked) {
                setDiscoverTarget(picked.id);
                if (target) {
                  void beginInstall(target, {
                    id: picked.id,
                    name: picked.name,
                    version_id: picked.version_id,
                    loader: picked.loader,
                    isServer: false,
                  });
                }
              }
            }}
          />
        </Suspense>
      )}
    </div>
  );
}
