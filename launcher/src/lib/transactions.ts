export interface TransactionPlan {
  schema_version: number;
  id: string;
  operation: string;
  target_kind: string;
  target_id: string;
  target_revision_id: string;
  source_path: string;
  source_state_sha256: string;
  target_state_sha256: string;
  changes: { path: string; action: 'add' | 'replace' | 'remove' | 'create_directory' | 'remove_directory'; before_sha256: string | null; after_sha256: string | null }[];
  unchanged_files: number;
  preserved_paths: string[];
  metadata_changes: boolean;
}
export type TransactionState = 'planned' | 'staging' | 'applying' | 'committed' | 'rolled_back' | 'recovery_required';
export interface TransactionReceipt {
  schema_version: number;
  id: string;
  task_id: string | null;
  plan: TransactionPlan;
  state: TransactionState;
  pre_change_snapshot: string | null;
  owned_areas: { role: string; path: string; removed: boolean }[];
  audit: { at: number; state: TransactionState; note: string }[];
  error: string | null;
}
