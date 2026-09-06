'use strict';

const PROJECT_HOST = /(?:^|\.)(?:modrinth\.com|curseforge\.com|github\.com|gitlab\.com|planetminecraft\.com|mcpedl\.com|modbay\.org|spigotmc\.org|hangar\.papermc\.io|moddb\.com|nexusmods\.com)$/i;
const SOCIAL_HOST = /(?:^|\.)(?:youtube\.com|youtu\.be|tiktok\.com|discord\.gg|discord\.com|twitter\.com|x\.com|instagram\.com|facebook\.com|patreon\.com|ko-fi\.com)$/i;
const PROVIDER_PATH = /\/(?:mod|modpack|resourcepack|shader|datapack|plugin|minecraft\/mc-mods|minecraft\/modpacks|minecraft\/texture-packs|minecraft\/shaders|minecraft\/data-packs)\//i;

const DEFAULT_SETTINGS = Object.freeze({
  autoSyncOnLaunch: true,
  launchCooldownHours: 12,
  maxIncrementalVideosPerCreator: 16,
  browserHistoryScrollPasses: 120,
  browserPoolSize: 3,
  videoConcurrency: 5,
  creatorConcurrency: 2,
  resolverCacheDays: 14,
});

const now = () => new Date().toISOString();
const sleep = ms => new Promise(resolve => setTimeout(resolve, Math.max(0, Number(ms) || 0)));
const clean = value => String(value == null ? '' : value)
  .replace(/[\u0000-\u001f\u007f]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
const unique = values => [...new Set((values || []).filter(Boolean))];

function safeUrl(value) {
  try {
    const url = new URL(String(value || '').trim());
    return /^https?:$/.test(url.protocol) ? url.toString() : '';
  } catch {
    return '';
  }
}

function urlKey(value) {
  const safe = safeUrl(value);
  if (!safe) return clean(value).replace(/\/$/, '').toLowerCase();
  const url = new URL(safe);
  url.hash = '';
  for (const key of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','ref','source','si','feature']) {
    url.searchParams.delete(key);
  }
  return url.toString().replace(/\/$/, '').toLowerCase();
}

function providerForUrl(value) {
  const safe = safeUrl(value);
  if (!safe) return '';
  const host = new URL(safe).hostname.toLowerCase();
  if (host === 'modrinth.com' || host.endsWith('.modrinth.com')) return 'Modrinth';
  if (host === 'curseforge.com' || host.endsWith('.curseforge.com')) return 'CurseForge';
  if (host === 'github.com' || host.endsWith('.github.com')) return 'GitHub';
  if (host === 'gitlab.com' || host.endsWith('.gitlab.com')) return 'GitLab';
  if (host === 'planetminecraft.com' || host.endsWith('.planetminecraft.com')) return 'Planet Minecraft';
  if (host === 'mcpedl.com' || host.endsWith('.mcpedl.com')) return 'MCPEDL';
  if (host === 'modbay.org' || host.endsWith('.modbay.org')) return 'ModBay';
  return 'Official';
}

function projectLink(value) {
  const safe = safeUrl(value);
  if (!safe) return false;
  const url = new URL(safe);
  if (SOCIAL_HOST.test(url.hostname)) return false;
  return PROJECT_HOST.test(url.hostname) || PROVIDER_PATH.test(url.pathname);
}

async function mapConcurrent(rows, limit, mapper) {
  const input = Array.isArray(rows) ? rows : [];
  if (!input.length) return [];
  const output = new Array(input.length);
  let cursor = 0;
  async function worker() {
    while (true) {
      const index = cursor++;
      if (index >= input.length) return;
      output[index] = await mapper(input[index], index);
    }
  }
  const count = Math.max(1, Math.min(input.length, Number(limit) || 1));
  await Promise.all(Array.from({ length:count }, () => worker()));
  return output;
}

function clampInt(value, fallback, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(number)));
}

module.exports = {
  PROJECT_HOST, SOCIAL_HOST, PROVIDER_PATH, DEFAULT_SETTINGS,
  now, sleep, clean, unique, safeUrl, urlKey, providerForUrl, projectLink,
  mapConcurrent, clampInt,
};
