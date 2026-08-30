import { useEffect, useMemo, useState } from "react";
import {
  Boxes,
  Check,
  Download,
  Eye,
  EyeOff,
  Loader2,
  Search,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";

import { api } from "../lib/api";
import { cn } from "../lib/cn";
import { loaderLabel } from "../lib/loader";
import { logoSrc } from "../lib/media";
import type {
  CatalogProjectPayload,
  ContentKind,
  Instance,
  ProjectDetails,
  ProjectVersion,
} from "../lib/types";
import { useStore } from "../store";
import { useContentInstaller } from "./CurseForgeDownloadModal";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "./Modal";

const KIND_LABELS: Record<ContentKind, string> = {
  mods: "mod",
  modpacks: "modpack",
  resourcepacks: "resource pack",
  shaderpacks: "shader pack",
  schematics: "schematic",
  datapacks: "data pack",
};

function normalized(value: string | null | undefined) {
  return String(value ?? "").trim().toLowerCase();
}

function matchesInstance(
  version: ProjectVersion,
  instance: Instance,
  kind: ContentKind,
) {
  if (!version.game_versions.includes(instance.version_id)) return false;
  if (kind !== "mods") return true;
  const loaders = version.loaders.map(normalized);
  const loader = normalized(instance.loader);
  if (loader) return loaders.length === 0 || loaders.includes(loader);
  return loaders.length === 0 || loaders.includes("vanilla") || loaders.includes("minecraft");
}

function bestVersion(
  versions: ProjectVersion[],
  instance: Instance,
  kind: ContentKind,
) {
  const matches = versions.filter((version) => matchesInstance(version, instance, kind));
  return (
    matches.find((version) => version.channel === "release") ??
    matches.find((version) => version.channel === "beta") ??
    matches[0] ??
    null
  );
}

async function resolveCatalogProject(request: CatalogProjectPayload) {
  try {
    const details = await api.getProjectDetails(request.provider, request.projectId);
    return { projectId: request.projectId, details };
  } catch (directError) {
    if (request.provider !== "curseforge") throw directError;
    const query = request.projectId.replace(/[-_]+/g, " ");
    const page = await api.searchContent("curseforge", request.kind, {
      query,
      game_versions: [],
      loaders: [],
      categories: [],
      environment: null,
      open_source_only: false,
      sort: "relevance",
      offset: 0,
      limit: 50,
    });
    const slug = normalized(request.projectId);
    const title = normalized(request.title);
    const exact =
      page.hits.find((hit) => normalized(hit.slug) === slug) ??
      page.hits.find((hit) => normalized(hit.title) === title);
    if (!exact) throw directError;
    const details = await api.getProjectDetails("curseforge", exact.id);
    return { projectId: exact.id, details };
  }
}

function SourceBadge({ instance }: { instance: Instance }) {
  const source = normalized(instance.import_source);
  if (source !== "modrinth" && source !== "curseforge") {
    return instance.external ? (
      <span className="rounded bg-surface-3 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-content-faint">
        External
      </span>
    ) : null;
  }
  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
        source === "modrinth" ? "bg-ok/15 text-ok" : "bg-lava/15 text-lava-bright",
      )}
    >
      {source === "modrinth" ? "Modrinth" : "CurseForge"} · in place
    </span>
  );
}

