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
  const receipt = await service.verifyNativeClient({
    session,
    cell,
    row,
    result: { state_dir: stateDir },
    bridge,
  });

  assert.equal(receipt.gate, 'native-client-load');
  assert.equal(receipt.artifact_sha256, artifactSha);
  assert.match(receipt.ready_marker, /LWJGL/);
  assert.equal(proofs.length, 1);
  assert.ok(calls.some((row) => row.command === 'launch_instance_qa'));
  assert.ok(!calls.some((row) => row.command === 'launch_instance'));
  assert.ok(calls.some((row) => row.command === 'kill_instance' && row.args.runningId === 'qa-run-1'));
  assert.ok(calls.some((row) => row.command === 'delete_instance' && row.args.instanceId === 'qa-instance-1'));
  assert.ok(fs.existsSync(path.join(dataDir, 'jobs', session.id, 'runtime', cell.id + '.json')));

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
    commands: calls.map((row) => row.command),
    ready_marker: receipt.ready_marker,
  }, null, 2));
})().catch((error) => {
  console.error(error?.stack || error);
  process.exitCode = 1;
});
