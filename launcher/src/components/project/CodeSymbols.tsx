import { useEffect, useRef, useState } from 'react';
import { Braces, ChevronLeft, ChevronRight, Code2, Loader2, RefreshCw, Search } from 'lucide-react';
import { api } from '../../lib/api';
import type { CodeSymbols as CodeEvidence } from '../../lib/artifacts';

export function CodeSymbols({ targetKind, targetId, fileName, archivePath }: { targetKind: string; targetId: string; fileName: string; archivePath: string }) {
  const [open, setOpen] = useState(false), [index, setIndex] = useState<CodeEvidence|null>(null), [detail, setDetail] = useState<CodeEvidence|null>(null);
  const [query, setQuery] = useState(''), [selected, select] = useState<string>(), [page, setPage] = useState(0), [members, setMembers] = useState(40);
  const [loading, setLoading] = useState(false), [error, setError] = useState(''), [revision, refresh] = useState(0);
  const request = useRef(0);
  useEffect(() => { setIndex(null); setDetail(null); select(undefined); setQuery(''); setPage(0); }, [targetKind, targetId, fileName, archivePath]);
  useEffect(() => {
    const ticket = ++request.current;
    if (!open) return;
    let current = true; setLoading(true); setError(''); setDetail(null); setMembers(40);
    api.getContentCodeSymbols(targetKind, targetId, 'mods', fileName, archivePath, selected).then(result => {
      if (!current || ticket !== request.current) return;
      if (selected) {
        if (index && result.artifact_sha256 !== index.artifact_sha256) { setIndex(null); select(undefined); throw new Error('The installed mod changed. Its class list is being refreshed.'); }
        setDetail(result);
      } else { setIndex(result); setPage(0); }
    }).catch(reason => { if (current && ticket === request.current) setError(String(reason)); }).finally(() => { if (current && ticket === request.current) setLoading(false); });
    return () => { current = false; };
  }, [open, targetKind, targetId, fileName, archivePath, selected, revision]);
  const matches = (index?.classes ?? []).filter(path => path.toLowerCase().includes(query.toLowerCase()));
  const pages = Math.max(1, Math.ceil(matches.length/60)), shown = matches.slice(page*60,(page+1)*60);
  const symbol = detail?.symbol;
  const allMembers = [...(symbol?.fields ?? []), ...(symbol?.methods ?? [])];
  return <details className="mt-3 border-t border-border-soft pt-2" onToggle={event => setOpen(event.currentTarget.open)}>
    <summary className="flex cursor-pointer items-center gap-2 text-[11px] text-content-muted"><Braces size={13}/>Explore installed code</summary>
    {open && <div role="region" className="mt-3 space-y-3" aria-label={`Code explorer ${fileName}${archivePath}`}>
      <p className="text-[11px] leading-relaxed text-content-faint">Read directly from this installed archive. Exploring code does not execute it. Source filenames and lines are compiler declarations.</p>
      <div className="flex items-center gap-2"><div className="flex min-w-0 flex-1 items-center gap-2 rounded-md bg-surface-deep px-2 py-1.5"><Search size={13} className="shrink-0 text-content-faint"/><input className="min-w-0 flex-1 bg-transparent text-xs text-content outline-none" aria-label="Search installed classes" placeholder="Find a class or package…" value={query} onChange={e=>{setQuery(e.target.value);setPage(0);}}/></div><button type="button" className="rounded p-1.5 text-content-muted hover:bg-brand/10" aria-label="Refresh code symbols" disabled={loading} onClick={()=>{setIndex(null);select(undefined);refresh(n=>n+1);}}><RefreshCw size={13}/></button></div>
      {loading && <p role="status" className="flex items-center gap-2 text-xs text-content-muted"><Loader2 size={13} className="animate-spin"/>Reading installed code…</p>}
      {error && <p role="alert" className="text-xs text-amber-300">{error}</p>}
      {index && <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="min-w-0"><div className="mb-2 flex items-center justify-between text-[10px] text-content-faint"><span>{matches.length} of {index.classes?.length} classes</span><span className="flex items-center gap-1"><button type="button" aria-label="Previous classes" disabled={!page} onClick={()=>setPage(p=>p-1)}><ChevronLeft size={14}/></button>{page+1}/{pages}<button type="button" aria-label="Next classes" disabled={page+1>=pages} onClick={()=>setPage(p=>p+1)}><ChevronRight size={14}/></button></span></div>
          <div className="max-h-72 overflow-auto rounded-md border border-border-soft p-1">{shown.map(path=><button key={path} type="button" title={path} aria-pressed={selected===path} className={`block w-full break-all rounded px-2 py-1.5 text-left font-mono text-[10px] ${selected===path?'bg-brand/10 text-brand':'text-content-muted hover:bg-surface-deep'}`} onClick={()=>select(path)}>{path.replace(/\.class$/,'').replace(/\//g,'.')}</button>)}{!shown.length && <p className="p-2 text-xs text-content-faint">No matching classes.</p>}</div>
        </div>
        <div role="region" aria-label="Selected class symbols" className="min-w-0 rounded-lg bg-surface-deep p-3">{symbol ? <>
          <p className="flex items-start gap-2 text-xs font-medium text-content"><Code2 size={14} className="mt-0.5 shrink-0 text-brand"/><span className="break-all">{symbol.name}</span></p>
          <p className="mt-1 break-all text-[10px] text-content-faint">{symbol.source_file ?? 'Source filename not recorded'} · class format {symbol.class_version}</p>
          {symbol.superclass && <p className="mt-1 break-all text-[10px] text-content-faint">Extends {symbol.superclass}</p>}
          <div className="mt-3 max-h-72 space-y-2 overflow-auto">{allMembers.slice(0,members).map((member,i)=><div key={i} className="border-t border-border-soft pt-2"><p className="break-all font-mono text-[11px] text-content">{member.name}<span className="ml-1 text-content-faint">{member.descriptor}</span></p><p className="mt-0.5 text-[10px] text-content-faint">{member.kind} · {member.first_line ? `source lines ${member.first_line}–${member.last_line}` : 'source line unavailable'}</p></div>)}{members<allMembers.length && <button type="button" className="text-xs text-brand" onClick={()=>setMembers(n=>n+40)}>Show more members · {allMembers.length-members} remaining</button>}</div>
          <details className="mt-3 text-[10px] text-content-faint"><summary className="cursor-pointer">Exact code fingerprints</summary><p className="mt-1 break-all font-mono">Class SHA-256 · {symbol.sha256}</p><p className="mt-1 break-all font-mono">Archive SHA-256 · {detail.archive_sha256}</p><p className="mt-1 break-all font-mono">Installed artifact SHA-256 · {detail.artifact_sha256}</p></details>
        </> : <p className="text-xs text-content-faint">Choose a class to explore its fields, methods and recorded source lines.</p>}</div>
      </div>}
    </div>}
  </details>;
}
