import { useEffect, useRef, useState } from 'react';
import { FileCheck2, Link2, Loader2, ShieldCheck } from 'lucide-react';
import { api } from '../lib/api';
import { formatBytes } from '../lib/format';
import type { EvidenceArtifact, EvidenceRelation, EvidenceVerification } from '../lib/evidence';

const button = 'inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs hover:bg-surface-2 disabled:opacity-40';
const field = 'min-w-0 rounded-lg border border-border bg-surface-1 px-2 py-2 text-xs';
const words = (value: string) => value.replace(/_/g, ' ');
export function EvidenceDetails({ evidenceId, title = 'Evidence & source' }: { evidenceId: string; title?: string }) {
  const [expanded, setExpanded] = useState(false), [record, setRecord] = useState<EvidenceArtifact | null>(null);
  const [verification, setVerification] = useState<EvidenceVerification | null>(null);
  const [others, setOthers] = useState<EvidenceArtifact[]>([]), [other, setOther] = useState('');
  const [relation, setRelation] = useState<EvidenceRelation>('comparison'), [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const epoch = useRef(0);
  useEffect(() => {
    const current = ++epoch.current; setRecord(null); setVerification(null); setOthers([]); setOther(''); setReason(''); setError(''); setBusy(false);
    if (expanded) void api.getEvidenceArtifact(evidenceId).then(async r => {
      if (current !== epoch.current) return; setRecord(r);
      const rows = await api.getEvidenceArtifacts(r.target.kind, r.target.id);
      if (current === epoch.current) setOthers(rows.filter(v => v.id !== evidenceId));
    }).catch(e => { if (current === epoch.current) setError(String(e)); });
    return () => { epoch.current++; };
  }, [evidenceId, expanded]);
  async function action(work: () => Promise<void>) {
    const current = epoch.current; setBusy(true); setError('');
    try { await work(); } catch (e) { if (current === epoch.current) setError(String(e)); }
    finally { if (current === epoch.current) setBusy(false); }
  }
  return <details className="mt-4 min-w-0 rounded-xl border border-border bg-surface-1/40 p-3 text-xs [overflow-wrap:anywhere]" open={expanded} onToggle={e => setExpanded(e.currentTarget.open)}>
    <summary className="cursor-pointer font-semibold text-content-muted"><FileCheck2 size={14} className="mr-2 inline text-brand" />{title}</summary>
    {expanded && <div className="mt-4 space-y-3">
      {error && <p role="alert" className="text-danger">{error}</p>}
      {!record ? (!error && <Loader2 size={16} className="animate-spin text-brand" />) : <>
        <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-brand/10 px-2 py-1 text-brand">{words(record.confidence_class)}</span><span className="text-content-faint">{record.producer ? `${record.producer.adapter} · ${record.producer.version}` : 'Original parser version not recorded'}</span></div>
        <p className="leading-relaxed text-content-muted">{record.scope}</p>
        <p className="leading-relaxed text-content-faint">{record.provenance.note}</p>
        <div className="grid gap-2 sm:grid-cols-2 text-content-muted"><span>Observed {record.observed_at ? new Date(record.observed_at).toLocaleString() : 'time not recorded'}</span><span className="break-all">Run {record.run_id || 'not recorded'}</span></div>
        {record.raw ? <div className="space-y-2 rounded-lg bg-surface-2 p-3"><p>{words(record.raw.representation)} · {formatBytes(record.raw.bytes)}</p><p className="break-all font-mono text-[10px] text-content-faint">SHA-256 {record.raw.sha256}</p><p className="break-all text-[10px] text-content-faint">{record.raw.path}</p></div> : <p className="text-warn">{record.missing_raw_reason}</p>}
        <button className={button} disabled={busy} onClick={() => { const current = epoch.current; void action(async () => { const result = await api.verifyEvidenceArtifact(evidenceId); if (current === epoch.current) setVerification(result); }); }}><ShieldCheck size={14} />Verify source</button>
        <button className={`${button} ml-2`} disabled={busy} onClick={() => { const current = epoch.current; void action(async () => { const freshness = await api.checkEvidenceFreshness(evidenceId); if (current === epoch.current) setRecord(r => r ? { ...r, freshness } : r); }); }}><FileCheck2 size={14} />Check current inputs</button>
        {busy && <p role="status" className="text-content-faint"><Loader2 size={12} className="mr-2 inline animate-spin" />Checking evidence…</p>}
        {record.freshness && <div className={`rounded-lg border p-3 ${record.freshness.state === 'current' ? 'border-brand/30 text-brand' : 'border-warn/30 text-warn'}`}><p className="font-semibold">{record.freshness.state === 'current' ? 'Inputs still match' : record.freshness.state === 'stale' ? 'Inputs changed · recheck before relying on this report' : 'Current applicability is unknown'}</p><p className="mt-1 text-[10px] text-content-faint">Checked {new Date(record.freshness.checked_at).toLocaleString()}{record.freshness.needs_recheck ? ' · newer changes detected' : ''}</p><ul className="mt-2 space-y-1 text-content-muted">{record.freshness.dependencies.filter(d => record.freshness?.state === 'current' || d.state !== 'unchanged').map((d,i) => <li key={i}>{d.reason}</li>)}</ul><p className="mt-2 text-content-faint">{record.freshness.scope}</p></div>}
        {verification && <div role="status" className={`rounded-lg border p-3 ${verification.raw.state === 'verified' && verification.normalized.state === 'verified' ? 'border-brand/30 text-brand' : 'border-warn/30 text-warn'}`}><p>Source: {words(verification.raw.state)} · Analysis: {words(verification.normalized.state)}</p>{verification.raw.reason && <p className="mt-2">{verification.raw.reason}</p>}<p className="mt-2 text-content-faint">{verification.scope}</p></div>}
        {!!record.links?.length && <div className="space-y-2">{record.links.map(link => <div key={link.id} className="rounded-lg border border-border p-2"><strong>{words(link.relation)}</strong><span className="ml-2 text-content-faint">{others.find(v => v.id === (link.from === evidenceId ? link.to : link.from))?.title || (link.from === evidenceId ? link.to : link.from)}</span><p className="mt-1 text-content-muted">{link.reason}</p></div>)}</div>}
        {!!others.length && <form className="flex flex-wrap gap-2 border-t border-border pt-3" onSubmit={e => { e.preventDefault(); const current = epoch.current; void action(async () => { await api.linkEvidenceArtifacts(evidenceId, other, relation, reason.trim()); const updated = await api.getEvidenceArtifact(evidenceId); if (current === epoch.current) { setRecord(updated); setReason(''); } }); }}>
          <select aria-label="Related evidence" required className={`${field} flex-1`} value={other} onChange={e => setOther(e.target.value)}><option value="">Relate another report…</option>{others.map(v => <option key={v.id} value={v.id}>{v.title} · {new Date(v.observed_at || v.recorded_at).toLocaleString()}</option>)}</select>
          <select aria-label="Evidence relationship" className={field} value={relation} onChange={e => setRelation(e.target.value as EvidenceRelation)}>{['comparison','contradiction','supports','supersedes'].map(v => <option key={v}>{v}</option>)}</select>
          <input aria-label="Evidence relationship reason" required className={`${field} w-full`} value={reason} onChange={e => setReason(e.target.value)} placeholder="What does this comparison show?" />
          <button className={button} disabled={busy || !other || !reason.trim()}><Link2 size={14} />Link evidence</button>
        </form>}
      </>}
    </div>}
  </details>;
}
