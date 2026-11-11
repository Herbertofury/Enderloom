#!/usr/bin/env python3
"""Exercise actual runner subprocesses with synthetic driver receipts, not game proof."""
from __future__ import annotations

import json
import hashlib
import pathlib
import subprocess
import sys
import tempfile
import unittest

from northpoint_compose import inventory
from northpoint_job_runner import normalized_cell, sha256_file

ROOT = pathlib.Path(__file__).resolve().parent
DRIVER = '''import argparse, json, pathlib, sys
p = argparse.ArgumentParser()
p.add_argument('--probe', action='store_true')
for name in ('cell-json', 'project', 'work', 'output'):
    p.add_argument('--' + name)
a = p.parse_args()
if a.probe:
    environment = pathlib.Path(a.project) / 'environment.txt'
    print(json.dumps({'protocol': 2, 'fixture': 'synthetic-attempt-state',
                      'environment': environment.read_text() if environment.exists() else ''}))
    raise SystemExit(0)
cfg = json.loads((pathlib.Path(a.project) / 'src/common/resources/attempt.json').read_text())
mode = cfg['mode']
if mode == 'invalid-json':
    print('not JSON')
    raise SystemExit(0)
if mode == 'process-failure':
    raise SystemExit(1)
if mode == 'no-receipt':
    raise SystemExit(0)
result = {'state': mode, 'evidence': [mode + '-current-attempt']}
if mode == 'passed' or cfg.get('artifact'):
    artifact = pathlib.Path(a.output) / 'fixture.bin'
    artifact.write_bytes(cfg.get('payload', 'prior-artifact').encode())
    result['artifact'] = str(artifact)
    result['conversion'] = {'fixture': cfg.get('payload', 'prior-artifact')}
print(json.dumps(result))
'''


class AttemptStateTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory(prefix='northpoint-attempt-state-')
        self.addCleanup(self.temp.cleanup)
        self.root = pathlib.Path(self.temp.name)
        self.project = self.root / 'project'
        self.project.mkdir()
        self.state = self.root / 'state'
        self.driver = self.root / 'fixture_driver.py'
        self.driver.write_text(DRIVER, encoding='utf-8')
        self.manifest = self.root / 'manifest.json'
        self.manifest.write_text(json.dumps({
            'project_root': str(self.project), 'primary_cell': 'fixture',
            'cells': [{'id': 'fixture', 'minecraft': '1.21.1', 'loader': 'fabric', 'java': 21}],
        }), encoding='utf-8')
        self.configure('passed')
        first, self.previous = self.run_runner(0)
        self.assertEqual(first['status'], 'PASS')
        self.previous_bytes = (self.state / 'release' / self.previous['artifact']['file']).read_bytes()

    def configure(self, mode: str, **extra) -> None:
        path = self.project / 'src/common/resources/attempt.json'
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps({'mode': mode, **extra}), encoding='utf-8')

    def run_runner(self, expected: int, proof: dict | None = None) -> tuple[dict, dict]:
        command = [sys.executable, str(ROOT / 'northpoint_job_runner.py'),
                   '--manifest', str(self.manifest), '--driver', str(self.driver),
                   '--state-dir', str(self.state), '--timeout', '15']
        if proof is not None:
            proof_file = self.root / 'proofs.json'
            proof_file.write_text(json.dumps({'proofs': [proof]}), encoding='utf-8')
            command += ['--runtime-proofs', str(proof_file)]
        cp = subprocess.run(command, text=True, capture_output=True, timeout=30)
        self.assertEqual(cp.returncode, expected, cp.stdout + cp.stderr)
        summary = json.loads(cp.stdout.splitlines()[-1])
        cell = json.loads((self.state / 'session.json').read_text(encoding='utf-8'))['cells']['fixture']
        return summary, cell

    def proof(self, artifact: dict) -> dict:
        return {'cell_id': 'fixture', 'passed': True, 'artifact_sha256': artifact['sha256'],
                'evidence': ['SYNTHETIC-RECEIPT-ONLY']}

    def test_no_artifact_attempts_do_not_inherit_previous_outputs(self) -> None:
        for mode in ('blocked', 'failed', 'cancelled', 'runtime-unverified',
                     'invalid-json', 'process-failure', 'no-receipt'):
            with self.subTest(mode=mode):
                self.configure('passed')
                self.run_runner(0)
                self.configure(mode)
                summary, cell = self.run_runner(2)
                self.assertEqual(summary['run']['built'], ['fixture'])
                self.assertIsNone(cell['artifact'])
                self.assertIsNone(cell['conversion'])
                self.assertNotIn('driver_stdout_tail', cell)
                self.assertNotIn('passed-current-attempt', cell['evidence'])
                matrix = json.loads((self.state / 'release/release-matrix.json').read_text(encoding='utf-8'))
                self.assertEqual(matrix['cells'][0]['artifact'], {})
                self.assertEqual((self.state / 'release/SHA256SUMS.txt').read_text(), '')
                # Old bytes and the original receipt stay available for recovery.
                self.assertEqual((self.state / 'release' / self.previous['artifact']['file']).read_bytes(), self.previous_bytes)
                self.assertTrue(list((self.state / 'work/history/fixture').glob('*/receipt.json')))

    def test_old_proof_cannot_promote_no_artifact_rebuild(self) -> None:
        self.configure('runtime-unverified')
        self.run_runner(2)
        resumed, cell = self.run_runner(2, self.proof(self.previous['artifact']))
        self.assertEqual(resumed['status'], 'FAILED_PRIMARY')
        self.assertEqual(resumed['run']['runtime_promoted'], [])
        self.assertEqual(resumed['run']['reused'], ['fixture'])
        self.assertEqual(cell['state'], 'runtime-unverified')
        self.assertIsNone(cell['artifact'])

    def test_current_artifact_requires_its_own_proof(self) -> None:
        self.configure('runtime-unverified', artifact=True, payload='new-artifact')
        _, current = self.run_runner(2)
        self.assertNotEqual(current['artifact']['sha256'], self.previous['artifact']['sha256'])
        rejected, _ = self.run_runner(2, self.proof(self.previous['artifact']))
        self.assertEqual(rejected['run']['runtime_promoted'], [])
        promoted, cell = self.run_runner(0, self.proof(current['artifact']))
        self.assertEqual(promoted['run']['runtime_promoted'], ['fixture'])
        self.assertEqual(promoted['run']['built'], [])
        self.assertEqual(cell['artifact'], current['artifact'])
        self.assertEqual(cell['attempts'], 2)

    def test_changed_inputs_invalidate_proof_before_promotion(self) -> None:
        self.configure('runtime-unverified', artifact=True, payload='new-artifact')
        _, current = self.run_runner(2)
        self.configure('runtime-unverified')
        rebuilt, cell = self.run_runner(2, self.proof(current['artifact']))
        self.assertEqual(rebuilt['run']['runtime_promoted'], [])
        self.assertEqual(rebuilt['run']['built'], ['fixture'])
        self.assertIsNone(cell['artifact'])

    def test_changed_environment_invalidates_proof_before_promotion(self) -> None:
        self.configure('runtime-unverified', artifact=True, payload='new-artifact')
        _, current = self.run_runner(2)
        (self.project / 'environment.txt').write_text('changed toolchain', encoding='utf-8')
        rebuilt, cell = self.run_runner(2, self.proof(current['artifact']))
        self.assertEqual(rebuilt['run']['runtime_promoted'], [])
        self.assertEqual(rebuilt['run']['built'], ['fixture'])
        self.assertEqual(cell['fingerprint'], current['fingerprint'])
        self.assertNotEqual(cell['environment_fingerprint'], current['environment_fingerprint'])

    def test_legacy_false_pass_cache_is_invalidated_without_losing_history(self) -> None:
        self.configure('runtime-unverified')
        manifest = json.loads(self.manifest.read_text(encoding='utf-8'))
        cell = normalized_cell(manifest['cells'][0])
        cell['primary'] = True
        # Exact input-payload format from the pre-fix runner, without attempt_schema.
        legacy_payload = {'compose': inventory(self.project, cell)['sha256'],
                          'driver_sha256': sha256_file(self.driver),
                          'artifact_fingerprint': '', 'cell': cell, 'config': {}}
        legacy_hash = hashlib.sha256(json.dumps(legacy_payload, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
        path = self.state / 'session.json'
        state = json.loads(path.read_text(encoding='utf-8'))
        state['cells']['fixture']['fingerprint'] = legacy_hash
        path.write_text(json.dumps(state), encoding='utf-8')
        rebuilt, current = self.run_runner(2, self.proof(self.previous['artifact']))
        self.assertEqual(rebuilt['run']['built'], ['fixture'])
        self.assertEqual(rebuilt['run']['runtime_promoted'], [])
        self.assertNotEqual(current['fingerprint'], legacy_hash)
        self.assertIsNone(current['artifact'])
        after = json.loads(path.read_text(encoding='utf-8'))
        self.assertEqual(after['runs'][:-1], state['runs'])


def main() -> int:
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(AttemptStateTests)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    if result.wasSuccessful():
        print('Northpoint attempt state self-test: PASS')
        return 0
    return 1


if __name__ == '__main__':
    raise SystemExit(main())
