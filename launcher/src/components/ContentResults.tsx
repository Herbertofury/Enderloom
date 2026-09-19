import '../../../catalog/trailers.js';
import '../../../catalog/video-controls.js';
import '../../../catalog/video-controls.css';
import '../../../catalog/trailers.css';
import { ContentIcon } from "./ContentIcon";
import { useLibraryLayout } from "../lib/library-layout";
import { LayoutDensityMenu, TILE_SIZE_STEPS } from "./LayoutDensityMenu";
import { Download, Heart } from "lucide-react";

import { relativeTime } from "../lib/time";
import type { ProjectSummary } from "../lib/types";
import type { ContentKind, SearchProvider } from "../lib/types";
import { projectFavorite } from "../lib/creative";
import { FavoriteButton } from "./FavoriteButton";

export type ResultView = "list" | "grid";

export function formatCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(0)}K`;
  return `${count}`;
}

export function accentFrom(color: number | null): string | undefined {
  if (color == null) return undefined;
  const r = (color >> 16) & 0xff;
  const g = (color >> 8) & 0xff;
  const b = color & 0xff;
  return `rgb(${r} ${g} ${b})`;
}

export function useResultView(_storageKey: string): [ResultView, (v: ResultView) => void] {
  const layout = useLibraryLayout(s=>s.layout), setLayout = useLibraryLayout(s=>s.setLayout);
  return [layout === 'tiles' ? 'grid' : 'list', view=>setLayout(view === 'grid' ? 'tiles' : 'list')];
}
export function ResultViewToggle({ view: _view, onChange: _onChange }: { view: ResultView; onChange: (v: ResultView) => void }) {
  const {layout,setLayout,tileSize,setTileSize} = useLibraryLayout();
  return <LayoutDensityMenu layout={layout} onLayoutChange={setLayout} tileSize={tileSize} onTileSizeChange={setTileSize} testIdPrefix="discover" />;
}

function Tags({ items, max }: { items: string[]; max: number }) {
  const shown = items.slice(0, max);
  const more = items.length - shown.length;
  if (shown.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1">
      {shown.map((tag) => (
        <span
          key={tag}
          className="rounded bg-surface-3 px-1.5 py-0.5 text-[10px] font-medium capitalize text-content-faint"
        >
          {tag}
        </span>
      ))}
      {more > 0 && <span className="text-[10px] text-content-faint">+{more}</span>}
    </div>
  );
}

function Stats({ project }: { project: ProjectSummary }) {
  return (
    <div className="flex shrink-0 items-center gap-2.5 text-[11px] text-content-faint">
      <span className="inline-flex items-center gap-1">
        <Download className="size-3" />
        {formatCount(project.downloads)}
      </span>
      {project.follows > 0 && (
        <span className="inline-flex items-center gap-1">
          <Heart className="size-3" />
          {formatCount(project.follows)}
        </span>
      )}
    </div>
  );
}

export interface ResultRow {
  project: ProjectSummary;
  subline?: string;
  onOpen: () => void;
  action: React.ReactNode;
}

export function ContentResults({ view, rows, provider, kind }: { view: ResultView; rows: ResultRow[]; provider: SearchProvider; kind: ContentKind }) {
  const tileSize = useLibraryLayout(s=>s.tileSize);
  const layout = useLibraryLayout(s=>s.layout);
  const projectUrl = (project: ProjectSummary) => {
    if (provider === 'modrinth') return `https://modrinth.com/project/${encodeURIComponent(project.id)}`;
    const segment = {mods:'mc-mods',modpacks:'modpacks',resourcepacks:'texture-packs',shaderpacks:'shaders',datapacks:'data-packs',schematics:undefined}[kind];
    return segment && project.slug ? `https://www.curseforge.com/minecraft/${segment}/${encodeURIComponent(project.slug)}` : undefined;
  };
  if (layout === 'table') return <div className="library-table-scroll"><table className="library-table" aria-label="Discover projects"><thead><tr><th>Project</th><th>Author</th><th>Downloads</th><th>Updated</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{rows.map(({project,subline,onOpen,action})=><tr key={project.id} onClick={onOpen}>
    <td><button className="library-table-name" aria-label={`Open ${project.title}`} data-trailer-context="catalog" data-project-url={projectUrl(project)} data-project-title={project.title}><ContentIcon src={project.icon_url} title={project.title} provider={provider} projectId={project.id} className="size-10"/><span><strong>{project.title}</strong>{subline && <small>{subline}</small>}</span></button></td><td>{project.author}</td><td>{formatCount(project.downloads)}</td><td>{project.updated ? relativeTime(Math.floor(new Date(project.updated).getTime()/1000)) : '—'}</td><td onClick={event=>event.stopPropagation()}><div className="library-table-actions"><FavoriteButton favorite={projectFavorite(project,provider,kind)}/>{action}</div></td>
  </tr>)}</tbody></table></div>;
  if (view === "grid") {
    return (
      <div className="library-tile-grid" style={{'--tile-width':TILE_SIZE_STEPS[tileSize].widthPx+'px'} as React.CSSProperties}>
        {rows.map(({project,subline,onOpen,action})=><article key={project.id} className="library-project-tile">
          <button className="library-tile-art" data-trailer-context="catalog" data-project-url={projectUrl(project)} data-project-title={project.title} onClick={onOpen} aria-label={project.title}><ContentIcon src={project.icon_url} title={project.title} provider={provider} projectId={project.id} className="size-full" /></button>
          <div className="library-tile-info"><button onClick={onOpen} className="library-tile-name" title={project.title}>{project.title}</button><span className="library-tile-author" title={project.author}>By {project.author}</span>{subline && <span className="library-tile-note">{subline}</span>}</div>
          <div className="library-tile-actions"><FavoriteButton favorite={projectFavorite(project,provider,kind)} />{action}</div>
        </article>)}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {rows.map(({ project, subline, onOpen, action }) => (
        <div
          key={project.id}
          onClick={onOpen}
          className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-surface-2"
        >
          <ContentIcon src={project.icon_url} title={project.title} provider={provider} projectId={project.id} className="size-14" />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <button className="truncate text-sm font-semibold text-content" data-trailer-context="catalog" data-project-url={projectUrl(project)} data-project-title={project.title}>
                {project.title}
              </button>
              <span className="shrink-0 text-[11px] text-content-faint">
                by {project.author}
              </span>
            </div>
            <div className="truncate text-xs text-content-muted">{project.description}</div>
            <div className="mt-1 flex items-center gap-2.5">
              <Stats project={project} />
              <Tags items={project.categories} max={4} />
              {project.updated && (
                <span className="shrink-0 text-[10px] text-content-faint">
                  Updated{" "}
                  {relativeTime(Math.floor(new Date(project.updated).getTime() / 1000))}
                </span>
              )}
            </div>
            {subline && <div className="mt-0.5 truncate text-[11px] text-ok">{subline}</div>}
          </div>
          <FavoriteButton favorite={projectFavorite(project, provider, kind)} />
          {action}
        </div>
      ))}
    </div>
  );
}
