import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, FolderOpen, Loader2, Play, Plus, Search, Square } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../store';
import { useLibraryLayout } from '../lib/library-layout';
import { LayoutDensityMenu, TILE_SIZE_STEPS } from '../components/LayoutDensityMenu';
import { ContentIcon } from '../components/ContentIcon';
import { logoSrc, mediaSrc } from '../lib/media';
import { relativeTime } from '../lib/time';
import type { Instance } from '../lib/types';
import { useActiveTasksByInstance } from '../lib/useTasks';
import './home-library.css';

export function HomeLibraryView() {
  const instances = useStore(s=>s.instances), organization = useStore(s=>s.instanceOrganization);
  const media = useStore(s=>s.media), running = useStore(s=>s.running), launching = useStore(s=>s.launching);
  const tasks = useActiveTasksByInstance();
  const { layout, setLayout, tileSize, setTileSize } = useLibraryLayout();
  const [query,setQuery] = useState(''), [collapsed,setCollapsed] = useState<Record<string,boolean>>({});
  const favorites = new Set(organization.favorites);
  const rows = useMemo(()=>instances.filter(i=>`${i.name} ${i.loader||'vanilla'} ${i.version_id}`.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>(b.last_played_at||0)-(a.last_played_at||0)||a.name.localeCompare(b.name)),[instances,query]);
  const groups = [ {id:'favorites',name:'Favorites',items:rows.filter(i=>favorites.has(i.id))},
    ...organization.groups.map(g=>({id:g.id,name:g.name,items:rows.filter(i=>!favorites.has(i.id)&&organization.placements.some(p=>p.instance_id===i.id&&p.group_id===g.id))})),
    {id:'ungrouped',name:'Library',items:rows.filter(i=>!favorites.has(i.id)&&!organization.placements.some(p=>p.instance_id===i.id&&p.group_id))} ];
  useEffect(() => { let cancelled = false; let next = 0;
    const missing = instances.filter(i=>!i.logo&&!useStore.getState().media[i.id]);
    const worker = async () => { while (!cancelled && next < missing.length) { const instance = missing[next++]; await useStore.getState().loadMedia(instance.id).catch(()=>{}); } };
    void Promise.all(Array.from({length:Math.min(4,missing.length)},worker));
    return () => { cancelled = true; };
  },[instances]);
  const art = (instance: Instance) => logoSrc(instance.logo) || (media[instance.id] ? mediaSrc(media[instance.id]!) : undefined);
  const openCard = (instance: Instance) => <button className="home-instance-open" onClick={()=>useStore.getState().openInstance(instance.id)} aria-label={`Open ${instance.name}`} />;
  const liveProcesses = Object.values(running).filter(process=>['running','stopping'].includes(process.state));
  async function play(instance: Instance) {
    const state = useStore.getState();
    try {
      if (!state.accounts.length) { state.setView('accounts'); toast('Sign in to Minecraft to play.'); return; }
      if (!state.installedIds.includes(instance.id)) await state.installInstance(instance.id);
      await useStore.getState().launchInstance(instance.id);
    } catch(error) { toast.error(`Could not start ${instance.name}`,{description:String(error)}); }
  }
  const playButton = (instance: Instance) => {
    const process = Object.values(running).find(p=>p.instance_id===instance.id && ['running','stopping'].includes(p.state));
    const task = tasks.get(instance.id);
    const busy = launching.includes(instance.id) || !!(task && task.kind !== 'performance_scan');
    return <button className="home-play" disabled={busy} onClick={()=>process ? void useStore.getState().killInstance(process.running_id) : void play(instance)} aria-label={`${process?'Stop':'Play'} ${instance.name}`}>
      {busy ? <Loader2 size={14} className="animate-spin"/> : process ? <Square size={13}/> : <Play size={14}/>} {busy?'Starting…':process?'Stop':'Play'}
    </button>;
  };
  return <div className="home-library">
    <header><div><span className="home-eyebrow">YOUR MINECRAFT</span><h1>Home</h1></div><span className="home-running">{liveProcesses.length ? `${liveProcesses.length} running` : 'Ready when you are'}</span><button className="add-content-button" onClick={()=>useStore.getState().startInstanceCreate()}><Plus size={17}/> New instance</button></header>
    {!query && rows.some(i=>i.last_played_at) && <section><h2>Jump back in</h2><div className="home-recent">{rows.filter(i=>i.last_played_at).slice(0,4).map(instance=><article key={instance.id}>{openCard(instance)}<ContentIcon src={art(instance)} title={instance.name} className="size-12"/><div><strong>{instance.name}</strong><small>{instance.loader || 'Vanilla'} {instance.version_id} · {relativeTime(instance.last_played_at!)}</small></div>{playButton(instance)}</article>)}</div></section>}
    <div className="home-library-tools"><label><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search your library" aria-label="Search your library"/></label><LayoutDensityMenu layout={layout} onLayoutChange={setLayout} tileSize={tileSize} onTileSizeChange={setTileSize} testIdPrefix="home"/><button onClick={()=>useStore.getState().setView('instances')} className="add-content-button"><FolderOpen size={16}/> Manage library</button></div>
    {!rows.length && <p className="home-empty">{query?'No instances match your search.':'Create or connect an instance to get started.'}</p>}
    {groups.filter(group=>group.items.length).map(group=><section key={group.id}>
      <button className="home-group-heading" onClick={()=>setCollapsed(s=>({...s,[group.id]:!s[group.id]}))} aria-expanded={!collapsed[group.id]}><ChevronDown size={16} style={{transform:collapsed[group.id]?'rotate(-90deg)':undefined}}/>{group.name}<span>{group.items.length}</span></button>
      {!collapsed[group.id] && <div className={layout==='tiles'?'library-tile-grid home-instance-grid':'home-instance-list'} style={{'--tile-width':TILE_SIZE_STEPS[tileSize].widthPx+'px'} as React.CSSProperties}>{group.items.map(instance=><article key={instance.id} className="home-instance">
        {openCard(instance)}<div className="home-instance-art"><ContentIcon src={art(instance)} title={instance.name} className="size-full"/></div><div className="home-instance-info"><strong title={instance.name}>{instance.name}</strong><small>{instance.loader || 'Vanilla'} {instance.version_id}</small></div>{playButton(instance)}
      </article>)}</div>}
    </section>)}
  </div>;
}
