import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, Eye, Loader2, Search } from "lucide-react";
import { toast } from "sonner";

import { api } from "../../lib/api";
import { cn } from "../../lib/cn";
import type { ContentItem, ContentKind, Instance, ProjectVersion, SearchProvider } from "../../lib/types";
import { Markdown } from "../project/Markdown";
import { Modal, ModalFooter, ModalHeader } from "../Modal";

function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export function ContentVersionModal({ open, item, instance, kind, onClose, onSwitched }: {
  open: boolean;
  item: ContentItem | null;
  instance: Instance;
  kind: ContentKind;
  onClose: () => void;
  onSwitched: () => Promise<void> | void;
}) {
  const source = item?.source;
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [showIncompatible, setShowIncompatible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [changelogs, setChangelogs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open || !source?.provider || !source.project_id) return;
    let live = true;
    setLoading(true);
    setVersions([]);
    setQuery("");
    setShowIncompatible(false);
    setSelectedId(source.version_id ?? "");
    api.listProjectVersions(source.provider, source.project_id, kind, instance.version_id,
      kind === "mods" ? instance.loader : null)
      .then((rows) => {
        if (!live) return;
        setVersions(rows);
        setSelectedId((current) => rows.some((version) => version.id === current)
          ? current
          : (rows.find((version) => version.compatible)?.id ?? rows[0]?.id ?? ""));
      })
      .catch((cause) => live && toast.error("Could not load project versions", { description: String(cause) }))
      .finally(() => live && setLoading(false));
    return () => { live = false; };
  }, [open, source?.provider, source?.project_id, source?.version_id, kind, instance.version_id, instance.loader]);

  const selected = versions.find((version) => version.id === selectedId) ?? null;
  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return versions.filter((version) => {
      if (!showIncompatible && !version.compatible && version.id !== source?.version_id) return false;
      return !needle || version.name.toLowerCase().includes(needle)
        || version.version_number.toLowerCase().includes(needle)
        || version.file_name.toLowerCase().includes(needle);
    });
  }, [versions, query, showIncompatible, source?.version_id]);

  useEffect(() => {
    if (!selected || selected.changelog != null || changelogs[selected.id] !== undefined) return;
    if (!source?.provider || !source.project_id) return;
    api.getVersionChangelog(source.provider, source.project_id, selected.id)
      .then((result) => setChangelogs((current) => ({ ...current, [selected.id]: result.body })))
      .catch(() => setChangelogs((current) => ({ ...current, [selected.id]: "" })));
  }, [selected, source?.provider, source?.project_id, changelogs]);

  const switchVersion = async () => {
    if (!item || !source?.provider || !source.project_id || !selected || !selected.compatible) return;
    setSwitching(true);
    try {
      await api.createInstanceSnapshot(instance.id, `Before switching ${source.title ?? item.file_name}`, ["logs", "crash-reports"]);
      await api.installContent(source.provider as SearchProvider, source.project_id, instance.id, kind,
        instance.version_id, kind === "mods" ? instance.loader : null, selected.id, true);
      toast.success(`Switched ${source.title ?? item.file_name}`, {
        description: `Now using ${selected.name}. A recovery snapshot was created first.`,
      });
      onClose();
      await onSwitched();
    } catch (cause) {
      toast.error("Could not switch version", { description: String(cause) });
    } finally {
      setSwitching(false);
    }
  };

  const currentId = source?.version_id ?? "";
  const changelog = selected?.changelog ?? (selected ? changelogs[selected.id] : undefined);

  return (
    <Modal open={open} onClose={onClose} size="full" dismissable={!switching} labelledBy="content-version-title">
      <ModalHeader id="content-version-title" title="Switch version" subtitle={source?.title ?? item?.file_name}
        onClose={switching ? undefined : onClose} />
      <div className="grid min-h-0 flex-1 grid-cols-[19rem_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col border-r border-border-soft bg-surface-2/35 p-4">
          <label className="flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-3">
            <Search className="size-4 text-content-faint" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search versions"
              className="min-w-0 flex-1 bg-transparent text-xs text-content outline-none placeholder:text-content-faint" />
          </label>
          <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-xs text-content-muted"><Loader2 className="size-4 animate-spin" /> Loading versions</div>
            ) : shown.length === 0 ? (
              <div className="py-10 text-center text-xs text-content-faint">No matching versions.</div>
            ) : (
              <div className="flex flex-col gap-1">{shown.map((version) => (
                <button key={version.id} onClick={() => setSelectedId(version.id)}
                  className={cn("flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors",
                    selectedId === version.id ? "bg-(--accent-glow) text-content" : "text-content-muted hover:bg-surface-3 hover:text-content",
                    !version.compatible && version.id !== currentId && "opacity-55")}> 
                  <span className={cn("grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-bold uppercase",
                    version.channel === "release" ? "bg-ok/20 text-ok" : "bg-warn/15 text-warn")}>{version.channel.slice(0, 1)}</span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold">{version.name}</span>
                    <span className="block truncate text-[10px] text-content-faint">{version.file_name}</span></span>
                  {version.id === currentId && <span className="rounded bg-surface-3 px-1.5 py-0.5 text-[9px] font-semibold text-content-muted">Current</span>}
                </button>
              ))}</div>
            )}
          </div>
          <button onClick={() => setShowIncompatible((value) => !value)}
            className="mt-3 inline-flex items-center gap-2 self-start text-xs font-medium text-content-muted hover:text-content">
            <Eye className="size-4" /> {showIncompatible ? "Hide incompatible" : "Show incompatible"}
          </button>
        </aside>

        <section className="min-h-0 overflow-y-auto p-5">
          {selected ? <>
            <div className="flex flex-wrap items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-xl font-semibold text-content">{selected.name}</h3>
                  <span className="rounded-full border border-ok/40 bg-ok/10 px-2 py-0.5 text-[10px] font-bold uppercase text-ok">{selected.channel}</span>
                  {selected.id === currentId && <span className="inline-flex items-center gap-1 rounded-full bg-(--accent-glow) px-2 py-0.5 text-[10px] font-semibold text-content-muted"><Check className="size-3" /> Current</span>}
                </div>
                <div className="mt-1 text-xs text-content-faint">{selected.version_number} · {selected.file_name}</div>
              </div>
              <time className="text-xs font-medium text-content-muted">{dateLabel(selected.date)}</time>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {selected.game_versions.map((value) => <span key={value} className="rounded bg-surface-3 px-2 py-1 text-[10px] text-content-muted">Minecraft {value}</span>)}
              {selected.loaders.map((value) => <span key={value} className="rounded bg-(--accent-glow) px-2 py-1 text-[10px] capitalize text-content-muted">{value}</span>)}
            </div>
            {!selected.compatible && <div className="mt-4 flex items-start gap-2 rounded-xl border border-warn/30 bg-warn/10 px-3 py-2.5 text-xs text-warn">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" /> This version does not match Minecraft {instance.version_id}{kind === "mods" && instance.loader ? ` / ${instance.loader}` : ""}.
            </div>}
            {item?.frozen && <div className="mt-4 flex items-start gap-2 rounded-xl border border-warn/30 bg-warn/10 px-3 py-2.5 text-xs text-warn">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" /> This project is frozen. Unfreeze it from the More menu before changing versions.
            </div>}
            <div className="mt-5 border-t border-border-soft pt-5">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-content-faint">Changelog</h4>
              {changelog === undefined ? <div className="flex items-center gap-2 text-xs text-content-muted"><Loader2 className="size-3.5 animate-spin" /> Loading changelog</div>
                : changelog.trim() ? <Markdown body={changelog} format="markdown" className="text-xs" />
                  : <p className="text-xs text-content-faint">No changelog was provided for this version.</p>}
            </div>
          </> : <div className="grid h-full place-items-center text-sm text-content-faint">Select a version.</div>}
        </section>
      </div>
      <ModalFooter className="justify-between">
        <div className="flex items-center gap-2 text-xs text-warn"><AlertTriangle className="size-4" /> Enderloom snapshots the instance before switching.</div>
        <div className="flex gap-2">
          <button onClick={onClose} disabled={switching} className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-semibold text-content-muted hover:bg-surface-3">Cancel</button>
          <button onClick={() => void switchVersion()} disabled={!selected || !selected.compatible || selected.id === currentId || item?.frozen || switching}
            className="inline-flex items-center gap-2 rounded-lg bg-ok px-4 py-2 text-xs font-bold text-black disabled:cursor-not-allowed disabled:opacity-40">
            {switching && <Loader2 className="size-3.5 animate-spin" />} Switch to {selected?.version_number ?? "version"}
          </button>
        </div>
      </ModalFooter>
    </Modal>
  );
}
