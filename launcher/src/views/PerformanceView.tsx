import { SparkReports } from "../components/performance/SparkReports";
import { TestingLab } from "../components/performance/TestingLab";
import { ContentIcon } from "../components/ContentIcon";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Box,
  FileCheck2,
  Fingerprint,
  FlaskConical,
  History,
  Info,
  Layers,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
  Square,
  Timer,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "../store";
import { useCreative } from "../creative-store";
import { api } from "../lib/api";
import { formatBytes } from "../lib/format";
import {
  isMCreator,
  type PerformanceReport,
  type InspectedMod,
} from "../lib/creative";
import { GeneratorBadge } from "../components/GeneratorBadge";
import { FavoriteButton } from "../components/FavoriteButton";
import { Modal, ModalHeader } from "../components/Modal";
import { RuntimeCaptures } from "../components/performance/RuntimeCaptures";
import "./creative.css";

export function PerformanceView() {
  const instances = useStore((s) => s.instances);
  const [instanceId, setInstanceId] = useState(
    () =>
      useStore.getState().detailInstanceId ??
      useStore.getState().selectedInstanceId ??
      instances[0]?.id ??
      "",
  );
  const [history, setHistory] = useState<PerformanceReport[]>([]);
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [tab, setTab] = useState("overview");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("name");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<InspectedMod | null>(null);
  const scans = useCreative((s) => s.scans);
  const task = useStore((s) =>
    Object.values(s.tasks).find(
      (t) =>
        t.kind === "performance_scan" &&
        t.instance_id === instanceId &&
        t.state === "running",
    ),
  );
  useEffect(() => {
    api
      .getPerformanceHistory()
      .then(setHistory)
      .catch((e) => setError(String(e)));
  }, []);
  useEffect(() => {
    setReport(history.find((r) => r.instance_id === instanceId) ?? null);
  }, [instanceId, history]);
  const instance = instances.find((i) => i.id === instanceId);
  const current = scans[instanceId];
  const stale =
    report &&
    current?.fingerprint &&
    current.kind === "static_scan" &&
    report.fingerprint !== current.fingerprint;
  const files = report?.files ?? [];
  const valid = files.filter((f) => f.inspection);
  const totals = useMemo(
    () => ({
      classes: valid.reduce((n, f) => n + f.inspection!.facts.classes, 0),
      textures: valid.reduce(
        (n, f) => n + f.inspection!.facts.texture_bytes,
        0,
      ),
      ticks: valid.filter((f) => f.inspection!.facts.tick_references.length > 0)
        .length,
      mixins: valid.filter((f) => f.inspection!.facts.mixin_configs > 0).length,
      mcreator: valid.filter((f) => isMCreator(f.inspection)).length,
    }),
    [files],
  );
  const shown = files
    .filter(
      (f) =>
        `${f.title} ${f.file_name} ${f.source?.provider ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (filter === "all" ||
          (filter === "mcreator" && isMCreator(f.inspection)) ||
          (filter === "ticks" &&
            !!f.inspection?.facts.tick_references.length) ||
          (filter === "errors" && !!f.error) ||
          (filter === "disabled" && !f.enabled)),
    )
    .sort((a, b) =>
      sort === "size"
        ? b.size - a.size
        : sort === "classes"
          ? (b.inspection?.facts.classes ?? 0) -
            (a.inspection?.facts.classes ?? 0)
          : sort === "mcreator"
            ? Number(isMCreator(b.inspection)) -
                Number(isMCreator(a.inspection)) ||
              a.title.localeCompare(b.title)
            : a.title.localeCompare(b.title),
    );
  const scan = async () => {
    if (!instanceId) return;
    setBusy(true);
    setError(null);
    try {
      const result = await useCreative.getState().scan(instanceId, true);
      setHistory(await api.getPerformanceHistory());
      setReport(result);
      setTab("overview");
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  };
  const previous = history.find(
    (h) => h.instance_id === instanceId && report && h.at < report.at,
  );
  const changedFiles =
    previous && report
      ? diff(
          previous.files.reduce(
            (o, f) => ({
              ...o,
              [f.file_name]: `${f.inspection?.sha256}:${f.enabled}`,
            }),
            {} as Record<string, string>,
          ),
          report.files.reduce(
            (o, f) => ({
              ...o,
              [f.file_name]: `${f.inspection?.sha256}:${f.enabled}`,
            }),
            {} as Record<string, string>,
          ),
        )
      : [];
  const changedConfigs =
    previous && report
      ? diff(previous.config_hashes, report.config_hashes)
      : [];
  return (
    <div className="creative-workspace performance-workspace">
      <header className="cr-hero">
        <div>
          <span className="cr-eyebrow">
            <FlaskConical size={14} /> PERFORMANCE{" "}
            <span className="cr-premium">PREMIUM PREVIEW</span>
          </span>
          <h1>Know what’s in your pack.</h1>
          <p>
            Inspect real mod files. Follow the evidence. Keep a record of what
            changed.
          </p>
        </div>
        <div
          className="cr-heart-orbit"
          style={{ position: "relative", marginRight: 20 }}
        >
          <FlaskConical />
        </div>
      </header>
      <main className="cr-performance-main">
        <div className="cr-section-heading">
          <div>
            <h2>Mod intelligence</h2>
            <span>
              {report
                ? `Last scan ${new Date(report.at).toLocaleString()}`
                : "Start with a local inspection of your instance"}
            </span>
          </div>
          <select
            aria-label="Performance instance"
            value={instanceId}
            disabled={busy || !!task}
            onChange={(e) => setInstanceId(e.target.value)}
          >
            <option value="" disabled>
              Choose an instance
            </option>
            {instances.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
          <button
            className="cr-button cr-primary"
            disabled={!instance || busy || !!task}
            onClick={scan}
          >
            {busy ? (
              <Loader2 className="animate-spin" size={15} />
            ) : (
              <Sparkles size={15} />
            )}
            Quick Scan
          </button>
        </div>
        {(busy || task) && (
          <div className="cr-scan-progress">
            <Loader2 className="animate-spin" size={17} />
            <div>
              {task?.stage ?? "Preparing local inspection…"}
              <small>
                {task
                  ? `${task.completed} / ${task.total} files inspected`
                  : "Reading the instance’s mod inventory"}
              </small>
              {task && task.total > 0 && (
                <progress value={task.completed} max={task.total} />
              )}
            </div>
            {task && (
              <button
                className="cr-button"
                onClick={() =>
                  api.cancelTask(task.id).catch((e) => toast.error(String(e)))
                }
              >
                <Square size={12} />
                Cancel
              </button>
            )}
          </div>
        )}
        {error && (
          <div className="cr-error" role="alert">
            <TriangleAlert size={15} />
            <span>{error}</span>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}
        <div className="cr-report-tabs">
          {[
            ["overview", "Overview"],
            ["files", "Inspected files"],
            ["runtime", "Startup & JFR"],
            ["spark", "Spark & logs"],
            ["testing", "Testing Lab"],
            ["history", "Scan history"],
          ].map(([id, label]) => (
            <button
              key={id}
              className={tab === id ? "active" : ""}
              onClick={() => setTab(id)}
            >
              {label}
              {id === "files" && report
                ? ` · ${files.length}`
                : id === "history"
                  ? ` · ${history.length}`
                  : ""}
            </button>
          ))}
        </div>
        {tab === "runtime" && <RuntimeCaptures instanceId={instanceId} onEvidence={() => setTab("spark")} />}
        {tab === "spark" && <SparkReports key={instanceId} instanceId={instanceId} />}
        {tab === "testing" && <TestingLab key={instanceId} instanceId={instanceId} onEvidence={() => setTab("spark")} />}
        {tab === "runtime" || tab === "spark" || tab === "testing" ? null : tab === "history" ? (
          <>
            {history.length === 0 && (
              <div className="cr-empty">
                <History size={36} />
                <h3>A history you can trust.</h3>
                <p>
                  Run a Quick Scan to save the exact mod files, configuration
                  fingerprints and findings for this instance.
                </p>
              </div>
            )}
            {history.map((h) => (
              <button
                className="cr-history-row"
                key={h.id}
                onClick={() => {
                  setInstanceId(h.instance_id);
                  setReport(h);
                  setTab("overview");
                }}
              >
                <FileCheck2 size={21} />
                <div>
                  <strong>{h.instance_name}</strong>
                  <small>
                    {new Date(h.at).toLocaleString()} · {h.files.length} files ·{" "}
                    {Object.keys(h.config_hashes).length} configs
                  </small>
                </div>
                <span>Static inspection</span>
                <ArrowUpRight size={15} />
              </button>
            ))}
          </>
        ) : !report ? (
          <div className="cr-empty">
            <Fingerprint size={44} />
            <h3>Start with what’s actually there.</h3>
            <p>
              Quick Scan reads JAR contents, checks MCreator signals, and
              fingerprints your config files. Your report is saved locally.
            </p>
            <button
              className="cr-button cr-primary"
              disabled={!instance || busy}
              onClick={scan}
            >
              Inspect {instance?.name ?? "an instance"}
            </button>
          </div>
        ) : (
          <>
            {stale && (
              <p className="cr-warning">
                This saved report differs from the latest scan. Mod or config
                changes can invalidate earlier findings.
              </p>
            )}
            <div className="cr-static-note">
              <Info size={16} />
              <span>
                Static inspection highlights areas to investigate. It does not
                measure FPS, TPS, lag, memory use or a mod’s performance impact.
                MCreator detection is a provenance clue, never a performance
                rating.
              </span>
            </div>
            {tab === "overview" ? (
              <>
                <div className="cr-metrics">
                  <Metric
                    label="Inspected mods"
                    value={`${valid.length} / ${files.length}`}
                    note={`${files.filter((f) => !f.enabled).length} disabled files included`}
                  />
                  <Metric
                    label="MCreator signals"
                    value={String(totals.mcreator)}
                    note="Open each label to see confidence and evidence"
                  />
                  <Metric
                    label="Config fingerprints"
                    value={String(Object.keys(report.config_hashes).length)}
                    note="Exact contents recorded for change tracking"
                  />
                  <Metric
                    label="Archive footprint"
                    value={formatBytes(files.reduce((n, f) => n + f.size, 0))}
                    note="Disk size, not runtime memory"
                  />
                </div>
                <div className="cr-analysis-grid">
                  <section className="cr-panel">
                    <h3>Places to investigate</h3>
                    <p>
                      These are properties of the files, with specific evidence
                      you can inspect.
                    </p>
                    <div className="cr-findings">
                      <Finding
                        icon={Timer}
                        title="Tick event references"
                        number={totals.ticks}
                        text="Mods reference tick event classes. Profiling is needed to establish whether these paths execute or consume time."
                        onClick={() => {
                          setFilter("ticks");
                          setTab("files");
                        }}
                      />
                      <Finding
                        icon={Layers}
                        title="Mixin configurations"
                        number={totals.mixins}
                        text="Archives include JSON files named for mixins. This describes integration points, not overhead."
                      />
                      <Finding
                        icon={Box}
                        title="Bundled texture assets"
                        number={formatBytes(totals.textures)}
                        text="Uncompressed PNG entry sizes across the inspected JARs. Loaded textures and GPU use can differ."
                      />
                      <Finding
                        icon={TriangleAlert}
                        title="Files needing attention"
                        number={
                          files.filter((f) => f.error || f.inspection?.limited)
                            .length
                        }
                        text="Unreadable files or partial inspections need a closer look before relying on the inventory."
                        onClick={() => {
                          setFilter("errors");
                          setTab("files");
                        }}
                      />
                    </div>
                  </section>
                  <section className="cr-panel">
                    <h3>Reproducible context</h3>
                    <p>A saved record of the inputs for this scan.</p>
                    <dl className="cr-environment">
                      <div>
                        <dt>Minecraft</dt>
                        <dd>{report.environment.minecraft}</dd>
                      </div>
                      <div>
                        <dt>Loader</dt>
                        <dd>
                          {report.environment.loader ?? "Vanilla"}{" "}
                          {report.environment.loader_version}
                        </dd>
                      </div>
                      <div>
                        <dt>Platform</dt>
                        <dd>
                          {report.environment.os} · {report.environment.arch}
                        </dd>
                      </div>
                      <div>
                        <dt>Heap limit</dt>
                        <dd>
                          {report.environment.memory_max ??
                            report.environment.global_memory_max}{" "}
                          MB
                        </dd>
                      </div>
                      <div>
                        <dt>Java selection</dt>
                        <dd>{report.environment.java ?? "Automatic"}</dd>
                      </div>
                      <div>
                        <dt>Detector</dt>
                        <dd>{report.detector}</dd>
                      </div>
                    </dl>
                    <code className="cr-hash">
                      INPUT SHA-256
                      <br />
                      {report.fingerprint}
                    </code>
                    <div className="cr-static-note">
                      <ShieldCheck size={16} />
                      <span>
                        Inspection reads files without executing mod code.
                        Reports stay in your launcher database.
                      </span>
                    </div>
                    <button
                      className="cr-button"
                      onClick={() =>
                        useStore.getState().openInstance(report.instance_id)
                      }
                    >
                      Manage this instance <ArrowUpRight size={14} />
                    </button>
                  </section>
                </div>
                {previous && (
                  <section className="cr-panel" style={{ marginTop: 20 }}>
                    <h3>Since the previous scan</h3>
                    <p>
                      {changedFiles.length} mod changes ·{" "}
                      {changedConfigs.length} config changes ·{" "}
                      {JSON.stringify(previous.environment) ===
                      JSON.stringify(report.environment)
                        ? "same recorded environment"
                        : "environment changed"}
                    </p>
                    <div className="cr-change-list">
                      {[
                        ...changedFiles.map((v) => `mods/${v}`),
                        ...changedConfigs,
                      ].map((v) => (
                        <code key={v}>{v}</code>
                      ))}
                    </div>
                  </section>
                )}
              </>
            ) : (
              <>
                <div className="cr-toolbar">
                  <label className="cr-search">
                    <Search size={15} />
                    <input
                      aria-label="Search inspected mods"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search names and files…"
                    />
                  </label>
                  <select
                    aria-label="Inspection filter"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="all">All mods</option>
                    <option value="mcreator">MCreator</option>
                    <option value="ticks">Tick references</option>
                    <option value="errors">Inspection errors</option>
                    <option value="disabled">Disabled</option>
                  </select>
                  <select
                    aria-label="Sort inspected mods"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option value="name">Name</option>
                    <option value="mcreator">MCreator first</option>
                    <option value="size">Archive size</option>
                    <option value="classes">Class count</option>
                  </select>
                </div>
                {shown.map((f) => (
                  <div className="cr-file-row" key={f.file_name}>
                    <ContentIcon src={f.source?.icon_url} title={f.title} provider={f.source?.provider} projectId={f.source?.project_id} className="size-10" />
                    <div>
                      <button
                        className="text-left max-w-full"
                        onClick={() => setDetail(f)}
                      >
                        <strong>{f.title}</strong>
                        <small>
                          {f.file_name} · {formatBytes(f.size)}
                          {!f.enabled && " · disabled"}
                        </small>
                      </button>
                      {f.error && (
                        <small className="text-danger">{f.error}</small>
                      )}
                    </div>
                    <div className="cr-file-stats">
                      {f.inspection && (
                        <span>
                          {f.inspection.facts.classes.toLocaleString()} classes
                        </span>
                      )}
                    </div>
                    {f.inspection && (
                      <GeneratorBadge
                        inspection={f.inspection}
                        title={f.title}
                      />
                    )}
                    {f.inspection && (
                      <FavoriteButton
                        favorite={{
                          provider: f.source?.provider ?? "local",
                          project_id:
                            f.source?.project_id ?? f.inspection.sha256,
                          title: f.title,
                          icon_url: f.source?.icon_url,
                          kind: "mods",
                        }}
                      />
                    )}
                    <button
                      className="cr-icon-button"
                      aria-label={`Inspect ${f.title}`}
                      onClick={() => setDetail(f)}
                    >
                      <ArrowUpRight size={15} />
                    </button>
                  </div>
                ))}
                {!shown.length && (
                  <div className="cr-empty">
                    <p>No files match these filters.</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
      {detail && (
        <Modal open onClose={() => setDetail(null)} size="lg">
          <ModalHeader
            title={detail.title}
            subtitle="Static archive evidence"
            onClose={() => setDetail(null)}
          />
          <div className="creative-modal-body">
            {detail.inspection ? (
              <>
                <GeneratorBadge
                  inspection={detail.inspection}
                  title={detail.title}
                />
                <code className="cr-hash">{detail.inspection.sha256}</code>
                <div className="cr-evidence">
                  <strong>Archive facts</strong>
                  <p>
                    {detail.inspection.facts.classes} classes ·{" "}
                    {detail.inspection.facts.procedures} procedure classes ·{" "}
                    {detail.inspection.facts.mixin_configs} mixin-named
                    configurations
                  </p>
                  <p>
                    Textures{" "}
                    {formatBytes(detail.inspection.facts.texture_bytes)} ·
                    sounds {formatBytes(detail.inspection.facts.sound_bytes)} ·
                    total unpacked{" "}
                    {formatBytes(detail.inspection.facts.unpacked_bytes)}
                  </p>
                </div>
                <h3>Tick event references</h3>
                <p>
                  These classes contain tick event names. A profiler must
                  establish execution frequency and cost.
                </p>
                {detail.inspection.facts.tick_references.map((path) => (
                  <code className="cr-hash" key={path}>
                    {path}
                  </code>
                ))}
                {!detail.inspection.facts.tick_references.length && (
                  <p>
                    No supported tick event names were found in inspected class
                    bytes.
                  </p>
                )}
                {detail.inspection.limited && (
                  <p className="cr-warning">
                    Inspection limits were reached for some entries. These
                    counts and references may be incomplete.
                  </p>
                )}
              </>
            ) : (
              <p className="cr-warning">{detail.error}</p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
function Metric({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="cr-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{note}</p>
    </div>
  );
}
function Finding({
  icon: Icon,
  title,
  number,
  text,
  onClick,
}: {
  icon: typeof Timer;
  title: string;
  number: string | number;
  text: string;
  onClick?: () => void;
}) {
  return (
    <div className="cr-finding">
      <Icon size={18} />
      <div>
        {onClick ? (
          <button className="text-left" onClick={onClick}>
            <strong>{title} ↗</strong>
          </button>
        ) : (
          <strong>{title}</strong>
        )}
        <p>{text}</p>
      </div>
      <b>{number}</b>
    </div>
  );
}
function diff(before: Record<string, string>, after: Record<string, string>) {
  return [...new Set([...Object.keys(before), ...Object.keys(after)])]
    .filter((key) => before[key] !== after[key])
    .map(
      (key) =>
        `${key} · ${!before[key] ? "added" : !after[key] ? "removed" : "changed"}`,
    );
}
