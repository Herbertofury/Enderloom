'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');

const DRIVER_PROFILES = Object.freeze({
  production: 'northpoint_production_driver.py',
  fixture: 'northpoint_fixture_driver.py',
});

function atomicJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.${crypto.randomBytes(4).toString('hex')}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  fs.renameSync(tmp, file);
}

function safeRealpath(file) {
  try { return fs.realpathSync.native(file); } catch { return null; }
}

function inside(root, child) {
  return child === root || child.startsWith(root + path.sep);
}

class NorthpointJobBridge {
  constructor({ toolkitRoot, dataDir, pythonBin = process.env.PYTHON_BIN || 'python3' } = {}) {
    this.toolkitRoot = safeRealpath(path.resolve(String(toolkitRoot || '')));
    this.dataDir = path.resolve(String(dataDir || '.'));
    this.pythonBin = pythonBin;
  }

  script(name) {
    if (!this.toolkitRoot) throw new Error('Northpoint toolkit is unavailable');
    if (!/^[A-Za-z0-9_.-]+\.py$/.test(String(name || ''))) throw new Error('Invalid Northpoint script name');
    const scriptsRoot = safeRealpath(path.join(this.toolkitRoot, 'scripts'));
    const target = safeRealpath(path.join(this.toolkitRoot, 'scripts', String(name)));
    if (!scriptsRoot || !target || !inside(scriptsRoot, target)) throw new Error(`Northpoint script unavailable: ${name}`);
    return target;
  }

  async runSession({ sessionId, sourceRoot, primaryCell, cells, config = {}, driverProfile = 'production', allowQaDriver = false, maxWorkers = 0, timeout = 180 } = {}) {
    if (!/^[A-Za-z0-9._-]{8,96}$/.test(String(sessionId || ''))) throw new Error('Invalid conversion session id');
    const project = safeRealpath(path.resolve(String(sourceRoot || '')));
    if (!project || !fs.statSync(project).isDirectory()) throw new Error('Conversion source root is unavailable');
    if (!Array.isArray(cells) || !cells.length) throw new Error('Conversion job has no selected cells');
    const normalized = cells.map((cell) => ({
      id: String(cell.id), minecraft: String(cell.minecraft), loader: String(cell.loader),
      java: Number(cell.java || 0), support_state: String(cell.support_state || 'stable'),
      primary: String(cell.id) === String(primaryCell),
    }));
    if (!normalized.some((cell) => cell.primary)) throw new Error('Primary conversion cell is not selected');

    const jobRoot = path.join(this.dataDir, 'jobs', String(sessionId));
    const stateDir = path.join(jobRoot, 'state');
    fs.mkdirSync(jobRoot, { recursive: true });
    const manifestPath = path.join(jobRoot, 'manifest.json');
    atomicJson(manifestPath, {
      schema_version: 1,
      project_root: project,
      primary_cell: String(primaryCell),
      cells: normalized,
      config: { ...config, zero_loss: true, session_id: String(sessionId) },
    });

    const profile = String(driverProfile || 'production');
    if (!Object.prototype.hasOwnProperty.call(DRIVER_PROFILES, profile)) {
      throw new Error(`Unknown Northpoint driver profile: ${profile}`);
    }
    if (profile !== 'production' && allowQaDriver !== true) {
      throw new Error('QA conversion drivers are disabled outside explicit test mode');
    }
    const runner = this.script('northpoint_job_runner.py');
    const driver = this.script(DRIVER_PROFILES[profile]);
    const args = [runner, '--manifest', manifestPath, '--driver', driver, '--state-dir', stateDir,
      '--max-workers', String(Math.max(0, Number(maxWorkers) || 0)), '--timeout', String(Math.max(10, Number(timeout) || 180))];
    const result = await new Promise((resolve, reject) => {
      const child = spawn(this.pythonBin, args, {
        cwd: this.toolkitRoot, windowsHide: true, env: process.env, stdio: ['ignore', 'pipe', 'pipe'],
      });
      let stdout = '', stderr = '';
      const append = (cur, chunk) => (cur + String(chunk)).slice(-4 * 1024 * 1024);
      child.stdout.on('data', (chunk) => { stdout = append(stdout, chunk); });
      child.stderr.on('data', (chunk) => { stderr = append(stderr, chunk); });
      child.once('error', reject);
      child.once('exit', (code, signal) => resolve({ code, signal, stdout, stderr }));
    });
    const lines = result.stdout.split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
    let receipt = null;
    for (let i = lines.length - 1; i >= 0; i--) {
      try { receipt = JSON.parse(lines[i]); break; } catch {}
    }
    if (!receipt) throw new Error(result.stderr.trim() || 'Northpoint runner returned no JSON receipt');
    const releaseDir = path.join(stateDir, 'release');
    const matrixPath = path.join(releaseDir, 'release-matrix.json');
    const matrix = fs.existsSync(matrixPath) ? JSON.parse(fs.readFileSync(matrixPath, 'utf8')) : null;
    return {
      ok: result.code === 0 && receipt.status === 'PASS',
      partial: receipt.status === 'PARTIAL',
      driver_profile: profile,
      exit_code: result.code,
      receipt,
      matrix,
      state_dir: stateDir,
      stdout_tail: lines.slice(-30).join('\n'),
      stderr_tail: result.stderr.split(/\r?\n/).slice(-30).join('\n'),
    };
  }
}

module.exports = { NorthpointJobBridge, DRIVER_PROFILES };