export interface FileHash { algorithm: 'sha256' | 'sha1' | 'sha512'; value: string }
export interface ArtifactIdentity { sha256: string; size: number; evidence_class: 'measured'; hashes: FileHash[] }
export interface ProviderProjectIdentity { provider: 'modrinth' | 'curseforge'; project_id: string; title: string; author: string; source_url: string; icon_url: string | null }
export interface ProjectSourceLink { id: string; left: ProviderProjectIdentity; right: ProviderProjectIdentity; reason: string; confidence_class: 'user_confirmed'; active: boolean; created_at: number; updated_at: number }
export interface ProjectSourcePreview { left: ProviderProjectIdentity; right: ProviderProjectIdentity; matching_file_hashes: string[] }
export interface ReleaseIdentity {
  id: string;
  project_id: string;
  provider: string;
  provider_version_id: string;
  artifacts: ArtifactIdentity[];
}
export interface ArtifactObservation {
  observation_id: number;
  target_kind: string;
  target_id: string;
  content_kind: string;
  file_name: string;
  artifact: ArtifactIdentity;
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
  releases: ReleaseIdentity[];
  observations: ArtifactObservation[];
  source_links: ProjectSourceLink[];
}
