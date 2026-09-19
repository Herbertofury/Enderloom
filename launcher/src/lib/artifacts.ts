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
export interface ProjectContext {
  provider: string;
  project_id: string;
  checked_at: number;
  targets: {
    kind: 'instance' | 'server'; id: string; name: string; minecraft: string; loader: string | null;
    files: { file_name: string; exists: boolean; enabled: boolean; version_id: string | null; mod_version: string | null; icon_url: string | null }[];
    configs: { path: string; title: string; exists: boolean; enabled: boolean; world: string | null; owner: import('./config-associations').ConfigAssociation }[];
    worlds?: { folder: string; name: string; directory: string; minecraft: string | null; status: string; warning: string | null; evidence: { kind: 'enabled_datapack'|'disabled_datapack'|'dimension_storage'; mod_id: string; path: string; detail: string }[] }[];
    dependencies: { owner: string; mod_id: string; qualified_id?: string; kind: string; direction: 'dependency' | 'dependent'; version_range: string | string[] | Record<string,unknown> | null; alternative_group?: string | null; unless?: unknown; declared_expression?: unknown; manifest: string; side: string; file_name: string; source_title: string | null; source_enabled: boolean; installed_targets: { file_name: string; title: string | null; enabled: boolean }[] }[];
    warnings: string[];
  }[];
  warnings: { target_id: string; message: string }[];
}
