'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const net = require('net');
const { spawn } = require('child_process');
const { EventEmitter } = require('events');
const { NorthpointJobBridge } = require('./northpoint-job-bridge');

const SESSION_SCHEMA = 1;
const PROFILE_SCHEMA = 1;
const CELL_STATES = new Set([
  'pending', 'blocked', 'building', 'built', 'testing', 'passed',
  'runtime-unverified', 'failed', 'cancelled', 'stale',
]);
const LOADERS = new Set(['fabric', 'quilt', 'neoforge', 'forge']);
const METADATA_TTL_MS = 6 * 60 * 60 * 1000;
const MOJANG_MANIFEST_URL = 'https://piston-meta.mojang.com/mc/game/version_manifest_v2.json';
const FABRIC_META_ROOT = 'https://meta.fabricmc.net/v2/versions/loader';
const QUILT_META_ROOT = 'https://meta.quiltmc.org/v3/versions/loader';
const NEOFORGE_METADATA_URL = 'https://maven.neoforged.net/releases/net/neoforged/neoforge/maven-metadata.xml';
const FORGE_PROMOTIONS_URL = 'https://files.minecraftforge.net/net/minecraftforge/forge/promotions_slim.json';
const DEFAULT_PROFILES = Object.freeze({
  schema_version: PROFILE_SCHEMA,
  snapshot_date: '2026-09-22',
  latest: { release: '26.3', dynamic_resolution_required: true },
  versions: [
    {
      minecraft: '1.20.1', java: 17, mapping_model: 'obfuscated-historical',
      loaders: {
        fabric: { support_state: 'stable', resolver: 'fabric-cli', runtime_lane: 'client+server' },
        forge: { support_state: 'stable', resolver: 'forge-maven', runtime_lane: 'client+server' },
      },
    },
    {
      minecraft: '1.21.1', java: 21, mapping_model: 'official-mapped',
      loaders: {
        fabric: { support_state: 'stable', resolver: 'fabric-cli', runtime_lane: 'client+server' },
        neoforge: { support_state: 'stable', resolver: 'neoforge-mdk', runtime_lane: 'client+server' },
      },
    },
    {
      minecraft: '26.3', java: 25, mapping_model: 'official-unobfuscated',
      loaders: {
        fabric: {
          support_state: 'stable', resolver: 'fabric-cli', loader_version: '0.19.5',
          loom: '1.17', gradle: '9.6.0', runtime_lane: 'client+server',
        },
        neoforge: {
          support_state: 'experimental', resolver: 'neoforge-mdk', gradle: '9.2.1',
          runtime_lane: 'client+server',
        },
      },
    },
  ],
});

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
}

function sha256(value) {
  const input = Buffer.isBuffer(value) ? value : Buffer.from(JSON.stringify(stable(value)));
  return crypto.createHash('sha256').update(input).digest('hex');
}

function atomicJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.${crypto.randomBytes(4).toString('hex')}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  fs.renameSync(tmp, file);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function parseCsv(value) {
  if (Array.isArray(value)) return value.map(String).map((v) => v.trim()).filter(Boolean);
  return String(value || '').split(',').map((v) => v.trim()).filter(Boolean);
}

function cellId(mc, loader) {
  return `mc-${mc}-${loader}`;
}

function javaMajorFromOutput(text) {
  const match = String(text || '').match(/version\s+"?(\d+)(?:\.|"|\s)/i)
    || String(text || '').match(/openjdk\s+(\d+)(?:\.|\s)/i);
  return match ? Number(match[1]) : null;
}

function safeRealpath(candidate) {
  try { return fs.realpathSync.native(candidate); } catch { return null; }
}

class NorthpointService extends EventEmitter {
  constructor({ rootDir, dataDir, toolkitRoot = null, env = {}, registryPath = null, metadataFetch = null, metadataTtlMs = METADATA_TTL_MS, nativeRequest = null, nativeEvents = null } = {}) {
    super();
    this.rootDir = path.resolve(rootDir || process.cwd());
    this.dataDir = path.resolve(dataDir || path.join(this.rootDir, '.enderloom', 'northpoint'));
    this.env = { ...env };
    this.explicitToolkitRoot = toolkitRoot ? path.resolve(toolkitRoot) : null;
    this.registryPath = registryPath ? path.resolve(registryPath) : null;
    this.metadataFetch = metadataFetch;
    this.nativeRequest = typeof nativeRequest === 'function' ? nativeRequest : null;
    this.nativeEvents = nativeEvents && typeof nativeEvents.on === 'function' ? nativeEvents : null;
    this.metadataTtlMs = Math.max(60 * 1000, Number(metadataTtlMs) || METADATA_TTL_MS);
    this.latestMetadata = null;
    this.sessionsDir = path.join(this.dataDir, 'sessions');
    fs.mkdirSync(this.sessionsDir, { recursive: true });
    this.registry = this.loadRegistry();
  }

  loadRegistry() {
    const candidates = [
      this.registryPath,
      path.join(this.rootDir, 'docs', 'northpoint', 'minecraft-version-profiles.json'),
    ].filter(Boolean);
    for (const candidate of candidates) {
      if (!fs.existsSync(candidate)) continue;
      const value = readJson(candidate);
      if (value?.schema_version !== PROFILE_SCHEMA || !Array.isArray(value?.versions)) {
        throw new Error(`Unsupported Northpoint version profile registry: ${candidate}`);
      }
      return value;
    }
    return JSON.parse(JSON.stringify(DEFAULT_PROFILES));
  }

  profileDigest() {
    return sha256(this.registry);
  }

  metadataCachePath() {
    return path.join(this.dataDir, 'metadata-cache.json');
  }

  readMetadataCache() {
    try {
      const value = readJson(this.metadataCachePath());
      return value?.schema_version === 1 ? value : null;
    } catch { return null; }
  }

  writeMetadataCache(value) {
    atomicJson(this.metadataCachePath(), { schema_version: 1, ...value });
  }

