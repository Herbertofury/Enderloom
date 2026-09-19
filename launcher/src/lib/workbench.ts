export type Origin =
  "unknown" | "original" | "edited" | "ai_assisted" | "patch";
export interface Revision {
  hash: string;
  at: number;
  note: string;
  origin: Origin;
}
export interface WorkbenchRecord {
  path: string;
  title: string;
  origin: Origin;
  notes: string;
  source_url: string;
  provider: string;
  project_id: string;
  version_id: string;
  recipe: string;
  game_version: string;
  loader_version: string;
  original_hash: string;
  revisions: Revision[];
  global_hash: string;
  update: null | {
    status: "current" | "available" | "unverified" | "incompatible" | "error";
    name?: string;
    version_id?: string;
    message: string;
    checked_at: number;
  };
}
export interface WorkbenchEntry {
  owner?: import("./config-associations").ConfigAssociation;
  automatic_owner?: import("./config-associations").ConfigAssociation;
  validation?: "pending" | "checked";
  path: string;
  title: string;
  config: boolean;
  addon: boolean;
  mod: boolean;
  exists: boolean;
  enabled: boolean;
  editable: boolean;
  size: number;
  hash: string;
  modified: boolean;
  tracked: boolean;
  issues: { severity: "error" | "warning" | "info"; message: string }[];
  record: WorkbenchRecord;
}
export interface ConfigPreset {
  id: string;
  name: string;
  path: string;
  text: string;
  hash: string;
  game_version: string;
  updated_at: number;
}
export interface InstallRecipe {
  id: string;
  title: string;
  folder: string | null;
  detected_version?: string;
  dependency: string;
  project_id: string;
  source_url: string;
  instructions: string;
}
export interface WorkbenchLibrary {
  entries: WorkbenchEntry[];
  warnings: string[];
  recipes: InstallRecipe[];
  presets: ConfigPreset[];
  scanned_at: number;
  premium: { mode: string; features: string[] };
}
export interface ConfigDocument {
  path: string;
  hash: string;
  text: string;
  problem: string | null;
}
export const ORIGINS: Record<Origin, string> = {
  unknown: "Unclassified",
  original: "Original · declared",
  edited: "Locally edited",
  ai_assisted: "AI assisted · declared",
  patch: "Patch",
};
export const needsAttention = (e: WorkbenchEntry) =>
  e.issues.some((i) => i.severity !== "info") ||
  ["error", "incompatible", "available"].includes(
    e.record.update?.status ?? "",
  );
