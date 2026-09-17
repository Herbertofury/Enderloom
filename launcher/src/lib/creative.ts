import type {
  ContentKind,
  ContentItem,
  ProjectSummary,
  SearchProvider,
} from "./types";

export interface FavoriteInput {
  provider: SearchProvider | "local";
  project_id: string;
  title: string;
  kind: ContentKind | "addons" | "config";
  icon_url?: string | null;
  description?: string;
  author?: string;
  game_versions?: string[];
  loaders?: string[];
  source_url?: string;
}
export interface Favorite extends FavoriteInput {
  key: string;
  collections: string[];
  tags: string[];
  notes: string;
  pinned: boolean;
  order: number;
  saved_at: number;
}
export interface CreativeLibrary {
  schema: number;
  favorites: Record<string, Favorite>;
  collections: Record<string, { id: string; name: string }>;
  preferences: Record<string, string>;
}
export interface Installation {
  instance_id: string;
  instance_name: string;
  kind: ContentKind | "config" | "addons";
  file_name: string;
  version?: string;
  version_id?: string;
  enabled: boolean;
  update?: { latest_name: string; latest_version_id: string } | null;
  inspection?: ModInspection | null;
}
export interface ModInspection {
  sha256: string;
  detector: string;
  status: "declared" | "likely" | "possible" | "unknown";
  evidence: { signal: string; path: string; detail: string }[];
  limited: boolean;
  scope: string;
  override?: {
    choice: "mcreator" | "not_mcreator";
    note: string;
    at: number;
  } | null;
  facts: {
    classes: number;
    procedures: number;
    texture_bytes: number;
    sound_bytes: number;
    unpacked_bytes: number;
    mixin_configs: number;
    tick_references: string[];
  };
}
export interface InspectedMod {
  file_name: string;
  enabled: boolean;
  size: number;
  title: string;
  source: ContentItem["source"];
  inspection: ModInspection | null;
  error: string | null;
}
export interface PerformanceReport {
  id: string;
  instance_id: string;
  instance_name: string;
  at: number;
  kind: string;
  detector: string;
  fingerprint: string;
  environment: Record<string, string | number | null>;
  config_hashes: Record<string, string>;
  files: InspectedMod[];
  duration_ms: number;
}
export interface RuntimeCapture {
  id: string;
  instance_id: string;
  instance_name: string;
  sandbox_id: string;
  at: number;
  seconds: number;
  state: string;
  cleaned_up: boolean;
  has_log?: boolean;
  cleanup_error?: string;
  error?: string | null;
  input_fingerprint?: string;
  recording_path?: string;
  recording_sha256?: string;
  sampling_note: string;
  milestones: Record<string, { elapsed_ms: number; evidence: string }>;
  jfr_error?: string;
  jfr?: {
    cpu_samples: number;
    mean_jvm_cpu_percent: number | null;
    heap_samples: number;
    max_observed_heap_bytes: number | null;
    gc_collections: number;
    gc_pause_events: number;
    total_gc_pause_ms: number | null;
    max_gc_pause_ms: number | null;
    scope: string;
  } | null;
}
export interface ModComparison {
  id: string;
  instance_id: string;
  instance_name: string;
  file_name: string;
  target_sha256: string;
  at: number;
  state: string;
  requested_pairs: number;
  seconds: number;
  method: string;
  error: string | null;
  captures: string[];
  pairs: {
    index: number;
    order: string;
    with_capture: string;
    without_capture: string;
    delta_ms: Record<string, number>;
  }[];
  statistics?: Record<
    string,
    {
      pairs: number;
      mean_delta_ms: number;
      sample_std_dev_ms: number | null;
      min_delta_ms: number;
      max_delta_ms: number;
    }
  >;
}
export function generatorLabel(value?: ModInspection | null): string {
  if (!value) return "Not inspected";
  if (value.override)
    return value.override.choice === "mcreator"
      ? "MCreator · marked by you"
      : "Other tool · marked by you";
  return {
    declared: "MCreator · declared",
    likely: "MCreator · likely",
    possible: "MCreator · possible",
    unknown: "Generator unknown",
  }[value.status];
}
export function isMCreator(value?: ModInspection | null): boolean {
  return value?.override
    ? value.override.choice === "mcreator"
    : !!value && value.status !== "unknown";
}
export function projectFavorite(
  project: ProjectSummary,
  provider: SearchProvider,
  kind: ContentKind,
): FavoriteInput {
  return { ...project, project_id: project.id, provider, kind };
}
export function contentFavorite(
  item: ContentItem,
  kind: ContentKind,
  inspection?: ModInspection | null,
): FavoriteInput | null {
  const source = item.source;
  if (source?.provider && source.project_id)
    return {
      provider: source.provider,
      project_id: source.project_id,
      title: source.title ?? item.file_name,
      kind,
      icon_url: source.icon_url,
    };
  if (inspection)
    return {
      provider: "local",
      project_id: inspection.sha256,
      title: source?.title ?? item.file_name,
      kind,
      description: `${kind}/${item.file_name}${item.enabled ? "" : ".disabled"}`,
    };
  return null;
}
