import { useEffect, useRef, useState } from 'react';
import { ArrowLeftToLine, ArrowRightToLine, GripHorizontal, PictureInPicture2, Play, Settings2, X } from 'lucide-react';
import type { ProjectDetails, SearchProvider } from '../../lib/types';
import '../../../../catalog/trailers.js';
import '../../../../catalog/video-controls.js';
import '../../../../catalog/video-controls.css';
import '../../../../catalog/trailers.css';
import './project-media.css';

type Placement = 'left' | 'right' | 'floating';
export function ProjectTrailer({ details, provider }: { details: ProjectDetails; provider: SearchProvider }) {
  const [closed, setClosed] = useState(false);
  const [placement, setPlacement] = useState<Placement>(() => {
    const stored = localStorage.getItem('project-media-placement');
    return stored === 'left' || stored === 'floating' ? stored : 'right';
  });
  const [position, setPosition] = useState({ x: Math.max(12, window.innerWidth - 356), y: 160 });
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const panel = useRef<HTMLElement>(null);
  const url = details.website_url || (provider === 'modrinth' ? `https://modrinth.com/project/${details.id}` : null);
  const poster = details.gallery.find(image => image.featured)?.url || details.gallery[0]?.url;
  const move = (next: Placement) => { setPlacement(next); localStorage.setItem('project-media-placement', next); };
  const clamp = (x: number, y: number) => ({ x: Math.max(8, Math.min(innerWidth - 340, x)), y: Math.max(8, Math.min(innerHeight - 320, y)) });
  useEffect(() => {
    const resize = () => setPosition(p => clamp(p.x, p.y));
    window.addEventListener('resize', resize); return () => window.removeEventListener('resize', resize);
  }, []);
  if (!url) return null;
  if (closed) return <button className="project-media-reopen" onClick={() => setClosed(false)} aria-label="Show project media"><Play size={15} /> Media</button>;
  return <aside ref={panel} className={`project-media-panel project-media-${placement}`} aria-label={`${details.title} media`}
    style={placement === 'floating' ? { left: position.x, top: position.y } : undefined}>
    <div className="project-media-heading">
      <button className="project-media-grip" aria-label="Move media panel" title="Drag to move; arrow keys move a floating panel"
        onPointerDown={event => { if (event.button !== 0) return; const rect = panel.current!.getBoundingClientRect(); setPosition({ x: rect.left, y: rect.top }); move('floating'); drag.current = { x: event.clientX, y: event.clientY, left: rect.left, top: rect.top }; event.currentTarget.setPointerCapture(event.pointerId); }}
        onPointerMove={event => { const d = drag.current; if (d) setPosition(clamp(d.left + event.clientX - d.x, d.top + event.clientY - d.y)); }}
        onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}
        onKeyDown={event => { const delta: Record<string, [number, number]> = { ArrowLeft: [-16, 0], ArrowRight: [16, 0], ArrowUp: [0, -16], ArrowDown: [0, 16] }; if (delta[event.key]) { event.preventDefault(); move('floating'); const [x,y] = delta[event.key]; setPosition(p => clamp(p.x+x, p.y+y)); } }}>
        <GripHorizontal size={15} /><span>Project media</span>
      </button>
      <button onClick={() => move('left')} aria-label="Dock media left" title="Dock left"><ArrowLeftToLine size={14} /></button>
      <button onClick={() => move('right')} aria-label="Dock media right" title="Dock right"><ArrowRightToLine size={14} /></button>
      <button onClick={() => move('floating')} aria-label="Float media panel" title="Float"><PictureInPicture2 size={14} /></button>
      <button onClick={() => setClosed(true)} aria-label="Close project media" title="Close"><X size={15} /></button>
    </div>
    <div className="detail-gallery" data-trailer-context="detail" data-project-url={url} data-project-title={details.title}>
      <img className="live-media-image" src={poster} hidden={!poster} alt={`${details.title} project screenshot`} loading="lazy" />
      {!poster && <div className="project-media-empty"><Play size={24} /><p>Watch a verified trailer</p><small>Real project media, with sources you can inspect.</small></div>}
    </div>
    <button type="button" data-trailer-settings className="project-media-settings"><Settings2 size={13} /> Trailer preferences</button>
  </aside>;
}
