import type { Instance, InstalledProjectSource } from "./types";

export type ContentSources = Record<string, Record<string, InstalledProjectSource>>;

export function buildInstalledInstancesByProject(
  instances: Instance[],
  contentSources: ContentSources,
  kind: string,
): Map<string, Instance[]> {
  const index = new Map<string, Instance[]>();
  for (const instance of instances) {
    const sourceMap = contentSources[`${instance.id}:${kind}`];
    if (!sourceMap) continue;
    for (const projectId of Object.keys(sourceMap)) {
      const found = index.get(projectId);
      if (found) found.push(instance);
      else index.set(projectId, [instance]);
    }
  }
  return index;
}

export function buildPackInstancesByProject(instances: Instance[]): Map<string, Instance> {
  const index = new Map<string, Instance>();
  for (const instance of instances) {
    if (instance.pack_project_id && !index.has(instance.pack_project_id)) {
      index.set(instance.pack_project_id, instance);
    }
  }
  return index;
}
