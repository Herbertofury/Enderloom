export interface ArtifactObservation {
  observation_id: number;
  target_kind: string;
  target_id: string;
  content_kind: string;
  file_name: string;
  artifact: { sha256: string; size: number; evidence_class: 'measured'; hashes: { algorithm: string; value: string }[] };
  release_id: string | null;
  provider_version_id: string | null;
  source_match: 'verified' | 'modified' | 'unverified';
  observed_at: number;
  current: boolean;
  previous_sha256: string | null;
}
export interface ProjectArtifactGraph {
  schema_version: number;
  project: { id: string; title: string; aliases: { provider: string; project_id: string }[] } | null;
  observations: ArtifactObservation[];
}
