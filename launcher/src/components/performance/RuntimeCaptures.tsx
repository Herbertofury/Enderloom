import { analyzeLog } from "../../lib/performance-evidence";
import { openUrl } from "@tauri-apps/plugin-opener";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Clock3,
  FlaskConical,
  FolderOpen,
  Loader2,
  Play,
  Square,
  TriangleAlert,
} from "lucide-react";
import { listen } from "@tauri-apps/api/event";
import { toast } from "sonner";
import { api } from "../../lib/api";
import { formatBytes } from "../../lib/format";
import { useStore } from "../../store";
import { Modal, ModalHeader } from "../Modal";
import type { RuntimeCapture } from "../../lib/creative";
import type { ModComparison } from "../../lib/creative";
import { useCreative } from "../../creative-store";

export function RuntimeCaptures({
  instanceId,
  onEvidence,
}: {
  instanceId: string;
  onEvidence: () => void;
}) {
  const [records, setRecords] = useState<RuntimeCapture[]>([]);
  const [selected, setSelected] = useState<RuntimeCapture | null>(null);
  const [seconds, setSeconds] = useState(30);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparisons, setComparisons] = useState<ModComparison[]>([]);
  const [comparison, setComparison] = useState<ModComparison | null>(null);
  const [target, setTarget] = useState("");
  const [repeats, setRepeats] = useState(2);
  const mods = useCreative((s) => s.scans[instanceId]?.files);
  const parentTask = useStore((s) =>
    Object.values(s.tasks).find(
      (t) =>
        t.kind === "performance_comparison" &&
        t.instance_id === instanceId &&
        t.state === "running",
    ),
  );
  const instance = useStore((s) =>
    s.instances.find((i) => i.id === instanceId),
  );
  const task = useStore((s) =>
    Object.values(s.tasks).find(
      (t) =>
        t.kind === "performance_test" &&
        t.instance_id === instanceId &&
        t.state === "running",
    ),
  );
  const refresh = () =>
    api
      .getRuntimeCaptures()
      .then((v) => setRecords(v.sort((a, b) => b.at - a.at)))
      .catch((e) => setError(String(e)));
  useEffect(() => {
    void refresh();
    void api
      .getModComparisons()
      .then(setComparisons)
      .catch((e) => setError(String(e)));
    const stop = listen<RuntimeCapture>(
      "performance:finished",
      () => void refresh(),
    );
    const comparisonStop = listen<ModComparison>(
      "performance:comparison",
      () => void api.getModComparisons().then(setComparisons),
    );
    return () => {
      void stop.then((f) => f());
      void comparisonStop.then((f) => f());
    };
  }, []);
  useEffect(() => {
    setTarget("");
    if (instanceId)
      void useCreative
        .getState()
        .scan(instanceId)
        .catch((e) => setError(String(e)));
  }, [instanceId]);
  const start = async () => {
    setBusy(true);
    setError(null);
    try {
      const record = await api.startPerformanceCapture(instanceId, seconds);
      await refresh();
      setSelected(record);
      if (record.has_log) {
        const text = await api.getCaptureLog(record.id);
        if (text) {
          const evidence = analyzeLog(
            text,
            record.instance_name + " · captured latest.log",
          );
          await api.savePerformanceEvidence(instanceId, evidence);
          if (
            useCreative.getState().library.preferences[
              "spark-open-after-test"
            ] === "true" &&
            evidence.spark_urls?.[0]
          )
            await openUrl(evidence.spark_urls[0]);
        }
      }
    } catch (e) {
      setError(String(e));
      await refresh();
    } finally {
      setBusy(false);
      void useStore.getState().refreshInstances();
    }
  };
  const metrics = selected?.jfr;
  return (
    <>
      <div className="cr-analysis-grid">
        <section className="cr-panel">
          <span className="cr-eyebrow">
            <FlaskConical size={14} /> STARTUP CAPTURE
          </span>
          <h3 style={{ marginTop: 14, fontSize: 22 }}>
            Measure a real Minecraft launch.
          </h3>
          <p>
            Enderloom copies this instance into a temporary test instance,
            starts Minecraft, records Flight Recorder telemetry, then stops its
            test process and removes the copy.
          </p>
          <div className="cr-static-note">
            <TriangleAlert size={16} />
            <span>
              A Minecraft window will open. Leave it at the title menu for
              comparable captures. Worlds, screenshots and launch hooks are
              excluded; mods, options, configs and custom content are copied.
              Shared game assets and Java are reused.
            </span>
          </div>
          <div className="cr-toolbar">
            <label className="text-xs text-content-muted">
              Capture window{" "}
              <select
                aria-label="Startup capture duration"
                value={seconds}
                disabled={busy || !!task}
                onChange={(e) => setSeconds(Number(e.target.value))}
              >
                {[15, 30, 60, 120, 300, 600, 900].map((n) => (
                  <option key={n} value={n}>
                    {n} seconds
                  </option>
                ))}
              </select>
            </label>
            <button
              className="cr-button cr-primary"
              disabled={!instance || busy || !!task || !!parentTask}
              onClick={start}
            >
              <Play size={14} />
              Start isolated capture
            </button>
          </div>
          <p className="cr-fine">
            Requires an installed instance, a signed-in Minecraft account, and
            Java 11+. The JVM’s jfr tool reads recorded CPU, heap and GC events.
            Individual mods are not assigned a cost from these whole-process
            measurements.
          </p>
        </section>
        <section className="cr-panel">
          <h3>What this measures</h3>
          <div className="cr-findings">
            <div className="cr-finding">
              <Clock3 size={17} />
              <div>
                <strong>Observed startup milestones</strong>
                <p>
                  Time from process spawn to resource reload, OpenAL
                  initialization and texture atlas creation. Log observation
                  resolution is approximately 200 ms.
                </p>
              </div>
            </div>
            <div className="cr-finding">
              <Activity size={17} />
              <div>
                <strong>JVM CPU, sampled heap and GC pauses</strong>
                <p>
                  Values come from the saved recording. Missing events stay
                  unavailable.
                </p>
              </div>
            </div>
            <div className="cr-finding">
              <FolderOpen size={17} />
              <div>
                <strong>Original recording retained</strong>
                <p>
                  The test folder is disposable. Its JFR evidence remains local
                  for deeper investigation.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <section className="cr-panel" style={{ marginTop: 20 }}>
        <span className="cr-eyebrow">DIRECT MOD COMPARISON</span>
        <h3 style={{ marginTop: 12 }}>
          The same pack, with and without one mod.
        </h3>
        <p>
          Each pair uses two fresh copies, alternating run order. Required
          dependencies are checked before removing the target. Source changes or
          failed launches invalidate the comparison.
        </p>
        <div className="cr-toolbar" style={{ marginTop: 18, marginBottom: 0 }}>
          <select
            aria-label="Comparison target mod"
            value={target}
            disabled={busy || !!task || !!parentTask}
            onChange={(e) => setTarget(e.target.value)}
          >
            <option value="">Choose an enabled mod</option>
            {mods
              ?.filter((f) => f.enabled && f.inspection)
              .map((f) => (
                <option key={f.file_name} value={f.file_name}>
                  {f.title}
                </option>
              ))}
          </select>
          <label className="text-xs text-content-muted">
            Pairs{" "}
            <input
              aria-label="Comparison pair count"
              type="number"
              min={1}
              max={100}
              value={repeats}
              disabled={busy || !!parentTask}
              onChange={(e) => setRepeats(Number(e.target.value))}
              className="w-16 rounded border border-border bg-surface-2 p-2"
            />
          </label>
          <button
            className="cr-button cr-primary"
            disabled={
              !target ||
              busy ||
              !!task ||
              !!parentTask ||
              !Number.isInteger(repeats) ||
              repeats < 1 ||
              repeats > 100
            }
            onClick={async () => {
              setBusy(true);
              setError(null);
              try {
                const result = await api.compareModStartup(
                  instanceId,
                  target,
                  seconds,
                  repeats,
                );
                setComparison(result);
                setComparisons(await api.getModComparisons());
                await refresh();
              } catch (e) {
                setError(String(e));
              } finally {
                setBusy(false);
                void useStore.getState().refreshInstances();
              }
            }}
          >
            Compare {repeats * 2} launches
          </button>
          <span className="cr-fine">
            {seconds}s per capture · allow time for copying and startup
          </span>
        </div>
      </section>
      {(busy || task || parentTask) && (
        <div className="cr-scan-progress" style={{ marginTop: 20 }}>
          <Loader2 className="animate-spin" size={17} />
          <div>
            {parentTask && <small>{parentTask.stage}</small>}
            {task?.stage ?? "Preparing test…"}
            {task && task.total > 0 && (
              <>
                <small>
                  {task.completed} / {task.total}{" "}
                  {task.stage.includes("Recording") ? "seconds" : "files"}
                </small>
                <progress value={task.completed} max={task.total} />
              </>
            )}
          </div>
          {(parentTask || task) && (
            <button
              className="cr-button"
              onClick={() =>
                api
                  .cancelTask((parentTask ?? task)!.id)
                  .catch((e) => toast.error(String(e)))
              }
            >
              <Square size={12} />
              Cancel {parentTask ? "comparison" : "capture"}
            </button>
          )}
        </div>
      )}
      {error && (
        <div className="cr-error" role="alert">
          {error}
        </div>
      )}
      <div className="cr-section-heading" style={{ marginTop: 28 }}>
        <div>
          <h2>Runtime evidence</h2>
          <span>
            {records.length} saved captures · failures and cancellations stay
            visible
          </span>
        </div>
        <button className="cr-button" onClick={refresh}>
          Refresh
        </button>
      </div>
      {records.map((r) => (
        <button
          className="cr-history-row"
          key={r.id}
          onClick={() => setSelected(r)}
        >
          <Activity size={20} />
          <div>
            <strong>{r.instance_name}</strong>
            <small>
              {new Date(r.at).toLocaleString()} · {r.seconds}s capture window ·{" "}
              {r.cleaned_up ? "sandbox removed" : "sandbox retained"}
            </small>
          </div>
          <span>{r.state}</span>
          <ArrowUpRight size={15} />
        </button>
      ))}
      {comparisons.length > 0 && (
        <h3 className="my-4 text-sm font-semibold">Direct comparisons</h3>
      )}
      {comparisons.map((r) => (
        <button
          className="cr-history-row"
          key={r.id}
          onClick={() => setComparison(r)}
        >
          <FlaskConical size={20} />
          <div>
            <strong>{r.file_name}</strong>
            <small>
              {r.instance_name} · {r.pairs.length} paired captures ·{" "}
              {new Date(r.at).toLocaleString()}
            </small>
          </div>
          <span>{r.state}</span>
          <ArrowUpRight size={15} />
        </button>
      ))}
      {selected && (
        <Modal open onClose={() => setSelected(null)} size="wide">
          <ModalHeader
            title={selected.instance_name}
            subtitle={`${selected.state} · ${new Date(selected.at).toLocaleString()}`}
            onClose={() => setSelected(null)}
          />
          <div className="creative-modal-body">
            {selected.error && <p className="cr-warning">{selected.error}</p>}
            <div
              className="cr-metrics"
              style={{
                gridTemplateColumns: "repeat(3,minmax(0,1fr))",
                marginBottom: 0,
              }}
            >
              <div className="cr-metric">
                <span>Mean JVM CPU</span>
                <strong>
                  {metrics?.mean_jvm_cpu_percent != null
                    ? `${metrics.mean_jvm_cpu_percent.toFixed(1)}%`
                    : "—"}
                </strong>
                <p>{metrics?.cpu_samples ?? 0} recorded samples</p>
              </div>
              <div className="cr-metric">
                <span>Observed heap peak</span>
                <strong style={{ fontSize: 23 }}>
                  {metrics?.max_observed_heap_bytes != null
                    ? formatBytes(metrics.max_observed_heap_bytes)
                    : "—"}
                </strong>
                <p>{metrics?.heap_samples ?? 0} heap observations</p>
              </div>
              <div className="cr-metric">
                <span>GC pause total</span>
                <strong style={{ fontSize: 23 }}>
                  {metrics?.total_gc_pause_ms != null
                    ? `${metrics.total_gc_pause_ms.toFixed(1)} ms`
                    : "—"}
                </strong>
                <p>{metrics?.gc_pause_events ?? 0} pause events</p>
              </div>
            </div>
            <h3>Observed milestones</h3>
            {Object.entries(selected.milestones).map(([name, m]) => (
              <div className="cr-evidence" key={name}>
                <strong>
                  {name.replace(/_/g, " ")} · {(m.elapsed_ms / 1000).toFixed(2)}{" "}
                  s
                </strong>
                <code>{m.evidence}</code>
              </div>
            ))}
            {!Object.keys(selected.milestones).length && (
              <p>
                No supported startup milestone was observed in this capture.
              </p>
            )}
            {selected.has_log && (
              <button
                className="cr-button"
                onClick={async () => {
                  try {
                    const text = await api.getCaptureLog(selected.id);
                    if (!text) throw new Error("Captured log is unavailable");
                    await api.savePerformanceEvidence(
                      selected.instance_id,
                      analyzeLog(
                        text,
                        selected.instance_name + " · captured latest.log",
                      ),
                    );
                    setSelected(null);
                    onEvidence();
                  } catch (e) {
                    toast.error(String(e));
                  }
                }}
              >
                Analyze captured log & Spark links <ArrowUpRight size={14} />
              </button>
            )}
            <p className="cr-fine">{selected.sampling_note}</p>
            {metrics && <p>{metrics.scope}</p>}
            {selected.jfr_error && (
              <p className="cr-warning">{selected.jfr_error}</p>
            )}
            <code className="cr-hash">
              Input fingerprint {selected.input_fingerprint ?? "Unavailable"}
            </code>
            {selected.recording_path && (
              <>
                <label>
                  Retained Flight Recorder evidence
                  <input readOnly value={selected.recording_path} />
                </label>
                <p className="cr-fine">
                  JFR files may contain runtime arguments and local paths.
                  Review the recording before sharing it.
                </p>
              </>
            )}
            <p className={selected.cleaned_up ? "cr-fine" : "cr-warning"}>
              {selected.cleaned_up
                ? "The isolated test instance was removed. Your source instance was preserved."
                : (selected.cleanup_error ??
                  "The sandbox is retained. A capture may still be running or may have been interrupted.")}
            </p>
            {!selected.cleaned_up && (
              <button
                className="cr-button"
                disabled={!!task || !!parentTask}
                onClick={async () => {
                  try {
                    const cleaned = await api.cleanupPerformanceCapture(
                      selected.id,
                    );
                    setSelected(cleaned);
                    await refresh();
                  } catch (e) {
                    toast.error(String(e));
                  }
                }}
              >
                Clean up retained sandbox
              </button>
            )}
          </div>
        </Modal>
      )}
      {comparison && (
        <Modal open onClose={() => setComparison(null)} size="wide">
          <ModalHeader
            title={comparison.file_name}
            subtitle={`${comparison.state} · direct paired startup comparison`}
            onClose={() => setComparison(null)}
          />
          <div className="creative-modal-body">
            <p>{comparison.method}</p>
            {comparison.error && (
              <p className="cr-warning">{comparison.error}</p>
            )}
            <p>
              Positive deltas mean the observed milestone took longer with the
              mod enabled. These observations apply to this exact pack,
              configuration and capture scenario.
            </p>
            {Object.entries(comparison.statistics ?? {}).map(([name, v]) => (
              <div className="cr-evidence" key={name}>
                <strong>
                  {name.replace(/_/g, " ")} · {v.mean_delta_ms >= 0 ? "+" : ""}
                  {v.mean_delta_ms.toFixed(0)} ms with target
                </strong>
                <p>
                  {v.pairs} pairs · sample standard deviation{" "}
                  {v.sample_std_dev_ms === null
                    ? "unavailable"
                    : `${v.sample_std_dev_ms.toFixed(0)} ms`}{" "}
                  · observed range {v.min_delta_ms.toFixed(0)} to{" "}
                  {v.max_delta_ms.toFixed(0)} ms
                </p>
              </div>
            ))}
            <p className="cr-fine">
              Small samples and 200 ms log observation intervals limit
              certainty. Startup comparisons do not establish FPS, server tick
              cost or gameplay behavior.
            </p>
            <code className="cr-hash">
              Target SHA-256 {comparison.target_sha256}
            </code>
            {comparison.pairs.map((p) => (
              <div className="cr-evidence" key={p.index}>
                <strong>
                  Pair {p.index} · {p.order}
                </strong>
                <div className="cr-detail-actions">
                  <button
                    className="cr-button"
                    onClick={() => {
                      setSelected(
                        records.find((r) => r.id === p.with_capture) ?? null,
                      );
                      setComparison(null);
                    }}
                  >
                    With target evidence
                  </button>
                  <button
                    className="cr-button"
                    onClick={() => {
                      setSelected(
                        records.find((r) => r.id === p.without_capture) ?? null,
                      );
                      setComparison(null);
                    }}
                  >
                    Without target evidence
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}
