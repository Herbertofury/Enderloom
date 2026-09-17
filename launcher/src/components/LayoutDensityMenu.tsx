import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  Folder,
  LayoutGrid,
  List,
  ListChecks,
  Table2,
} from "lucide-react";

import { cn } from "../lib/cn";
import "./library-layout.css";

export type LayoutMode = "tiles" | "table" | "list";
export type OrganizationMode = "groups" | "flat";

export const TILE_SIZE_STEPS = [
  { label: "XS", widthPx: 120 },
  { label: "S", widthPx: 144 },
  { label: "M", widthPx: 168 },
  { label: "L", widthPx: 192 },
  { label: "XL", widthPx: 260 },
] as const;

const LAYOUTS = [
  { mode: "tiles", label: "Tiles", icon: LayoutGrid },
  { mode: "table", label: "Table", icon: Table2 },
  { mode: "list", label: "List", icon: List },
] as const;

export function LayoutDensityMenu({
  layout,
  onLayoutChange,
  tileSize,
  onTileSizeChange,
  organization,
  onOrganizationChange,
  testIdPrefix,
}: {
  layout: LayoutMode;
  onLayoutChange: (layout: LayoutMode) => void;
  tileSize: number;
  onTileSizeChange: (size: number) => void;
  organization?: OrganizationMode;
  onOrganizationChange?: (organization: OrganizationMode) => void;
  testIdPrefix: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const activeSize = TILE_SIZE_STEPS[tileSize] ?? TILE_SIZE_STEPS[1];

  useEffect(() => {
    if (!open) return;
    const closeIfOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", closeIfOutside);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("pointerdown", closeIfOutside);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const ActiveIcon = LAYOUTS.find((item) => item.mode === layout)?.icon ?? LayoutGrid;
  const showOrganization = organization != null && onOrganizationChange != null;

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        onClick={() => setOpen((current) => !current)}
        aria-label="View and tile size"
        aria-expanded={open}
        aria-haspopup="dialog"
        title="View and tile size"
        data-testid={`${testIdPrefix}-view-trigger`}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition-colors",
          open
            ? "border-(--accent)/45 bg-(--accent)/10 text-(--accent-bright)"
            : "border-border-soft bg-surface-2/60 text-content-muted hover:bg-surface-3 hover:text-content",
        )}
      >
        <ActiveIcon className="size-4" />
        <span className="capitalize">{layout}</span>
        {layout === "tiles" && (
          <span className="rounded bg-surface-3 px-1.5 py-0.5 font-mono text-[9px] text-content-faint">
            {activeSize.label}
          </span>
        )}
        <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="View options"
          data-testid={`${testIdPrefix}-view-options`}
          className="absolute right-0 top-[calc(100%+0.45rem)] z-40 w-64 overflow-hidden rounded-xl border border-border bg-surface p-1.5 shadow-2xl shadow-black/55"
        >
          <div className="px-2 pb-1 pt-1 text-[9px] font-bold uppercase tracking-[0.15em] text-content-faint">
            Layout
          </div>
          {LAYOUTS.map(({ mode, label, icon: Icon }) => (
            <button
              key={mode}
              onClick={() => onLayoutChange(mode)}
              aria-pressed={layout === mode}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-colors",
                layout === mode
                  ? "bg-surface-3 text-content"
                  : "text-content-muted hover:bg-surface-2 hover:text-content",
              )}
            >
              <Icon className="size-4" />
              <span className="flex-1">{label}</span>
              {layout === mode && <Check className="size-3.5 text-(--accent)" strokeWidth={2.5} />}
            </button>
          ))}

          {showOrganization && (
            <>
              <div className="my-1.5 h-px bg-border-soft" />
              <div className="px-2 pb-1 pt-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-content-faint">
                Organization
              </div>
              {(
                [
                  { mode: "groups", label: "Groups view", icon: Folder },
                  { mode: "flat", label: "Flat view", icon: ListChecks },
                ] as const
              ).map(({ mode, label, icon: Icon }) => (
                <button
                  key={mode}
                  onClick={() => onOrganizationChange(mode)}
                  aria-pressed={organization === mode}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-colors",
                    organization === mode
                      ? "bg-surface-3 text-content"
                      : "text-content-muted hover:bg-surface-2 hover:text-content",
                  )}
                >
                  <Icon className="size-4" />
                  <span className="flex-1">{label}</span>
                  {organization === mode && <Check className="size-3.5 text-(--accent)" strokeWidth={2.5} />}
                </button>
              ))}
            </>
          )}

          {layout === "tiles" && (
            <div className="mt-1.5 border-t border-border-soft px-2.5 pb-2 pt-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-content-faint">
                  Tile size
                </span>
                <span className="font-mono text-[9px] tabular-nums text-content-faint">
                  {activeSize.widthPx}px
                </span>
              </div>
              <div
                className="instance-tile-slider-wrap"
                style={{ "--tile-progress": tileSize * 25 } as React.CSSProperties}
              >
                <output className="instance-tile-slider-value" aria-hidden="true">
                  {activeSize.label}
                </output>
                <input
                  type="range"
                  min={0}
                  max={TILE_SIZE_STEPS.length - 1}
                  step={1}
                  value={tileSize}
                  onChange={(event) => onTileSizeChange(Number(event.target.value))}
                  aria-label={`Tile size: ${activeSize.label}`}
                  aria-valuetext={`${activeSize.label}, ${activeSize.widthPx} pixels`}
                  data-testid={`${testIdPrefix}-tile-size`}
                  className="instance-tile-slider w-full"
                />
              </div>
              <div className="mt-0.5 flex justify-between px-0.5 font-mono text-[9px] font-semibold text-content-faint">
                {TILE_SIZE_STEPS.map((size, index) => (
                  <button
                    key={size.label}
                    type="button"
                    aria-label={`Use ${size.label} tiles`}
                    aria-pressed={tileSize === index}
                    onClick={() => onTileSizeChange(index)}
                    className={cn(
                      "w-5 text-center transition-colors hover:text-content",
                      tileSize === index && "text-(--accent-bright)",
                    )}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
