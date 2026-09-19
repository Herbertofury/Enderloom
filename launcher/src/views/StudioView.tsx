import { useEffect, useRef, useState } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { listen } from '@tauri-apps/api/event';
import { Archive, ArrowLeftRight, Check, FolderPlus, Loader2, Plus, Search, ShieldCheck, X } from 'lucide-react';
import { api } from '../lib/api';
import { formatBytes } from '../lib/format';
import { EvidenceDetails } from '../components/EvidenceDetails';
import type { ConversionProject, ConversionRequest, ConversionSnapshot, PackageComparison, PackageEntries } from '../lib/conversion';

const empty = (): ConversionRequest => ({ project_id: '', title: '', minecraft: '', loader: 'forge', loader_version: '', java: 17, checkpoint: '', inputs: [] });
const field = 'w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-content outline-none focus:border-brand';
const button = 'inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-surface-2 disabled:opacity-40';
const statuses = ['identical_bytes', 'changed', 'missing', 'added', 'ambiguous'];
const words = (s: string) => s.replace(/_/g, ' ');

export function StudioView() {
  const [projects, setProjects] = useState<ConversionProject[]>([]);
  const [request, setRequest] = useState(empty);
  const [selected, setSelected] = useState('');
  const [snapshot, setSnapshot] = useState<ConversionSnapshot | null>(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [baseline, setBaseline] = useState(''), [candidate, setCandidate] = useState('');
  const [query, setQuery] = useState(''), [filter, setFilter] = useState(''), [offset, setOffset] = useState(0);
  const [entries, setEntries] = useState<PackageEntries | null>(null), [comparison, setComparison] = useState<PackageComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const generation = useRef(0), selection = useRef(selected); selection.current = selected;
  const refresh = async () => setProjects(await api.getConversionProjects());
  useEffect(() => {
    let alive = true;
    void api.getConversionProjects().then(v => { if (alive) setProjects(v); }).catch(e => { if (alive) setError(String(e)); });
    const unlisten = listen<{project_id:string}>('conversion:updated', ({ payload }) => {
      if (!alive) return;
      void api.getConversionProjects().then(v => { if (alive) setProjects(v); }).catch(e => { if (alive) setError(String(e)); });
      if (selection.current === payload.project_id) void api.getConversionSnapshot(payload.project_id).then(v => { if (alive && selection.current === payload.project_id) setSnapshot(v); });
    });
    return () => { alive = false; generation.current++; void unlisten.then(off => off()); };
  }, []);
  useEffect(() => {
    let alive = true; setSnapshot(null); setBaseline(''); setCandidate(''); setEntries(null); setComparison(null); setOffset(0); setFilter(''); setQuery(''); setError('');
    if (selected) void api.getConversionSnapshot(selected).then(s => { if (alive) { setSnapshot(s); setBaseline(s.inputs[0]?.sha256 || ''); } }).catch(e => { if (alive) setError(String(e)); });
    return () => { alive = false; };
  }, [selected]);
  useEffect(() => {
    let alive = true; setEntries(null); setComparison(null); setLoading(!!baseline);
    const timer = window.setTimeout(() => {
      if (!baseline) return;
      const read = candidate ? api.compareConversionInputs(baseline, candidate, query, filter, offset).then(v => { if (alive) setComparison(v); }) : api.getConversionEntries(baseline, query, filter, offset).then(v => { if (alive) setEntries(v); });
      void read.catch(e => { if (alive) setError(String(e)); }).finally(() => { if (alive) setLoading(false); });
    }, 140);
    return () => { alive = false; clearTimeout(timer); };
  }, [baseline, candidate, query, filter, offset, snapshot?.id]);
  const edit = (key: keyof ConversionRequest, value: string | number) => setRequest(r => ({ ...r, [key]: value }));
  async function addFiles() {
    try {
      const paths = await open({ multiple: true, filters: [{ name: 'Minecraft source or content packages', extensions: ['zip', 'jar', 'mcpack', 'mcaddon'] }] });
      if (paths) setRequest(r => ({ ...r, inputs: [...r.inputs, ...(Array.isArray(paths) ? paths : [paths]).filter(path => !r.inputs.some(i => i.path === path)).map(path => ({ path, label: path.split(/[\\/]/).pop() || path, role: 'reference' as const }))] }));
    } catch (e) { setError(String(e)); }
  }
  async function inspect() {
    const g = ++generation.current; const submitted = request; setBusy(true); setError('');
    try {
      const result = await api.startConversionIntake({ ...submitted, inputs: submitted.inputs.map(i => ({ ...i, expected_sha256: i.expected_sha256?.trim() || null })) });
      if (g !== generation.current) return;
      await refresh(); setSelected(result.project_id); setSnapshot(result); setBaseline(result.inputs[0]?.sha256 || '');
    } catch (e) { if (g === generation.current) setError(String(e)); }
    finally { if (g === generation.current) setBusy(false); }
  }
  const total = comparison?.total ?? entries?.total ?? 0;
  const input = snapshot?.inputs.find(i => i.sha256 === baseline);
  return <div className="flex h-full flex-col overflow-y-auto p-6 text-content">
    <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div><div className="mb-1 text-xs font-semibold uppercase tracking-widest text-brand">Project studio</div><h1 className="text-2xl font-semibold">Every original. Every change.</h1><p className="mt-2 text-sm text-content-muted">Preserve source packages, inspect their contents, and trace what still needs to be restored.</p></div>
      <button className={button} disabled={busy} onClick={() => { setSelected(''); setRequest(empty()); }}><Plus size={15} />New project</button>
    </header>
    {error && <div role="alert" className="mb-4 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">{error}</div>}
    <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
      <aside className="space-y-4">
        <label className="block text-xs text-content-muted">Saved projects<select aria-label="Saved conversion project" className={`${field} mt-2`} value={selected} disabled={busy} onChange={e => { const p = projects.find(p => p.project_id === e.target.value); setSelected(e.target.value); setRequest(p?.request || empty()); }}><option value="">New project</option>{projects.map(p => <option key={p.project_id} value={p.project_id}>{p.title}</option>)}</select></label>
        <form className="space-y-3 rounded-xl border border-border bg-surface-1/50 p-4" onSubmit={e => { e.preventDefault(); void inspect(); }}>
          <fieldset disabled={busy} className="space-y-3">
            <legend className="mb-3 font-semibold">Primary target &amp; inputs</legend>
            <label className="block text-xs text-content-muted">Project name<input required className={`${field} mt-1`} value={request.title} onChange={e => { edit('title', e.target.value); if (!selected) edit('project_id', e.target.value.toLowerCase().replace(/[^a-z0-9_-]+/g, '-')); }} placeholder="Advent of Ascension" /></label>
            <label className="block text-xs text-content-muted">Project ID<input required pattern="[A-Za-z0-9_-]+" className={`${field} mt-1`} value={request.project_id} onChange={e => edit('project_id', e.target.value)} readOnly={!!selected} /></label>
            <div className="grid grid-cols-2 gap-2"><label className="text-xs text-content-muted">Minecraft<input required className={`${field} mt-1`} value={request.minecraft} onChange={e => edit('minecraft', e.target.value)} placeholder="1.20.1" /></label><label className="text-xs text-content-muted">Java<input required type="number" min={1} className={`${field} mt-1`} value={request.java} onChange={e => edit('java', +e.target.value)} /></label></div>
            <div className="grid grid-cols-2 gap-2"><label className="text-xs text-content-muted">Loader<select className={`${field} mt-1`} value={request.loader} onChange={e => edit('loader', e.target.value)}>{['forge','neoforge','fabric','quilt','bedrock'].map(v => <option key={v}>{v}</option>)}</select></label><label className="text-xs text-content-muted">Loader version<input required className={`${field} mt-1`} value={request.loader_version} onChange={e => edit('loader_version', e.target.value)} placeholder="47.4.23" /></label></div>
            <label className="block text-xs text-content-muted">Starting checkpoint<input className={`${field} mt-1`} value={request.checkpoint} onChange={e => edit('checkpoint', e.target.value)} placeholder="CP40 / Batch34 visual final" /></label>
            <button type="button" className={`${button} w-full`} onClick={() => void addFiles()}><FolderPlus size={15} />Add packages</button>
            {request.inputs.map((i, index) => <div key={`${i.path}-${index}`} className="space-y-2 rounded-lg border border-border p-2.5">
              <div className="flex items-center gap-2"><Archive size={15} className="shrink-0 text-brand" /><span className="min-w-0 flex-1 break-all text-xs" title={i.path}>{i.label}</span><button type="button" aria-label={`Remove ${i.label}`} onClick={() => setRequest(r => ({ ...r, inputs: r.inputs.filter((_, n) => n !== index) }))}><X size={14} /></button></div>
              <select aria-label={`Role for ${i.label}`} className={field} value={i.role} onChange={e => setRequest(r => ({ ...r, inputs: r.inputs.map((v,n) => n === index ? { ...v, role: e.target.value as typeof i.role } : v) }))}>{['authority','checkpoint','reference','candidate','toolkit'].map(v => <option key={v}>{v}</option>)}</select>
              <input aria-label={`Expected SHA-256 for ${i.label}`} className={field} placeholder="Expected SHA-256 (optional)" pattern="[A-Fa-f0-9]{64}" value={i.expected_sha256 || ''} onChange={e => setRequest(r => ({ ...r, inputs: r.inputs.map((v,n) => n === index ? { ...v, expected_sha256: e.target.value } : v) }))} />
            </div>)}
          </fieldset>
          <button type="submit" disabled={busy || !request.inputs.length} className={`${button} w-full border-brand/40 bg-brand/15 text-brand`}>{busy ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}{busy ? 'Preserving & indexing…' : 'Inspect and save checkpoint'}</button>
          <p className="text-xs leading-relaxed text-content-faint">Original files stay untouched. Cancel or resume interrupted work from Activity. Existing verified package inventories are reused.</p>
        </form>
      </aside>
      <section className="min-w-0 space-y-4">
        {!snapshot ? <div className="grid min-h-80 place-content-center rounded-2xl border border-dashed border-border p-10 text-center"><Archive className="mx-auto mb-4 text-brand" size={40} /><h2 className="text-lg font-semibold">A clear starting point</h2><p className="mt-2 max-w-lg text-sm text-content-muted">Add the original release, checkpoint source and candidate package to build a searchable, hash-verified inventory. No files are executed during inspection.</p></div> : <>
          <div className="rounded-xl border border-brand/25 bg-brand/5 p-5"><div className="flex items-center gap-2 text-sm font-semibold"><Check size={17} className="text-brand" />{snapshot.title}<span className="ml-auto rounded-full bg-brand/10 px-2 py-1 text-[11px] text-brand">Inputs indexed</span></div><p className="mt-2 text-sm text-content-muted">{snapshot.primary_target.minecraft} · {snapshot.primary_target.loader} {snapshot.primary_target.loader_version} · Java {snapshot.primary_target.java}</p><p className="mt-1 text-xs text-content-faint">{snapshot.checkpoint || 'Initial intake'} · {snapshot.inputs.reduce((n,i) => n + i.entry_count, 0).toLocaleString()} entries · {snapshot.inputs.length} packages</p><p className="mt-3 text-xs leading-relaxed text-content-muted">{snapshot.scope}</p></div>
          <div className="grid gap-2 sm:grid-cols-2">{snapshot.inputs.map((i,n) => <button key={`${i.sha256}-${n}`} className={`min-w-0 rounded-xl border p-3 text-left ${baseline === i.sha256 ? 'border-brand/50 bg-brand/5' : 'border-border hover:bg-surface-1'}`} onClick={() => { setBaseline(i.sha256); setOffset(0); setFilter(''); }}><div className="flex items-center gap-2"><Archive size={15} className="shrink-0 text-brand" /><span className="truncate text-sm font-semibold">{i.label}</span></div><p className="mt-2 text-xs text-content-muted">{i.role} · {i.entry_count.toLocaleString()} entries · {formatBytes(i.bytes)}</p><p className="mt-1 truncate font-mono text-[10px] text-content-faint" title={i.sha256}>SHA-256 {i.sha256}</p><p className="mt-1 text-[11px] text-brand">{i.expected_hash_verified ? 'Matches expected SHA-256' : 'Measured and preserved'}{i.cache_reused ? ' · Reused inventory' : ''}</p>{i.warnings.length > 0 && <p className="mt-1 text-xs text-warn">{i.warnings.length} package warnings</p>}</button>)}</div>
          {input && input.warnings.length > 0 && <details className="rounded-lg border border-warn/30 p-3 text-xs text-warn"><summary>Package warnings — review before extracting or building</summary><ul className="mt-2 list-inside list-disc break-all">{input.warnings.map((w,i) => <li key={i}>{w}</li>)}</ul></details>}
          {input && <EvidenceDetails key={`${snapshot.id}:${input.sha256}`} evidenceId={`conversion:${snapshot.id}:${input.sha256}`} />}
          <div className="flex flex-wrap items-center gap-2"><ArrowLeftRight size={16} className="text-brand" /><select aria-label="Compare with package" className={`${field} min-w-0 flex-1`} value={candidate} onChange={e => { setCandidate(e.target.value); setOffset(0); setFilter(''); }}><option value="">Browse selected package</option>{snapshot.inputs.filter(i => i.sha256 !== baseline).map((i,n) => <option key={n} value={i.sha256}>Compare with {i.label}</option>)}</select></div>
          {comparison && <div className="flex flex-wrap gap-2">{statuses.map(s => <button key={s} className={`${button} ${filter === s ? 'border-brand text-brand' : ''}`} onClick={() => { setFilter(filter === s ? '' : s); setOffset(0); }}>{words(s)} <strong>{(comparison.counts[s] || 0).toLocaleString()}</strong></button>)}</div>}
          <div className="flex gap-2"><label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border px-3"><Search size={15} /><input aria-label="Search package paths" value={query} onChange={e => { setQuery(e.target.value); setOffset(0); }} className="w-full bg-transparent py-2 text-sm outline-none" placeholder="Search every indexed path…" /></label>{!candidate && <select aria-label="Content family" className={`${field} max-w-48`} value={filter} onChange={e => { setFilter(e.target.value); setOffset(0); }}><option value="">All content families</option>{Object.keys(input?.families || {}).sort().map(f => <option key={f}>{f}</option>)}</select>}</div>
          <div className="overflow-hidden rounded-xl border border-border"><div className="flex items-center justify-between border-b border-border bg-surface-1 px-3 py-2 text-xs text-content-muted"><span aria-live="polite">{loading ? 'Reading inventory…' : `${total.toLocaleString()} matching paths`}</span><span>Byte identity &amp; resource paths</span></div><div className="max-h-[480px] overflow-auto">
            {loading ? <div className="p-8 text-center"><Loader2 className="mx-auto animate-spin text-brand" size={20} /></div> : (comparison?.rows || entries?.entries || []).map((r,index) => <div key={index} className="flex gap-3 border-b border-border-soft px-3 py-2 text-xs last:border-0"><span className="min-w-0 flex-1 break-all font-mono">{'status' in r ? r.key : r.path}</span><span className={`shrink-0 ${'status' in r && ['missing','ambiguous'].includes(r.status) ? 'text-warn' : 'text-content-muted'}`}>{'status' in r ? words(r.status) : r.family}</span></div>)}
            {!loading && !total && <p className="p-8 text-center text-sm text-content-faint">No paths match these filters.</p>}
          </div></div>
          <div className="flex items-center justify-between text-xs text-content-muted"><button className={button} disabled={loading || offset === 0} onClick={() => setOffset(n => Math.max(0,n - 100))}>Previous</button><span>{total ? `${offset + 1}–${Math.min(offset+100,total)} of ${total.toLocaleString()}` : '0 results'}</span><button className={button} disabled={loading || offset + 100 >= total} onClick={() => setOffset(n => n + 100)}>Next</button></div>
        </>}
      </section>
    </div>
  </div>;
}
