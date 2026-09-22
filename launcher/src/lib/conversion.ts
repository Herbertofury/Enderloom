export type ConversionLoader = "fabric" | "quilt" | "neoforge" | "forge";

export type ConversionCellState =
  | "pending"
  | "blocked"
  | "building"
  | "built"
  | "testing"
  | "passed"
  | "runtime-unverified"
  | "failed"
  | "cancelled"
  | "stale";

export interface ConversionCell {
  id: string;
  minecraft: string;
  loader: string;
  java?: number;
  mapping_model?: string;
  support_state: string;
  selected?: boolean;
  primary?: boolean;
  reason?: string | null;
  profile?: Record<string, unknown>;
}

export interface ConversionPlanRequest {
  targetMc: string;
  targetLoader: ConversionLoader;
  matrix?: "target-only" | "all";
  versions?: string[] | string;
  loaders?: ConversionLoader[] | string;
  exclude?: string[] | string;
  includeExperimental?: boolean;
  latestVersion?: string;
}

export interface ConversionSchedulerBudget {
  logical_cpus: number;
  total_memory_mb: number;
  reserved_memory_mb: number;
  estimated_gradle_cell_mb: number;
  max_secondary_cells: number;
}

export interface ConversionPlan {
  schema_version: number;
  profile_sha256: string;
  registry_snapshot_date: string | null;
  latest_resolution: { requested: string; resolved: string; source: string };
  matrix_mode: string;
  primary: ConversionCell;
  secondary: ConversionCell[];
  cells: ConversionCell[];
  fanout_gate: "primary-passed";
  scheduler: ConversionSchedulerBudget;
}

export interface ConversionMetadataState {
  source: string;
  fetched_at?: string | null;
  fresh: boolean;
  errors?: Array<{ loader: string; error: string }>;
  error?: string;
}

export interface ConversionVersionResolution {
  minecraft: string;
  java: number | null;
  profile: Record<string, unknown> & { minecraft: string; loaders: Record<string, unknown> };
  errors: Array<{ loader: string; error: string }>;
  source: string;
  fresh: boolean;
  error?: string;
}

export interface ConversionCapabilities {
  schema_version: number;
  service: "northpoint";
  profile_sha256: string;
  registry_snapshot_date: string | null;
  latest_release: string | null;
  latest_profile_resolved: boolean;
  metadata: ConversionMetadataState | null;
  java: { available: boolean; major: number | null; raw: string };
  toolkit: { available: boolean; root: string | null; simple_mod_selftest: boolean };
  scheduler: ConversionSchedulerBudget;
  execution_available: boolean;
  no_fake_execution: true;
}

export interface ConversionCellRecord {
  cell_id: string;
  state: ConversionCellState;
  support_state: string;
  primary: boolean;
  selected: boolean;
  reason: string | null;
  fingerprint: string | null;
  artifact: unknown;
  evidence: unknown[];
  attempts: number;
}

export interface ConversionSession {
  schema_version: number;
  id: string;
  created_at: string;
  updated_at: string;
  source: Record<string, unknown>;
  plan: ConversionPlan;
  phase: string;
  fanout_unlocked: boolean;
  cells: Record<string, ConversionCellRecord>;
  last_error: string | null;
}

export interface ConversionSelfTestResult {
  ok: boolean;
  marker: string;
  stdout_tail: string;
}

export interface ConversionJobArtifact {
  file: string;
  sha256: string;
  size: number;
}

export interface ConversionJobMatrixCell {
  cell_id: string;
  state: ConversionCellState;
  fingerprint: string | null;
  artifact?: ConversionJobArtifact | null;
  reason?: string | null;
}

export interface ConversionJobResult {
  session: ConversionSession;
  job: {
    ok: boolean;
    partial: boolean;
    driver_profile: "production";
    exit_code: number | null;
    receipt: {
      status: "PASS" | "PARTIAL" | "FAILED_PRIMARY";
      run?: {
        built: string[];
        reused: string[];
        failed: string[];
        blocked: string[];
      };
      [key: string]: unknown;
    };
    matrix: {
      schema_version: number;
      generated_at?: string;
      cells: ConversionJobMatrixCell[];
    } | null;
    state_dir: string;
    stdout_tail: string;
    stderr_tail: string;
  };
}
