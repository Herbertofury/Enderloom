'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { spawn } = require('child_process');
const { EventEmitter } = require('events');

const SESSION_SCHEMA = 1;
const PROFILE_SCHEMA = 1;
const CELL_STATES = new Set([
  'pending', 'blocked', 'building', 'built', 'testing', 'passed',
  'runtime-unverified', 'failed', 'cancelled', 'stale',
]);
const LOADERS = new Set(['fabric', 'quilt', 'neoforge', 'forge']);
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
  constructor({ rootDir, dataDir, toolkitRoot = null, env = {}, registryPath = null } = {}) {
    super();
    this.rootDir = path.resolve(rootDir || process.cwd());
    this.dataDir = path.resolve(dataDir || path.join(this.rootDir, '.enderloom', 'northpoint'));
    this.env = { ...env };
    this.explicitToolkitRoot = toolkitRoot ? path.resolve(toolkitRoot) : null;
    this.registryPath = registryPath ? path.resolve(registryPath) : null;
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

  snapshot() {
    const toolkit = this.toolkitRoot();
    return {
      state: 'ready',
      latest_release: this.latestRelease() || null,
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
      const script = path.join(candidate, 'scripts', 'northpoint_simple_mod_selftest.py');
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
        source: latestAliases.has(requestedMc) ? (input.latestVersion || input.latest_version ? 'runtime-override' : 'registry-snapshot') : 'explicit',
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
    const latest = this.latestRelease(input.latestVersion || input.latest_version);
    const latestProfile = this.registry.versions.find((row) => String(row.minecraft) === latest) || null;
    return {
      schema_version: 1,
      service: 'northpoint',
      profile_sha256: this.profileDigest(),
      registry_snapshot_date: this.registry.snapshot_date || null,
      latest_release: latest || null,
      latest_profile_resolved: !!latestProfile,
      java,
      toolkit: {
        available: !!toolkit,
        root: toolkit,
        simple_mod_selftest: !!toolkit && fs.existsSync(path.join(toolkit, 'scripts', 'northpoint_simple_mod_selftest.py')),
      },
      scheduler: this.schedulerBudget(),
      execution_available: !!toolkit,
      no_fake_execution: true,
    };
  }

  async runWorkerScript(scriptName, args = [], { timeoutMs = 180000 } = {}) {
    const toolkit = this.toolkitRoot();
    if (!toolkit) throw new Error('Minecraft Dev Kit worker is not installed/configured; execution is unavailable');
    const script = path.join(toolkit, 'scripts', scriptName);
    const resolved = safeRealpath(script);
    const scriptsRoot = safeRealpath(path.join(toolkit, 'scripts'));
    if (!resolved || !scriptsRoot || (resolved !== scriptsRoot && !resolved.startsWith(scriptsRoot + path.sep))) {
      throw new Error(`Dev Kit worker script is unavailable: ${scriptName}`);
    }
    if (!/^[a-zA-Z0-9_.-]+\.py$/.test(scriptName)) throw new Error('invalid Dev Kit worker script name');
    return await new Promise((resolve, reject) => {
      const child = spawn(this.env.PYTHON_BIN || process.env.PYTHON_BIN || 'python3', [resolved, ...args.map(String)], {
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

  async selfTest() {
    const result = await this.runWorkerScript('northpoint_simple_mod_selftest.py', []);
    const marker = 'Northpoint simple mod matrix self-test: PASS';
    if (!result.stdout.includes(marker)) throw new Error('Dev Kit simple-mod worker exited without its PASS marker');
    return { ok: true, marker, stdout_tail: result.stdout.split(/\r?\n/).slice(-40).join('\n') };
  }

  async request(command, args = {}) {
    switch (String(command)) {
      case 'conversion_capabilities': return await this.capabilities(args);
      case 'conversion_plan': return this.plan(args);
      case 'conversion_create_session': return this.createSession(args);
      case 'conversion_get_session': return this.publicSession(this.readSession(args.sessionId || args.session_id));
      case 'conversion_list_sessions': return this.listSessions();
      case 'conversion_record_fingerprint': return this.recordFingerprint(args.sessionId || args.session_id, args.cellId || args.cell_id, args.inputs || {});
      case 'conversion_start_cell': return this.startCell(args.sessionId || args.session_id, args.cellId || args.cell_id);
      case 'conversion_finish_cell': return this.finishCell(args.sessionId || args.session_id, args.cellId || args.cell_id, args.result || {});
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