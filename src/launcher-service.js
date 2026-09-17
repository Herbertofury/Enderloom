'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const net = require('net');
const { EventEmitter } = require('events');
const { spawn } = require('child_process');
const { randomUUID } = require('crypto');

const PROTOCOL_VERSION = 1;
const DEFAULT_TIMEOUT_MS = 120000;

class LauncherService extends EventEmitter {
  constructor({ rootDir, dataDir, resourcesDir = process.resourcesPath, env = {} } = {}) {
    super();
    this.rootDir = rootDir;
    this.dataDir = dataDir;
    this.resourcesDir = resourcesDir;
    this.env = { ...env };
    this.child = null;
    this.socket = null;
    this.pending = new Map();
    this.ready = null;
    this.readyResolve = null;
    this.readyReject = null;
    this.stopping = false;
    this.status = { state: 'stopped', version: '', pid: null, error: '' };
  }

  executable() {
    const name = process.platform === 'win32' ? 'enderloom-service.exe' : 'enderloom-service';
    const candidates = [
      process.env.ENDERLOOM_SERVICE_PATH,
      path.join(this.resourcesDir || '', 'native', name),
      path.join(this.rootDir, 'native', 'target', 'release', name),
      path.join(this.rootDir, 'native', 'target', 'debug', name),
    ].filter(Boolean);
    return candidates.find((candidate) => fs.existsSync(candidate)) || null;
  }

  snapshot() {
    return { ...this.status };
  }

  async start() {
    if ((this.child || this.socket) && this.status.state === 'ready') return this.snapshot();
    if (this.ready) return this.ready;
    const executable = this.executable();
    if (!executable) {
      throw new Error('Enderloom Rust service is not built. Run npm run build:launcher-service.');
    }
    fs.mkdirSync(this.dataDir, { recursive: true });
    this.stopping = false;
    this.status = { state: 'starting', version: '', pid: null, error: '' };
    this.ready = new Promise((resolve, reject) => {
      this.readyResolve = resolve;
      this.readyReject = reject;
    });
    const ready = this.ready;
    // A disconnect can reject the handshake before connectExisting returns.
    ready.catch(() => {});
    if (await this.connectExisting()) {
      const handshake = setTimeout(() => this.onExit(new Error('Shared Enderloom service handshake timed out')), 5000);
      handshake.unref?.();
      try { return await ready; } finally { clearTimeout(handshake); }
    }
    const child = spawn(executable, ['--data-dir', this.dataDir], {
      cwd: this.rootDir,
      env: { ...process.env, ...this.env },
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    this.child = child;
    this.status.pid = child.pid ?? null;

    const output = readline.createInterface({ input: child.stdout, crlfDelay: Infinity });
    output.on('line', (line) => this.onLine(line));
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk) => this.emit('diagnostic', String(chunk)));
    child.once('error', (error) => this.onExit(error));
    child.once('exit', (code, signal) => {
      this.onExit(new Error(`Enderloom Rust service exited (${code ?? signal ?? 'unknown'})`));
    });

    const timeout = setTimeout(() => {
      if (this.status.state !== 'ready') this.onExit(new Error('Enderloom Rust service handshake timed out'));
    }, 15000);
    timeout.unref?.();
    try {
      return await ready;
    } finally {
      clearTimeout(timeout);
    }
  }

  async connectExisting() {
    let endpoint;
    try { endpoint = JSON.parse(fs.readFileSync(path.join(this.dataDir, '.enderloom-control.json'), 'utf8')); }
    catch { return false; }
    if (endpoint?.protocol !== PROTOCOL_VERSION || !Number.isInteger(endpoint.port) || endpoint.port < 1 || endpoint.port > 65535 || typeof endpoint.token !== 'string') return false;
    return await new Promise((resolve) => {
      const socket = net.createConnection({host:'127.0.0.1',port:endpoint.port});
      const timer = setTimeout(() => {socket.destroy();resolve(false);},2000);
      let connected = false;
      socket.once('connect', () => {
        clearTimeout(timer);connected=true;this.socket=socket;
        this.status.pid = endpoint.pid;
        readline.createInterface({input:socket,crlfDelay:Infinity})
          .on('line',line=>this.onLine(line))
          .on('error',error=>{if(this.socket===socket)this.onExit(error);});
        socket.write(JSON.stringify({protocol:PROTOCOL_VERSION,token:endpoint.token})+'\n');
        resolve(true);
      });
      socket.on('error',error=>{
        clearTimeout(timer);
        if(connected){if(this.socket===socket)this.onExit(error);}else resolve(false);
      });
      socket.once('close',()=>{if(connected && this.socket===socket)this.onExit(new Error('Shared Enderloom service disconnected'));});
    });
  }

  onLine(line) {
    let message;
    try {
      message = JSON.parse(line);
    } catch {
      this.emit('diagnostic', 'Rust service wrote a non-protocol stdout line');
      return;
    }
    if (message?.protocol !== PROTOCOL_VERSION) {
      this.onExit(new Error('Enderloom Rust service protocol mismatch'));
      return;
    }
    if (message.event) {
      if (message.event === 'service:ready') {
        if (this.socket && Number(message.payload?.pid) !== this.status.pid) {
          this.onExit(new Error('Shared Enderloom service owner mismatch'));
          return;
        }
        this.status = {
          state: 'ready',
          version: String(message.payload?.version || ''),
          pid: Number(message.payload?.pid) || this.child?.pid || null,
          error: '',
        };
        this.readyResolve?.(this.snapshot());
        this.readyResolve = null;
        this.readyReject = null;
      }
      this.emit('event', { event: String(message.event), payload: message.payload });
      return;
    }
    const record = this.pending.get(String(message.id || ''));
    if (!record) return;
    this.pending.delete(String(message.id));
    clearTimeout(record.timer);
    if (message.ok) record.resolve(message.result);
    else record.reject(new Error(
      `Enderloom Rust command failed (${record.command}): ${String(message.error || 'unknown error')}`,
    ));
  }

