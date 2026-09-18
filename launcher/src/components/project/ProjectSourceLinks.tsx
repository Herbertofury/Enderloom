import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Link2, Loader2, Plus, Unlink, X } from 'lucide-react';
import { openUrl } from '@tauri-apps/plugin-opener';
import { api } from '../../lib/api';
import type { ProjectArtifactGraph, ProjectSourcePreview, ProviderProjectIdentity } from '../../lib/artifacts';
import { ContentIcon } from '../ContentIcon';

const button = 'inline-flex items-center justify-center gap-2 rounded-lg border border-border-soft px-3 py-2 text-xs font-medium text-content transition-colors hover:bg-surface-3 disabled:opacity-50';
const input = 'rounded-lg border border-border-soft bg-surface px-3 py-2 text-sm text-content outline-none focus:border-brand';

function SourceCard({ source }: { source: ProviderProjectIdentity }) {
  return <div className="flex min-w-0 items-start gap-3 rounded-xl border border-border-soft bg-surface p-3">
    <ContentIcon src={source.icon_url} title={source.title} className="size-11 shrink-0 rounded-lg" />
    <div className="min-w-0 flex-1"><p className="text-[10px] font-semibold uppercase tracking-wider text-brand">{source.provider}</p><p className="truncate text-sm font-semibold text-content" title={source.title}>{source.title}</p><p className="truncate text-xs text-content-muted">{source.author || 'Author unavailable'}</p><p className="mt-1 break-all font-mono text-[10px] text-content-faint">Project {source.project_id}</p></div>
    <button type="button" className="rounded p-1 text-content-faint hover:text-content" aria-label={`Open ${source.provider} source for ${source.title}`} onClick={() => void openUrl(source.source_url)}><ExternalLink className="size-3.5" /></button>
  </div>;
}

