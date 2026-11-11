#!/usr/bin/env python3
"""Exercise real runner subprocesses with explicitly synthetic driver receipts."""
from __future__ import annotations

import hashlib
import json
import pathlib
import subprocess
import sys
import tempfile
import unittest

ROOT = pathlib.Path(__file__).resolve().parent
DRIVER = '''import argparse, json, pathlib
p = argparse.ArgumentParser()
p.add_argument('--probe', action='store_true')
for name in ('cell-json', 'project', 'work', 'output'):
    p.add_argument('--' + name)
a = p.parse_args()
if a.probe:
    print(json.dumps({'protocol': 2, 'fixture': 'SYNTHETIC-driver-receipt'}))
    raise SystemExit(0)
cell = json.loads(pathlib.Path(a.cell_json).read_text())
config = pathlib.Path(a.project) / ('src/cell/' + cell['id'] + '/resources/receipt.json')
value = json.loads(config.read_text()) if config.exists() else {'state': 'passed'}
if isinstance(value, dict) and value.get('state') in ('passed', 'runtime-unverified'):
    artifact = pathlib.Path(a.output) / 'fixture.bin'
    artifact.write_text('SYNTHETIC-ARTIFACT|' + cell['id'])
    value['artifact'] = str(artifact)
    value['evidence'] = ['SYNTHETIC-RECEIPT-ONLY']
print(json.dumps(value))
'''


