import { Code2, ExternalLink, FileCode2 } from 'lucide-react';
import { openUrl } from '@tauri-apps/plugin-opener';
import type { ProjectContext } from '../../lib/artifacts';
import { CodeSymbols } from './CodeSymbols';

export function ProjectProvenance({ target }: { target: ProjectContext['targets'][number] }) {
  if (!target.provenance?.length && !target.source_evidence?.length) return null;
  return <details className="mt-3 border-t border-border-soft pt-3">
    <summary className="flex cursor-pointer items-center gap-2 text-xs text-content-muted"><FileCode2 size={14}/>Source &amp; licenses</summary>
    <p className="my-2 text-[11px] text-content-faint">Declarations from installed files, kept separate for bundled mods. Source links and entrypoints are declared metadata; execution and permissions are not inferred.</p>
    <div className="space-y-2">{target.provenance?.map(({ file_name, enabled, record }, index) => <section key={`${file_name}:${record.archive_path}:${record.manifest}:${index}`} aria-label={`Source metadata ${record.mod_ids.join(', ')}`} className="min-w-0 rounded-lg border border-border-soft bg-surface p-3">
      <p className="text-xs font-medium text-content">{record.mod_ids.join(', ')}<span className="ml-2 font-normal text-content-faint">{record.archive_path ? 'Bundled' : 'Installed'}{!enabled && ' · disabled'}</span></p>
      <p className="mt-1 break-all font-mono text-[10px] text-content-faint">{file_name} → {record.archive_path}{record.manifest}</p>
      <div className="my-3 flex flex-wrap gap-1.5">{record.licenses.length ? record.licenses.map((license, i) => <span key={i} title={license.name ?? undefined} className="rounded border border-brand/15 bg-brand/10 px-2 py-1 text-[11px] text-brand">{license.id}{license.url && <button type="button" aria-label={`Read ${license.id} license`} className="ml-1 inline-flex" onClick={() => void openUrl(license.url!)}><ExternalLink size={11}/></button>}</span>) : <span className="text-[11px] text-content-faint">License not declared in this manifest</span>}</div>
      <div className="space-y-1">{record.links.map((link, i) => <button key={i} type="button" title={link.url} className="flex max-w-full items-center gap-2 text-left text-[11px] text-brand hover:underline" onClick={() => void openUrl(link.url)}><ExternalLink size={12} className="shrink-0"/><span className="min-w-0 break-all">{link.kind === 'sources' ? 'Source repository' : link.kind === 'issues' ? 'Issue tracker' : 'Project website'} · {link.url}</span></button>)}</div>
      {!!record.symbols.length && <details className="mt-3 border-t border-border-soft pt-2"><summary className="cursor-pointer text-[11px] text-content-muted">Declared entrypoints · {record.symbols.length}</summary>{record.symbols.map((symbol, i) => <div key={i} className="mt-2 flex items-start gap-2 text-[11px]"><Code2 size={13} className="mt-0.5 shrink-0 text-brand"/><div className="min-w-0"><code className="break-all text-content">{symbol.value}</code><p className="text-content-faint">{symbol.entrypoint}{symbol.adapter && ` · ${symbol.adapter}`}</p></div></div>)}</details>}
      <details className="mt-3 text-[10px] text-content-faint"><summary className="cursor-pointer">Manifest fingerprint</summary><p className="mt-1 break-all font-mono">SHA-256 · {record.manifest_sha256}</p></details>
      <CodeSymbols targetKind={target.kind} targetId={target.id} fileName={file_name} archivePath={record.archive_path}/>
    </section>)}</div>
    {!!target.source_evidence?.length && <div className="mt-3 space-y-2"><p className="text-xs font-medium text-content">Config declarations found in source</p>{target.source_evidence.map(({ file_name, checked_at, evidence }, index) => <div key={index} className="rounded-lg bg-surface p-3 text-xs">
      <p className="break-all text-content">{evidence.path}<span className="ml-2 text-content-faint">{evidence.scope}</span></p>
      <p className="my-1 text-[11px] text-content-faint">{evidence.version_match ? 'Declared version tag' : 'Repository revision · installed version unverified'} · {evidence.reference} · {file_name}</p>
      <button type="button" className="flex items-center gap-1 text-[11px] text-brand hover:underline" onClick={() => void openUrl(evidence.source_url)}><ExternalLink size={12}/>View source declaration</button>
      <p className="mt-1 break-all font-mono text-[10px] text-content-faint">{evidence.repository} · {evidence.revision} · line {evidence.line}</p>
      <p className="mt-1 text-[10px] text-content-faint">Checked {new Date(checked_at * 1000).toLocaleString()}</p>
    </div>)}</div>}
  </details>;
}
