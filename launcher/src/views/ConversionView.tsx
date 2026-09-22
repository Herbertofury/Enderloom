import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FolderOpen,
  Gauge,
  Loader2,
  Play,
  RefreshCw,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import { open as openDialog } from "../compat/tauri-dialog";
import { Button, PageHeader, Toggle } from "../components/ui";
import { Select } from "../components/Select";
import { api } from "../lib/api";
import { cn } from "../lib/cn";
import type {
  ConversionCapabilities,
  ConversionCellState,
  ConversionJobResult,
  ConversionLoader,
  ConversionPlan,
  ConversionPlanRequest,
  ConversionSession,
  ConversionSourceIntake,
} from "../lib/conversion";

const LOADERS: ConversionLoader[] = ["fabric", "neoforge", "forge", "quilt"];

function stateClass(state: ConversionCellState | string) {
  if (state === "passed") return "border-ok/35 bg-ok/10 text-ok";
  if (state === "building" || state === "testing" || state === "built")
    return "border-(--accent)/35 bg-(--accent-glow)/25 text-(--accent-bright)";
  if (state === "blocked" || state === "runtime-unverified")
    return "border-warning/35 bg-warning/10 text-warning";
  if (state === "failed") return "border-danger/35 bg-danger/10 text-danger";
  if (state === "stale") return "border-warning/30 bg-warning/5 text-content-muted";
  return "border-border bg-surface-3 text-content-muted";
}

function StatusPill({ state }: { state: ConversionCellState | string }) {
  return (
    <span
      className={cn(
        "rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        stateClass(state),
      )}
    >
      {state.split("-").join(" ")}
    </span>
  );
}

function Readiness({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok: boolean;
}) {
  return (
    <div className="rounded-xl border border-border-soft bg-surface-2/60 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-content-muted">{label}</span>
        {ok ? (
          <CheckCircle2 className="size-4 text-ok" />
        ) : (
          <AlertTriangle className="size-4 text-warning" />
        )}
      </div>
      <div className="mt-1 truncate font-mono text-xs text-content">{value}</div>
    </div>
  );
}

function PlanCell({
  minecraft,
  loader,
  state,
  primary,
}: {
  minecraft: string;
  loader: string;
  state: string;
  primary?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border-soft bg-void/35 px-3 py-2">
      <div className="min-w-0">
        <div className="truncate text-xs font-medium text-content">
          Minecraft {minecraft} · {loader}
        </div>
        {primary && (
          <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-(--accent)">
            Primary target
          </div>
        )}
      </div>
      <StatusPill state={state} />
    </div>
  );
}

