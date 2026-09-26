import { api } from "./api";
import type {
  ContentKind,
  ProjectDetails,
  ProjectMirror,
  ProjectSummary,
  SearchProvider,
} from "./types";

const DETAIL_FRESH_MS = 60_000;
const MAX_DETAILS = 256;

interface DetailEntry {
  value: ProjectDetails;
  fetchedAt: number;
}

const details = new Map<string, DetailEntry>();
const inFlight = new Map<string, Promise<ProjectDetails>>();
const mirrors = new Map<string, ProjectMirror[]>();
const mirrorInFlight = new Map<string, Promise<ProjectMirror[]>>();

function key(provider: SearchProvider, projectId: string): string {
  return `${provider}:${projectId}`;
}

function remember(cacheKey: string, value: ProjectDetails): ProjectDetails {
  details.delete(cacheKey);
  details.set(cacheKey, { value, fetchedAt: Date.now() });
  while (details.size > MAX_DETAILS) {
    const oldest = details.keys().next().value as string | undefined;
    if (!oldest) break;
    details.delete(oldest);
  }
  return value;
}

export function peekProjectDetails(
  provider: SearchProvider,
  projectId: string,
): ProjectDetails | null {
  return details.get(key(provider, projectId))?.value ?? null;
}

export function projectDetailsFromSummary(
  provider: SearchProvider,
  summary: ProjectSummary,
): ProjectDetails {
  const page = summary.slug ?? summary.id;
  return {
    id: summary.id,
    slug: summary.slug,
    title: summary.title,
    description: summary.description,
    body: "",
    body_format: "markdown",
    icon_url: summary.icon_url,
    downloads: summary.downloads,
    follows: summary.follows,
    author: summary.author,
    gallery: [],
    game_versions: summary.game_versions,
    loaders: summary.loaders,
    client_side: null,
    server_side: null,
    categories: summary.categories,
    license: null,
    links: [],
    published: null,
    updated: summary.updated,
    website_url:
      provider === "modrinth"
        ? `https://modrinth.com/project/${page}`
        : `https://www.curseforge.com/minecraft/mc-mods/${page}`,
    color: summary.color,
  };
}

export function loadProjectDetails(
  provider: SearchProvider,
  projectId: string,
  force = false,
): Promise<ProjectDetails> {
  const cacheKey = key(provider, projectId);
  const cached = details.get(cacheKey);
  if (!force && cached && Date.now() - cached.fetchedAt < DETAIL_FRESH_MS) {
    return Promise.resolve(cached.value);
  }

  const active = inFlight.get(cacheKey);
  if (active) return active;

  const request = api
    .getProjectDetails(provider, projectId)
    .then((value) => remember(cacheKey, value))
    .finally(() => inFlight.delete(cacheKey));
  inFlight.set(cacheKey, request);
  return request;
}

export function prefetchProjectDetails(
  provider: SearchProvider,
  projectId: string,
): void {
  void loadProjectDetails(provider, projectId).catch(() => {
    // Prefetch is speculative. The real navigation path reports an error if it still fails.
  });
}


export function peekProjectMirrors(
  provider: SearchProvider,
  projectId: string,
  kind: ContentKind,
): ProjectMirror[] | null {
  return mirrors.get(`${key(provider, projectId)}:${kind}`) ?? null;
}

export function loadProjectMirrors(
  provider: SearchProvider,
  projectId: string,
  kind: ContentKind,
): Promise<ProjectMirror[]> {
  const cacheKey = `${key(provider, projectId)}:${kind}`;
  const cached = mirrors.get(cacheKey);
  if (cached) return Promise.resolve(cached);

  const active = mirrorInFlight.get(cacheKey);
  if (active) return active;

  const request = api
    .findProjectMirrors(provider, projectId, kind)
    .then((value) => {
      mirrors.set(cacheKey, value);
      return value;
    })
    .finally(() => mirrorInFlight.delete(cacheKey));
  mirrorInFlight.set(cacheKey, request);
  return request;
}

export function prefetchProject(
  provider: SearchProvider,
  projectId: string,
  kind: ContentKind,
): void {
  prefetchProjectDetails(provider, projectId);
  void loadProjectMirrors(provider, projectId, kind).catch(() => {
    // Mirror discovery is enrichment and must never block project navigation.
  });
}