export function ProjectSourceLinks({ provider, projectId, graph, onChange }: { provider: string; projectId: string; graph: ProjectArtifactGraph | null; onChange: (graph: ProjectArtifactGraph) => void }) {
  const [editing, setEditing] = useState(false), [otherProvider, setOtherProvider] = useState(provider === 'modrinth' ? 'curseforge' : 'modrinth');
  const [otherId, setOtherId] = useState(''), [reason, setReason] = useState(''), [confirmed, setConfirmed] = useState(false);
  const [preview, setPreview] = useState<ProjectSourcePreview | null>(null), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const request = useRef(0);
  useEffect(() => () => { request.current++; }, []);
  function resetPreview() { request.current++; setPreview(null); setConfirmed(false); setBusy(false); setError(''); }
  async function inspect() {
    const ticket = ++request.current; setBusy(true); setError(''); setPreview(null); setConfirmed(false);
    try { const value = await api.previewProjectSourceLink(provider, projectId, otherProvider, otherId.trim()); if (request.current === ticket) setPreview(value); }
    catch (e) { if (request.current === ticket) setError(String(e)); }
    finally { if (request.current === ticket) setBusy(false); }
  }
  async function save() {
    if (!preview || !confirmed || !reason.trim()) return;
    const ticket = ++request.current; setBusy(true); setError('');
    try {
      const value = await api.linkProjectSources(preview.left.provider, preview.left.project_id, preview.right.provider, preview.right.project_id, reason.trim(), confirmed);
      if (request.current === ticket) { onChange(value); setEditing(false); setPreview(null); setOtherId(''); setReason(''); setConfirmed(false); }
    } catch (e) { if (request.current === ticket) setError(String(e)); }
    finally { if (request.current === ticket) setBusy(false); }
  }
  async function unlink(linkId: string) {
    const ticket = ++request.current; setBusy(true); setError('');
    try { const value = await api.unlinkProjectSource(provider, projectId, linkId); if (request.current === ticket) onChange(value); }
    catch (e) { if (request.current === ticket) setError(String(e)); }
    finally { if (request.current === ticket) setBusy(false); }
  }
  const links = graph?.source_links?.filter(link => link.active) || [];
  return <section aria-label="Project sources" className="space-y-3 rounded-xl border border-border-soft bg-surface-2/60 p-3">
    <div className="flex items-center gap-2"><Link2 className="size-4 text-brand" /><h3 className="text-xs font-semibold text-content">Project sources</h3><button type="button" className={`${button} ml-auto`} disabled={busy} onClick={() => { resetPreview(); setEditing(!editing); }}>{editing ? <X className="size-3.5" /> : <Plus className="size-3.5" />}{editing ? 'Cancel linking' : 'Link another source'}</button></div>
    {!links.length && !editing && <p className="text-xs text-content-faint">Connect this mod’s other provider page to see its installed copies and release history together.</p>}
    {links.map(link => <div key={link.id} className="space-y-2 border-t border-border-soft pt-3">
      <div className="grid gap-2 sm:grid-cols-2"><SourceCard source={link.left} /><SourceCard source={link.right} /></div>
      <div className="flex items-start gap-3"><details className="min-w-0 flex-1 text-xs text-content-muted"><summary className="cursor-pointer">Why are these linked?</summary><p className="mt-2 whitespace-pre-wrap break-words">{link.reason}</p><p className="mt-1 text-content-faint">Confirmed by you · {new Date(link.updated_at).toLocaleString()}. Source details come from the providers.</p></details><button type="button" className={button} disabled={busy} onClick={() => void unlink(link.id)} aria-label={`Unlink ${link.left.title} and ${link.right.title}`}><Unlink className="size-3.5" />Unlink</button></div>
    </div>)}
    {editing && <form className="space-y-3 border-t border-border-soft pt-3" onSubmit={event => { event.preventDefault(); void inspect(); }}>
      <div className="flex flex-wrap items-end gap-2"><label className="flex flex-col gap-1 text-xs text-content-muted">Provider<select className={input} value={otherProvider} disabled={busy} onChange={e => { setOtherProvider(e.target.value); resetPreview(); }}><option value="curseforge">CurseForge</option><option value="modrinth">Modrinth</option></select></label><label className="flex min-w-44 flex-1 flex-col gap-1 text-xs text-content-muted">Other project ID<input className={input} value={otherId} disabled={busy} placeholder={otherProvider === 'curseforge' ? 'Numeric Project ID, e.g. 328085' : 'Project ID or slug, e.g. create'} onChange={e => { setOtherId(e.target.value); resetPreview(); }} /></label><button className={button} disabled={busy || !otherId.trim()} type="submit">{busy ? <Loader2 className="size-3.5 animate-spin" /> : <Link2 className="size-3.5" />}Compare sources</button></div>
      {preview && <div className="space-y-3 rounded-xl border border-brand/20 bg-brand/5 p-3">
        <div className="grid gap-2 sm:grid-cols-2"><SourceCard source={preview.left} /><SourceCard source={preview.right} /></div>
        <p className="text-xs text-content-muted">{preview.matching_file_hashes.length ? `${preview.matching_file_hashes.length} matching verified file ${preview.matching_file_hashes.length === 1 ? 'hash' : 'hashes'} recorded. Check the author and project pages before linking.` : 'No matching verified files recorded yet. Check both project pages and their authors.'}</p>
        <label className="flex flex-col gap-1 text-xs text-content-muted">Why these are the same project<textarea className={`${input} min-h-16 resize-y`} value={reason} disabled={busy} placeholder="For example, the author links both pages from their official project." onChange={e => setReason(e.target.value)} /></label>
        <label className="flex items-start gap-2 text-xs text-content"><input type="checkbox" className="mt-0.5 accent-brand" checked={confirmed} disabled={busy} onChange={e => setConfirmed(e.target.checked)} />I checked that these pages are the same project, including the author, rather than a fork or add-on.</label>
        <div className="flex flex-wrap items-center gap-3"><button type="button" className={`${button} bg-brand/15`} disabled={busy || !confirmed || !reason.trim()} onClick={() => void save()}>Link these sources</button><p className="text-[11px] text-content-faint">You can unlink them anytime. Files stay in place.</p></div>
      </div>}
    </form>}
    {error && <p role="alert" className="text-xs text-red-300">{error}</p>}
  </section>;
}