class DriverReceiptTests(unittest.TestCase):
    def setUp(self) -> None:
        temp = tempfile.TemporaryDirectory(prefix='northpoint-driver-receipt-')
        self.addCleanup(temp.cleanup)
        self.root = pathlib.Path(temp.name)
        self.project = self.root / 'project'
        self.project.mkdir()
        self.state = self.root / 'state'
        self.driver = self.root / 'driver.py'
        self.driver.write_text(DRIVER, encoding='utf-8')
        self.manifest = self.root / 'manifest.json'
        self.manifest.write_text(json.dumps({
            'project_root': str(self.project), 'primary_cell': 'primary',
            'cells': [{'id': cid, 'minecraft': '1.21.1', 'loader': 'fabric', 'java': 21}
                      for cid in ('primary', 'broken', 'healthy')],
        }), encoding='utf-8')

    def configure(self, cid: str, receipt: object) -> None:
        path = self.project / 'src/cell' / cid / 'resources/receipt.json'
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(receipt), encoding='utf-8')

    def run_runner(self, expected: int = 0) -> tuple[dict, dict]:
        cp = subprocess.run([
            sys.executable, str(ROOT / 'northpoint_job_runner.py'),
            '--manifest', str(self.manifest), '--driver', str(self.driver),
            '--state-dir', str(self.state), '--timeout', '15', '--max-workers', '2',
        ], text=True, capture_output=True, timeout=30)
        self.assertEqual(cp.returncode, expected, cp.stdout + cp.stderr)
        self.assertNotIn('Traceback', cp.stderr)
        summary = json.loads(cp.stdout.splitlines()[-1])
        state = json.loads((self.state / 'session.json').read_text(encoding='utf-8'))
        self.assertIn('finished_at', state['runs'][-1])
        self.assertEqual(summary['run'], state['runs'][-1])
        return summary, state

    def assert_failed_receipt(self, state: dict, cid: str, value: object) -> None:
        rec = state['cells'][cid]
        self.assertEqual(rec['state'], 'failed')
        self.assertIn('driver receipt must be a JSON object', rec['reason'])
        self.assertIsNone(rec['artifact'])
        self.assertEqual(rec['evidence'], [])
        work = self.state / 'work' / cid
        self.assertEqual(json.loads((work / 'receipt.json').read_text()), value)
        self.assertEqual(json.loads((work / 'driver.stdout.txt').read_text()), value)
        self.assertEqual(json.loads((work / 'driver.process.json').read_text())['returncode'], 0)

    def release_rows(self) -> dict[str, dict]:
        matrix = json.loads((self.state / 'release/release-matrix.json').read_text())
        return {row['cell_id']: row for row in matrix['cells']}

    def released_names(self) -> list[str]:
        lines = (self.state / 'release/SHA256SUMS.txt').read_text().splitlines()
        for line in lines:
            digest, name = line.split('  ')
            artifact = self.state / 'release' / name
            self.assertEqual(hashlib.sha256(artifact.read_bytes()).hexdigest(), digest)
        return [line.split('  ')[1] for line in lines]

    def test_all_non_object_json_types_fail_one_secondary_without_aborting_others(self) -> None:
        for receipt in (None, [], ['passed'], 'passed', 7, 2.5, True, False):
            with self.subTest(receipt=receipt):
                self.configure('broken', receipt)
                summary, state = self.run_runner(3)
                self.assertEqual(summary['status'], 'PARTIAL')
                self.assertEqual(summary['run']['failed'], ['broken'])
                self.assert_failed_receipt(state, 'broken', receipt)
                self.assertEqual(state['cells']['healthy']['state'], 'passed')
                self.assertEqual(self.released_names(), ['healthy.bin', 'primary.bin'])

    def test_malformed_primary_stops_secondaries_with_structured_failure(self) -> None:
        self.configure('primary', None)
        summary, state = self.run_runner(2)
        self.assertEqual(summary['status'], 'FAILED_PRIMARY')
        self.assertEqual(summary['run']['built'], ['primary'])
        self.assert_failed_receipt(state, 'primary', None)
        self.assertEqual(state['cells']['healthy']['attempts'], 0)
        self.assertEqual(state['cells']['broken']['attempts'], 0)
        self.assertEqual(self.released_names(), [])

    def test_bad_receipt_replaces_stale_success_but_preserves_recovery_bytes(self) -> None:
        _, before = self.run_runner()
        artifact = self.state / 'release/broken.bin'
        old_bytes = artifact.read_bytes()
        old_receipt = (self.state / 'work/broken/receipt.json').read_bytes()
        self.configure('broken', None)
        summary, after = self.run_runner(3)
        self.assertEqual(summary['run']['reused'], ['healthy', 'primary'])
        self.assertEqual(summary['run']['built'], ['broken'])
        self.assert_failed_receipt(after, 'broken', None)
        self.assertEqual(after['runs'][:-1], before['runs'])
        self.assertEqual(self.release_rows()['broken']['state'], 'failed')
        self.assertEqual(self.release_rows()['broken']['artifact'], {})
        self.assertEqual(self.released_names(), ['healthy.bin', 'primary.bin'])
        self.assertEqual(artifact.read_bytes(), old_bytes)
        archives = list((self.state / 'work/history/broken').glob('*/receipt.json'))
        self.assertEqual([path.read_bytes() for path in archives], [old_receipt])

    def test_failed_receipt_retries_without_manual_reset_and_can_recover(self) -> None:
        self.configure('broken', [])
        self.run_runner(3)
        summary, failed = self.run_runner(3)
        self.assertEqual(summary['run']['built'], ['broken'])
        self.assertEqual(failed['cells']['broken']['attempts'], 2)
        self.configure('broken', {'state': 'passed'})
        summary, recovered = self.run_runner()
        self.assertEqual(summary['status'], 'PASS')
        self.assertEqual(summary['run']['built'], ['broken'])
        self.assertEqual(recovered['cells']['broken']['attempts'], 3)
        self.assertEqual(self.released_names(), ['broken.bin', 'healthy.bin', 'primary.bin'])
        summary, _ = self.run_runner()
        self.assertEqual(summary['run']['built'], [])
        self.assertEqual(len(summary['run']['reused']), 3)

    def test_valid_blocked_and_unverified_receipts_keep_existing_behavior(self) -> None:
        self.configure('broken', {'state': 'blocked', 'reason': 'SYNTHETIC missing prerequisite'})
        self.configure('healthy', {'state': 'runtime-unverified'})
        summary, state = self.run_runner(3)
        self.assertEqual(summary['run']['blocked'], ['broken', 'healthy'])
        self.assertEqual(summary['run']['failed'], [])
        self.assertEqual(state['cells']['broken']['state'], 'blocked')
        self.assertEqual(state['cells']['healthy']['state'], 'runtime-unverified')
        self.assertEqual(self.released_names(), ['primary.bin'])

    def test_unknown_object_state_remains_failure_not_protocol_crash(self) -> None:
        self.configure('broken', {'state': 'not-a-real-state'})
        summary, state = self.run_runner(3)
        self.assertEqual(summary['run']['failed'], ['broken'])
        self.assertEqual(state['cells']['broken']['reason'], 'unknown driver state: not-a-real-state')


def main() -> int:
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(DriverReceiptTests)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    if result.wasSuccessful():
        print('Northpoint driver receipt self-test: PASS')
        return 0
    return 1


if __name__ == '__main__':
    raise SystemExit(main())
