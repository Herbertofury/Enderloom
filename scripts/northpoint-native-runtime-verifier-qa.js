'use strict';

const assert = require('assert/strict');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { EventEmitter } = require('events');

const { NorthpointService } = require('../src/northpoint-service');

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

(async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'northpoint-native-runtime-qa-'));
  const dataDir = path.join(root, 'data');
  const stateDir = path.join(root, 'state');
  const releaseDir = path.join(stateDir, 'release');
  fs.mkdirSync(releaseDir, { recursive: true });
  const candidate = path.join(releaseDir, 'candidate.jar');
  fs.writeFileSync(candidate, Buffer.from('northpoint-runtime-candidate'));
  const artifactSha = sha256(candidate);

  const events = new EventEmitter();
  const calls = [];
  const nativeRequest = async (command, args) => {
    calls.push({ command, args });

    if (command === 'create_server') {
      assert.equal(args.flavor, 'fabric');
      assert.equal(args.versionId, '1.21.1');
      assert.equal(args.flavorVersion, '0.16.10');
      assert.equal(args.acceptEula, true);
      return { id: 'qa-server-1' };
    }
    if (command === 'install_server') return null;
    if (command === 'set_server_properties') {
      assert.equal(args.serverId, 'qa-server-1');
      assert.ok(args.changes.some((row) => row.key === 'server-port' && Number(row.value) > 0));
      return [];
    }
    if (command === 'add_server_content') {
      assert.equal(args.serverId, 'qa-server-1');
      assert.deepEqual(args.sources, [candidate]);
      return ['candidate.jar'];
    }
    if (command === 'start_server') {
      setTimeout(() => {
        events.emit('event', {
          event: 'server:log',
          payload: {
            server_id: 'qa-server-1',
            stream: 'stdout',
            lines: ['[Server thread/INFO]: Done (1.234s)! For help, type "help"'],
          },
        });
      }, 30);
      return {
        server_id: 'qa-server-1',
        running_id: 'qa-server-run-1',
        state: 'running',
        pid: 1234,
      };
    }
    if (command === 'get_server_console') return [];
    if (command === 'stop_server') {
      setTimeout(() => {
        events.emit('event', {
          event: 'server:state',
          payload: {
            server_id: args.serverId,
            running_id: 'qa-server-run-1',
            state: 'exited',
            exit_code: 0,
          },
        });
      }, 10);
      return null;
    }
    if (command === 'force_stop_server' || command === 'delete_server') return null;

    if (command === 'create_instance') return { id: 'qa-instance-1' };
    if (command === 'install_instance') return null;
    if (command === 'add_instance_content') {
      assert.equal(args.instanceId, 'qa-instance-1');
      assert.equal(args.kind, 'mods');
      assert.deepEqual(args.sources, [candidate]);
      return ['candidate.jar'];
    }
    if (command === 'launch_instance_qa') {
      setTimeout(() => {
        events.emit('event', {
          event: 'process:log',
          payload: {
            running_id: 'qa-run-1',
            stream: 'stdout',
            lines: ['[Render thread/INFO]: Backend library: LWJGL version 3.3.3'],
          },
        });
      }, 20);
      setTimeout(() => {
        events.emit('event', {
          event: 'process:log',
          payload: {
            running_id: 'qa-run-1',
            stream: 'stdout',
            lines: ['[Render thread/INFO]: Reloading ResourceManager: vanilla, fabric'],
          },
        });
      }, 50);
      return 'qa-run-1';
    }
    if (command === 'get_logs') return [];
    if (command === 'kill_instance') {
      setTimeout(() => {
        events.emit('event', {
          event: 'process:state',
          payload: { running_id: args.runningId, state: 'exited', exit_code: 0 },
        });
      }, 10);
      return null;
    }
    if (command === 'close_running' || command === 'delete_instance') return null;

    throw new Error(`unexpected native command: ${command}`);
  };

  const service = new NorthpointService({
    rootDir: root,
    dataDir,
    nativeRequest,
    nativeEvents: events,
    env: {
      ENDERLOOM_NORTHPOINT_RUNTIME_STABILIZE_MS: '100',
      ENDERLOOM_NORTHPOINT_RUNTIME_TIMEOUT_MS: '10000',
      ENDERLOOM_NORTHPOINT_SERVER_STABILIZE_MS: '500',
      ENDERLOOM_NORTHPOINT_SERVER_TIMEOUT_MS: '10000',
    },
  });
  const proofs = [];
  const bridge = {
    recordRuntimeProof(value) {
      proofs.push(value);
      assert.equal(value.artifactSha256, artifactSha);
      return value;
    },
  };
  const session = { id: '01234567-89ab-cdef-0123-456789abcdef' };
  const cell = {
    id: 'mc-1.21.1-fabric',
    minecraft: '1.21.1',
    loader: 'fabric',
    profile: { loader_version: '0.16.10' },
  };
  const row = {
    cell_id: cell.id,
    state: 'runtime-unverified',
    artifact: { file: 'candidate.jar', sha256: artifactSha },
  };

  const runtime = await service.verifyRuntimeCandidate({
    session,
    cell,
    row,
    result: { state_dir: stateDir },
    bridge,
    runtimeScope: 'both',
  });

  assert.equal(runtime.runtime_scope, 'both');
  assert.deepEqual(runtime.receipts.map((receipt) => receipt.gate), [
    'native-dedicated-server-load',
    'native-client-load',
  ]);
  assert.match(runtime.receipts[0].ready_marker, /Done \(/);
  assert.match(runtime.receipts[1].ready_marker, /Reloading ResourceManager/);
  assert.equal(proofs.length, 1);
  assert.ok(proofs[0].evidence.some((row) => row.startsWith('native-dedicated-server-load:')));
  assert.ok(proofs[0].evidence.some((row) => row.startsWith('native-client-load:')));

  assert.ok(calls.some((row) => row.command === 'start_server'));
  assert.ok(calls.some((row) => row.command === 'stop_server' && row.args.serverId === 'qa-server-1'));
  assert.ok(calls.some((row) => row.command === 'delete_server' && row.args.serverId === 'qa-server-1'));
  assert.ok(calls.some((row) => row.command === 'launch_instance_qa'));
  assert.ok(!calls.some((row) => row.command === 'launch_instance'));
  assert.ok(calls.some((row) => row.command === 'kill_instance' && row.args.runningId === 'qa-run-1'));
  assert.ok(calls.some((row) => row.command === 'delete_instance' && row.args.instanceId === 'qa-instance-1'));

  const evidenceRoot = path.join(dataDir, 'jobs', session.id, 'runtime');
  assert.ok(fs.existsSync(path.join(evidenceRoot, cell.id + '.server.json')));
  assert.ok(fs.existsSync(path.join(evidenceRoot, cell.id + '.client.json')));

  const fatalRun = 'qa-run-fatal';
  const fatalPromise = service.waitForNativeClient(fatalRun, { timeoutMs: 10000, stabilizeMs: 100 });
  setTimeout(() => {
    events.emit('event', {
      event: 'process:log',
      payload: {
        running_id: fatalRun,
        stream: 'stderr',
        lines: ['java.lang.NoClassDefFoundError: net/example/MissingClass'],
      },
    });
  }, 20);
  await assert.rejects(fatalPromise, /NoClassDefFoundError/);

  console.log(JSON.stringify({
    status: 'PASS',
    artifact_sha256: artifactSha,
    runtime_scope: runtime.runtime_scope,
    gates: runtime.receipts.map((receipt) => receipt.gate),
    commands: calls.map((row) => row.command),
  }, null, 2));
})().catch((error) => {
  console.error(error?.stack || error);
  process.exitCode = 1;
});
