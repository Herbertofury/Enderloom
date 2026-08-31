import { ArrowUpCircle, FileBox, Loader2, Search, Trash2 } from "lucide-react";

import { cn } from "../../lib/cn";
import { formatBytes } from "../../lib/format";
import type { ContentItem, SearchProvider } from "../../lib/types";
import { DeferredImage } from "../DeferredImage";

function Toggle({
  on,
  onClick,
  disabled,
}: {
  on: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={on ? "Disable" : "Enable"}
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full transition-colors duration-300",
        on ? "bg-(--accent)" : "bg-surface-3",
        disabled && "cursor-not-allowed opacity-40",
      )}
    >
      <span
        className={cn(
          "absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow transition-transform duration-300",
          on ? "translate-x-4" : "translate-x-0",
        )}
      />
    </button>
  );
}

function Tag({ tone, title, children }: { tone?: "accent"; title?: string; children: string }) {
  return (
    <span
      title={title}
      className={cn(
        "shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
        tone === "accent"
          ? "bg-(--accent-glow) text-content-muted"
          : "bg-surface-3 text-content-faint",
      )}
    >
      {children}
    </span>
  );
}

export function ContentItemCard({
  item,
  layout = "list",
  busy,
  disabled,
  disabledReason,
  onOpenProject,
  onOpenCatalog,
  onUpdate,
  onToggle,
  onRemove,
  onContextMenu,
}: {
  item: ContentItem;
  layout?: "tiles" | "table" | "list";
  busy?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  onOpenProject?: (provider: SearchProvider, projectId: string, title?: string) => void;
  onOpenCatalog?: () => void;
  onUpdate: () => void;
  onToggle: () => void;
  onRemove: () => void;
  onContextMenu?: (event: React.MouseEvent) => void;
}) {
  const source = item.source;
  const displayName = source?.title ?? item.file_name;
  const linked = !!source?.provider && !!source.project_id && !!onOpenProject;
  const openProject = () =>
    linked &&
    onOpenProject?.(
      source!.provider! as SearchProvider,
      source!.project_id!,
      source!.title ?? undefined,
    );
  const icon = (className: string, fallbackClassName = className) =>
    source?.icon_url ? (
      <DeferredImage
        src={source.icon_url}
        alt=""
        className={cn(className, "bg-surface-3 object-cover")}
        fallback={
          <div className={cn("grid place-items-center bg-surface-3 text-content-faint", fallbackClassName)}>
            <FileBox className="size-5" />
          </div>
        }
      />
    ) : (
      <div className={cn("grid place-items-center bg-surface-3 text-content-faint", fallbackClassName)}>
        <FileBox className="size-5" />
      </div>
    );
  const tags = (
    <>
      {source?.provider && <Tag>{source.provider}</Tag>}
      {source?.origin === "pack" && <Tag tone="accent">pack</Tag>}
      {source?.origin === "dependency" && <Tag>dependency</Tag>}
      {!linked && source?.mod_id && (
        <Tag title="Identified from the file itself, not linked to a provider">local</Tag>
      )}
    </>
  );
  const actions = (compact = false) => (
    <div className="flex shrink-0 items-center justify-end gap-1">
      {item.update && (
        <button
          onClick={onUpdate}
          disabled={busy || disabled}
          title={disabledReason ?? `Update to ${item.update.latest_name}`}
          aria-label={`Update ${displayName}`}
          className={cn(
            "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-warn/15 text-xs font-semibold text-warn transition-colors hover:bg-warn/25 disabled:cursor-not-allowed disabled:opacity-40",
            compact ? "w-8 justify-center" : "px-3",
          )}
        >
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : <ArrowUpCircle className="size-3.5" />}
          {!compact && "Update"}
        </button>
      )}
      {onOpenCatalog && (
        <button
          onClick={onOpenCatalog}
          aria-label={`Research ${displayName} in Catalog`}
          title="Research in Catalog"
          className="grid size-8 shrink-0 place-items-center rounded-lg text-content-faint transition-colors hover:bg-(--accent-glow) hover:text-content"
        >
          <Search className="size-4" />
        </button>
      )}
      <Toggle on={item.enabled} disabled={disabled} onClick={onToggle} />
      <button
        onClick={onRemove}
        disabled={disabled}
        aria-label={`Delete ${displayName}`}
        title={disabledReason}
        className="grid size-8 place-items-center rounded-lg text-content-faint transition-colors hover:bg-danger/15 hover:text-danger disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-content-faint"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );

  if (layout === "tiles") {
    return (
      <article
        onContextMenu={onContextMenu}
        className={cn(
          "group flex min-w-0 flex-col overflow-hidden rounded-xl border transition-opacity",
          item.update ? "border-warn/30 bg-warn/6" : "border-border-soft bg-surface-2/70",
          !item.enabled && "opacity-55",
        )}
      >
        <button
          onClick={openProject}
          disabled={!linked}
          className={cn("relative aspect-square w-full overflow-hidden text-left", linked && "cursor-pointer")}
        >
          {icon("size-full transition-transform duration-300 group-hover:scale-105", "size-full")}
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/85 to-transparent" />
          <span className="pointer-events-none absolute inset-x-2 bottom-2 line-clamp-2 text-xs font-semibold text-white drop-shadow">
            {displayName}
          </span>
          <span className="pointer-events-none absolute left-2 top-2 flex flex-wrap gap-1">{tags}</span>
        </button>
        <div className="min-w-0 px-2.5 py-2">
          <div className="truncate text-[10px] text-content-faint">
            {source?.mod_version ? `v${source.mod_version} · ` : ""}{formatBytes(item.size)}{!item.enabled && " · disabled"}
          </div>
          <div className="mt-1.5 flex items-center justify-end">{actions(true)}</div>
        </div>
      </article>
    );
  }

  if (layout === "table") {
    return (
      <div
        onContextMenu={onContextMenu}
        className={cn(
          "grid grid-cols-[minmax(15rem,2fr)_7rem_7rem_6rem_auto] items-center gap-3 border-b border-border-soft/70 px-3 py-2 last:border-0 hover:bg-surface-2",
          item.update && "bg-warn/6",
          !item.enabled && "opacity-55",
        )}
      >
        <button onClick={openProject} disabled={!linked} className="flex min-w-0 items-center gap-2.5 text-left">
          {icon("size-9 shrink-0 rounded-lg", "size-9 shrink-0 rounded-lg")}
          <span className="min-w-0">
            <span className="block truncate text-xs font-semibold text-content">{displayName}</span>
            <span className="block truncate text-[10px] text-content-faint">{item.file_name}</span>
          </span>
        </button>
        <span className="truncate text-[11px] capitalize text-content-muted">{source?.provider ?? "Local"}</span>
        <span className="truncate text-[11px] text-content-muted">{source?.mod_version ?? "—"}</span>
        <span className="text-[11px] tabular-nums text-content-faint">{formatBytes(item.size)}</span>
        {actions(true)}
      </div>
    );
  }

  return (
    <div
      onContextMenu={onContextMenu}
      className={cn(
        "flex items-center gap-3 rounded-xl border px-4 py-2.5 transition-opacity",
        item.update ? "border-warn/30 bg-warn/6" : "border-border-soft bg-surface-2/70",
        !item.enabled && "opacity-55",
      )}
    >
      {icon("size-9 shrink-0 rounded-lg", "size-9 shrink-0 rounded-lg")}

      <div
        className={cn("min-w-0 flex-1", linked && "cursor-pointer")}
        onClick={openProject}
      >
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-content">{displayName}</span>
          {tags}
        </div>
        <div className="truncate text-[11px] text-content-faint">
          {source?.title ? `${item.file_name} · ` : ""}
          {source?.mod_version && `v${source.mod_version} · `}
          {formatBytes(item.size)}
          {!item.enabled && " · disabled"}
        </div>
      </div>

      {actions(false)}
    </div>
  );
}
