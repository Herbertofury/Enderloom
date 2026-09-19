import { useEffect, useRef, useState } from "react";
import { evidenceSource } from "../../lib/evidence";
import { EvidenceDetails } from "../EvidenceDetails";
import { ArrowUpRight, FileText, Flame, Loader2, Upload } from "lucide-react";
import { openUrl } from "@tauri-apps/plugin-opener";
import { api } from "../../lib/api";
import { useCreative } from "../../creative-store";
import { ContentIcon } from "../ContentIcon";
import {
  analyzeLog,
  MAX_EVIDENCE_BYTES,
  sparkUrl,
  unpackEvidence,
  type EvidenceReport,
} from "../../lib/performance-evidence";

export function SparkReports({ instanceId }: { instanceId: string }) {
  const [reports, setReports] = useState<EvidenceReport[]>([]);
  const [selected, setSelected] = useState<EvidenceReport | null>(null);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [thread, setThread] = useState(0);
  const [query, setQuery] = useState("");
  const upload = useRef<HTMLInputElement>(null);
  const view = useRef(instanceId), generation = useRef(0), evidenceRequest = useRef(0);
  view.current = instanceId;
  const prefs = useCreative((s) => s.library.preferences);
  const [mods, setMods] = useState<
    Awaited<ReturnType<typeof api.listInstanceContent>>
  >([]);
  useEffect(() => {
    const revision = ++generation.current, ticket = ++evidenceRequest.current;
    const ownsView = () => current && revision === generation.current && view.current === instanceId;
    setSelected(null);
    setThread(0);
    setReports([]);
    setMods([]);
    setError('');
    setBusy(false);
    setUrl('');
    setQuery('');
    let current = true;
    void api
      .getPerformanceEvidence(instanceId)
      .then((v) => {
        if (ownsView() && ticket === evidenceRequest.current) {
          setReports(v);
          setSelected(v[0] ?? null);
        }
      })
      .catch((e) => { if (ownsView() && ticket === evidenceRequest.current) setError(String(e)); });
    void api
      .listInstanceContent(instanceId, "mods")
      .then((v) => {
        if (ownsView()) setMods(v);
      })
      .catch(() => {});
    void useCreative
      .getState()
      .load()
      .catch(() => {});
    return () => {
      current = false;
      generation.current++;
    };
  }, [instanceId]);
  const run = async (work: () => Promise<EvidenceReport>) => {
    const revision = generation.current, ticket = ++evidenceRequest.current;
    const ownsView = () => revision === generation.current && ticket === evidenceRequest.current && view.current === instanceId;
    setBusy(true);
    setError("");
    try {
      const result = await api.savePerformanceEvidence(
        instanceId,
        await work(),
      );
      if (!ownsView()) return;
      const history = await api.getPerformanceEvidence(instanceId);
      if (!ownsView()) return;
      setSelected(result);
      setThread(0);
      setReports(history);
    } catch (e) {
      if (ownsView()) setError(String(e));
    } finally {
      if (ownsView()) setBusy(false);
    }
  };
  const inspectBytes = async (raw: Uint8Array, name: string, url?: string) => {
    const bytes = await unpackEvidence(raw);
    const digest = await crypto.subtle.digest("SHA-256", raw as BufferSource);
    const isLog = /\.(?:log|txt)(?:\.gz)?$/i.test(name);
    const logText = isLog ? await api.redactText(new TextDecoder().decode(bytes)) : '';
    const source = evidenceSource(isLog ? new TextEncoder().encode(logText) : raw);
    const report = isLog
      ? analyzeLog(logText, name)
      : await new Promise<EvidenceReport>((resolve, reject) => {
          const worker = new Worker(
            new URL("../../lib/spark-worker.ts", import.meta.url),
            { type: "module" },
          );
          const timer = setTimeout(() => {
            worker.terminate();
            reject(new Error("Spark analysis timed out"));
          }, 30_000);
          worker.onmessage = (e) => {
            clearTimeout(timer);
            worker.terminate();
            if (e.data.error) reject(new Error(e.data.error));
            else resolve(e.data.report);
          };
          worker.onerror = (e) => {
            clearTimeout(timer);
            worker.terminate();
            reject(new Error(e.message));
          };
          worker.postMessage({ bytes, title: name }, [bytes.buffer]);
        });
    report.sha256 = [...new Uint8Array(digest)]
      .map((n) => n.toString(16).padStart(2, "0"))
      .join("");
    report.url = url;
    report.analysis_source = source;
    return report;
  };
  const importUrl = (raw: string) =>
    run(async () => {
      const canonical = sparkUrl(raw);
      const response = await api.getSparkProfile(
        new URL(canonical).pathname.slice(1),
      );
      return inspectBytes(
        Uint8Array.from(atob(response.data), (c) => c.charCodeAt(0)),
        `Spark · ${new URL(canonical).pathname.slice(1)}`,
        canonical,
      );
    });
  const active = selected?.threads?.[thread];
  const openViewer = (url: string) =>
    void openUrl(url).catch((e) => setError(String(e)));
  return (
    <div className="cr-spark">
      <section className="cr-panel">
        <div className="cr-section-heading">
          <div>
            <h2>
              <Flame size={19} className="inline mr-2 text-orange-300" />
              Spark & log intelligence
            </h2>
            <p>
              Real samples, traceable symptoms, and the full profiler one click
              away.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 my-4">
          <input
            aria-label="Spark report URL"
            className="min-w-48 flex-1 rounded-lg border border-border bg-surface-2 p-2 text-sm"
            placeholder="https://spark.lucko.me/…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button
            className="cr-button cr-primary"
            disabled={busy || !url || !instanceId}
            onClick={() => void importUrl(url)}
          >
            Read Spark report
          </button>
          <button
            className="cr-button"
            disabled={!url}
            onClick={() => {
              try {
                openViewer(sparkUrl(url));
              } catch (e) {
                setError(String(e));
              }
            }}
          >
            Open full viewer <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="cr-button"
            disabled={busy || !instanceId}
            onClick={() => upload.current?.click()}
          >
            <Upload size={14} />
            Import profile / log
          </button>
          <button
            className="cr-button"
            disabled={busy || !instanceId}
            onClick={() =>
              void run(async () => {
                const text = await api.redactInstanceLog(instanceId, "latest.log", false);
                return { ...analyzeLog(text, "latest.log"), analysis_source: evidenceSource(new TextEncoder().encode(text)) };
              })
            }
          >
            <FileText size={14} />
            Analyze latest.log
          </button>
          <label className="flex items-center gap-2 text-xs text-content-muted">
            <input
              type="checkbox"
              checked={prefs["spark-open-after-test"] === "true"}
              onChange={(e) =>
                void useCreative
                  .getState()
                  .act("preferences", {
                    "spark-open-after-test": String(e.target.checked),
                  })
                  .catch((e) => setError(String(e)))
              }
            />
            Open Spark automatically after a test when its log contains a report
          </label>
        </div>
        <input
          ref={upload}
          type="file"
          hidden
          accept=".sparkprofile,.sparkheap,.sparkhealth,.log,.txt,.gz"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            void run(async () => {
              if (file.size > MAX_EVIDENCE_BYTES)
                throw new Error("Choose a report smaller than 32 MiB");
              return inspectBytes(
                new Uint8Array(await file.arrayBuffer()),
                file.name,
              );
            });
          }}
        />
        <p className="cr-fine mt-3">
          Imports are analyzed locally. Reading an existing Spark URL downloads
          that report; Enderloom does not upload your logs or profiles.
        </p>
      </section>
      {busy && (
        <div className="cr-scan-progress my-3">
          <Loader2 className="animate-spin" size={16} />
          Reading recorded evidence…
        </div>
      )}
      {error && (
        <div role="alert" className="cr-error my-3">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 xl:grid-cols-[230px_minmax(0,1fr)] gap-5 mt-5">
        <aside className="cr-panel">
          <h3 className="text-sm font-semibold mb-3">Saved reports</h3>
          {!reports.length && (
            <p className="text-xs text-content-faint">
              Import a Spark profile or analyze this instance’s log.
            </p>
          )}
          {reports.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                setSelected(r);
                setThread(0);
              }}
              className={`block w-full rounded-lg p-3 text-left mb-1 ${selected?.id === r.id ? "bg-violet-400/15" : "hover:bg-surface-3"}`}
            >
              <strong className="block text-xs truncate">{r.title}</strong>
              <small className="text-[10px] text-content-faint">
                {new Date(r.at!).toLocaleString()}
              </small>
            </button>
          ))}
        </aside>
        {selected && (
          <section className="cr-panel min-w-0">
            <div className="flex items-start gap-3 mb-4">
              <div className="mr-auto min-w-0">
                <h2 className="font-display text-lg break-words">
                  {selected.title}
                </h2>
                <p className="text-xs text-content-faint">
                  {selected.platform} {selected.mode}
                </p>
              </div>
              {selected.url && (
                <button
                  className="cr-button"
                  onClick={() => openViewer(selected.url!)}
                >
                  Full Spark viewer <ArrowUpRight size={14} />
                </button>
              )}
            </div>
            {selected.kind === "spark" && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                  {[
                    ["TPS · last minute", selected.tps],
                    ["Mean MSPT · last minute", selected.mspt_mean],
                    ["p95 MSPT · last minute", selected.mspt_p95],
                    ["Max MSPT · last minute", selected.mspt_max],
                  ].map(([label, value]) => (
                    <div
                      key={String(label)}
                      className="rounded-lg bg-surface-2 p-3"
                    >
                      <small className="text-[10px] text-content-faint">
                        {label}
                      </small>
                      <strong className="block text-xl mt-1">
                        {typeof value === "number" ? value.toFixed(2) : "—"}
                      </strong>
                    </div>
                  ))}
                </div>
                {selected.threads?.length ? (
                  <>
                    <label className="text-xs text-content-muted">
                      Sampled thread
                      <select
                        aria-label="Spark thread"
                        value={thread}
                        onChange={(e) => setThread(Number(e.target.value))}
                        className="ml-3 max-w-full rounded bg-surface-2 p-2"
                      >
                        {selected.threads?.map((t, i) => (
                          <option key={i} value={i}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <input
                      aria-label="Filter Spark mods and methods"
                      placeholder="Filter mods or methods…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="my-4 block w-full rounded-lg border border-border bg-surface-2 p-2 text-xs"
                    />
                    <h3 className="text-sm font-semibold mb-3">
                      Mod share · exclusive samples
                    </h3>
                    {active?.mods
                      .filter((m) =>
                        m.name.toLowerCase().includes(query.toLowerCase()),
                      )
                      .map((m) => {
                        const installed = mods.find((i) =>
                          [i.source?.mod_id, i.source?.title].some(
                            (n) => n?.toLowerCase() === m.name.toLowerCase(),
                          ),
                        );
                        return (
                          <div
                            key={m.name}
                            className="flex items-center gap-3 border-b border-border-soft py-3"
                          >
                            <ContentIcon
                              title={m.name}
                              src={installed?.source?.icon_url}
                              provider={installed?.source?.provider}
                              projectId={installed?.source?.project_id}
                              className="size-9"
                            />
                            <div className="min-w-0 flex-1">
                              <strong className="block truncate text-xs">
                                {m.name}
                              </strong>
                              <div className="mt-2 h-1 rounded bg-surface-3">
                                <div
                                  className="h-full rounded bg-violet-300"
                                  style={{
                                    width: `${Math.min(100, m.percent)}%`,
                                  }}
                                />
                              </div>
                            </div>
                            <strong className="text-sm tabular-nums">
                              {m.percent.toFixed(2)}%
                            </strong>
                          </div>
                        );
                      })}
                    <h3 className="text-sm font-semibold mt-6 mb-2">
                      Hot methods · inclusive samples
                    </h3>
                    <p className="text-[10px] text-content-faint mb-3">
                      Calls include their children, so these percentages overlap
                      and must not be added.
                    </p>
                    {active?.frames
                      .filter((f) =>
                        `${f.method} ${f.source}`
                          .toLowerCase()
                          .includes(query.toLowerCase()),
                      )
                      .map((f, i) => (
                        <div
                          key={i}
                          className="flex gap-3 py-2 border-b border-border-soft text-xs"
                        >
                          <code className="min-w-0 flex-1 break-all">
                            {f.method}
                            <small className="block text-content-faint">
                              {f.source}
                            </small>
                          </code>
                          <span className="tabular-nums">
                            {f.percent.toFixed(2)}%
                          </span>
                        </div>
                      ))}
                  </>
                ) : selected.heap?.length ? (
                  <>
                    <h3 className="text-sm font-semibold mb-3">
                      Heap by class · reported snapshot bytes
                    </h3>
                    {selected.heap.map((item, i) => (
                      <div
                        key={i}
                        className="flex gap-3 border-b border-border-soft py-2 text-xs"
                      >
                        <code className="min-w-0 flex-1 break-all">
                          {item.type}
                          <small className="block text-content-faint">
                            {item.instances.toLocaleString()} instances ·{" "}
                            {(item.bytes / 1048576).toFixed(2)} MiB
                          </small>
                        </code>
                        <strong>{item.percent.toFixed(2)}%</strong>
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-xs text-content-faint">
                    Health snapshot. This report contains no sampled call tree.
                  </p>
                )}
              </>
            )}
            {selected.kind === "log" && (
              <>
                <p className="text-xs mb-3">
                  {selected.line_count?.toLocaleString()} analyzed lines
                </p>
                {!selected.findings?.length && (
                  <p className="text-xs text-content-faint">
                    No recognized performance warnings in this text. That does
                    not establish smooth frame times.
                  </p>
                )}
                {selected.findings?.map((f) => (
                  <details
                    key={f.category}
                    className="rounded-lg border border-border-soft p-3 mb-3"
                    open
                  >
                    <summary className="text-sm font-semibold cursor-pointer">
                      {f.category} · {f.count}
                      {f.max_ms != null &&
                        ` · max reported ${f.max_ms.toFixed(1)} ms`}
                    </summary>
                    {f.examples.map((e) => (
                      <pre
                        key={e.line}
                        className="mt-3 whitespace-pre-wrap break-all text-[10px] text-content-muted"
                      >
                        Line {e.line}: {e.text}
                      </pre>
                    ))}
                  </details>
                ))}
                {selected.spark_urls?.map((link) => (
                  <div
                    key={link}
                    className="flex flex-wrap items-center gap-2 py-2"
                  >
                    <span className="text-xs mr-auto">{link}</span>
                    <button
                      className="cr-button"
                      disabled={busy}
                      onClick={() => void importUrl(link)}
                    >
                      Analyze samples
                    </button>
                    <button
                      className="cr-button"
                      onClick={() => openViewer(link)}
                    >
                      Open Spark <ArrowUpRight size={14} />
                    </button>
                  </div>
                ))}
              </>
            )}
            <div className="mt-5">
              {selected.warnings.map((warning, i) => (
                <p key={i} className="cr-fine mb-2">
                  {warning}
                </p>
              ))}
            </div>
            {selected.sha256 && (
              <p className="cr-hash">Source SHA-256 · {selected.sha256}</p>
            )}
            {selected.evidence_id && <EvidenceDetails key={selected.evidence_id} evidenceId={selected.evidence_id} />}
          </section>
        )}
      </div>
    </div>
  );
}