  onExit(error) {
    if (!this.child && !this.socket && this.status.state === 'stopped') return;
    const reason = error instanceof Error ? error : new Error(String(error));
    this.status = {
      ...this.status,
      state: this.stopping ? 'stopped' : 'failed',
      error: this.stopping ? '' : reason.message,
      pid: null,
    };
    this.readyReject?.(reason);
    this.readyResolve = null;
    this.readyReject = null;
    this.ready = null;
    this.child = null;
    const socket = this.socket;
    this.socket = null;
    socket?.destroy();
    for (const record of this.pending.values()) {
      clearTimeout(record.timer);
      record.reject(reason);
    }
    this.pending.clear();
    this.emit('exit', this.snapshot());
  }

  async request(command, args = {}, { timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
    if (timeoutMs === DEFAULT_TIMEOUT_MS && ['start_performance_capture', 'compare_mod_startup'].includes(command)) {
      const seconds = Math.max(15, Math.min(900, Number(args.seconds) || 30));
      const launches = command === 'compare_mod_startup' ? 2 * Math.max(1, Math.min(100, Number(args.repeats) || 2)) : 1;
      timeoutMs = Math.max(DEFAULT_TIMEOUT_MS, launches * (seconds + 180) * 1000);
    }
    if (timeoutMs === DEFAULT_TIMEOUT_MS && command === 'start_testing_session') timeoutMs = 600000;
    if (timeoutMs === DEFAULT_TIMEOUT_MS && command === 'run_testing_scenario') timeoutMs = 1900000;
    await this.start();
    const input = this.socket || this.child?.stdin;
    if (!input?.writable) throw new Error('Enderloom Rust service is unavailable');
    const id = randomUUID();
    const message = JSON.stringify({
      protocol: PROTOCOL_VERSION,
      id,
      command: String(command),
      args: args && typeof args === 'object' ? args : {},
    });
    return await new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Enderloom Rust command timed out: ${command}`));
      }, Math.max(1000, Number(timeoutMs) || DEFAULT_TIMEOUT_MS));
      timer.unref?.();
      this.pending.set(id, { resolve, reject, timer, command: String(command) });
      input.write(message + '\n', (error) => {
        if (!error) return;
        const record = this.pending.get(id);
        if (!record) return;
        this.pending.delete(id);
        clearTimeout(record.timer);
        record.reject(error);
      });
    });
  }

  async close() {
    this.stopping = true;
    if (this.socket) {
      this.socket.end();
      this.onExit(new Error('Shared service connection closed'));
      return;
    }
    const child = this.child;
    if (!child) {
      this.status = { state: 'stopped', version: '', pid: null, error: '' };
      return;
    }
    await new Promise((resolve, reject) => {
      let settled = false;
      let killTimer;
      let giveUpTimer;
      const finish = (error) => {
        if (settled) return;
        settled = true;
        clearTimeout(killTimer);
        clearTimeout(giveUpTimer);
        if (error) reject(error);
        else resolve();
      };
      child.once('exit', finish);
      try { child.stdin.end(); } catch {}
      killTimer = setTimeout(() => {
        try { child.kill(); } catch {}
      }, 2500);
      giveUpTimer = setTimeout(
        () => finish(new Error('Enderloom Rust service did not stop; reset was cancelled')),
        5000,
      );
      killTimer.unref?.();
      giveUpTimer.unref?.();
    });
  }

  async applyReset(deep = false) {
    const executable = this.executable();
    if (!executable) throw new Error('Enderloom Rust service is unavailable for offline reset');
    await this.close();
    return await new Promise((resolve, reject) => {
      const args = ['--apply-reset', '--data-dir', this.dataDir, ...(deep ? ['--deep'] : [])];
      const child = spawn(executable, args, {
        cwd: this.rootDir,
        env: { ...process.env, ...this.env },
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      let output = '';
      let diagnostic = '';
      let settled = false;
      let timer;
      const finish = (error, report) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (error) reject(error);
        else resolve(report);
      };
      const append = (current, chunk) => (current + String(chunk)).slice(-1024 * 1024);
      child.stdout.on('data', (chunk) => { output = append(output, chunk); });
      child.stderr.on('data', (chunk) => { diagnostic = append(diagnostic, chunk); });
      timer = setTimeout(() => {
        try { child.kill(); } catch {}
        finish(new Error('Enderloom offline reset timed out'));
      }, 30000);
      timer.unref?.();
      child.once('error', (error) => {
        finish(error);
      });
      child.once('exit', (code) => {
        if (code !== 0) {
          finish(new Error(diagnostic.trim() || `Enderloom offline reset exited with code ${code}`));
          return;
        }
        try {
          const report = JSON.parse(output.trim());
          const recoveryRoot = path.resolve(this.dataDir, 'reset-recovery');
          const recoveryDir = path.resolve(String(report?.recovery_dir || ''));
          if (recoveryDir !== recoveryRoot && !recoveryDir.startsWith(recoveryRoot + path.sep)) {
            throw new Error('offline reset returned an unexpected recovery path');
          }
          finish(null, report);
        } catch (error) {
          finish(error);
        }
      });
    });
  }
}

module.exports = { LauncherService, PROTOCOL_VERSION };
