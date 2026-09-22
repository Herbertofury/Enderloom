'use strict';

const assert = require('assert/strict');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { NorthpointJobBridge } = require('../src/northpoint-job-bridge');

function write(root, rel, text) {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text, 'utf8');
}

function sha256File(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

(async () => {
  const toolkit = path.join(__dirname, '..', 'tools', 'minecraft-dev-kit');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'northpoint-runtime-proof-bridge-'));
  const project = path.join(root, 'project');
  const dataDir = path.join(root, 'data');
  write(
    project,
    'src/main/java/example/Proof.java',
    'package example; public final class Proof { public static int value(){ return 42; } }\n',
  );
  write(
    project,
    'src/main/resources/fabric.mod.json',
    JSON.stringify({
      schemaVersion: 1,
      id: 'runtimeproof',
      version: '1.0.0',
      name: 'Runtime Proof',
      environment: '*',
    }, null, 2) + '\n',
  );

  const cell = {
    id: 'mc-1.21.1-fabric',
    minecraft: '1.21.1',
    loader: 'fabric',
    java: 21,
    support_state: 'stable',
  };
  const bridge = new NorthpointJobBridge({ toolkitRoot: toolkit, dataDir, rootDir: path.join(__dirname, '..') });
  const first = await bridge.runSession({
    sessionId: 'qa-runtime-proof-0001',
    sourceRoot: project,
    primaryCell: cell.id,
    cells: [cell],
    driverProfile: 'production',
    timeout: 120,
  });
  assert.equal(first.ok, false, JSON.stringify(first));
  assert.equal(first.receipt.status, 'FAILED_PRIMARY', JSON.stringify(first));
  const row = first.matrix.cells.find((entry) => entry.cell_id === cell.id);
  assert.equal(row.state, 'runtime-unverified', JSON.stringify(row));
  assert.ok(row.artifact?.sha256, JSON.stringify(row));
  assert.ok(row.artifact?.file, JSON.stringify(row));
  const candidate = path.join(first.state_dir, 'release', row.artifact.file);
  assert.equal(sha256File(candidate), row.artifact.sha256);

  assert.throws(
    () => bridge.recordRuntimeProof({
      sessionId: 'qa-runtime-proof-0001',
      cellId: cell.id,
      artifactSha256: '0'.repeat(64),
      evidence: ['wrong-sha'],
    }),
    /does not match/,
  );

  const proof = bridge.recordRuntimeProof({
    sessionId: 'qa-runtime-proof-0001',
    cellId: cell.id,
    artifactSha256: row.artifact.sha256,
    evidence: ['bridge-native-runtime-fixture:PASS'],
  });
  assert.equal(proof.proof.artifact_sha256, row.artifact.sha256);
  assert.equal(proof.proof.passed, true);

  const second = await bridge.runSession({
    sessionId: 'qa-runtime-proof-0001',
    sourceRoot: project,
    primaryCell: cell.id,
    cells: [cell],
    driverProfile: 'production',
    timeout: 120,
  });
  assert.equal(second.ok, true, JSON.stringify(second));
  assert.equal(second.receipt.status, 'PASS', JSON.stringify(second));
  assert.deepEqual(second.receipt.run.built, []);
  assert.deepEqual(second.receipt.run.reused, [cell.id]);
  assert.deepEqual(second.receipt.run.runtime_promoted, [cell.id]);
  const finalRow = second.matrix.cells.find((entry) => entry.cell_id === cell.id);
  assert.equal(finalRow.state, 'passed');
  assert.equal(finalRow.artifact.sha256, row.artifact.sha256);

  console.log(JSON.stringify({
    status: 'PASS',
    artifact_sha256: row.artifact.sha256,
    first: first.receipt.run,
    second: second.receipt.run,
  }, null, 2));
})().catch((error) => {
  console.error(error?.stack || error);
  process.exitCode = 1;
});
