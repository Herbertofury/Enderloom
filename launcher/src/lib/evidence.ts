export type EvidenceSource = { data: string };
export type EvidenceArtifact = {
  schema_version: number; id: string; kind: 'spark_profile' | 'log_analysis' | 'package_inventory'; title: string;
  producer: { adapter: string; version: string } | null;
  target: { kind: string; id: string; snapshot_id: string | null }; run_id: string | null;
  observed_at: number | null; recorded_at: number;
  raw: { sha256: string; bytes: number; path: string; representation: string } | null;
  missing_raw_reason: string | null; normalized: { schema: string; key: string; sha256: string };
  provenance: { operation: string; source_url: string | null; note: string };
  confidence_class: 'measured' | 'sampled' | 'inferred' | 'externally_reported'; scope: string;
  links?: { id: string; from: string; to: string; relation: EvidenceRelation; reason: string; recorded_at: number }[];
};
export type EvidenceRelation = 'comparison' | 'contradiction' | 'supports' | 'supersedes';
export type EvidenceVerification = { checked_at: number; raw: { state: string; reason?: string; actual_sha256?: string }; normalized: { state: string }; scope: string };
export function evidenceSource(bytes: Uint8Array): EvidenceSource {
  const parts: string[] = [];
  for (let i = 0; i < bytes.length; i += 0x8000) parts.push(String.fromCharCode(...bytes.subarray(i, i + 0x8000)));
  return { data: btoa(parts.join('')) };
}