export function CatalogInstallModal({
  request,
  onClose,
}: {
  request: CatalogProjectPayload | null;
  onClose: () => void;
}) {
  const instances = useStore((state) => state.instances);
  const selectedInstanceId = useStore((state) => state.selectedInstanceId);
  const contentInstaller = useContentInstaller();
  const [details, setDetails] = useState<ProjectDetails | null>(null);
  const [projectId, setProjectId] = useState("");
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [installed, setInstalled] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [compatibleOnly, setCompatibleOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [failures, setFailures] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!request) return;
    let live = true;
    setDetails(null);
    setProjectId("");
    setVersions([]);
    setInstalled(new Set());
    setSelected(new Set());
    setSearch("");
    setCompatibleOnly(false);
    setFailures({});
    setError(null);
    setLoading(true);
    void resolveCatalogProject(request)
      .then(async (resolved) => {
        const projectVersions = await api.listProjectVersions(
          request.provider,
          resolved.projectId,
          request.kind,
          "",
          null,
        );
        const installedRows = await Promise.all(
          instances.map(async (instance) => [
            instance.id,
            await api
              .getInstalledProjectFile(instance.id, request.kind, resolved.projectId)
              .then(Boolean)
              .catch(() => false),
          ] as const),
        );
        if (!live) return;
        const alreadyInstalled = new Set(
          installedRows.filter(([, present]) => present).map(([id]) => id),
        );
        const compatible = instances.filter(
          (instance) =>
            instance.available !== false &&
            !alreadyInstalled.has(instance.id) &&
            !!bestVersion(projectVersions, instance, request.kind),
        );
        const preferred =
          compatible.find((instance) => instance.id === selectedInstanceId) ?? compatible[0];
        setDetails(resolved.details);
        setProjectId(resolved.projectId);
        setVersions(projectVersions);
        setInstalled(alreadyInstalled);
        setSelected(preferred ? new Set([preferred.id]) : new Set());
      })
      .catch((cause) => live && setError(String(cause)))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [request?.catalogId, request?.projectId, request?.provider, request?.kind, instances, selectedInstanceId]);

  const versionByInstance = useMemo(
    () =>
      new Map(
        instances.map((instance) => [
          instance.id,
          request ? bestVersion(versions, instance, request.kind) : null,
        ]),
      ),
    [instances, request, versions],
  );
  const compatibleIds = useMemo(
    () =>
      new Set(
        instances
          .filter(
            (instance) =>
              instance.available !== false &&
              !installed.has(instance.id) &&
              !!versionByInstance.get(instance.id),
          )
          .map((instance) => instance.id),
      ),
    [instances, installed, versionByInstance],
  );
  const rows = useMemo(() => {
    const needle = normalized(search);
    return [...instances]
      .filter((instance) => !needle || normalized(instance.name).includes(needle))
      .filter((instance) => !compatibleOnly || compatibleIds.has(instance.id))
      .sort(
        (a, b) =>
          Number(compatibleIds.has(b.id)) - Number(compatibleIds.has(a.id)) ||
          a.name.localeCompare(b.name),
      );
  }, [instances, search, compatibleOnly, compatibleIds]);

  const toggle = (id: string) => {
    if (!compatibleIds.has(id) || installing) return;
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const install = async () => {
    if (!request || !projectId || selected.size === 0) return;
    const targets = instances.filter((instance) => selected.has(instance.id));
    setInstalling(true);
    setFailures({});
    setError(null);
    let succeeded = 0;
    const failed: Record<string, string> = {};
    for (let index = 0; index < targets.length; index += 1) {
      const instance = targets[index];
      const version = versionByInstance.get(instance.id);
      if (!version) continue;
      setProgress(`Installing ${index + 1} of ${targets.length} · ${instance.name}`);
      try {
        const files = await contentInstaller.installContent({
          provider: request.provider,
          projectId,
          instanceId: instance.id,
          kind: request.kind,
          gameVersion: instance.version_id,
          loader: request.kind === "mods" ? instance.loader : null,
          versionId: version.id,
          title: details?.title ?? request.title,
          iconUrl: details?.icon_url ?? null,
        });
        if (!files) break;
        succeeded += 1;
        setInstalled((current) => new Set(current).add(instance.id));
        setSelected((current) => {
          const next = new Set(current);
          next.delete(instance.id);
          return next;
        });
      } catch (cause) {
        failed[instance.id] = String(cause);
        setFailures({ ...failed });
      }
    }
    setInstalling(false);
    setProgress("");
    if (succeeded > 0) {
      toast.success(
        `${details?.title ?? request.title} installed to ${succeeded} instance${succeeded === 1 ? "" : "s"}`,
        failed && Object.keys(failed).length > 0
          ? { description: `${Object.keys(failed).length} target${Object.keys(failed).length === 1 ? " needs" : "s need"} attention.` }
          : undefined,
      );
    }
    if (succeeded === targets.length) onClose();
  };

  const icon = details?.icon_url ?? null;
  const selectedCount = selected.size;
  const kindLabel = request ? KIND_LABELS[request.kind] : "project";

  return (
    <Modal
      open={!!request}
      onClose={onClose}
      size="wide"
      className="h-[min(720px,calc(100vh-48px))]"
      dismissable={!installing}
      labelledBy="catalog-install-title"
    >
      <ModalHeader
        id="catalog-install-title"
        title="Install project"
        subtitle={`Choose one or several compatible instances. External profiles stay in their original launcher folders.`}
        icon={
          icon ? (
            <img src={icon} alt="" className="size-10 rounded-xl bg-surface-3 object-cover" />
          ) : (
            <span className="grid size-10 place-items-center rounded-xl bg-(--accent)/15 text-(--accent)">
              <Download className="size-5" />
            </span>
          )
        }
        onClose={installing ? undefined : onClose}
      />

      <div className="border-b border-border-soft px-5 py-3.5">
        <div className="flex items-center gap-3 rounded-xl border border-border-soft bg-void/60 p-3">
          {icon ? (
            <img src={icon} alt="" className="size-11 rounded-xl bg-surface-3 object-cover" />
          ) : (
            <span className="grid size-11 place-items-center rounded-xl bg-surface-3 text-content-faint">
              <Boxes className="size-5" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-content">
              {details?.title ?? request?.title ?? "Catalog project"}
            </div>
            <div className="mt-0.5 text-[11px] text-content-faint">
              {request?.provider === "modrinth" ? "Modrinth" : "CurseForge"} · {kindLabel}
              {versions.length > 0 ? ` · ${versions.length} published versions checked` : ""}
            </div>
          </div>
          <span className="rounded-full border border-ok/25 bg-ok/10 px-2.5 py-1 text-[10px] font-semibold text-ok">
            {compatibleIds.size} compatible
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-border-soft px-5 py-3">
        <label className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 focus-within:border-(--accent)/50">
          <Search className="size-4 shrink-0 text-content-faint" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search instances"
            className="min-w-0 flex-1 bg-transparent text-xs text-content outline-none placeholder:text-content-faint"
          />
        </label>
        <button
          type="button"
          onClick={() => setCompatibleOnly((value) => !value)}
          title={compatibleOnly ? "Show every instance" : "Show compatible instances only"}
          className={cn(
            "grid size-9 place-items-center rounded-lg border transition-colors",
            compatibleOnly
              ? "border-(--accent)/40 bg-(--accent)/10 text-(--accent)"
              : "border-border bg-surface-2 text-content-muted hover:text-content",
          )}
        >
          {compatibleOnly ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        </button>
        <button
          type="button"
          onClick={() => setSelected(new Set(compatibleIds))}
          disabled={compatibleIds.size === 0 || installing}
          className="h-9 rounded-lg border border-border bg-surface-2 px-3 text-xs font-medium text-content-muted transition-colors hover:text-content disabled:opacity-40"
        >
          Select all compatible
        </button>
      </div>

      <ModalBody className="p-2">
        {loading ? (
          <div className="grid h-full place-items-center text-sm text-content-muted">
            <span className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin text-(--accent)" /> Checking every instance
            </span>
          </div>
        ) : error ? (
          <div className="m-3 rounded-xl border border-danger/30 bg-danger/[0.06] p-4 text-sm text-danger">
            {error}
          </div>
        ) : rows.length === 0 ? (
          <div className="grid h-full place-items-center text-sm text-content-faint">
            No matching instances.
          </div>
        ) : (
          rows.map((instance) => {
            const compatible = compatibleIds.has(instance.id);
            const isInstalled = installed.has(instance.id);
            const unavailable = instance.available === false;
            const selectedRow = selected.has(instance.id);
            const version = versionByInstance.get(instance.id);
            const logo = logoSrc(instance.logo);
            const failed = failures[instance.id];
            return (
              <button
                key={instance.id}
                type="button"
                onClick={() => toggle(instance.id)}
                disabled={!compatible || installing}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
                  selectedRow
                    ? "border-(--accent)/35 bg-(--accent)/[0.08]"
                    : "border-transparent hover:border-border-soft hover:bg-surface-2/60",
                  (!compatible || installing) && "cursor-not-allowed opacity-65",
                  failed && "border-danger/30 bg-danger/[0.05] opacity-100",
                )}
              >
                <span
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded-md border",
                    selectedRow
                      ? "border-(--accent) bg-(--accent) text-black"
                      : "border-border bg-surface-3 text-transparent",
                  )}
                >
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                {logo ? (
                  <img src={logo} alt="" className="size-10 shrink-0 rounded-xl bg-surface-3 object-cover" />
                ) : (
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface-3 text-content-faint">
                    <Boxes className="size-4" />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-sm font-medium text-content">{instance.name}</span>
                    <SourceBadge instance={instance} />
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-content-faint">
                    Minecraft {instance.version_id} · {loaderLabel(instance)}
                    {version ? ` · ${version.version_number || version.name}` : ""}
                  </span>
                  {failed && <span className="mt-0.5 block truncate text-[10px] text-danger">{failed}</span>}
                </span>
                {isInstalled ? (
                  <span className="rounded bg-ok/15 px-2 py-1 text-[10px] font-semibold text-ok">
                    Installed
                  </span>
                ) : unavailable ? (
                  <span className="flex items-center gap-1 rounded bg-danger/15 px-2 py-1 text-[10px] font-semibold text-danger">
                    <TriangleAlert className="size-3" /> Unavailable
                  </span>
                ) : !compatible ? (
                  <span className="flex items-center gap-1 rounded bg-warn/15 px-2 py-1 text-[10px] font-semibold text-warn">
                    <TriangleAlert className="size-3" /> No matching build
                  </span>
                ) : null}
              </button>
            );
          })
        )}
      </ModalBody>

      <ModalFooter className="justify-between">
        <div className="text-[11px] text-content-faint">
          {installing
            ? progress
            : selectedCount > 0
              ? `${selectedCount} instance${selectedCount === 1 ? "" : "s"} selected`
              : "Select at least one compatible instance"}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={installing}
            className="h-9 rounded-lg px-3.5 text-xs font-medium text-content-muted transition-colors hover:bg-surface-3 hover:text-content disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void install()}
            disabled={loading || installing || selectedCount === 0 || !!error}
            className="inline-flex h-9 items-center gap-2 rounded-lg px-4 text-xs font-semibold text-black shadow-lg shadow-(color:--accent-glow) [background:linear-gradient(to_bottom,var(--accent),var(--accent-deep))] hover:[background:linear-gradient(to_bottom,var(--accent-bright),var(--accent))] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {installing ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            {installing ? "Installing" : `Install to ${selectedCount || "selected"}`}
          </button>
        </div>
      </ModalFooter>
    </Modal>
  );
}