export function ConversionView() {
  const [capabilities, setCapabilities] = useState<ConversionCapabilities | null>(null);
  const [sessions, setSessions] = useState<ConversionSession[]>([]);
  const [sourcePath, setSourcePath] = useState("");
  const [sourceIntake, setSourceIntake] = useState<ConversionSourceIntake | null>(null);
  const [targetMc, setTargetMc] = useState("latest");
  const [loader, setLoader] = useState<ConversionLoader>("fabric");
  const [matrix, setMatrix] = useState<"target-only" | "all">("target-only");
  const [includeExperimental, setIncludeExperimental] = useState(false);
  const [plan, setPlan] = useState<ConversionPlan | null>(null);
  const [activeSession, setActiveSession] = useState<ConversionSession | null>(null);
  const [lastJob, setLastJob] = useState<ConversionJobResult | null>(null);
  const [health, setHealth] = useState<string | null>(null);
  const [toolchainStatus, setToolchainStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState<"boot" | "inspect" | "plan" | "run" | "health" | "refresh" | null>("boot");
  const [error, setError] = useState<string | null>(null);

  const request = useMemo<ConversionPlanRequest>(
    () => ({
      targetMc: targetMc.trim() || "latest",
      targetLoader: loader,
      matrix,
      includeExperimental,
    }),
    [targetMc, loader, matrix, includeExperimental],
  );

  const refreshBase = async () => {
    const [caps, recent] = await Promise.all([
      api.getConversionCapabilities(),
      api.listConversionSessions(),
    ]);
    setCapabilities(caps);
    setSessions(recent);
  };

  useEffect(() => {
    let live = true;
    refreshBase()
      .catch((err) => live && setError(String(err)))
      .finally(() => live && setBusy(null));
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    let live = true;
    let unlisten: (() => void) | null = null;
    window.enderloomLauncher
      .listen<ConversionSession>("conversion:stateDelta", (session) => {
        if (!live) return;
        setActiveSession((current) => (current?.id === session.id ? session : current));
        setSessions((current) => {
          const next = current.filter((row) => row.id !== session.id);
          return [session, ...next].slice(0, 12);
        });
      })
      .then((dispose) => {
        if (live) unlisten = dispose;
        else dispose();
      })
      .catch(() => {});
    return () => {
      live = false;
      unlisten?.();
    };
  }, []);

  useEffect(() => {
    let live = true;
    let unlisten: (() => void) | null = null;
    window.enderloomLauncher
      .listen<{ state: string; java: number; path?: string }>("conversion:toolchain", (event) => {
        if (!live) return;
        setToolchainStatus(
          event.state === "ready"
            ? `JDK ${event.java} ready`
            : `Provisioning JDK ${event.java}…`,
        );
      })
      .then((dispose) => {
        if (live) unlisten = dispose;
        else dispose();
      })
      .catch(() => {});
    return () => {
      live = false;
      unlisten?.();
    };
  }, []);

  const chooseSource = async () => {
    const selected = await openDialog({
      directory: true,
      multiple: false,
      title: "Choose a mod source project",
    });
    if (typeof selected === "string") {
      setSourcePath(selected);
      setSourceIntake(null);
      setPlan(null);
      setLastJob(null);
      setError(null);
      setBusy("inspect");
      try {
        const intake = await api.inspectConversionSource(selected);
        setSourceIntake(intake);
        if (intake.loader && LOADERS.includes(intake.loader)) {
          setLoader(intake.loader);
        }
      } catch (err) {
        setError(String(err));
      } finally {
        setBusy(null);
      }
    }
  };

  const planConversion = async () => {
    setBusy("plan");
    setError(null);
    setLastJob(null);
    try {
      const next = await api.planConversion(request);
      setPlan(next);
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(null);
    }
  };

  const executeSession = async (session: ConversionSession) => {
    setBusy("run");
    setError(null);
    setActiveSession(session);
    setLastJob(null);
    try {
      const result = await api.executeConversionSession(session.id);
      setActiveSession(result.session);
      setLastJob(result);
      await refreshBase();
    } catch (err) {
      setError(String(err));
      try {
        setActiveSession(await api.getConversionSession(session.id));
      } catch {}
    } finally {
      setBusy(null);
    }
  };

  const createAndRun = async () => {
    if (!sourcePath) return;
    setBusy("run");
    setError(null);
    setLastJob(null);
    try {
      const session = await api.createConversionSession({
        ...request,
        source: {
          kind: "source-tree",
          project_root: sourcePath,
        },
      });
      setActiveSession(session);
      const result = await api.executeConversionSession(session.id);
      setActiveSession(result.session);
      setLastJob(result);
      await refreshBase();
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(null);
    }
  };

  const refreshLatest = async () => {
    setBusy("refresh");
    setError(null);
    try {
      await api.refreshConversionProfiles(true);
      await refreshBase();
      if (targetMc.trim().toLowerCase().startsWith("latest")) {
        setPlan(await api.planConversion(request));
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(null);
    }
  };

  const runHealth = async () => {
    setBusy("health");
    setError(null);
    setHealth(null);
    try {
      const result = await api.runConversionSelfTest();
      setHealth(result.marker);
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(null);
    }
  };

  const sourceName =
    sourcePath.split(/[\\/]/).filter(Boolean).pop() || "No source selected";
  const canExecute = capabilities?.execution_available === true;
  const running = busy === "run";
  const activeCells = activeSession
    ? activeSession.plan.cells.filter((cell) => activeSession.cells[cell.id]?.selected)
    : [];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Convert Mod"
        subtitle="Northpoint universal version + loader conversion"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={runHealth} disabled={busy !== null}>
              {busy === "health" ? <Loader2 className="size-4 animate-spin" /> : <Gauge className="size-4" />}
              Engine check
            </Button>
            <Button variant="ghost" onClick={refreshLatest} disabled={busy !== null}>
              {busy === "refresh" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}
              Refresh targets
            </Button>
          </div>
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-8 py-6">
        <div className="mx-auto grid max-w-6xl gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(22rem,.9fr)]">
          <div className="space-y-5">
            <section className="rounded-2xl border border-border-soft bg-surface-2/60 p-5">
              <div className="flex items-center gap-2">
                <Wrench className="size-4 text-(--accent)" />
                <h2 className="font-display text-sm font-semibold text-content">Conversion target</h2>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <div className="mb-1.5 text-xs font-medium text-content-muted">Source project</div>
                  <button
                    type="button"
                    onClick={chooseSource}
                    className="flex w-full items-center gap-3 rounded-xl border border-border bg-void px-3 py-3 text-left transition-colors hover:bg-surface-3"
                  >
                    <FolderOpen className="size-4 shrink-0 text-(--accent)" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-content">{sourceName}</span>
                      <span className="mt-0.5 block truncate text-[11px] text-content-faint">
                        {sourcePath || "Choose the mod source folder Enderloom should convert"}
                      </span>
                    </span>
                  </button>
                  {busy === "inspect" && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-content-muted">
                      <Loader2 className="size-3.5 animate-spin" />
                      Inspecting build, loader, metadata and source version…
                    </div>
                  )}
                  {sourceIntake && (
                    <div className="mt-3 rounded-xl border border-border-soft bg-void/35 p-3">
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-wide text-content-faint">Source</div>
                          <div className="mt-1 text-xs font-medium text-content">
                            {sourceIntake.minecraft || "Unknown"} · {sourceIntake.loader || "Unknown loader"}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-wide text-content-faint">Mod ID</div>
                          <div className="mt-1 truncate font-mono text-xs text-content">
                            {sourceIntake.mod_id || "Undetected"}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-wide text-content-faint">Build</div>
                          <div className="mt-1 text-xs font-medium text-content">
                            {sourceIntake.build.mode}
                            {sourceIntake.java ? ` · Java ${sourceIntake.java}` : ""}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-wide text-content-faint">Source scan</div>
                          <div className="mt-1 text-xs font-medium text-content">
                            {sourceIntake.source_counts.java + sourceIntake.source_counts.kotlin} code · {sourceIntake.source_counts.mixins} mixin
                          </div>
                        </div>
                      </div>
                      {sourceIntake.warnings.length > 0 && (
                        <div className="mt-3 space-y-1 border-t border-border-soft pt-2">
                          {sourceIntake.warnings.map((warning) => (
                            <div key={warning} className="flex items-start gap-2 text-[11px] text-warning">
                              <AlertTriangle className="mt-0.5 size-3 shrink-0" />
                              <span>{warning}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <label>
                    <span className="mb-1.5 block text-xs font-medium text-content-muted">
                      Minecraft target
                    </span>
                    <input
                      value={targetMc}
                      onChange={(event) => {
                        setTargetMc(event.target.value);
                        setPlan(null);
                      }}
                      placeholder="latest or any version, e.g. 1.20.1"
                      className="w-full rounded-lg border border-border bg-void px-3 py-2 text-sm text-content outline-none transition-colors focus:border-(--accent)"
                    />
                  </label>
                  <div>
                    <span className="mb-1.5 block text-xs font-medium text-content-muted">Loader</span>
                    <Select
                      value={loader}
                      options={LOADERS}
                      onChange={(value) => {
                        setLoader(value as ConversionLoader);
                        setPlan(null);
                      }}
                    />
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMatrix("target-only");
                      setPlan(null);
                    }}
                    className={cn(
                      "rounded-xl border px-4 py-3 text-left transition-colors",
                      matrix === "target-only"
                        ? "border-(--accent)/45 bg-(--accent-glow)/25"
                        : "border-border-soft bg-void/35 hover:bg-surface-3",
                    )}
                  >
                    <div className="text-sm font-medium text-content">Target only</div>
                    <div className="mt-0.5 text-[11px] text-content-faint">
                      Finish and verify the requested target first.
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMatrix("all");
                      setPlan(null);
                    }}
                    className={cn(
                      "rounded-xl border px-4 py-3 text-left transition-colors",
                      matrix === "all"
                        ? "border-(--accent)/45 bg-(--accent-glow)/25"
                        : "border-border-soft bg-void/35 hover:bg-surface-3",
                    )}
                  >
                    <div className="text-sm font-medium text-content">Universal matrix</div>
                    <div className="mt-0.5 text-[11px] text-content-faint">
                      Fan out only after the primary target passes.
                    </div>
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4 rounded-xl border border-border-soft bg-void/35 px-4 py-3">
                  <div>
                    <div className="text-sm font-medium text-content">Experimental loader cells</div>
                    <div className="mt-0.5 text-[11px] text-content-faint">
                      Include discovered loader/version combinations that are not yet stable.
                    </div>
                  </div>
                  <Toggle
                    checked={includeExperimental}
                    onChange={(value) => {
                      setIncludeExperimental(value);
                      setPlan(null);
                    }}
                    label="Include experimental conversion cells"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button onClick={planConversion} disabled={busy !== null}>
                    {busy === "plan" ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                    Plan conversion
                  </Button>
                  <Button
                    onClick={createAndRun}
                    disabled={!sourcePath || !canExecute || busy !== null}
                  >
                    {running ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
                    Convert & verify
                  </Button>
                  {!canExecute && capabilities && (
                    <span className="text-xs text-warning">
                      Conversion worker is not executable on this machine yet.
                    </span>
                  )}
                </div>
              </div>
            </section>

            {plan && (
              <section className="rounded-2xl border border-border-soft bg-surface-2/60 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display text-sm font-semibold text-content">Resolved plan</h2>
                    <p className="mt-0.5 text-xs text-content-faint">
                      {plan.latest_resolution.requested} → {plan.latest_resolution.resolved} ·{" "}
                      {plan.secondary.length} secondary cell{plan.secondary.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <span className="text-[11px] text-content-faint">
                    Fan-out: {plan.fanout_gate}
                  </span>
                </div>
                <div className="mt-4 grid gap-2 md:grid-cols-2">
                  <PlanCell
                    minecraft={plan.primary.minecraft}
                    loader={plan.primary.loader}
                    state={plan.primary.support_state}
                    primary
                  />
                  {plan.secondary.map((cell) => (
                    <PlanCell
                      key={cell.id}
                      minecraft={cell.minecraft}
                      loader={cell.loader}
                      state={cell.support_state}
                    />
                  ))}
                </div>
              </section>
            )}

            {activeSession && (
              <section className="rounded-2xl border border-border-soft bg-surface-2/60 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display text-sm font-semibold text-content">Active conversion</h2>
                    <p className="mt-0.5 font-mono text-[11px] text-content-faint">
                      {activeSession.id} · {activeSession.phase}
                    </p>
                  </div>
                  <StatusPill
                    state={
                      activeSession.phase === "complete"
                        ? "passed"
                        : activeSession.phase.includes("failed")
                          ? "failed"
                          : activeSession.phase.includes("running") ||
                              activeSession.phase.includes("building")
                            ? "building"
                            : "pending"
                    }
                  />
                </div>
                <div className="mt-4 space-y-2">
                  {activeCells.map((cell) => {
                    const record = activeSession.cells[cell.id];
                    return (
                      <div
                        key={cell.id}
                        className="flex items-center justify-between gap-4 rounded-xl border border-border-soft bg-void/35 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-xs font-medium text-content">
                            {cell.minecraft} · {cell.loader}
                            {record.primary ? " · primary" : ""}
                          </div>
                          {record.reason && (
                            <div className="mt-0.5 truncate text-[11px] text-content-faint">
                              {record.reason}
                            </div>
                          )}
                        </div>
                        <StatusPill state={record.state} />
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {lastJob && (
              <section className="rounded-2xl border border-border-soft bg-surface-2/60 p-5">
                <h2 className="font-display text-sm font-semibold text-content">Last run receipt</h2>
                <div className="mt-3 grid gap-2 sm:grid-cols-4">
                  {(["built", "reused", "blocked", "failed"] as const).map((key) => (
                    <div key={key} className="rounded-xl border border-border-soft bg-void/35 px-3 py-3">
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-content-faint">
                        {key}
                      </div>
                      <div className="mt-1 text-xl font-semibold text-content">
                        {lastJob.job.receipt.run?.[key]?.length ?? 0}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="space-y-5">
            <section className="rounded-2xl border border-border-soft bg-surface-2/60 p-5">
              <h2 className="font-display text-sm font-semibold text-content">Engine readiness</h2>
              <div className="mt-4 grid gap-2">
                <Readiness
                  label="Embedded conversion worker"
                  value={capabilities?.toolkit.root || "Unavailable"}
                  ok={capabilities?.toolkit.available === true}
                />
                <Readiness
                  label="Python runtime"
                  value={
                    capabilities?.toolkit.python
                      ? `${capabilities.toolkit.python.version} · ${capabilities.toolkit.python.source}`
                      : "Unavailable"
                  }
                  ok={!!capabilities?.toolkit.python}
                />
                <Readiness
                  label="Production driver"
                  value={capabilities?.toolkit.production_driver ? "Ready" : "Unavailable"}
                  ok={capabilities?.toolkit.production_driver === true}
                />
                <Readiness
                  label="Java"
                  value={
                    capabilities?.java.available
                      ? `Java ${capabilities.java.major ?? "?"}`
                      : "Unavailable"
                  }
                  ok={capabilities?.java.available === true}
                />
                <Readiness
                  label="Latest Minecraft"
                  value={capabilities?.latest_release || "Unresolved"}
                  ok={capabilities?.latest_profile_resolved === true}
                />
              </div>
              {toolchainStatus && (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-(--accent)/30 bg-(--accent-glow)/15 px-3 py-2 text-xs text-content">
                  {toolchainStatus.includes("Provisioning") ? (
                    <Loader2 className="size-3.5 animate-spin text-(--accent)" />
                  ) : (
                    <CheckCircle2 className="size-3.5 text-ok" />
                  )}
                  {toolchainStatus}
                </div>
              )}
              {health && (
                <div className="mt-3 rounded-xl border border-ok/30 bg-ok/10 px-3 py-2 text-xs text-ok">
                  {health}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-border-soft bg-surface-2/60 p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-sm font-semibold text-content">Recent conversions</h2>
                <span className="text-[10px] uppercase tracking-wide text-content-faint">
                  resumable
                </span>
              </div>
              <div className="mt-3 space-y-2">
                {sessions.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border px-4 py-5 text-center text-xs text-content-faint">
                    No conversion sessions yet.
                  </div>
                ) : (
                  sessions.slice(0, 8).map((session) => {
                    const primary = session.plan.primary;
                    const primaryState = session.cells[primary.id]?.state || "pending";
                    return (
                      <button
                        key={session.id}
                        type="button"
                        onClick={() => setActiveSession(session)}
                        className="flex w-full items-center justify-between gap-3 rounded-xl border border-border-soft bg-void/35 px-3 py-3 text-left transition-colors hover:bg-surface-3"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-medium text-content">
                            {primary.minecraft} · {primary.loader}
                          </span>
                          <span className="mt-0.5 block truncate font-mono text-[10px] text-content-faint">
                            {session.id}
                          </span>
                        </span>
                        <StatusPill state={primaryState} />
                      </button>
                    );
                  })
                )}
              </div>
              {activeSession && activeSession.phase !== "complete" && (
                <Button
                  className="mt-3 w-full"
                  variant="ghost"
                  onClick={() => executeSession(activeSession)}
                  disabled={!canExecute || busy !== null}
                >
                  {running ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
                  Resume selected session
                </Button>
              )}
            </section>
          </div>
        </div>

        {error && (
          <div className="mx-auto mt-5 max-w-6xl rounded-xl border border-danger/35 bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