  async fetchMetadataText(url) {
    if (typeof this.metadataFetch === 'function') {
      const value = await this.metadataFetch(url);
      if (typeof value === 'string') return { text: value, headers: {} };
      if (value && typeof value === 'object') {
        if (typeof value.text === 'string') return { text: value.text, headers: value.headers || {} };
        if (value.json !== undefined) return { text: JSON.stringify(value.json), headers: value.headers || {} };
      }
      throw new Error(`metadata fixture returned no body for ${url}`);
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    timer.unref?.();
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Enderloom-Northpoint/1 (+https://github.com/Herbertofury/Enderloom)',
          'Accept': 'application/json, application/xml, text/xml, text/plain;q=0.8, */*;q=0.5',
        },
      });
      if (!response.ok) throw new Error(`metadata HTTP ${response.status}: ${url}`);
      return {
        text: await response.text(),
        headers: {
          etag: response.headers.get('etag'),
          last_modified: response.headers.get('last-modified'),
        },
      };
    } finally {
      clearTimeout(timer);
    }
  }

  async fetchMetadataJson(url) {
    const response = await this.fetchMetadataText(url);
    return { ...response, json: JSON.parse(response.text) };
  }

  static mavenVersions(xml) {
    return [...String(xml || '').matchAll(/<version>([^<]+)<\/version>/g)].map((m) => m[1].trim()).filter(Boolean);
  }

  static neoforgePrefix(minecraft) {
    const mc = String(minecraft);
    if (/^\d{2,}\.\d+(?:\.\d+)?$/.test(mc)) {
      const parts = mc.split('.');
      return `${parts[0]}.${parts[1]}.${parts[2] || '0'}.`;
    }
    const m = mc.match(/^1\.(\d+)(?:\.(\d+))?$/);
    return m ? `${m[1]}.${m[2] || '0'}.` : null;
  }

  upsertVersionProfile(profile, { latest = false } = {}) {
    const version = String(profile.minecraft);
    const index = this.registry.versions.findIndex((row) => String(row.minecraft) === version);
    if (index >= 0) this.registry.versions[index] = profile;
    else this.registry.versions.push(profile);
    if (latest) this.registry.latest = { ...(this.registry.latest || {}), release: version, dynamic_resolution_required: true };
  }

  versionMetadataCachePath(minecraft) {
    const key = sha256(String(minecraft)).slice(0, 20);
    return path.join(this.dataDir, 'version-metadata', `${key}.json`);
  }

  mappingModelFor(minecraft, existing = null) {
    if (existing?.mapping_model) return existing.mapping_model;
    const mc = String(minecraft);
    const major = Number(mc.split('.')[0]);
    if (major >= 26) return 'official-unobfuscated';
    const legacy = mc.match(/^1\.(\d+)(?:\.(\d+))?/);
    if (legacy && Number(legacy[1]) < 14) return 'historical-obfuscated';
    return 'official-mapped';
  }

  async buildDynamicProfile(minecraft, versionRow, detailsJson, existing = null) {
    const java = Number(detailsJson?.javaVersion?.majorVersion || existing?.java || 0) || null;
    const profile = {
      ...(existing || {}),
      minecraft: String(minecraft),
      java,
      mapping_model: this.mappingModelFor(minecraft, existing),
      loaders: {},
      dynamic: true,
      minecraft_metadata_url: versionRow?.url || existing?.minecraft_metadata_url || null,
    };
    const probes = await Promise.allSettled([
      this.probeFabric(minecraft), this.probeQuilt(minecraft), this.probeNeoForge(minecraft), this.probeForge(minecraft),
    ]);
    const names = ['fabric', 'quilt', 'neoforge', 'forge'];
    const errors = [];
    probes.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        if (result.value) profile.loaders[names[index]] = result.value;
      } else {
        errors.push({ loader: names[index], error: String(result.reason?.message || result.reason) });
      }
    });
    if (existing?.loaders) {
      probes.forEach((result, index) => {
        const name = names[index];
        if (result.status === 'rejected' && !profile.loaders[name] && existing.loaders[name]) {
          profile.loaders[name] = { ...existing.loaders[name], metadata_state: 'stale-unverified' };
        }
      });
    }
    return { minecraft: String(minecraft), java, profile, errors };
  }

  async refreshVersionProfile(minecraft, { force = false, allowStale = true } = {}) {
    const mc = String(minecraft || '').trim();
    if (!mc) throw new Error('Minecraft version is required');
    const cachePath = this.versionMetadataCachePath(mc);
    let cached = null;
    try { cached = readJson(cachePath); } catch {}
    const now = Date.now();
    if (!force && cached?.resolved?.profile && now - Number(cached.fetched_at_ms || 0) < this.metadataTtlMs) {
      this.upsertVersionProfile(cached.resolved.profile);
      return { ...cached.resolved, source: 'version-metadata-cache', fresh: true };
    }
    try {
      const manifest = await this.fetchMetadataJson(MOJANG_MANIFEST_URL);
      const versionRow = (manifest.json?.versions || []).find((row) => String(row?.id) === mc);
      if (!versionRow?.url) throw new Error(`Mojang version manifest does not contain ${mc}`);
      const details = await this.fetchMetadataJson(versionRow.url);
      const existing = this.registry.versions.find((row) => String(row.minecraft) === mc) || null;
      const resolved = await this.buildDynamicProfile(mc, versionRow, details.json, existing);
      this.upsertVersionProfile(resolved.profile);
      const fetchedAt = new Date().toISOString();
      atomicJson(cachePath, { schema_version: 1, fetched_at: fetchedAt, fetched_at_ms: now, resolved });
      return { ...resolved, source: 'live-version-metadata', fresh: true };
    } catch (error) {
      if (allowStale && cached?.resolved?.profile) {
        this.upsertVersionProfile(cached.resolved.profile);
        return { ...cached.resolved, source: 'stale-version-metadata-cache', fresh: false, error: String(error.message || error) };
      }
      throw error;
    }
  }

  async probeFabric(minecraft) {
    const { json } = await this.fetchMetadataJson(`${FABRIC_META_ROOT}/${encodeURIComponent(minecraft)}`);
    const rows = Array.isArray(json) ? json : [];
    const stableRows = rows.filter((row) => row?.loader?.stable === true);
    const chosen = stableRows[0] || rows[0];
    if (!chosen?.loader?.version) return null;
    return {
      support_state: stableRows.length ? 'stable' : 'experimental',
      resolver: 'fabric-meta',
      loader_version: String(chosen.loader.version),
      runtime_lane: 'client+server',
      metadata_source: `${FABRIC_META_ROOT}/${minecraft}`,
    };
  }

  async probeQuilt(minecraft) {
    const { json } = await this.fetchMetadataJson(`${QUILT_META_ROOT}/${encodeURIComponent(minecraft)}`);
    const rows = Array.isArray(json) ? json : [];
    const chosen = rows[0];
    const version = chosen?.loader?.version || chosen?.version;
    if (!version) return null;
    return {
      support_state: 'experimental',
      resolver: 'quilt-meta',
      loader_version: String(version),
      runtime_lane: 'client+server',
      metadata_source: `${QUILT_META_ROOT}/${minecraft}`,
    };
  }

  async probeNeoForge(minecraft) {
    const { text } = await this.fetchMetadataText(NEOFORGE_METADATA_URL);
    const prefix = NorthpointService.neoforgePrefix(minecraft);
    if (!prefix) return null;
    const versions = NorthpointService.mavenVersions(text).filter((version) => version.startsWith(prefix));
    if (!versions.length) return null;
    const stable = versions.filter((version) => !/-/.test(version));
    const chosen = (stable.length ? stable : versions).at(-1);
    return {
      support_state: stable.length ? 'stable' : 'experimental',
      resolver: 'neoforge-maven',
      loader_version: chosen,
      runtime_lane: 'client+server',
      metadata_source: NEOFORGE_METADATA_URL,
    };
  }

  async probeForge(minecraft) {
    const { json } = await this.fetchMetadataJson(FORGE_PROMOTIONS_URL);
    const promos = json?.promos || {};
    const chosen = promos[`${minecraft}-recommended`] || promos[`${minecraft}-latest`];
    if (!chosen) return null;
    return {
      support_state: 'stable',
      resolver: 'forge-promotions',
      loader_version: String(chosen),
      runtime_lane: 'client+server',
      metadata_source: FORGE_PROMOTIONS_URL,
    };
  }

  async refreshLatestProfile({ force = false, allowStale = true } = {}) {
    const now = Date.now();
    const cached = this.readMetadataCache();
    if (!force && cached?.resolved?.profile && now - Number(cached.fetched_at_ms || 0) < this.metadataTtlMs) {
      this.upsertVersionProfile(cached.resolved.profile, { latest: true });
      this.latestMetadata = { source: 'metadata-cache', fetched_at: cached.fetched_at, fresh: true, errors: cached.resolved.errors || [] };
      return { ...cached.resolved, source: 'metadata-cache', fresh: true };
    }
    try {
      const manifest = await this.fetchMetadataJson(MOJANG_MANIFEST_URL);
      const minecraft = String(manifest.json?.latest?.release || '').trim();
      if (!minecraft) throw new Error('Mojang manifest did not provide latest.release');
      const versionRow = (manifest.json?.versions || []).find((row) => String(row?.id) === minecraft);
      if (!versionRow?.url) throw new Error(`Mojang manifest is missing metadata URL for ${minecraft}`);
      const details = await this.fetchMetadataJson(versionRow.url);
      const existing = this.registry.versions.find((row) => String(row.minecraft) === minecraft) || null;
      const resolved = await this.buildDynamicProfile(minecraft, versionRow, details.json, existing);
      const { java, profile, errors } = resolved;
      this.upsertVersionProfile(profile, { latest: true });
      const fetchedAt = new Date().toISOString();
      this.writeMetadataCache({ fetched_at: fetchedAt, fetched_at_ms: now, resolved });
      this.latestMetadata = { source: 'live-metadata', fetched_at: fetchedAt, fresh: true, errors };
      return { ...resolved, source: 'live-metadata', fresh: true };
    } catch (error) {
      if (allowStale && cached?.resolved?.profile) {
        this.upsertVersionProfile(cached.resolved.profile, { latest: true });
        this.latestMetadata = { source: 'stale-metadata-cache', fetched_at: cached.fetched_at, fresh: false, error: String(error.message || error) };
        return { ...cached.resolved, source: 'stale-metadata-cache', fresh: false, error: String(error.message || error) };
      }
      const release = this.latestRelease();
      const profile = this.registry.versions.find((row) => String(row.minecraft) === release) || null;
      this.latestMetadata = { source: 'registry-snapshot', fetched_at: null, fresh: false, error: String(error.message || error) };
      if (!profile) throw error;
      return { minecraft: release, java: profile.java || null, profile, errors: [], source: 'registry-snapshot', fresh: false, error: String(error.message || error) };
    }
  }

  async preparePlan(input = {}) {
    const requested = String(input.targetMc || input.target_mc || '').trim();
    const latestAlias = ['latest', 'latest-release', 'latest_release'].includes(requested);
    if (latestAlias && input.refreshLatest !== false && input.refresh_latest !== false) {
      await this.refreshLatestProfile({ force: input.forceRefresh === true || input.force_refresh === true });
    } else if (!latestAlias) {
      const known = this.registry.versions.some((row) => String(row.minecraft) === requested);
      if ((!known || input.refreshProfile === true || input.refresh_profile === true) && input.resolveVersion !== false && input.resolve_version !== false) {
        await this.refreshVersionProfile(requested, { force: input.forceRefresh === true || input.force_refresh === true });
      }
    }
    return this.plan(input);
  }

  snapshot() {
    const toolkit = this.toolkitRoot();
    return {
      state: 'ready',
      latest_release: this.latestRelease() || null,
      metadata: this.latestMetadata,
      profile_sha256: this.profileDigest(),
      execution_available: !!toolkit,
      toolkit_root: toolkit,
    };
  }

  toolkitRoot() {
    const candidates = [
      this.explicitToolkitRoot,
      this.env.ENDERLOOM_MINECRAFT_DEV_KIT,
      process.env.ENDERLOOM_MINECRAFT_DEV_KIT,
      path.join(this.dataDir, 'minecraft-dev-kit'),
      path.join(this.rootDir, 'tools', 'minecraft-dev-kit'),
    ].filter(Boolean).map((p) => path.resolve(String(p)));
    for (const candidate of candidates) {
      const script = path.join(candidate, 'scripts', 'northpoint_graduation.py');
      if (fs.existsSync(script)) return safeRealpath(candidate) || candidate;
    }
    return null;
  }

  async detectJava() {
    return await new Promise((resolve) => {
      const child = spawn(this.env.JAVA_BIN || process.env.JAVA_BIN || 'java', ['-version'], {
        cwd: this.rootDir,
        env: { ...process.env, ...this.env }, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
      });
      let output = '';
      const append = (chunk) => { output = (output + String(chunk)).slice(-64 * 1024); };
      child.stdout.on('data', append);
      child.stderr.on('data', append);
      child.once('error', () => resolve({ available: false, major: null, raw: '' }));
      child.once('exit', (code) => resolve({ available: code === 0, major: javaMajorFromOutput(output), raw: output.trim() }));
    });
  }

  schedulerBudget() {
    const cpus = Math.max(1, os.availableParallelism ? os.availableParallelism() : os.cpus().length);
    const totalMb = Math.floor(os.totalmem() / (1024 * 1024));
    const reserveMb = Math.max(2048, Math.floor(totalMb * 0.18));
    const usableMb = Math.max(2048, totalMb - reserveMb);
    const gradleCellMb = 3072;
    const byMemory = Math.max(1, Math.floor(usableMb / gradleCellMb));
    return {
      logical_cpus: cpus,
      total_memory_mb: totalMb,
      reserved_memory_mb: reserveMb,
      estimated_gradle_cell_mb: gradleCellMb,
      max_secondary_cells: Math.max(1, Math.min(Math.max(1, cpus - 1), byMemory)),
    };
  }

  latestRelease(runtimeLatest = null) {
    return String(runtimeLatest || this.registry?.latest?.release || '').trim();
  }

  plan(input = {}) {
    const requestedMc = String(input.targetMc || input.target_mc || '').trim();
    const targetLoader = String(input.targetLoader || input.target_loader || '').trim().toLowerCase();
    if (!requestedMc) throw new Error('target Minecraft version is required');
    if (!LOADERS.has(targetLoader)) throw new Error(`unsupported loader: ${targetLoader}`);
    const latestAliases = new Set(['latest', 'latest-release', 'latest_release']);
    const targetMc = latestAliases.has(requestedMc)
      ? this.latestRelease(input.latestVersion || input.latest_version)
      : requestedMc;
    if (!targetMc) throw new Error('latest Minecraft release is unresolved; refresh metadata first');
    const versions = new Map(this.registry.versions.map((row) => [String(row.minecraft), row]));
    const targetProfile = versions.get(targetMc);
    if (!targetProfile) throw new Error(`Minecraft ${targetMc} has no resolved Northpoint profile`);
    const targetLoaderProfile = targetProfile.loaders?.[targetLoader];
    if (!targetLoaderProfile) throw new Error(`${targetLoader} is not resolved for Minecraft ${targetMc}`);

    const matrixMode = String(input.matrix || 'target-only');
    if (!['target-only', 'all'].includes(matrixMode)) throw new Error(`unsupported matrix mode: ${matrixMode}`);
    const requestedVersions = parseCsv(input.versions);
    const requestedLoaders = parseCsv(input.loaders).map((v) => v.toLowerCase());
    const versionList = requestedVersions.length ? requestedVersions : this.registry.versions.map((row) => String(row.minecraft));
    const loaderList = requestedLoaders.length ? requestedLoaders : ['fabric', 'quilt', 'neoforge', 'forge'];
    const excludes = new Set(parseCsv(input.exclude));
    const includeExperimental = input.includeExperimental === true || input.include_experimental === true;
    const cells = [];

    for (const mc of versionList) {
      const profile = versions.get(mc);
      if (!profile) {
        cells.push({ id: `mc-${mc}-*`, minecraft: mc, loader: '*', support_state: 'unsupported', selected: false, reason: 'no version profile' });
        continue;
      }
      for (const loader of loaderList) {
        const id = cellId(mc, loader);
        const lp = profile.loaders?.[loader];
        if (excludes.has(id) || excludes.has(`${mc}-${loader}`)) {
          cells.push({ id, minecraft: mc, loader, support_state: 'blocked', selected: false, reason: 'excluded by current run' });
          continue;
        }
        if (!lp) {
          cells.push({ id, minecraft: mc, loader, support_state: 'unsupported', selected: false, reason: 'loader profile unavailable' });
          continue;
        }
        const state = String(lp.support_state || 'unsupported');
        const selected = matrixMode === 'all' && (state === 'stable' || (includeExperimental && state === 'experimental'));
        cells.push({
          id, minecraft: mc, loader, java: profile.java, mapping_model: profile.mapping_model,
          support_state: state, selected, reason: lp.blocked_reason || null, profile: lp,
        });
      }
    }

    const primaryId = cellId(targetMc, targetLoader);
    let primary = cells.find((row) => row.id === primaryId);
    if (!primary) {
      primary = {
        id: primaryId, minecraft: targetMc, loader: targetLoader, java: targetProfile.java,
        mapping_model: targetProfile.mapping_model, support_state: targetLoaderProfile.support_state,
        selected: true, reason: targetLoaderProfile.blocked_reason || null, profile: targetLoaderProfile,
      };
      cells.unshift(primary);
    }
    primary.primary = true;
    primary.selected = true;
    const secondary = cells
      .filter((row) => row.id !== primaryId && row.selected)
      .sort((a, b) => `${a.minecraft}/${a.loader}`.localeCompare(`${b.minecraft}/${b.loader}`));
    return {
      schema_version: 1,
      profile_sha256: this.profileDigest(),
      registry_snapshot_date: this.registry.snapshot_date || null,
      latest_resolution: {
        requested: requestedMc,
        resolved: targetMc,
        source: latestAliases.has(requestedMc) ? (input.latestVersion || input.latest_version ? 'runtime-override' : (this.latestMetadata?.source || 'registry-snapshot')) : 'explicit',
      },
      matrix_mode: matrixMode,
      primary,
      secondary,
      cells: [primary, ...cells.filter((row) => row.id !== primaryId)],
      fanout_gate: 'primary-passed',
      scheduler: this.schedulerBudget(),
    };
  }

  sessionPath(id) {
    if (!/^[a-f0-9-]{16,64}$/i.test(String(id))) throw new Error('invalid conversion session id');
    return path.join(this.sessionsDir, `${id}.json`);
  }

  readSession(id) {
    const file = this.sessionPath(id);
    if (!fs.existsSync(file)) throw new Error(`conversion session not found: ${id}`);
    return readJson(file);
  }

  writeSession(session) {
    session.updated_at = new Date().toISOString();
    atomicJson(this.sessionPath(session.id), session);
    this.emit('event', { event: 'conversion:stateDelta', payload: this.publicSession(session) });
    return session;
  }

  publicSession(session) {
    return JSON.parse(JSON.stringify(session));
  }

  createSession(input = {}) {
    const plan = this.plan(input);
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const source = input.source && typeof input.source === 'object'
      ? { ...input.source }
      : { kind: String(input.sourceKind || 'unknown'), path: input.sourcePath ? String(input.sourcePath) : null };
    const cellStates = Object.fromEntries(plan.cells.map((cell) => [cell.id, {
      cell_id: cell.id,
      state: cell.support_state === 'blocked' ? 'blocked' : 'pending',
      support_state: cell.support_state,
      primary: cell.id === plan.primary.id,
      selected: cell.id === plan.primary.id || plan.secondary.some((row) => row.id === cell.id),
      reason: cell.reason || null,
      fingerprint: null,
      artifact: null,
      evidence: [],
      attempts: 0,
    }]));
    const session = {
      schema_version: SESSION_SCHEMA,
      id, created_at: now, updated_at: now,
      source,
      plan,
      phase: 'planned',
      fanout_unlocked: false,
      cells: cellStates,
      last_error: null,
    };
    this.writeSession(session);
    return this.publicSession(session);
  }

  listSessions() {
    if (!fs.existsSync(this.sessionsDir)) return [];
    return fs.readdirSync(this.sessionsDir)
      .filter((name) => name.endsWith('.json'))
      .map((name) => {
        try { return readJson(path.join(this.sessionsDir, name)); } catch { return null; }
      })
      .filter(Boolean)
      .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)))
      .map((session) => this.publicSession(session));
  }

  fingerprintCell(input = {}) {
    const required = ['common', 'loader', 'version', 'cell', 'toolchain', 'dependencies', 'config'];
    const normalized = {};
    for (const key of required) normalized[key] = String(input[key] || '');
    normalized.adapters = Array.isArray(input.adapters) ? [...input.adapters].map(String).sort() : [];
    normalized.runtime_contract = String(input.runtime_contract || '');
    return sha256(normalized);
  }

  recordFingerprint(sessionId, cell, inputs = {}) {
    const session = this.readSession(sessionId);
    const record = session.cells?.[cell];
    if (!record) throw new Error(`unknown matrix cell: ${cell}`);
    const fingerprint = this.fingerprintCell(inputs);
    if (record.fingerprint && record.fingerprint !== fingerprint && record.state === 'passed') {
      record.state = 'stale';
      record.reason = 'cell inputs changed';
    }
    record.fingerprint = fingerprint;
    this.writeSession(session);
    return { cell_id: cell, fingerprint, state: record.state };
  }

  assertCanStart(session, cell) {
    const record = session.cells?.[cell];
    if (!record) throw new Error(`unknown matrix cell: ${cell}`);
    if (!record.selected) throw new Error(`matrix cell is not selected: ${cell}`);
    if (!record.primary && !session.fanout_unlocked) {
      throw new Error('secondary matrix cells are locked until the primary target passes');
    }
    if (record.support_state === 'blocked' || record.support_state === 'unsupported') {
      throw new Error(record.reason || `matrix cell cannot be built: ${cell}`);
    }
    return record;
  }

  startCell(sessionId, cell) {
    const session = this.readSession(sessionId);
    const record = this.assertCanStart(session, cell);
    if (!['pending', 'failed', 'stale', 'cancelled', 'runtime-unverified'].includes(record.state)) {
      throw new Error(`matrix cell cannot start from state ${record.state}`);
    }
    record.state = 'building';
    record.reason = null;
    record.attempts = Number(record.attempts || 0) + 1;
    session.phase = record.primary ? 'building-primary' : 'building-matrix';
    this.writeSession(session);
    return this.publicSession(session);
  }

  finishCell(sessionId, cell, result = {}) {
    const session = this.readSession(sessionId);
    const record = session.cells?.[cell];
    if (!record) throw new Error(`unknown matrix cell: ${cell}`);
    const state = String(result.state || 'failed');
    if (!CELL_STATES.has(state)) throw new Error(`invalid conversion cell state: ${state}`);
    if (!['building', 'built', 'testing'].includes(record.state) && state !== 'cancelled') {
      throw new Error(`matrix cell cannot finish from state ${record.state}`);
    }
    record.state = state;
    record.reason = result.reason ? String(result.reason) : null;
    record.artifact = result.artifact || record.artifact || null;
    record.evidence = Array.isArray(result.evidence) ? result.evidence : record.evidence;
    if (record.primary && state === 'passed') {
      session.fanout_unlocked = true;
      session.phase = session.plan.secondary.length ? 'primary-passed' : 'complete';
    } else if (record.primary && state !== 'passed') {
      session.fanout_unlocked = false;
      session.phase = state === 'runtime-unverified' ? 'primary-runtime-unverified' : 'primary-failed';
    }
    this.writeSession(session);
    return this.publicSession(session);
  }

  async capabilities(input = {}) {
    const java = await this.detectJava();
    const toolkit = this.toolkitRoot();
    const workerBridge = toolkit ? new NorthpointJobBridge({
      toolkitRoot: toolkit,
      dataDir: this.dataDir,
      rootDir: this.rootDir,
      resourcesDir: process.resourcesPath,
      pythonBin: this.env.PYTHON_BIN || process.env.PYTHON_BIN || null,
    }) : null;
    const worker = workerBridge ? workerBridge.capabilities() : {
      available: false,
      python: null,
      production_driver: false,
    };
    const latest = this.latestRelease(input.latestVersion || input.latest_version);
    const latestProfile = this.registry.versions.find((row) => String(row.minecraft) === latest) || null;
    return {
      schema_version: 1,
      service: 'northpoint',
      profile_sha256: this.profileDigest(),
      registry_snapshot_date: this.registry.snapshot_date || null,
      latest_release: latest || null,
      latest_profile_resolved: !!latestProfile,
      metadata: this.latestMetadata,
      java,
      toolkit: {
        available: !!toolkit,
        root: toolkit,
        simple_mod_selftest: !!toolkit && fs.existsSync(path.join(toolkit, 'scripts', 'northpoint_graduation.py')),
        fast_graduation: !!toolkit && fs.existsSync(path.join(toolkit, 'scripts', 'northpoint_graduation.py')),
        production_driver: worker.production_driver,
        python: worker.python,
      },
      scheduler: this.schedulerBudget(),
      execution_available: worker.available,
      no_fake_execution: true,
    };
  }

  async runWorkerScript(scriptName, args = [], { timeoutMs = 180000 } = {}) {
    const toolkit = this.toolkitRoot();
    if (!toolkit) throw new Error('Minecraft Dev Kit worker is not installed/configured; execution is unavailable');
    const workerBridge = new NorthpointJobBridge({
      toolkitRoot: toolkit,
      dataDir: this.dataDir,
      rootDir: this.rootDir,
      resourcesDir: process.resourcesPath,
      pythonBin: this.env.PYTHON_BIN || process.env.PYTHON_BIN || null,
    });
    const python = workerBridge.pythonCommand();
    if (!python) throw new Error('Python 3 runtime is unavailable; install or bundle Python before running conversions');
    const script = path.join(toolkit, 'scripts', scriptName);
    const resolved = safeRealpath(script);
    const scriptsRoot = safeRealpath(path.join(toolkit, 'scripts'));
    if (!resolved || !scriptsRoot || (resolved !== scriptsRoot && !resolved.startsWith(scriptsRoot + path.sep))) {
      throw new Error(`Dev Kit worker script is unavailable: ${scriptName}`);
    }
    if (!/^[a-zA-Z0-9_.-]+\.py$/.test(scriptName)) throw new Error('invalid Dev Kit worker script name');
    return await new Promise((resolve, reject) => {
      const child = spawn(python.bin, [...python.args, resolved, ...args.map(String)], {
        cwd: toolkit, env: { ...process.env, ...this.env }, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
      });
      let stdout = '';
      let stderr = '';
      const append = (current, chunk) => (current + String(chunk)).slice(-4 * 1024 * 1024);
      child.stdout.on('data', (chunk) => { stdout = append(stdout, chunk); });
      child.stderr.on('data', (chunk) => { stderr = append(stderr, chunk); });
      let settled = false;
      const finish = (error, value) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (error) reject(error); else resolve(value);
      };
      const timer = setTimeout(() => {
        try { child.kill(); } catch {}
        finish(new Error(`Dev Kit worker timed out: ${scriptName}`));
      }, Math.max(1000, Number(timeoutMs) || 180000));
      timer.unref?.();
      child.once('error', (error) => finish(error));
      child.once('exit', (code, signal) => {
        if (code !== 0) {
          finish(new Error(stderr.trim() || stdout.trim() || `Dev Kit worker failed (${code ?? signal ?? 'unknown'})`));
          return;
        }
        finish(null, { code, stdout, stderr });
      });
    });
  }

  async inspectSource(input = {}) {
    const raw = String(input.sourceRoot || input.source_root || input.path || '').trim();
    if (!raw) throw new Error('Conversion source folder is required');
    const source = safeRealpath(path.resolve(raw));
    if (!source || !fs.statSync(source).isDirectory()) {
      throw new Error('Conversion source folder is unavailable');
    }
    const result = await this.runWorkerScript('northpoint_source_intake.py', ['--project', source], { timeoutMs: 45000 });
    const lines = result.stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    let value = null;
    for (let index = lines.length - 1; index >= 0; index -= 1) {
      try {
        value = JSON.parse(lines[index]);
        break;
      } catch {}
    }
    if (!value || typeof value !== 'object') throw new Error('Source intake returned no JSON result');
    if (value.error) throw new Error(String(value.error));
    return value;
  }

  async provisionJava(cells) {
    if (!this.nativeRequest) return cells.map((cell) => ({ ...cell }));
    const byMajor = new Map();
    for (const cell of cells) {
      const major = Number(cell.java || 0);
      if (!major || byMajor.has(major)) continue;
      this.emit('event', {
        event: 'conversion:toolchain',
        payload: { state: 'provisioning', java: major },
      });
      const info = await this.nativeRequest(
        'install_java_jdk',
        { major },
        { timeoutMs: 15 * 60 * 1000 },
      );
      if (!info?.path || Number(info.major) !== major) {
        throw new Error(`Managed JDK ${major} was not provisioned correctly`);
      }
      byMajor.set(major, String(info.path));
      this.emit('event', {
        event: 'conversion:toolchain',
        payload: { state: 'ready', java: major, path: String(info.path) },
      });
    }
    return cells.map((cell) => ({
      ...cell,
      java_path: byMajor.get(Number(cell.java || 0)) || cell.java_path || null,
    }));
  }

  async reserveQaPort() {
    return await new Promise((resolve, reject) => {
      const server = net.createServer();
      server.unref();
      server.once('error', reject);
      server.listen({ host: '127.0.0.1', port: 0 }, () => {
        const address = server.address();
        const port = typeof address === 'object' && address ? Number(address.port) : 0;
        server.close((error) => {
          if (error) reject(error);
          else if (!port) reject(new Error('Could not reserve a QA server port'));
          else resolve(port);
        });
      });
    });
  }

  async waitForNativeServer(serverId, runningId, { timeoutMs = 180000, stabilizeMs = 3000 } = {}) {
    if (!this.nativeEvents || !this.nativeRequest) {
      throw new Error('Native Minecraft server verifier is unavailable');
    }
    const fatal = /(MixinApplyError|MixinTransformerError|ModResolutionException|ModLoadingException|LoadingFailedException|NoClassDefFoundError|VerifyError|IllegalAccessError|NoSuchMethodError|NoSuchFieldError|IncompatibleClassChangeError|Failed to start the minecraft server|Encountered an unexpected exception|Errors were found during mod loading|Could not execute entrypoint)/i;
    const contextualClassNotFound = /(\[ERROR\]|\[FATAL\]|Exception in thread|Caused by:).*ClassNotFoundException/i;
    const ready = /Done \([^)]+\)!?(?: For help, type ["']?help["']?)?/i;
    const lines = [];
    return await new Promise((resolve, reject) => {
      let settled = false;
      let readyMarker = null;
      let timeoutTimer = null;
      let stabilizeTimer = null;
      const finish = (error, value) => {
        if (settled) return;
        settled = true;
        if (timeoutTimer) clearTimeout(timeoutTimer);
        if (stabilizeTimer) clearTimeout(stabilizeTimer);
        this.nativeEvents.off('event', onEvent);
        if (error) reject(error);
        else resolve(value);
      };
      const inspect = (line) => {
        const text = String(line || '');
        if (!text) return;
        lines.push(text);
        if (lines.length > 500) lines.splice(0, lines.length - 500);
        if (fatal.test(text) || contextualClassNotFound.test(text)) {
          finish(new Error(`Native Minecraft server failed: ${text.slice(-800)}`));
          return;
        }
        if (!readyMarker && ready.test(text)) {
          readyMarker = text.slice(-800);
          stabilizeTimer = setTimeout(() => {
            finish(null, { ready_marker: readyMarker, logs_tail: lines.slice(-200) });
          }, Math.max(500, Number(stabilizeMs) || 3000));
          stabilizeTimer.unref?.();
        }
      };
      const onEvent = (message) => {
        const event = String(message?.event || '');
        const payload = message?.payload || {};
        if (String(payload.server_id || '') !== String(serverId)) return;
        if (event === 'server:log') {
          for (const line of Array.isArray(payload.lines) ? payload.lines : []) inspect(line);
          return;
        }
        if (
          event === 'server:state' &&
          String(payload.running_id || '') === String(runningId) &&
          !['running', 'stopping'].includes(String(payload.state || ''))
        ) {
          finish(new Error(`Minecraft server exited before runtime proof: ${payload.state || 'unknown'} (${payload.exit_code ?? '?'})`));
        }
      };
      this.nativeEvents.on('event', onEvent);
      timeoutTimer = setTimeout(() => {
        finish(new Error(`Native Minecraft server readiness timed out after ${Math.round(timeoutMs / 1000)}s`));
      }, Math.max(10000, Number(timeoutMs) || 180000));
      timeoutTimer.unref?.();
      Promise.resolve(
        this.nativeRequest('get_server_console', { serverId }, { timeoutMs: 15000 }),
      ).then((existing) => {
        for (const row of Array.isArray(existing) ? existing : []) inspect(row?.line);
      }).catch(() => {});
    });
  }

  async stopNativeQaServer(serverId, runningId) {
    if (!serverId || !this.nativeRequest) return false;
    let exited = false;
    let listener = null;
    const wait = this.nativeEvents ? new Promise((resolve) => {
      let timer = null;
      const finish = () => {
        if (timer) clearTimeout(timer);
        resolve();
      };
      listener = (message) => {
        if (message?.event !== 'server:state') return;
        if (String(message?.payload?.server_id || '') !== String(serverId)) return;
        if (runningId && String(message?.payload?.running_id || '') !== String(runningId)) return;
        if (['running', 'stopping'].includes(String(message?.payload?.state || ''))) return;
        exited = true;
        finish();
      };
      this.nativeEvents.on('event', listener);
      timer = setTimeout(finish, 15000);
      timer.unref?.();
    }) : Promise.resolve();
    try {
      await this.nativeRequest('stop_server', { serverId }, { timeoutMs: 30000 });
    } catch {
      try {
        await this.nativeRequest('force_stop_server', { serverId }, { timeoutMs: 15000 });
      } catch {}
    }
    await wait;
    if (listener) this.nativeEvents.off('event', listener);
    if (!exited) {
      try {
        await this.nativeRequest('force_stop_server', { serverId }, { timeoutMs: 15000 });
      } catch {}
    }
    return exited;
  }

  async waitForNativeClient(runningId, { timeoutMs = 120000, stabilizeMs = 8000 } = {}) {
    if (!this.nativeEvents || !this.nativeRequest) {
      throw new Error('Native Minecraft runtime verifier is unavailable');
    }
    const fatal = /(MixinApplyError|MixinTransformerError|ModResolutionException|ModLoadingException|LoadingFailedException|NoClassDefFoundError|VerifyError|IllegalAccessError|NoSuchMethodError|NoSuchFieldError|IncompatibleClassChangeError|Could not execute entrypoint|Failed to start Minecraft|Errors were found during mod loading|A mod crashed on startup)/i;
    const contextualClassNotFound = /(\[ERROR\]|\[FATAL\]|Exception in thread|Caused by:).*ClassNotFoundException/i;
    const ready = /(OpenAL initialized|Reloading ResourceManager|Created:\s*\d+x\d+x\d+.*atlas)/i;
    const lines = [];
    return await new Promise((resolve, reject) => {
      let settled = false;
      let readyMarker = null;
      let timeoutTimer = null;
      let stabilizeTimer = null;
      const finish = (error, value) => {
        if (settled) return;
        settled = true;
        if (timeoutTimer) clearTimeout(timeoutTimer);
        if (stabilizeTimer) clearTimeout(stabilizeTimer);
        this.nativeEvents.off('event', onEvent);
        if (error) reject(error);
        else resolve(value);
      };
      const inspect = (line) => {
        const text = String(line || '');
        if (!text) return;
        lines.push(text);
        if (lines.length > 500) lines.splice(0, lines.length - 500);
        if (fatal.test(text) || contextualClassNotFound.test(text)) {
          finish(new Error(`Native Minecraft startup failed: ${text.slice(-800)}`));
          return;
        }
        if (!readyMarker && ready.test(text)) {
          readyMarker = text.slice(-800);
          stabilizeTimer = setTimeout(() => {
            finish(null, { ready_marker: readyMarker, logs_tail: lines.slice(-200) });
          }, Math.max(1000, Number(stabilizeMs) || 8000));
          stabilizeTimer.unref?.();
        }
      };
      const onEvent = (message) => {
        const event = String(message?.event || '');
        const payload = message?.payload || {};
        if (String(payload.running_id || '') !== String(runningId)) return;
        if (event === 'process:log') {
          for (const line of Array.isArray(payload.lines) ? payload.lines : []) inspect(line);
          return;
        }
        if (event === 'process:state' && payload.state !== 'running') {
          finish(new Error(`Minecraft exited before runtime proof: ${payload.state || 'unknown'} (${payload.exit_code ?? '?'})`));
        }
      };
      this.nativeEvents.on('event', onEvent);
      timeoutTimer = setTimeout(() => {
        finish(new Error(`Native Minecraft readiness timed out after ${Math.round(timeoutMs / 1000)}s`));
      }, Math.max(10000, Number(timeoutMs) || 120000));
      timeoutTimer.unref?.();
      Promise.resolve(
        this.nativeRequest('get_logs', { runningId }, { timeoutMs: 15000 }),
      ).then((existing) => {
        for (const row of Array.isArray(existing) ? existing : []) inspect(row?.line);
      }).catch(() => {});
    });
  }

  async stopNativeQaRun(runningId) {
    if (!runningId || !this.nativeRequest) return false;
    let exited = false;
    let listener = null;
    const wait = this.nativeEvents ? new Promise((resolve) => {
      let timer = null;
      const finish = () => {
        if (timer) clearTimeout(timer);
        resolve();
      };
      listener = (message) => {
        if (message?.event !== 'process:state') return;
        if (String(message?.payload?.running_id || '') !== String(runningId)) return;
        if (message?.payload?.state === 'running') return;
        exited = true;
        finish();
      };
      this.nativeEvents.on('event', listener);
      timer = setTimeout(finish, 12000);
      timer.unref?.();
    }) : Promise.resolve();
    try {
      await this.nativeRequest('kill_instance', { runningId }, { timeoutMs: 15000 });
    } catch {}
    await wait;
    if (listener) this.nativeEvents.off('event', listener);
    try {
      await this.nativeRequest('close_running', { runningId }, { timeoutMs: 15000 });
    } catch {}
    return exited;
  }

  runtimeCandidate(row, result) {
    const artifact = row?.artifact || {};
    const artifactFile = String(artifact.file || '');
    const artifactSha = String(artifact.sha256 || '').toLowerCase();
    if (!artifactFile || !/^[a-f0-9]{64}$/.test(artifactSha)) {
      throw new Error('Runtime candidate artifact identity is incomplete');
    }
    const releaseDir = path.join(result.state_dir, 'release');
    const releaseRoot = safeRealpath(releaseDir);
    const candidate = safeRealpath(path.join(releaseDir, artifactFile));
    if (!candidate || !releaseRoot || !(candidate === releaseRoot || candidate.startsWith(releaseRoot + path.sep))) {
      throw new Error('Runtime candidate artifact is outside the release directory');
    }
    if (!fs.statSync(candidate).isFile()) throw new Error('Runtime candidate artifact is missing');
    return { artifactFile, artifactSha, candidate, releaseDir };
  }

  async verifyNativeClient({ session, cell, row, result }) {
    if (!this.nativeRequest || !this.nativeEvents) {
      throw new Error('Native Minecraft runtime verifier is unavailable');
    }
    const loaderVersion = String(cell?.profile?.loader_version || '').trim();
    if (!loaderVersion) {
      throw new Error(`Loader version is unresolved for ${cell.minecraft} ${cell.loader}`);
    }
    const { artifactFile, artifactSha, candidate } = this.runtimeCandidate(row, result);

    const evidenceDir = path.join(this.dataDir, 'jobs', session.id, 'runtime');
    fs.mkdirSync(evidenceDir, { recursive: true });
    const qaName = `Enderloom QA ${String(cell.minecraft)} ${String(cell.loader)} ${session.id.slice(0, 8)}`;
    let instance = null;
    let runningId = null;
    const startedAt = new Date().toISOString();
    try {
      this.emit('event', {
        event: 'conversion:runtime',
        payload: { cell_id: cell.id, state: 'installing', minecraft: cell.minecraft, loader: cell.loader },
      });
      instance = await this.nativeRequest('create_instance', {
        name: qaName,
        versionId: String(cell.minecraft),
        loader: String(cell.loader),
        loaderVersion,
      }, { timeoutMs: 30000 });
      if (!instance?.id) throw new Error('Native QA instance creation returned no instance id');

      await this.nativeRequest(
        'install_instance',
        { instanceId: instance.id },
        { timeoutMs: 15 * 60 * 1000 },
      );
      await this.nativeRequest('add_instance_content', {
        instanceId: instance.id,
        kind: 'mods',
        sources: [candidate],
      }, { timeoutMs: 60000 });

      this.emit('event', {
        event: 'conversion:runtime',
        payload: { cell_id: cell.id, state: 'launching', instance_id: instance.id },
      });
      runningId = await this.nativeRequest(
        'launch_instance_qa',
        { instanceId: instance.id },
        { timeoutMs: 120000 },
      );
      if (!runningId) throw new Error('Native QA launch returned no running id');

      const proof = await this.waitForNativeClient(runningId, {
        timeoutMs: Math.max(
          10000,
          Number(this.env.ENDERLOOM_NORTHPOINT_RUNTIME_TIMEOUT_MS) || 180000,
        ),
        stabilizeMs: Math.max(
          100,
          Number(this.env.ENDERLOOM_NORTHPOINT_RUNTIME_STABILIZE_MS) || 10000,
        ),
      });
      const receipt = {
        schema_version: 1,
        cell_id: cell.id,
        minecraft: String(cell.minecraft),
        loader: String(cell.loader),
        loader_version: loaderVersion,
        artifact_sha256: artifactSha,
        artifact_file: artifactFile,
        instance_id: instance.id,
        running_id: runningId,
        started_at: startedAt,
        verified_at: new Date().toISOString(),
        gate: 'native-client-load',
        ready_marker: proof.ready_marker,
        logs_tail: proof.logs_tail,
      };
      const receiptPath = path.join(evidenceDir, `${cell.id}.client.json`);
      atomicJson(receiptPath, receipt);
      this.emit('event', {
        event: 'conversion:runtime',
        payload: {
          cell_id: cell.id,
          state: 'client-passed',
          artifact_sha256: artifactSha,
          minecraft: cell.minecraft,
          loader: cell.loader,
        },
      });
      return { ...receipt, evidence_path: receiptPath };
    } finally {
      if (runningId) await this.stopNativeQaRun(runningId);
      if (instance?.id) {
        try {
          await this.nativeRequest('delete_instance', { instanceId: instance.id }, { timeoutMs: 60000 });
        } catch {}
      }
    }
  }

  async executeJob(input = {}) {
    const sessionId = String(input.sessionId || input.session_id || '');
    const session = this.readSession(sessionId);
    const toolkit = this.toolkitRoot();
    if (!toolkit) throw new Error('Minecraft Dev Kit worker is not installed/configured; execution is unavailable');
    const sourceRoot = String(
      session.source?.project_root || session.source?.path || '',
    ).trim();
    if (!sourceRoot) throw new Error('Conversion session has no source project root');
    const selected = session.plan.cells.filter((cell) => session.cells?.[cell.id]?.selected === true);
    if (!selected.some((cell) => cell.id === session.plan.primary.id)) {
      throw new Error('Primary conversion cell is not selected');
    }

    const syncResult = (result) => {
      for (const row of result.matrix?.cells || []) {
        const record = session.cells?.[row.cell_id];
        if (!record) continue;
        record.state = String(row.state || record.state);
        record.fingerprint = row.fingerprint || record.fingerprint;
        record.reason = row.reason || null;
        if (row.artifact?.file) {
          record.artifact = {
            ...row.artifact,
            file: path.join(result.state_dir, 'release', String(row.artifact.file)),
          };
        }
        record.evidence = [
          ...(Array.isArray(record.evidence) ? record.evidence : []),
          { kind: 'northpoint-job-runner', state_dir: result.state_dir },
        ];
      }
      const primary = session.cells?.[session.plan.primary.id];
      session.fanout_unlocked = primary?.state === 'passed';
    };

    session.phase = 'provisioning-toolchains';
    session.last_error = null;
    this.writeSession(session);
    try {
      const provisioned = await this.provisionJava(selected);
      const bridge = new NorthpointJobBridge({
        toolkitRoot: toolkit,
        dataDir: this.dataDir,
        rootDir: this.rootDir,
        resourcesDir: process.resourcesPath,
        pythonBin: this.env.PYTHON_BIN || process.env.PYTHON_BIN || null,
      });
      const runArgs = {
        sessionId,
        sourceRoot,
        primaryCell: session.plan.primary.id,
        cells: provisioned,
        config: {},
        driverProfile: 'production',
        maxWorkers: Math.max(0, Math.min(8, Number(input.maxWorkers || input.max_workers) || 0)),
        timeout: Math.max(30, Math.min(3600, Number(input.timeout) || 180)),
      };

      session.phase = 'job-running';
      this.writeSession(session);
      let result = await bridge.runSession(runArgs);
      syncResult(result);
      this.writeSession(session);

      const selectedIds = new Set(selected.map((cell) => String(cell.id)));
      const runtimeErrors = [];
      const runtimeReceipts = [];
      const maxPromotionPasses = Math.max(1, selected.length + 1);
      for (let pass = 0; pass < maxPromotionPasses; pass += 1) {
        const candidates = (result.matrix?.cells || []).filter(
          (row) =>
            selectedIds.has(String(row.cell_id)) &&
            String(row.state) === 'runtime-unverified' &&
            row.artifact?.file &&
            row.artifact?.sha256,
        );
        if (!candidates.length || !this.nativeRequest || !this.nativeEvents) break;

        session.phase = 'runtime-verifying';
        this.writeSession(session);
        let proofsAdded = 0;
        for (const row of candidates) {
          const cell = session.plan.cells.find((entry) => String(entry.id) === String(row.cell_id));
          if (!cell) continue;
          try {
            const receipt = await this.verifyNativeClient({ session, cell, row, result, bridge });
            runtimeReceipts.push(receipt);
            proofsAdded += 1;
            const record = session.cells?.[row.cell_id];
            if (record) {
              record.evidence = [
                ...(Array.isArray(record.evidence) ? record.evidence : []),
                {
                  kind: 'native-client-load',
                  artifact_sha256: row.artifact.sha256,
                  verified_at: receipt.verified_at,
                },
              ];
              delete record.runtime_error;
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            runtimeErrors.push({ cell_id: row.cell_id, error: message });
            const record = session.cells?.[row.cell_id];
            if (record) {
              record.runtime_error = message;
              record.evidence = [
                ...(Array.isArray(record.evidence) ? record.evidence : []),
                { kind: 'native-client-load', state: 'failed', error: message },
              ];
            }
            this.emit('event', {
              event: 'conversion:runtime',
              payload: { cell_id: row.cell_id, state: 'failed', error: message },
            });
          }
        }
        this.writeSession(session);
        if (!proofsAdded) break;

        session.phase = 'job-running';
        this.writeSession(session);
        result = await bridge.runSession(runArgs);
        syncResult(result);
        this.writeSession(session);
      }

      const primary = session.cells?.[session.plan.primary.id];
      session.fanout_unlocked = primary?.state === 'passed';
      session.phase = result.ok ? 'complete' : session.fanout_unlocked ? 'partial' : 'primary-failed';
      session.last_error = result.ok
        ? null
        : runtimeErrors[0]?.error || result.receipt?.status || 'conversion job failed';
      this.writeSession(session);
      return {
        session: this.publicSession(session),
        job: result,
        runtime: {
          attempted: runtimeReceipts.length + runtimeErrors.length,
          passed: runtimeReceipts,
          failed: runtimeErrors,
        },
      };
    } catch (error) {
      session.phase = 'job-failed';
      session.fanout_unlocked = false;
      session.last_error = error instanceof Error ? error.message : String(error);
      this.writeSession(session);
      throw error;
    }
  }

  async selfTest() {
    const result = await this.runWorkerScript('northpoint_graduation.py', []);
    const marker = 'Northpoint fast graduation: PASS';
    if (!result.stdout.includes(marker)) throw new Error('Dev Kit fast graduation exited without its PASS marker');
    return { ok: true, marker, stdout_tail: result.stdout.split(/\r?\n/).slice(-40).join('\n') };
  }

  async request(command, args = {}) {
    switch (String(command)) {
      case 'conversion_capabilities': return await this.capabilities(args);
      case 'conversion_refresh_profiles': return await this.refreshLatestProfile({ force: args.force === true });
      case 'conversion_resolve_version': return await this.refreshVersionProfile(args.minecraft || args.version, { force: args.force === true });
      case 'conversion_inspect_source': return await this.inspectSource(args);
      case 'conversion_plan': return await this.preparePlan(args);
      case 'conversion_create_session': await this.preparePlan(args); return this.createSession(args);
      case 'conversion_get_session': return this.publicSession(this.readSession(args.sessionId || args.session_id));
      case 'conversion_list_sessions': return this.listSessions();
      case 'conversion_record_fingerprint': return this.recordFingerprint(args.sessionId || args.session_id, args.cellId || args.cell_id, args.inputs || {});
      case 'conversion_start_cell': return this.startCell(args.sessionId || args.session_id, args.cellId || args.cell_id);
      case 'conversion_finish_cell': return this.finishCell(args.sessionId || args.session_id, args.cellId || args.cell_id, args.result || {});
      case 'conversion_execute_job': return await this.executeJob(args);
      case 'conversion_self_test': return await this.selfTest();
      default: throw new Error(`Unknown Northpoint command: ${command}`);
    }
  }

  async close() {}
}

module.exports = {
  NorthpointService,
  DEFAULT_PROFILES,
  CELL_STATES,
  SESSION_SCHEMA,
  javaMajorFromOutput,
  sha256,
};