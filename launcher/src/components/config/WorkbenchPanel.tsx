import { configAssociation, createConfigAssociator } from "../../lib/config-associations";
import { ContentIcon } from "../ContentIcon";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowDownToLine,
  ArrowUpRight,
  Braces,
  Check,
  ChevronRight,
  CircleAlert,
  Code2,
  Copy,
  FileCode2,
  FileSliders,
  FolderOpen,
  GitBranch,
  Globe2,
  History,
  Layers3,
  Loader2,
  Package,
  Plus,
  Power,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { open } from "@tauri-apps/plugin-dialog";
import { openUrl } from "@tauri-apps/plugin-opener";
import { toast } from "sonner";
import { api } from "../../lib/api";
import type { ContentItem, Instance } from "../../lib/types";
import {
  type ConfigDocument,
  type ConfigPreset,
  type InstallRecipe,
  type Origin,
  type WorkbenchEntry,
  type WorkbenchLibrary,
  ORIGINS,
  needsAttention,
} from "../../lib/workbench";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "../Modal";
import { Button } from "../ui";
import { useStore } from "../../store";
import "./workbench.css";
import { useCreative } from "../../creative-store";
import { GeneratorBadge } from "../GeneratorBadge";
import { FavoriteButton } from "../FavoriteButton";
import { WorkbenchFileList, type WorkbenchRow } from "./WorkbenchFileList";
import { workbenchSnapshot, scanWorkbenchShared, refreshWorkbenchAfterChange, modSnapshot, loadWorkbenchMods } from "../../lib/workbench-cache";

