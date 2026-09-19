import { useEffect, useState } from 'react';
import { ChevronRight, GitBranch, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import type { Task } from '../lib/types';
import { EvidenceDetails } from './EvidenceDetails';

type Record = Awaited<ReturnType<typeof api.getTaskDetail>>;
const time = (n: number | null) => n == null ? 'Not recorded' : new Date(n * 1000).toLocaleString();
const words = (value: string) => value.replace(/_/g, ' ');

export function TaskDetails({ task }: { task: Task }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(task.id);
  const [record, setRecord] = useState<Record | null>(null);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    if (!open) return;
    let live = true;
    setRecord(null); setError('');
    api.getTaskDetail(selected).then(value => { if (live) setRecord(value); }, reason => { if (live) setError(String(reason)); });
    return () => { live = false; };
  }, [open, selected, task.state, task.attempt, refresh]);
  const current = record?.task.id === task.id && (task.revision ?? 0) >= (record.task.revision ?? 0) ? task : record?.task;
  const details = current?.details;
  return <details className="mt-2 text-[11px]" open={open} onToggle={event => setOpen(event.currentTarget.open)}>
    <summary className="cursor-pointer select-none text-content-muted hover:text-content">Task history &amp; evidence</summary>
    {open && <div className="mt-2 min-w-0 space-y-3 rounded-lg border border-border bg-surface p-3 [overflow-wrap:anywhere]" data-testid="task-details">
      {error && <p role="alert" className="text-danger">{error}</p>}
      {!record && !error && <p role="status" className="flex items-center gap-2"><Loader2 size={12} className="animate-spin" />Loading task history…</p>}
      {record && current && details && <>
        {selected !== task.id && <button className="text-brand" onClick={() => setSelected(task.id)}>← Back to {task.title}</button>}
        <div className="flex items-start justify-between gap-2"><p className="font-semibold text-content">{current.title}{details.archived && <span className="ml-2 font-normal text-content-faint">Archived</span>}</p><button className="text-content-faint hover:text-content" aria-label="Refresh task details" onClick={() => setRefresh(n => n + 1)}>Refresh</button></div>
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-content-muted">
          <dt>Operation</dt><dd className="break-all">{details.operation}</dd>
          <dt>Task ID</dt><dd className="break-all font-mono text-[10px] select-text">{current.id}</dd>
          {details.target && <><dt>{words(details.target.kind)}</dt><dd className="break-all select-text">{details.target.id}</dd></>}
        </dl>
        {details.blocker && <div className="rounded-md bg-warn/10 p-2 text-warn"><p>{details.blocker.reason}</p><p className="mt-1 text-content-muted">{details.blocker.recovery}</p></div>}
        {details.history_note && <p className="text-content-faint">{details.history_note}</p>}
        <ol className="space-y-2 border-l border-border pl-3" aria-label="Task attempts">{details.attempts.map(attempt => <li key={attempt.id}>
          <p className="font-medium">Attempt {attempt.number} · {words(attempt.state)}</p>
          <p className="text-content-faint">{time(attempt.started_at)}{attempt.finished_at != null && <> → {time(attempt.finished_at)}</>}</p>
          <p className="break-words text-content-muted">{attempt.error || attempt.stage}</p>
        </li>)}</ol>
        {details.cancellation_requested_at != null && <p className="text-content-faint">Cancellation requested {time(details.cancellation_requested_at)}</p>}
        {details.checkpoint_id && <details><summary className="cursor-pointer text-content-muted">Resume checkpoint</summary><p className="mt-1 break-all font-mono text-[10px] select-text">{details.checkpoint_id}</p></details>}
        {(record.parent || record.children.length > 0) && <div className="space-y-1 border-t border-border pt-2"><p className="mb-2 flex items-center gap-1 font-medium"><GitBranch size={12} />Related tasks</p>{[...(record.parent ? [record.parent] : []), ...record.children].map(related => <button key={related.id} className="flex w-full items-center gap-1 rounded p-1 text-left hover:bg-surface-2" onClick={() => setSelected(related.id)}><ChevronRight size={12} /><span className="min-w-0 flex-1 break-words">{related.id === record.parent?.id ? 'Parent' : 'Child'} · {related.title}</span><span className="text-content-faint">{words(related.state)}</span></button>)}</div>}
        {details.run_ids.length > 0 && <details><summary className="cursor-pointer text-content-muted">Run identities ({details.run_ids.length})</summary>{details.run_ids.map(id => <p key={id} className="mt-1 break-all font-mono text-[10px] select-text">{id}</p>)}</details>}
        {details.processes.length > 0 && <div className="space-y-1"><p className="font-medium">Observed processes</p>{details.processes.map(p => <p key={`${p.run_id}:${p.pid}:${p.role}`} className="text-content-muted">{words(p.role)} · PID {p.pid} · Attempt {p.attempt}<br /><span className="text-content-faint">{p.stopped_at ? `Stopped ${time(p.stopped_at)}` : `Observed ${time(p.observed_at)} · current state not checked`}</span></p>)}</div>}
        {details.cleanup.length > 0 && <div className="space-y-2"><p className="font-medium">Owned resources</p>{details.cleanup.map(resource => <div key={resource.id} className="rounded-md bg-surface-2 p-2"><p className={resource.state === 'removed' ? 'text-ok' : 'text-warn'}>{words(resource.kind)} · {words(resource.state)}</p><p className="mt-1 break-all text-[10px] text-content-faint select-text">{resource.path}</p><p className="mt-1 text-content-muted">{resource.reason}</p></div>)}</div>}
        {details.produced_evidence.map((id, index) => <EvidenceDetails key={id} evidenceId={id} title={`Produced evidence ${index + 1}`} />)}
      </>}
    </div>}
  </details>;
}
