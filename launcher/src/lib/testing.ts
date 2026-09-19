import type { InspectedMod } from "./creative";
import type { EvidenceReport } from "./performance-evidence";
export type TestArtifact = { kind: "image" | "video" | "spark" | "log"; name: string; label: string; path: string; at: number; sha256?: string };
export type TestStep = { at: number; command: string; expected: string | null; matched: boolean; status: string; output: string; duration_ms: number };
export type TestReport = {
  id: string; at: number; instance_id: string; instance_name: string; state: string; minecraft: string; loader: string; loader_version: string;
  record_video: boolean; max_seconds: number; ready_at?: number; finished_at?: number; error?: string; cleaned_up?: boolean; cleanup_error?: string;
  launched_at?: number; adapter_ready_at?: number; world_ready_at?: number; requested_world?: string | null;
  ready_observation?: { at: number; dimension: string; position: number[]; screen: null };
  mods?: InspectedMod[]; steps: TestStep[]; artifacts: TestArtifact[]; report_dir: string; input_fingerprint?: string;
  fps_by_dimension?: Record<string, { samples: number; mean_fps: number; min_reported_fps: number; max_reported_fps: number }>;
  fps_note: string; adapter: { name: string; release: string; source: string; sha256: string }; probe_version: string;
  frame_times?: Record<string, { frames: number; mean_frame_ms: number; p95_frame_ms: number; p99_frame_ms: number; max_frame_ms: number; one_percent_low_fps: number; hitches_over_50ms: number; hitches_over_100ms: number; hitches_over_250ms: number }>;
  frame_time_note?: string; loaded_mods?: Array<{id:string; name:string; version:string}>; runtime_environment?: Record<string,string|number>;
  evidence?: EvidenceReport[]; analysis_errors?: Array<{name:string;error:string}>; scenario_state?: string; scenario_error?: string;
};
export type TestArtifactData = { data: string };
export type TestReportSummary = Pick<TestReport, "id" | "at" | "instance_id" | "instance_name" | "state" | "scenario_state" | "finished_at">;
export type TestScenario = { name: string; steps: Array<{ command?: string; expect?: string; timeoutSeconds?: number; screenshot?: string; waitSeconds?: number }> };