type Section = "all" | "attention" | "presets" | "lineage";
const size = (bytes: number) =>
  bytes < 1024
    ? `${bytes} B`
    : bytes < 1048576
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1048576).toFixed(1)} MB`;
const date = (at: number) => new Date(at * 1000).toLocaleString();
const short = (hash: string) => hash.slice(0, 12);
const err = (e: unknown) => String(e).replace(/^Error: /, "");
function Status({ entry }: { entry: WorkbenchEntry }) {
  if (!entry.exists) return <span className="wb-badge danger">Missing</span>;
  if (entry.validation === "pending") return <span className="wb-badge">Checking…</span>;
  if (entry.issues.some((i) => i.severity === "error"))
    return <span className="wb-badge danger">Needs repair</span>;
  if (entry.record.update?.status === "available")
    return <span className="wb-badge amber">Update available</span>;
  if (
    entry.issues.some((i) => i.severity === "warning") ||
    ["error", "incompatible"].includes(entry.record.update?.status ?? "")
  )
    return <span className="wb-badge amber">Review needed</span>;
  if (entry.modified) return <span className="wb-badge violet">Modified</span>;
  return (
    <span className="wb-badge">{entry.enabled ? "On disk" : "Disabled"}</span>
  );
}

export function WorkbenchPanel({
  instance,
  mode,
  initialSection = "all",
  initialPath = null,
}: {
  instance: Instance;
  mode: "config" | "addons";
  initialSection?: Section;
  initialPath?: string | null;
}) {
  const [library, setLibrary] = useState<WorkbenchLibrary | null>(() => workbenchSnapshot(instance.id, initialSection === "lineage"));
  const inspected = useCreative((s) => s.scans[instance.id]);
  const prefs = useCreative(s => s.library.preferences);
  const [mods, setMods] = useState<ContentItem[]>(() => modSnapshot(instance.id));
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const grouping = prefs["config-layout"] === "files" ? "files" : "mods";
  const associationKey = (path: string) => "config-owner:" + instance.id + ":" + path;
  const associate = useMemo(() => createConfigAssociator(mods), [mods]);
  const associations = useMemo(() => new Map((library?.entries ?? []).map(entry => [entry.path, associate(entry, prefs[associationKey(entry.path)])])), [library, associate, prefs, instance.id]);
  const owner = (entry: WorkbenchEntry) => associations.get(entry.path)!;
  const savePreference = (key: string, value: string) => {
    void useCreative.getState().act("preferences", { [key]: value }).catch(e => toast.error(String(e)));
  };
  useEffect(() => {
    let current = true;
    void useCreative.getState().load().catch(() => {});
    void loadWorkbenchMods(instance.id).then(items => { if (current) setMods(items); }).catch(e => { if (current) setError("Mod association lookup: " + String(e)); });
    return () => { current = false; };
  }, [instance.id]);
  const [section, setSection] = useState<Section>(initialSection);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(initialPath);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(!library);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [install, setInstall] = useState<string | null>(null);
  const [editor, setEditor] = useState<WorkbenchEntry | null>(null);
  const [metadata, setMetadata] = useState<WorkbenchEntry | null>(null);
  const [preset, setPreset] = useState<ConfigPreset | null>(null);
  const alive = useRef(true);
  const panel = useRef<HTMLDivElement>(null);
  const refreshId = useRef(0);
  const includeMods = section === "lineage";
  const refresh = useCallback(async (afterChange = false) => {
    const request = ++refreshId.current;
    setValidating(true);
    try {
      const scan = afterChange ? refreshWorkbenchAfterChange : scanWorkbenchShared;
      await scan(instance.id, includeMods, data => {
        if (alive.current && request === refreshId.current) {
          setLibrary(data);
          setError(null);
          setLoading(false);
        }
      });
    } catch (e) {
      if (alive.current && request === refreshId.current) setError(err(e));
    } finally {
      if (alive.current && request === refreshId.current) { setLoading(false); setValidating(false); }
    }
  }, [instance.id, includeMods]);
  useEffect(() => {
    alive.current = true;
    panel.current?.parentElement?.scrollTo({ top: 0 });
    void refresh();
    return () => {
      alive.current = false;
      refreshId.current++;
    };
  }, [refresh]);
  // Refresh after returning from a file editor or external launcher, without overwriting an open draft.
  useEffect(() => {
    const focus = () => {
      if (!busy && !validating && !editor && !metadata && !install) void refresh();
    };
    window.addEventListener("focus", focus);
    return () => window.removeEventListener("focus", focus);
  }, [refresh, busy, validating, editor, metadata, install]);
  const run = async (
    operation: string,
    payload: Record<string, unknown>,
    message: string,
  ) => {
    setBusy(true);
    setError(null);
    try {
      const result = await api.workbenchAction(instance.id, operation, payload);
      if (result?.path) setSelected(result.path);
      await refresh(true);
      toast.success(message);
    } catch (e) {
      setError(err(e));
    } finally {
      setBusy(false);
    }
  };
  const checkUpdates = async () => {
    setBusy(true);
    try {
      setLibrary(await api.checkWorkbenchUpdates(instance.id));
      setError(null);
    } catch (e) {
      setError(err(e));
    } finally {
      setBusy(false);
    }
  };
  const entries = library?.entries ?? [];
  const pendingValidation = entries.some(entry => entry.validation === "pending");
  const baseEntries =
    mode === "addons"
      ? entries.filter((e) => e.addon)
      : entries.filter((e) => e.config);
  const attention = baseEntries.filter(needsAttention);
  const list = (
    section === "lineage"
      ? entries.filter((e) => e.mod || e.tracked || e.modified)
      : section === "attention"
        ? attention
        : baseEntries
  ).filter((e) =>
    `${e.title} ${e.path} ${ORIGINS[e.record.origin]} ${e.record.notes} ${owner(e).title} ${owner(e).id}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const grouped = new Map<string, { id: string; association: ReturnType<typeof configAssociation>; files: WorkbenchEntry[] }>();
  if (mode === "config" && section !== "lineage" && grouping === "mods") {
    for (const entry of list) {
      const association = owner(entry);
      const group = grouped.get(association.id) ?? { id: association.id, association, files: [] };
      group.files.push(entry); grouped.set(association.id, group);
    }
  }
  const groups = grouped.size ? [...grouped.values()].sort((a,b) => a.id === "unassigned" ? 1 : b.id === "unassigned" ? -1 : a.association.title.localeCompare(b.association.title)) : [{ id: "all", association: null, files: list }];
  const detail = entries.find((e) => e.path === selected);
  const running = useStore((s) => s.running);
  const mutateDisabled =
    busy ||
    !!Object.values(running).find(
      (r) => r.instance_id === instance.id && r.state === "running",
    );
  const importFile = async (recipe: string) => {
    setInstall(recipe);
  };
  const replace = async (entry: WorkbenchEntry) => {
    const source = await open({
      multiple: false,
      title: "Choose replacement; the current file will be preserved",
    });
    if (typeof source === "string")
      await run(
        "replace",
        {
          path: entry.path,
          source,
          expectedHash: entry.hash,
          note: "Replaced with a local file",
        },
        "Replacement installed; previous revision preserved",
      );
  };
  const renderGroup = (group: typeof groups[number]) => group.association && (<button className="wb-mod-group" aria-expanded={!collapsed[group.id]} onClick={() => setCollapsed(v => ({ ...v, [group.id]: !v[group.id] }))}>
                  <ContentIcon title={group.association.title} src={group.association.mod?.source?.icon_url} provider={group.association.mod?.source?.provider} projectId={group.association.mod?.source?.project_id} className="size-10" />
                  <span><strong>{group.association.title}</strong><small>{group.files.length} {group.files.length === 1 ? "file" : "files"} · {group.files.some(entry => entry.validation === "pending") ? "Checking health…" : `${group.files.filter(needsAttention).length} need attention`}{group.association.mod && !group.association.mod.enabled ? " · mod disabled" : ""}</small></span>
                  <ChevronRight size={16} style={{ transform: collapsed[group.id] ? undefined : "rotate(90deg)" }} />
                </button>);
  const renderFile = (entry: WorkbenchEntry) => (                <button
                  key={entry.path}
                  className={`wb-file ${selected === entry.path ? "selected" : ""}`}
                  onClick={() => setSelected(entry.path)}
                >
                  <span
                    className={`wb-file-icon ${entry.addon ? "addon" : entry.mod ? "mod" : ""}`}
                  >
                    {entry.mod ? (
                      <ContentIcon title={entry.title} provider={entry.record.provider} projectId={entry.record.project_id} src={mods.find(m => `mods/${m.file_name}${m.enabled ? "" : ".disabled"}` === entry.path)?.source?.icon_url} className="size-full" />
                    ) : entry.addon ? (
                      <ContentIcon title={entry.title} provider={entry.record.provider} projectId={entry.record.project_id} className="size-full" />
                    ) : (
                      <FileCode2 size={21} />
                    )}
                  </span>
                  <span className="wb-file-copy">
                    <strong>{entry.title}</strong>
                    <code>{entry.path}</code>
                    <span className="wb-file-tags">
                      {entry.addon && entry.config && (
                        <span>CONFIG + ADDON</span>
                      )}
                      {entry.tracked && (
                        <span>
                          <History size={10} /> {entry.record.revisions.length}{" "}
                          revisions
                        </span>
                      )}
                      {entry.record.origin !== "unknown" && (
                        <span>{ORIGINS[entry.record.origin]}</span>
                      )}
                    </span>
                  </span>
                  <span className="wb-file-end">
                    <Status entry={entry} />
                    <small>{size(entry.size)}</small>
                  </span>
                  <ChevronRight size={14} />
                </button>);
  const rows: WorkbenchRow[] = groups.flatMap(group => [
    ...(group.association ? [{ key: 'group:' + group.id, render: () => renderGroup(group) }] : []),
    ...(!group.association || !collapsed[group.id] ? group.files.map(entry => ({ key: entry.path, render: () => renderFile(entry) })) : []),
  ]);
  return (
    <div ref={panel} className="wb" data-workbench={mode}>
      <div className={`wb-hero ${mode === "addons" ? "wb-hero-addons" : ""}`}>
        <div className="wb-hero-copy">
          <span className="wb-eyebrow">
            <span className="wb-live-dot" /> YOUR INSTANCE, FINELY TUNED
          </span>
          <h2>
            {mode === "config"
              ? "Your settings, together."
              : "More possibilities. Perfectly placed."}
          </h2>
          <p>
            {mode === "config"
              ? "Find every config, organize by mod, and keep your changes recoverable."
              : "Gun packs, custom content, and the extras that make your world different. Keep them together, wherever they belong."}
          </p>
          <div className="wb-hero-actions">
            <button
              className="wb-button primary"
              disabled={mutateDisabled}
              onClick={() =>
                void importFile(mode === "config" ? "config" : "custom")
              }
            >
              <Plus size={15} />{" "}
              {mode === "config" ? "Import config" : "Install an addon"}
            </button>
            <button
              className="wb-button"
              disabled={busy}
              onClick={() => void checkUpdates()}
            >
              {busy ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}{" "}
              Check updates
            </button>
          </div>
        </div>
        <div className="wb-hero-art" aria-hidden="true">
          <div className="wb-orbit orbit-one" />
          <div className="wb-orbit orbit-two" />
          <div className="wb-art-card card-back">
            <Braces size={28} />
            <i />
            <i />
          </div>
          <div className="wb-art-card card-front">
            {mode === "config" ? (
              <SlidersHorizontal size={37} />
            ) : (
              <Layers3 size={37} />
            )}
            <span>MADE FOR YOUR WORLD</span>
          </div>
          <span className="wb-art-spark">
            <Sparkles size={20} />
          </span>
        </div>
      </div>

      <div className="wb-stats">
        <button onClick={() => setSection("all")}>
          <FileSliders />
          <span>
            <strong>{baseEntries.length}</strong>
            <small>
              {mode === "config" ? "Config files & packs" : "Installed addons"}
            </small>
          </span>
        </button>
        <button
          onClick={() => setSection("attention")}
          className={attention.length ? "has-attention" : ""}
        >
          <ShieldCheck />
          <span>
            <strong>{pendingValidation ? "…" : attention.length}</strong>
            <small>{pendingValidation ? "Checking config health" : "Need your attention"}</small>
          </span>
          {attention.length === 0 && library && <Check size={14} />}
        </button>
        <button onClick={() => setSection("presets")}>
          <Globe2 />
          <span>
            <strong>{library?.presets.length ?? 0}</strong>
            <small>Global presets</small>
          </span>
        </button>
        <button onClick={() => setSection("lineage")}>
          <GitBranch />
          <span>
            <strong>{entries.filter((e) => e.tracked).length}</strong>
            <small>Preserved baselines</small>
          </span>
          <Sparkles size={13} />
        </button>
      </div>
      {error && (
        <div className="wb-notice error" role="alert">
          <CircleAlert size={17} />
          <span>{error}</span>
          <button aria-label="Dismiss error" onClick={() => setError(null)}>
            <X size={14} />
          </button>
        </div>
      )}
      {library?.warnings.map((w) => (
        <div key={w} className="wb-notice">
          <CircleAlert size={16} />
          <span>{w}</span>
        </div>
      ))}
      {mutateDisabled && !busy && (
        <div className="wb-notice">
          <CircleAlert size={16} /> Stop Minecraft before editing or installing
          files.
        </div>
      )}

      <div className="wb-workspace">
        <aside className="wb-rail">
          <span className="wb-eyebrow">WORKSPACE</span>
          {(
            [
              {
                id: "all",
                title: mode === "config" ? "All configs" : "All addons",
                icon: FileSliders,
                count: baseEntries.length,
              },
              {
                id: "attention",
                title: "Needs attention",
                icon: CircleAlert,
                count: attention.length,
              },
              {
                id: "presets",
                title: "Global presets",
                icon: Globe2,
                count: library?.presets.length ?? 0,
              },
              {
                id: "lineage",
                title: "Mod lineage",
                icon: GitBranch,
                count: null,
              },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              className={section === item.id ? "active" : ""}
              onClick={() => {
                setSection(item.id);
                setSelected(null);
              }}
            >
              <item.icon size={16} />
              {item.title}
              {item.count !== null && <span>{item.count}</span>}
            </button>
          ))}
          <div className="wb-rail-note">
            <ShieldCheck size={21} />
            <strong>Room to experiment.</strong>
            <p>
              Edits made here keep a recoverable copy. Your saved original stays
              within reach.
            </p>
          </div>
        </aside>
        <main className="wb-main">
          <div className="wb-library-heading">
            <div>
              <h3>
                {section === "lineage"
                  ? "Every edit has a story."
                  : section === "presets"
                    ? "Your settings, everywhere."
                    : section === "attention"
                      ? "A little care goes a long way."
                      : mode === "addons"
                        ? "Your addon collection"
                        : "Your configuration library"}
              </h3>
              <p>
                {section === "lineage"
                  ? "Preserve a baseline, label AI assistance, and trace every revision."
                  : section === "presets"
                    ? "Save a config once. Apply it to the compatible instances you choose."
                    : "Real files. Shared records. Always connected to your instance."}
              </p>
            </div>
            <button
              className="wb-icon-button"
              aria-label="Rescan files"
              disabled={busy || validating}
              onClick={() => void refresh()}
            >
              <RefreshCw size={15} className={validating ? "animate-spin" : undefined} />
            </button>
          </div>
          {validating && !loading && <div className="wb-notice wb-scan-status" role="status"><Loader2 size={14} className="animate-spin" /><span>Checking for changes in the background. You can browse and edit your configs.</span></div>}
          {section === "lineage" && (
            <div className="wb-notice violet">
              <Sparkles size={16} />
              <span>
                Hashes detect edits. AI labels come from your declaration;
                authorship cannot be inferred from a file. A saved baseline is
                the file as it existed when tracking began.
              </span>
            </div>
          )}
          {section !== "presets" && (
            <label className="wb-search">
              <Search size={16} />
              <input
                aria-label="Search configs and addons"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  section === "lineage"
                    ? "Find a mod, patch, or original…"
                    : "Search names, paths, or notes…"
                }
              />
              <span>{list.length} files</span>
            </label>
          )}

          {mode === "addons" && section === "all" && (
            <div className="wb-recipes">
              {library?.recipes.map((recipe) => (
                <button
                  key={recipe.id}
                  disabled={mutateDisabled}
                  onClick={() => setInstall(recipe.id)}
                  className={recipe.id === "tacz" ? "tacz" : "doom"}
                >
                  <span className="wb-recipe-icon">
                    {recipe.id === "tacz" ? <Sparkles /> : <Layers3 />}
                  </span>
                  <span>
                    <small>GUIDED INSTALL</small>
                    <strong>{recipe.title}</strong>
                    <code>
                      {recipe.folder
                        ? `${recipe.folder}/`
                        : "Version-aware destination"}
                    </code>
                  </span>
                  <ArrowUpRight size={17} />
                </button>
              ))}
            </div>
          )}

          {mode === "config" && section !== "presets" && section !== "lineage" && (
            <div className="wb-organize">
              <div><strong>Find settings by their mod</strong><small>Matches installed mod IDs and folder conventions. Your corrections are remembered.</small></div>
              <div className="wb-view-switch" role="group" aria-label="Config organization">
                <button aria-pressed={grouping === "mods"} onClick={() => savePreference("config-layout", "mods")}>By mod</button>
                <button aria-pressed={grouping === "files"} onClick={() => savePreference("config-layout", "files")}>All files</button>
              </div>
              {grouping === "mods" && <div className="wb-group-actions">
                <button className="wb-text-button" onClick={() => setCollapsed({})}>Expand all</button>
                <button className="wb-text-button" onClick={() => setCollapsed(Object.fromEntries(groups.map(group => [group.id, true])))}>Collapse all</button>
              </div>}
            </div>
          )}
          {loading ? (
            <div className="wb-empty">
              <Loader2 className="animate-spin" />
              <h4>Getting to know your instance…</h4>
              <p>
                Reading configs, checking archives, and reconciling saved
                history.
              </p>
            </div>
          ) : section === "presets" ? (
            <div className="wb-presets">
              {library?.presets.length ? (
                library.presets.map((p) => (
                  <article key={p.id} className="wb-preset">
                    <div className="wb-file-icon">
                      <Globe2 size={22} />
                    </div>
                    <div>
                      <h4>{p.name}</h4>
                      <code>{p.path}</code>
                      <p>
                        Minecraft {p.game_version} · Updated{" "}
                        {date(p.updated_at)}
                      </p>
                    </div>
                    <button
                      className="wb-button"
                      disabled={mutateDisabled}
                      onClick={() => setPreset(p)}
                    >
                      Apply to instances <ChevronRight size={13} />
                    </button>
                  </article>
                ))
              ) : (
                <div className="wb-empty">
                  <Globe2 />
                  <h4>Good settings deserve to travel.</h4>
                  <p>
                    Select a config and choose “Save as global preset.” Apply it
                    across matching Minecraft versions, with a backup before
                    every change.
                  </p>
                </div>
              )}
            </div>
          ) : !list.length ? (
            <div className="wb-empty">
              {section === "attention" ? (
                <ShieldCheck />
              ) : mode === "addons" ? (
                <Package />
              ) : (
                <FileSliders />
              )}
              <h4>
                {query
                  ? "No matching files"
                  : section === "attention"
                    ? pendingValidation ? "Checking config health…" : "Nothing needs attention here."
                    : section === "lineage"
                      ? "Start with a mod you’re making yours."
                      : mode === "addons"
                        ? "Make room for something new."
                        : "Your next fine-tuning session starts here."}
              </h4>
              <p>
                {query
                  ? "Try a name, folder, or origin label."
                  : section === "attention"
                    ? pendingValidation ? "Checks are still running. Files remain available in All configs." : "No issues were found in the current scan. Mod-specific compatibility still depends on the author’s requirements."
                    : "Files appear here as Minecraft creates them, or when you import them. Your actual instance is the source of truth."}
              </p>
              {!query && section === "all" && (
                <button
                  className="wb-button"
                  disabled={mutateDisabled}
                  onClick={() =>
                    setInstall(mode === "config" ? "config" : "custom")
                  }
                >
                  <Plus size={14} /> Import your first{" "}
                  {mode === "config" ? "config" : "addon"}
                </button>
              )}
            </div>
          ) : (
            <WorkbenchFileList rows={rows} grid={mode === "addons" && section === "all"} scrollElement={() => panel.current?.parentElement ?? null} />
          )}
          <div className="wb-footnote">
            <Activity size={12} />
            {library
              ? `Last scanned ${date(library.scanned_at)}`
              : "Waiting for the native service"}
            <span>Config and Addons share one library</span>
          </div>
        </main>
        {detail && section !== "presets" && (
          <aside className="wb-inspector">
            <div className="wb-inspector-top">
              <span className="wb-eyebrow">FILE DETAILS</span>
              <button
                aria-label="Close file details"
                onClick={() => setSelected(null)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="wb-detail-icon">
              {detail.addon ? (
                <ContentIcon title={detail.title} provider={detail.record.provider} projectId={detail.record.project_id} className="size-14" />
              ) : detail.mod ? (
                <ContentIcon title={detail.title} provider={detail.record.provider} projectId={detail.record.project_id} src={mods.find(m => `mods/${m.file_name}${m.enabled ? "" : ".disabled"}` === detail.path)?.source?.icon_url} className="size-14" />
              ) : (
                <FileSliders size={28} />
              )}
            </div>
            <h3>{detail.title}</h3>
            <code className="wb-detail-path">{detail.path}</code>
            <Status entry={detail} />
            {detail.config && <div className="wb-association">
              <label htmlFor="config-owner">Belongs to</label>
              <select id="config-owner" aria-label="Config mod association" value={prefs[associationKey(detail.path)] || "auto"} onChange={e => savePreference(associationKey(detail.path), e.target.value)}>
                <option value="auto">Automatic · {configAssociation(detail, mods, "auto").title}</option>
                <option value="unassigned">Shared / unassigned</option>
                {mods.map(m => <option key={m.file_name} value={m.source?.mod_id || m.file_name}>{m.source?.title || m.source?.mod_id || m.file_name}</option>)}
                {prefs[associationKey(detail.path)] && !["auto", "unassigned", ...mods.map(m => m.source?.mod_id || m.file_name)].includes(prefs[associationKey(detail.path)]) && <option value={prefs[associationKey(detail.path)]}>{prefs[associationKey(detail.path)]} · missing mod</option>}
              </select>
              <small>{owner(detail).reason}</small>
            </div>}
            {detail.mod && inspected?.files.find((f) => f.inspection?.sha256 === detail.hash)?.inspection && <GeneratorBadge title={detail.title} inspection={inspected.files.find((f) => f.inspection?.sha256 === detail.hash)!.inspection!} />}
            {detail.hash && <FavoriteButton label favorite={{ provider: detail.record.project_id && (detail.record.provider === "modrinth" || detail.record.provider === "curseforge") ? detail.record.provider : "local", project_id: detail.record.project_id || detail.hash, title: detail.title, kind: detail.mod ? "mods" : detail.addon ? "addons" : "config", description: detail.path, source_url: detail.record.source_url }} />}
            <div className="wb-detail-actions">
              {detail.editable && (
                <button
                  className="wb-button primary"
                  disabled={mutateDisabled || !detail.exists}
                  onClick={() => setEditor(detail)}
                >
                  <SlidersHorizontal size={14} /> Edit config
                </button>
              )}
              <button
                className="wb-button"
                disabled={mutateDisabled}
                onClick={() => setMetadata(detail)}
              >
                <GitBranch size={14} />{" "}
                {detail.tracked ? "Edit tracking" : "Track origin"}
              </button>
            </div>
            {detail.issues.map((issue, i) => (
              <div className={`wb-detail-notice ${issue.severity}`} key={i}>
                <CircleAlert size={14} />
                <p>{issue.message}</p>
              </div>
            ))}
            {detail.issues.some((issue) =>
              /changed version|Minecraft or loader version changed/.test(
                issue.message,
              ),
            ) && (
              <button
                className="wb-text-button"
                disabled={mutateDisabled}
                onClick={() =>
                  void run(
                    "review_compatibility",
                    { path: detail.path },
                    "Compatibility review recorded",
                  )
                }
              >
                <Check size={13} /> Mark compatibility reviewed
              </button>
            )}
            {detail.record.update && (
              <div
                className={`wb-detail-notice ${detail.record.update.status === "error" ? "error" : "info"}`}
              >
                <RefreshCw size={14} />
                <div>
                  <strong>
                    {
                      {
                        current: "Current stable release",
                        available: "Update available",
                        unverified: "Version comparison unverified",
                        incompatible: "No compatible release",
                        error: "Update check failed",
                      }[detail.record.update.status]
                    }
                  </strong>
                  {detail.record.update.name && (
                    <p>{detail.record.update.name}</p>
                  )}
                  <p>{detail.record.update.message}</p>
                  <small>Checked {date(detail.record.update.checked_at)}</small>
                </div>
              </div>
            )}
            <dl className="wb-details">
              <div>
                <dt>Origin</dt>
                <dd>{ORIGINS[detail.record.origin]}</dd>
              </div>
              <div>
                <dt>Baseline for</dt>
                <dd>Minecraft {detail.record.game_version}</dd>
              </div>
              <div>
                <dt>Provider file ID</dt>
                <dd>{detail.record.version_id || "Not linked"}</dd>
              </div>
              <div>
                <dt>SHA-256</dt>
                <dd title={detail.hash}>
                  {short(detail.hash) || "Unavailable"}
                </dd>
              </div>
            </dl>
            {detail.record.source_url && (
              <button
                className="wb-text-button"
                onClick={() => void openUrl(detail.record.source_url)}
              >
                <ArrowUpRight size={14} /> Open original project
              </button>
            )}
            {detail.record.notes && (
              <p className="wb-notes">{detail.record.notes}</p>
            )}
            <div className="wb-detail-actions secondary">
              {detail.editable && (
                <button
                  className="wb-button"
                  disabled={mutateDisabled || !detail.exists || !detail.hash}
                  onClick={() =>
                    void run(
                      "save_preset",
                      { path: detail.path, expectedHash: detail.hash },
                      "Global preset saved",
                    )
                  }
                >
                  <Globe2 size={14} /> Save as global preset
                </button>
              )}
              <button
                className="wb-button"
                disabled={mutateDisabled || !detail.exists || !detail.hash}
                onClick={() => void replace(detail)}
              >
                <ArrowDownToLine size={14} /> Replace file
              </button>
              {!detail.editable && (
                <button
                  className="wb-button"
                  disabled={mutateDisabled || !detail.exists || !detail.hash}
                  onClick={() =>
                    void run(
                      "toggle",
                      { path: detail.path, expectedHash: detail.hash },
                      detail.enabled ? "Addon disabled" : "Addon enabled",
                    )
                  }
                >
                  <Power size={14} /> {detail.enabled ? "Disable" : "Enable"}
                </button>
              )}
            </div>
            <div className="wb-history-heading">
              <h4>Revision history</h4>
            </div>
            {detail.tracked ? (
              <div className="wb-timeline">
                {[...detail.record.revisions].reverse().map((r, i) => (
                  <div key={`${r.hash}-${r.at}-${i}`}>
                    <i />
                    <strong>{r.note}</strong>
                    <small>{date(r.at)}</small>
                    <code>{short(r.hash)}</code>
                    {r.hash === detail.record.original_hash && (
                      <span className="wb-badge">Saved baseline</span>
                    )}
                    {r.hash !== detail.hash && (
                      <button
                        disabled={mutateDisabled || !detail.hash}
                        className="wb-text-button"
                        onClick={() =>
                          void run(
                            "restore",
                            {
                              path: detail.path,
                              expectedHash: detail.hash,
                              hash: r.hash,
                            },
                            "Revision restored; previous content preserved",
                          )
                        }
                      >
                        <RotateCcw size={12} /> Restore this revision
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="wb-muted">
                Save a baseline before experimenting. Tracking preserves that
                file and records later edits.
              </p>
            )}
          </aside>
        )}
      </div>
      {install && (
        <InstallDialog
          instance={instance}
          initial={install}
          recipes={library?.recipes ?? []}
          onClose={() => setInstall(null)}
          onDone={async (path) => {
            setInstall(null);
            await refresh(true);
            setSelected(path);
          }}
        />
      )}
      {editor && (
        <ConfigEditor
          instance={instance}
          entry={editor}
          onClose={() => setEditor(null)}
          onDone={() => refresh(true)}
        />
      )}
      {metadata && (
        <TrackingDialog
          instance={instance}
          entry={metadata}
          onClose={() => setMetadata(null)}
          onDone={async () => {
            setMetadata(null);
            await refresh(true);
          }}
        />
      )}
      {preset && (
        <PresetDialog
          preset={preset}
          current={instance}
          onClose={() => setPreset(null)}
          onDone={() => refresh(true)}
        />
      )}
    </div>
  );
}

function InstallDialog({
  instance,
  initial,
  recipes,
  onClose,
  onDone,
}: {
  instance: Instance;
  initial: string;
  recipes: InstallRecipe[];
  onClose: () => void;
  onDone: (path: string) => Promise<void>;
}) {
  const [recipe, setRecipe] = useState(initial);
  const [folder, setFolder] = useState(initial === "config" ? "config" : "");
  const [source, setSource] = useState("");
  const [title, setTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [provider, setProvider] = useState("");
  const [projectId, setProjectId] = useState("");
  const [versionId, setVersionId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const selected = recipes.find((r) => r.id === recipe);
  const destination = selected?.folder || folder;
  const name = source.split(/[\\/]/).pop();
  const pick = async () => {
    const path = await open({
      multiple: false,
      title: "Select a custom content file",
      filters: [
        {
          name: "Configs, packs and mods",
          extensions: [
            "zip",
            "jar",
            "json",
            "json5",
            "jsonc",
            "toml",
            "cfg",
            "ini",
            "yml",
            "yaml",
            "properties",
            "txt",
            "js",
            "zs",
            "lua",
          ],
        },
      ],
    });
    if (typeof path === "string") {
      setSource(path);
      if (!title) setTitle(path.split(/[\\/]/).pop() || "");
    }
  };
  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      const result = await api.workbenchAction(instance.id, "install", {
        source,
        recipe,
        folder: destination,
        title,
        sourceUrl,
        provider,
        projectId,
        versionId,
        origin: "unknown",
      });
      await onDone(result.path);
      toast.success("Installed with its original preserved");
    } catch (e) {
      setError(err(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      open
      onClose={onClose}
      dismissable={!busy}
      size="xl"
      labelledBy="install-addon-title"
    >
      <ModalHeader
        id="install-addon-title"
        title="A place for every extra."
        subtitle="Guided custom installation"
        icon={<Package className="text-trace" />}
        onClose={onClose}
      />
      <ModalBody className="wb-dialog">
        <label>
          Install recipe
          <select
            value={recipe}
            onChange={(e) => {
              setRecipe(e.target.value);
              setFolder(e.target.value === "config" ? "config" : "");
            }}
          >
            {recipes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
            <option value="config">Config file</option>
            <option value="custom">Custom destination</option>
          </select>
        </label>
        {selected && (
          <div className="wb-install-guide">
            <ShieldCheck size={22} />
            <div>
              <strong>{selected.dependency}</strong>
              <p>{selected.instructions}</p>
              <button
                className="wb-text-button"
                onClick={() => void openUrl(selected.source_url)}
              >
                Read the author’s installation guide <ArrowUpRight size={12} />
              </button>
            </div>
          </div>
        )}
        {recipe === "tacz" && !selected?.folder ? (
          <label>
            Installed TaCZ generation
            <select value={folder} onChange={(e) => setFolder(e.target.value)}>
              <option value="">
                Choose the version installed in this instance
              </option>
              <option value="tacz">TaCZ 1.1.4 or newer → tacz/</option>
              <option value="config/tacz/custom">
                TaCZ older than 1.1.4 → config/tacz/custom/
              </option>
            </select>
          </label>
        ) : (
          !selected && (
            <label>
              Destination folder
              <input
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                placeholder="config, kubejs/data, or your custom folder"
              />
              <small>
                Relative to {instance.name}. ZIP archives stay intact.
              </small>
            </label>
          )
        )}
        <button className="wb-file-picker" onClick={() => void pick()}>
          <FolderOpen size={25} />
          <strong>{name || "Choose a file to install"}</strong>
          <span>
            {source || "ZIP packs, JAR mods, scripts, and config files"}
          </span>
        </button>
        <div className="wb-form-grid">
          <label>
            Display name
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label>
            Installed provider file / version ID
            <input
              value={versionId}
              onChange={(e) => setVersionId(e.target.value)}
              placeholder="Optional; enables accurate update comparison"
            />
          </label>
        </div>
        {!selected && (
          <>
            <label>
              Original project URL
              <input
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://…"
              />
            </label>
            <div className="wb-form-grid">
              <label>
                Update provider
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                >
                  <option value="">Local / other source</option>
                  <option value="curseforge">CurseForge</option>
                  <option value="modrinth">Modrinth</option>
                </select>
              </label>
              <label>
                Provider project ID
                <input
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                />
              </label>
            </div>
          </>
        )}
        <div className="wb-destination">
          <span>REVIEW INSTALLATION</span>
          <code>
            {destination || "Choose a destination"}/{name || "your-file.zip"}
          </code>
          <small>
            Archive integrity checked · Original preserved · Restart Minecraft
            to load
          </small>
        </div>
        {error && (
          <p className="wb-form-error" role="alert">
            {error}
          </p>
        )}
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button
          onClick={() => void submit()}
          disabled={busy || !source || !destination}
        >
          {busy ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <ArrowDownToLine size={15} />
          )}{" "}
          Install & track
        </Button>
      </ModalFooter>
    </Modal>
  );
}

function TrackingDialog({
  instance,
  entry,
  onClose,
  onDone,
}: {
  instance: Instance;
  entry: WorkbenchEntry;
  onClose: () => void;
  onDone: () => Promise<void>;
}) {
  const [form, setForm] = useState({
    title: entry.title,
    origin: entry.record.origin,
    notes: entry.record.notes,
    sourceUrl: entry.record.source_url,
    provider: entry.record.provider,
    projectId: entry.record.project_id,
    versionId: entry.record.version_id,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [originalSource, setOriginalSource] = useState("");
  const set = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));
  const submit = async () => {
    setBusy(true);
    try {
      await api.workbenchAction(
        instance.id,
        entry.tracked ? "metadata" : "track",
        { path: entry.path, ...form, originalSource },
      );
      await onDone();
    } catch (e) {
      setError(err(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      open
      onClose={onClose}
      dismissable={!busy}
      size="xl"
      labelledBy="tracking-title"
    >
      <ModalHeader
        id="tracking-title"
        title="Keep the story behind the file."
        subtitle="Track the original, your edits, and their source."
        onClose={onClose}
        icon={<GitBranch className="text-trace" />}
      />
      <ModalBody className="wb-dialog">
        <div className="wb-notice violet">
          <Sparkles size={18} />
          <span>
            AI assistance is a label you provide. A hash detects changes, not
            who or what created them. The baseline saves this file’s current
            bytes.
          </span>
        </div>
        <div className="wb-form-grid">
          <label>
            Display name
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </label>
          <label>
            Origin
            <select
              value={form.origin}
              onChange={(e) => set("origin", e.target.value as Origin)}
            >
              {Object.entries(ORIGINS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Original project URL
          <input
            value={form.sourceUrl}
            onChange={(e) => set("sourceUrl", e.target.value)}
            placeholder="Link back to the author’s original"
          />
        </label>
        <div className="wb-form-grid">
          <label>
            Provider
            <select
              value={form.provider}
              onChange={(e) => set("provider", e.target.value)}
            >
              <option value="">Local / other</option>
              <option value="curseforge">CurseForge</option>
              <option value="modrinth">Modrinth</option>
            </select>
          </label>
          <label>
            Project ID
            <input
              value={form.projectId}
              onChange={(e) => set("projectId", e.target.value)}
            />
          </label>
        </div>
        <label>
          Installed file / version ID
          <input
            value={form.versionId}
            onChange={(e) => set("versionId", e.target.value)}
          />
        </label>
        <button
          className="wb-file-picker"
          onClick={() => {
            void open({
              multiple: false,
              title: "Attach the actual upstream original",
            }).then((p) => {
              if (typeof p === "string") setOriginalSource(p);
            });
          }}
        >
          <FolderOpen size={20} />
          <strong>
            {originalSource
              ? "Upstream original selected"
              : "Attach the upstream original (optional)"}
          </strong>
          <span>
            {originalSource ||
              "Link the unedited file while keeping your working mod installed."}
          </span>
        </button>
        <label>
          Patch notes / AI tool / original version
          <textarea
            rows={4}
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="What changed? Which original is this based on? How was AI involved?"
          />
        </label>
        {error && (
          <p className="wb-form-error" role="alert">
            {error}
          </p>
        )}
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" disabled={busy} onClick={onClose}>
          Cancel
        </Button>
        <Button disabled={busy || !entry.exists} onClick={() => void submit()}>
          <ShieldCheck size={15} />
          {entry.tracked ? "Save tracking" : "Preserve baseline & track"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

function ConfigEditor({
  instance,
  entry,
  onClose,
  onDone,
}: {
  instance: Instance;
  entry: WorkbenchEntry;
  onClose: () => void;
  onDone: () => Promise<void>;
}) {
  const [doc, setDoc] = useState<ConfigDocument | null>(null);
  const [text, setText] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [raw, setRaw] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  useEffect(() => {
    let alive = true;
    void api
      .workbenchAction<ConfigDocument>(instance.id, "read", {
        path: entry.path,
      })
      .then((d) => {
        if (alive) {
          setDoc(d);
          setText(d.text);
        }
      })
      .catch((e) => {
        if (alive) setError(err(e));
      });
    return () => {
      alive = false;
    };
  }, [instance.id, entry.path]);
  const dirty = !!doc && text !== doc.text;
  let json: Record<string, unknown> | null = null;
  if (entry.path.endsWith(".json")) {
    try {
      const v = JSON.parse(text);
      if (v && !Array.isArray(v) && typeof v === "object") json = v;
    } catch {}
  }
  const fields = json
    ? Object.entries(json).filter(([, v]) =>
        ["string", "boolean", "number"].includes(typeof v),
      )
    : [];
  const update = (key: string, value: unknown) => {
    if (json)
      setText(JSON.stringify({ ...json, [key]: value }, null, 2) + "\n");
  };
  const save = async () => {
    if (!doc) return;
    setBusy(true);
    setError("");
    try {
      await api.workbenchAction(instance.id, "save", {
        path: entry.path,
        expectedHash: doc.hash,
        text,
        note: note || "Config edited",
      });
      const d = await api.workbenchAction<ConfigDocument>(instance.id, "read", {
        path: entry.path,
      });
      setDoc(d);
      setText(d.text);
      setNote("");
      await onDone();
      toast.success("Config saved with a recoverable revision");
    } catch (e) {
      setError(err(e));
    } finally {
      setBusy(false);
    }
  };
  const close = () => {
    if (!busy) dirty ? setConfirmClose(true) : onClose();
  };
  return (
    <Modal
      open
      onClose={close}
      dismissable={!busy}
      size="full"
      labelledBy="config-editor-title"
    >
      <ModalHeader
        id="config-editor-title"
        title={entry.title}
        subtitle={entry.path}
        onClose={close}
        icon={<FileSliders className="text-ok" />}
      />
      <ModalBody className="wb-dialog wb-editor">
        <fieldset disabled={busy} className="contents">
          <div className="wb-editor-toolbar">
            <span>
              <ShieldCheck size={14} /> Backed up before saving
            </span>
            <button className="wb-button" onClick={() => setRaw(!raw)}>
              <Code2 size={14} />
              {raw ? "Settings view" : "Source view"}
            </button>
          </div>
          {doc?.problem && (
            <div className="wb-notice error">
              <CircleAlert size={16} />
              <span>Current file needs repair: {doc.problem}</span>
            </div>
          )}
          {!doc && !error ? (
            <Loader2 className="animate-spin" />
          ) : !raw && fields.length > 0 ? (
            <div className="wb-setting-fields">
              {fields.map(([key, value]) => (
                <label key={key}>
                  <span>
                    <strong>{key.replace(/[_-]/g, " ")}</strong>
                    <code>{key}</code>
                  </span>
                  {typeof value === "boolean" ? (
                    <button
                      type="button"
                      role="switch"
                      aria-checked={value}
                      aria-label={key}
                      className={`wb-switch ${value ? "on" : ""}`}
                      onClick={() => update(key, !value)}
                    >
                      <i />
                    </button>
                  ) : (
                    <input
                      aria-label={key}
                      type={typeof value === "number" ? "number" : "text"}
                      value={String(value)}
                      onChange={(e) => {
                        if (
                          typeof value !== "number" ||
                          (e.target.value.trim() &&
                            Number.isFinite(Number(e.target.value)))
                        )
                          update(
                            key,
                            typeof value === "number"
                              ? Number(e.target.value)
                              : e.target.value,
                          );
                      }}
                    />
                  )}
                </label>
              ))}
              <p className="wb-muted">
                Top-level settings are shown here. Nested settings are preserved
                and available in Source view. Mod-specific value ranges are not
                validated.
              </p>
            </div>
          ) : (
            <textarea
              className="wb-code-editor"
              aria-label="Config source"
              spellCheck={false}
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={17}
            />
          )}
          <label>
            Revision note
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="A small note for future you…"
            />
          </label>
          {error && (
            <div className="wb-notice error" role="alert">
              <CircleAlert size={16} />
              <span>{error}</span>
            </div>
          )}
          {confirmClose && (
            <div className="wb-notice">
              <span>You have unsaved edits.</span>
              <button
                className="wb-button"
                onClick={() => setConfirmClose(false)}
              >
                Keep editing
              </button>
              <button className="wb-button" onClick={onClose}>
                Discard draft
              </button>
            </div>
          )}
        </fieldset>
      </ModalBody>
      <ModalFooter>
        <span className="mr-auto text-xs text-content-muted">
          {dirty ? "Unsaved changes" : "No unsaved changes"}
        </span>
        <Button variant="ghost" onClick={close} disabled={busy}>
          Close
        </Button>
        <Button onClick={() => void save()} disabled={!dirty || busy}>
          {busy ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Save size={15} />
          )}{" "}
          Save config
        </Button>
      </ModalFooter>
    </Modal>
  );
}

function PresetDialog({
  preset,
  current,
  onClose,
  onDone,
}: {
  preset: ConfigPreset;
  current: Instance;
  onClose: () => void;
  onDone: () => Promise<void>;
}) {
  const instances = useStore((s) => s.instances).filter(
    (i) => i.version_id === preset.game_version,
  );
  const [selected, setSelected] = useState<string[]>(
    current.version_id === preset.game_version ? [current.id] : [],
  );
  const [results, setResults] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const apply = async () => {
    setBusy(true);
    for (const id of selected) {
      try {
        const library = await api.scanWorkbench(id);
        const entry = library.entries.find((e) => e.path === preset.path);
        await api.workbenchAction(id, "apply_preset", {
          path: preset.path,
          presetId: preset.id,
          expectedHash: entry?.hash ?? "",
        });
        setResults((r) => ({
          ...r,
          [id]: "Applied · previous file preserved",
        }));
      } catch (e) {
        setResults((r) => ({ ...r, [id]: err(e) }));
      }
    }
    await onDone();
    setBusy(false);
  };
  return (
    <Modal
      open
      onClose={onClose}
      dismissable={!busy}
      size="xl"
      labelledBy="preset-title"
    >
      <ModalHeader
        id="preset-title"
        title="Bring your settings along."
        subtitle={`${preset.name} · Minecraft ${preset.game_version}`}
        icon={<Globe2 className="text-ok" />}
        onClose={onClose}
      />
      <ModalBody className="wb-dialog">
        <div className="wb-destination">
          <span>CONFIG TO APPLY</span>
          <code>{preset.path}</code>
          <small>
            This replaces the whole file in each selected instance. Existing
            files are backed up. No background synchronization is enabled.
          </small>
        </div>
        <div className="wb-preset-targets">
          {instances.map((i) => (
            <label key={i.id}>
              <input
                type="checkbox"
                checked={selected.includes(i.id)}
                disabled={busy}
                onChange={(e) =>
                  setSelected((s) =>
                    e.target.checked
                      ? [...s, i.id]
                      : s.filter((id) => id !== i.id),
                  )
                }
              />
              <span>
                <strong>{i.name}</strong>
                <small>
                  {results[i.id] ||
                    `${i.loader || "Vanilla"} · ${i.version_id}`}
                </small>
              </span>
            </label>
          ))}
        </div>
        {!instances.length && (
          <p className="wb-muted">
            No instances use Minecraft {preset.game_version}.
          </p>
        )}
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose} disabled={busy}>
          Close
        </Button>
        <Button
          disabled={busy || !selected.length}
          onClick={() => void apply()}
        >
          {busy ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Copy size={15} />
          )}{" "}
          Apply to {selected.length} instances
        </Button>
      </ModalFooter>
    </Modal>
  );
}
