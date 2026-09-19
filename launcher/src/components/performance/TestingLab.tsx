import { useEffect, useRef, useState } from "react";
import { Camera, Play, Square, Video, Terminal, FolderOpen, ChevronRight, Download, FlaskConical, Loader2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { toast } from "sonner";
import { api } from "../../lib/api";
import type { SparkThread } from "../../lib/performance-evidence";
import type { TestReport, TestReportSummary } from "../../lib/testing";
import { useStore } from "../../store";
import type { WorldSummary } from "../../lib/types";
import aetherScenario from "../../../../tools/minecraft-testing/scenarios/aether-smoke.json";
import { ContentIcon } from "../ContentIcon";
import "./testing.css";

export function TestingLab({ instanceId, onEvidence }: { instanceId: string; onEvidence: () => void }) {
  const [reports, setReports] = useState<TestReportSummary[]>([]), [selected, select] = useState<string | null>(null), [report,setReport] = useState<TestReport | null>(null);
  const [record, setRecord] = useState(false), [busy, setBusy] = useState(false), [command, setCommand] = useState("gui"), [label, setLabel] = useState("Item in action");
  const [error, setError] = useState<string | null>(null);
  const [worlds,setWorlds] = useState<WorldSummary[]>([]), [world,setWorld] = useState("");
  const view=useRef({instanceId,selected}), request=useRef(0);view.current={instanceId,selected};
  const scenarioTask=useStore(s=>Object.values(s.tasks).find(t=>t.kind==="performance_test"&&t.instance_id===instanceId&&t.state==="running"&&t.title==="Run Minecraft scenario"));
  const testingRevision=useStore(s=>Object.values(s.tasks).filter(t=>t.kind==="performance_test"&&t.instance_id===instanceId).map(t=>`${t.id}:${t.state}`).join('|'));
  const refresh = async () => { const ticket=++request.current;const current=()=>ticket===request.current&&view.current.instanceId===instanceId&&view.current.selected===selected;try{const rows=(await api.getTestingReports()).filter(r => r.instance_id === instanceId);if(!current())return;setReports(rows);const id=rows.find(r=>r.id===selected)?.id ?? rows[0]?.id;const next=id ? await api.getTestingReport(id) : null;if(current()){if(next&&next.instance_id!==instanceId)throw new Error('This report belongs to a different instance.');setReport(next);setError(null);}}catch(e){if(current())setError(String(e));} };
  useEffect(() => {void refresh();return()=>{request.current++;};},[instanceId,selected,testingRevision]);
  useEffect(() => {let current=true;select(null);setReport(null);setReports([]);setBusy(false);setError(null);setWorld("");setWorlds([]);void api.listInstanceWorlds(instanceId).then(value=>{if(current)setWorlds(value);}).catch(()=>{if(current)setWorlds([]);});return()=>{current=false;};},[instanceId]);
  useEffect(() => { if (!reports.some(r => r.state === "running" || r.state === "preparing")) return; const timer = setInterval(() => { void refresh().catch(() => {}); }, 3000); return () => clearInterval(timer); }, [instanceId, selected, reports.some(r => r.state === "running" || r.state === "preparing")]);
  const work = async (action: () => Promise<unknown>) => {setBusy(true);setError(null);try{await action();if(view.current.instanceId===instanceId)await refresh();}catch(e){if(view.current.instanceId===instanceId)setError(String(e));}finally{if(view.current.instanceId===instanceId)setBusy(false);}};
  const running = report?.state === "running";
  const anyRunning = reports.some(r => ["running", "preparing"].includes(r.state));
  const analyze = () => work(async () => {
    if (!report) return;
    await api.analyzeTestingReport(report.id);
    if(view.current.instanceId===instanceId){onEvidence();toast.success("Test logs and Spark profiles added to this instance’s evidence");}
  });
  return <div className="test-lab">
    <section className="test-hero">
      <div className="test-hero-icon"><FlaskConical size={30}/></div><div><span className="test-eyebrow">TESTING LAB</span><h2>Play it. Measure it. Keep the proof.</h2><p>Drive a real Minecraft client from here or the CLI. Every session runs in its own copy and keeps its evidence together.</p></div>
      <span className="test-mode">Rendered client · CLI controlled</span>
    </section>
    <div className="test-setup">
      <label className="test-record"><input type="checkbox" checked={record} onChange={e => setRecord(e.target.checked)} disabled={busy || anyRunning}/><Video size={20}/><span><strong>Record this test</strong><small>Off by default · game window only · 30 fps · no audio</small></span></label>
      <select aria-label="Test world" value={world} onChange={e => setWorld(e.target.value)} disabled={busy || anyRunning}><option value="">Start at the title screen</option>{worlds.filter(w => w.status !== "damaged").map(w => <option key={w.folder_name} value={w.folder_name}>Copy world · {w.name}</option>)}</select>
      <button className="btn-primary" disabled={busy || anyRunning || !instanceId} onClick={() => work(async () => { const r = await api.startTestingSession(instanceId, record, 900, world || null);if(view.current.instanceId!==instanceId)return;select(r.id);if(r.error)setError(r.error); })}>{busy ? <Loader2 size={16} className="animate-spin"/> : <Play size={16}/>} Start test session</button>
      <button aria-label="Refresh test reports" disabled={busy} onClick={()=>void refresh()}><RefreshCw size={16}/>Refresh reports</button>
    </div>
    <p className="test-footnote">Pinned adapters: Minecraft 1.21.1 · NeoForge, Forge and Fabric. Windows recording requires FFmpeg. Recording adds overhead and is recorded in the comparison context. Sessions stop automatically after 15 minutes.</p>
    {error && <div className="test-error" role="alert"><AlertCircle size={18}/>{error}</div>}
    {!report ? <div className="test-empty"><Camera size={36}/><h3>Your next test, with evidence.</h3><p>Screenshots of an item working, a playable recording, the exact mod versions, and the commands that got you there.</p><code>enderloom test start "Instance name"</code></div> : <>
      <div className="test-report-top"><div><span className={`test-status ${report.state}`}>{report.state}</span><h3>{report.instance_name}</h3><p>Minecraft {report.minecraft} · {report.loader} {report.loader_version} · {new Date(report.at).toLocaleString()}</p></div>
        <select aria-label="Test report" value={report.id} onChange={e => select(e.target.value)}>{reports.map(r => <option value={r.id} key={r.id}>{new Date(r.at).toLocaleString()} · {r.state}</option>)}</select>
      </div>
      {report.ready_observation && <p className="test-footnote">World readiness verified · {report.ready_observation.dimension} · player position {report.ready_observation.position.map(n=>n.toFixed(1)).join(', ')} · {new Date(report.ready_observation.at).toLocaleTimeString()}</p>}
      {report.error && <div className="test-error">{report.error}</div>}
      {scenarioTask && <div className="test-actions"><span className="test-footnote">{scenarioTask.stage}</span><button onClick={()=>api.cancelTask(scenarioTask.id).catch(e=>setError(String(e)))}><Square size={16}/> Cancel scenario</button></div>}
      {report.scenario_error && <div className="test-error">{report.scenario_error}</div>}
      {running && report.mods?.some(m => m.source?.mod_id === "aether") && <div className="test-actions"><button disabled={busy} onClick={() => work(async () => {const r = await api.runTestingScenario(report.id,aetherScenario);if(r.scenario_error) setError(r.scenario_error);else await api.finishTestingSession(report.id);})}><FlaskConical size={16}/> Run Aether acceptance</button><span className="test-footnote">Requires a loaded world with commands enabled. Visits the dimension, tests the sword, records Spark and captures screenshots.</span></div>}
      {running && <section className="test-controls"><div className="test-command"><Terminal size={18}/><input aria-label="Minecraft test command" value={command} onChange={e => setCommand(e.target.value)} onKeyDown={e => { if(e.key === "Enter" && !busy) void work(() => api.testingCommand(report.id, command)); }}/><button disabled={busy || !command} onClick={() => work(() => api.testingCommand(report.id, command))}>Send <ChevronRight size={16}/></button></div>
        <div className="test-actions"><input aria-label="Screenshot label" value={label} onChange={e => setLabel(e.target.value)}/><button disabled={busy || !label} onClick={() => work(() => api.testingScreenshot(report.id,label))}><Camera size={16}/> Capture evidence</button><button disabled={busy} onClick={() => work(() => api.finishTestingSession(report.id))}><Square size={16}/> Finish & save report</button></div>
        <p className="test-footnote">Try <code>gui</code>, <code>click 0</code>, <code>key w --duration 1000</code> or a Minecraft <code>/command</code>. <code>@attack</code> and <code>@use</code> control the game without desktop focus. Save a private Spark capture with <code>/spark profiler stop --save-to-file</code>.</p>
      </section>}
      <div className="test-actions"><button onClick={() => window.enderloomLauncher.revealInFolder(report.report_dir)}><FolderOpen size={16}/> Evidence folder</button><button onClick={() => {const blob=new Blob([JSON.stringify(report,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`enderloom-test-${report.id}.json`;a.click();setTimeout(() => URL.revokeObjectURL(a.href),1000);}}><Download size={16}/> Export report</button><button disabled={busy || !report.artifacts.some(a => ["spark","log"].includes(a.kind))} onClick={analyze}>Analyze Spark & logs</button></div>
      {Object.keys(report.fps_by_dimension ?? {}).length > 0 && <section><h3>Observed client performance</h3><div className="test-metrics">{Object.entries(report.fps_by_dimension!).map(([dimension,m]) => <div key={dimension}><span>{dimension}</span><strong>{m.mean_fps.toFixed(1)} <small>FPS</small></strong><p>{m.samples} one-second observations · {m.min_reported_fps}–{m.max_reported_fps} reported FPS</p></div>)}</div><p className="test-footnote">{report.fps_note}</p></section>}
      {Object.keys(report.frame_times ?? {}).length > 0 && <section><h3>Frame pacing & hitches</h3><div className="test-metrics">{Object.entries(report.frame_times!).map(([dimension,m]) => <div key={dimension}><span>{dimension} · {m.frames.toLocaleString()} frames</span><strong>{m.p95_frame_ms.toFixed(1)} <small>ms · p95</small></strong><p>1% low: {m.one_percent_low_fps.toFixed(1)} FPS · p99: {m.p99_frame_ms.toFixed(1)} ms</p><p>{m.hitches_over_50ms} hitches over 50 ms · {m.hitches_over_250ms} over 250 ms</p></div>)}</div><p className="test-footnote">{report.frame_time_note}</p></section>}
      {!!report.evidence?.length && <section><h3>Spark & log findings</h3><div className="test-metrics">{report.evidence.filter(e => e.kind === "spark").map((e,i) => <div key={i}><span>{e.platform} · {((e.duration_ms ?? 0)/1000).toFixed(0)}s profile</span><strong>{e.tps?.toFixed(2) ?? "—"} <small>TPS</small></strong><p>MSPT p95: {e.mspt_p95?.toFixed(2) ?? "—"} ms</p>{e.threads?.filter(t=>/^(Render|Server) thread$/.test(t.name)).map(t=><ThreadSamples key={t.name} thread={t}/>)}{e.threads?.some(t=>!/^(Render|Server) thread$/.test(t.name)) && <details className="test-details"><summary>Other threads · {e.threads.filter(t=>!/^(Render|Server) thread$/.test(t.name)).length}</summary>{e.threads.filter(t=>!/^(Render|Server) thread$/.test(t.name)).map(t=><ThreadSamples key={t.name} thread={t}/>)}</details>}</div>)}</div>{report.evidence.flatMap(e => e.findings ?? []).map(f => <details key={f.category} className="test-details"><summary>{f.category} · {f.count}</summary>{f.examples.map((e,i) => <p key={i}>{e.text}</p>)}</details>)}<p className="test-footnote">Sample shares include waiting when Spark samples it. They do not measure CPU utilization or the FPS you would gain by removing a mod.</p></section>}
      {!!report.analysis_errors?.length && <div className="test-error" role="alert"><AlertCircle size={18}/><div><strong>Some evidence could not be analyzed</strong>{report.analysis_errors.map((failure,i)=><p key={i}>{failure.name}: {failure.error}</p>)}</div></div>}
      {report.evidence?.some(e=>e.warnings?.length) && <details className="test-details"><summary>Evidence limitations</summary>{report.evidence.flatMap(e=>(e.warnings??[]).map((warning,i)=><p key={`${e.id??e.title}:${i}`}>{e.title}: {warning}</p>))}</details>}
      {report.loaded_mods && <details className="test-details"><summary>Loaded mods & dependencies <span>{report.loaded_mods.length} runtime entries</span></summary><div className="test-loaded-mods">{report.loaded_mods.map(m => <div key={m.id}><span>{m.name}</span><code>{m.version}</code></div>)}</div><div className="test-loaded-mods">{Object.entries(report.runtime_environment ?? {}).map(([k,v]) => <div key={k}><span>{k.replace(/_/g," ")}</span><code>{String(v)}</code></div>)}</div></details>}
      {report.video_error && <div className="test-error" role="alert"><Video size={18}/>{report.video_error}</div>}
      {report.video_finalization_error && <div className="test-error" role="alert"><Video size={18}/>{report.video_finalization_error}</div>}
      {report.artifacts.some(a => a.kind === "video") && <section><h3>Replay the test</h3>{report.artifacts.filter(a => a.kind === "video").map(a => <video key={a.name} className="test-video" controls preload="metadata" src={convertFileSrc(a.path)}/>)}</section>}
      {report.artifacts.some(a => a.kind === "image") && <section><h3>Visual evidence</h3><div className="test-gallery">{report.artifacts.filter(a => a.kind === "image").map(a => <figure key={a.name}><a href={convertFileSrc(a.path)} target="_blank" rel="noreferrer"><img src={convertFileSrc(a.path)} alt={a.label} loading="lazy"/></a><figcaption><Camera size={14}/>{a.label}</figcaption></figure>)}</div></section>}
      <details className="test-details" open><summary>Test timeline <span>{report.steps.length} actions</span></summary>{report.steps.length ? report.steps.map((s,i) => <div className="test-step" key={i}>{s.status === "passed" ? <CheckCircle2 size={16}/> : <Terminal size={16}/>}<div><code>{s.command}</code><small>{s.status} · {(s.duration_ms/1000).toFixed(1)}s</small>{s.output && <pre>{s.output}</pre>}</div></div>) : <p>Commands and assertions will appear here.</p>}</details>
      <details className="test-details"><summary>Exact test environment <span>{report.mods?.length ?? 0} source mods + test instruments</span></summary><p>Adapter: {report.adapter.name} · {report.adapter.release}. Enderloom probe {report.probe_version}. Recording: {report.record_video ? "enabled" : "disabled"}.</p><div className="test-mods">{report.mods?.map(m => <div key={m.file_name}><ContentIcon title={m.title} src={m.source?.icon_url} style={{ width: 36, height: 36 }}/><span><strong>{m.title}</strong><small>{m.file_name}</small><code>{m.inspection?.sha256}</code></span></div>)}</div><p className="test-footnote">Input fingerprint: {report.input_fingerprint}</p></details>
      {report.finished_at && <p className="test-footnote">{report.cleaned_up ? "Temporary game copy removed. All evidence remains in this report." : `Cleanup needs attention: ${report.cleanup_error ?? "sandbox retained"}`}</p>}
    </>}
  </div>;
}

function ThreadSamples({ thread }: { thread: SparkThread }) {
  return <details className="test-details"><summary>{thread.name} · {thread.mods.length} attributed entries</summary><div className="test-loaded-mods">{[...thread.mods].sort((a,b)=>b.percent-a.percent).map(mod=><div key={mod.name}><span>{mod.name}</span><code>{mod.percent.toFixed(3)}% samples</code></div>)}</div></details>;
}
