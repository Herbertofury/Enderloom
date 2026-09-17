import { useEffect, useState } from 'react';
import { Fingerprint, Loader2, ShieldCheck, TriangleAlert } from 'lucide-react';
import { api } from '../../lib/api';
import type { ProjectArtifactGraph } from '../../lib/artifacts';
import type { SearchProvider } from '../../lib/types';
import { useStore } from '../../store';

export function ProjectArtifactIdentity({ provider, projectId }: { provider: SearchProvider; projectId: string }) {
  const [open, setOpen] = useState(false), [graph, setGraph] = useState<ProjectArtifactGraph | null>(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const instances = useStore(state => state.instances);
  useEffect(() => {
    if (!open) return;
    let live = true;
    void api.getProjectArtifactGraph(provider, projectId).then(value => { if (live) setGraph(value); }).catch(e => { if (live) setError(String(e)); });
    return () => { live = false; };
  }, [open, provider, projectId]);
  async function verify() {
    setBusy(true); setError('');
    try { setGraph(await api.verifyProjectArtifacts(provider, projectId)); }
    catch (e) { setError(String(e)); }
    finally { setBusy(false); }
  }
  const current = graph?.observations.filter(row => row.current) || [];
  return <details className="relative mx-6 mb-5 rounded-xl border border-border-soft bg-surface/80" onToggle={event => setOpen(event.currentTarget.open)}>
    <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-medium text-content"><Fingerprint className="size-4 text-brand" />Installed file identity<span className="ml-auto text-xs font-normal text-content-faint">Originals & changes</span></summary>
    {open && <div className="space-y-3 border-t border-border-soft p-4">
      <div className="flex items-center justify-between gap-4"><p className="text-xs text-content-muted">Verify exact installed bytes against the recorded release. Earlier fingerprints stay in history.</p><button type="button" disabled={busy} onClick={() => void verify()} className="flex shrink-0 items-center gap-2 rounded-lg bg-surface-3 px-3 py-2 text-xs font-medium text-content disabled:opacity-50">{busy ? <Loader2 className="size-3.5 animate-spin" /> : <Fingerprint className="size-3.5" />}{busy ? 'Verifying files…' : 'Verify installed files'}</button></div>
      {error && <p role="alert" className="text-xs text-red-300">{error}</p>}
      {!current.length && !busy && <p className="text-xs text-content-faint">No verified installed copies recorded yet. Verification checks this project’s known installed files.</p>}
      {graph?.observations.map(row => <div key={row.observation_id} className={`rounded-lg border border-border-soft p-3 ${row.current ? 'bg-surface-2' : 'opacity-65'}`}>
        <div className="flex flex-wrap items-center gap-2 text-xs"><span className="font-medium text-content">{row.file_name}</span><span className={`ml-auto flex items-center gap-1 ${row.source_match === 'verified' ? 'text-emerald-300' : row.source_match === 'modified' ? 'text-amber-300' : 'text-content-muted'}`}>{row.source_match === 'verified' ? <ShieldCheck className="size-3.5" /> : <TriangleAlert className="size-3.5" />}{row.source_match === 'verified' ? 'Matches recorded release' : row.source_match === 'modified' ? 'Differs from recorded release' : 'Source hash unavailable'}</span></div>
        <p className="mt-1 text-xs text-content-faint">{instances.find(instance => instance.id === row.target_id)?.name || row.target_kind} · file version {row.provider_version_id || 'unknown'} · {row.current ? 'Last checked' : 'Earlier observation'} {new Date(row.observed_at).toLocaleString()}</p>
        <p className="mt-2 break-all font-mono text-[11px] text-content-muted" title="Measured SHA-256">SHA-256 {row.artifact.sha256}</p>
        {row.previous_sha256 && <p className="mt-1 break-all font-mono text-[11px] text-content-faint">Previous at this path: {row.previous_sha256}</p>}
      </div>)}
    </div>}
  </details>;
}
