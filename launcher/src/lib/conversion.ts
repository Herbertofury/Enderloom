export type ConversionInput = { path: string; label: string; role: 'authority' | 'checkpoint' | 'reference' | 'candidate' | 'toolkit'; expected_sha256?: string | null };
export type ConversionRequest = { project_id: string; title: string; minecraft: string; loader: string; loader_version: string; java: number; checkpoint: string; inputs: ConversionInput[] };
export type ConversionProject = { project_id: string; title: string; snapshot_id: string; at: number; request: ConversionRequest };
export type ConversionSnapshot = { id: string; project_id: string; title: string; primary_target: { minecraft: string; loader: string; loader_version: string; java: number }; checkpoint: string; at: number; state: string; scope: string; inputs: (ConversionInput & { sha256: string; bytes: number; retained_path: string; entry_count: number; families: Record<string, number>; warnings: string[]; cache_reused: boolean; expected_hash_verified: boolean })[] };
export type PackageEntry = { path: string; key: string; family: string; sha256: string; bytes: number };
export type PackageEntries = { total: number; offset: number; entries: PackageEntry[] };
export type PackageComparison = { total: number; offset: number; counts: Record<string, number>; scope: string; rows: { key: string; status: string; baseline: PackageEntry[] | null; candidate: PackageEntry[] | null }[] };
