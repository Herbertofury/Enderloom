#!/usr/bin/env python3
"""Actual resumable runner tests with synthetic receipts, not Minecraft proof."""
from __future__ import annotations

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
    print(json.dumps({'protocol': 2, 'fixture': 'SYNTHETIC-manifest-scope'}))
    raise SystemExit(0)
cell = json.loads(pathlib.Path(a.cell_json).read_text())
config = json.loads((pathlib.Path(a.project) / 'src/common/resources/fixture.json').read_text())
state = config.get(cell['id'], 'passed')
result = {'state': state, 'evidence': ['SYNTHETIC-RECEIPT-ONLY']}
if state in ('passed', 'runtime-unverified'):
    artifact = pathlib.Path(a.output) / 'fixture.bin'
    artifact.write_text(cell['id'] + '|' + json.dumps(config, sort_keys=True))
    result['artifact'] = str(artifact)
print(json.dumps(result))
'''


class ManifestScopeTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory(prefix='northpoint-manifest-scope-')
        self.addCleanup(self.temp.cleanup)
        self.root = pathlib.Path(self.temp.name)
        self.project = self.root / 'project'
        self.state = self.root / 'state'
        self.driver = self.root / 'driver.py'
        self.driver.write_text(DRIVER, encoding='utf-8')
        self.manifest = self.root / 'manifest.json'
        self.configure()
        self.select('primary', 'secondary')

    def configure(self, **modes: str) -> None:
        path = self.project / 'src/common/resources/fixture.json'
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(modes), encoding='utf-8')

    def select(self, *ids: str, primary: str = 'primary') -> None:
        self.manifest.write_text(json.dumps({
            'project_root': str(self.project), 'primary_cell': primary,
            'cells': [{'id': cid, 'minecraft': '1.21.1', 'loader': 'fabric', 'java': 21} for cid in ids],
        }), encoding='utf-8')

    def run_runner(self, expected: int = 0, proofs: list[dict] | None = None) -> tuple[dict, dict]:
        command = [sys.executable, str(ROOT / 'northpoint_job_runner.py'),
                   '--manifest', str(self.manifest), '--driver', str(self.driver),
                   '--state-dir', str(self.state), '--timeout', '15', '--max-workers', '2']
        if proofs is not None:
            path = self.root / 'proofs.json'
            path.write_text(json.dumps({'proofs': proofs}), encoding='utf-8')
            command += ['--runtime-proofs', str(path)]
        cp = subprocess.run(command, text=True, capture_output=True, timeout=30)
        self.assertEqual(cp.returncode, expected, cp.stdout + cp.stderr)
        return json.loads(cp.stdout.splitlines()[-1]), json.loads((self.state / 'session.json').read_text(encoding='utf-8'))

    def proof(self, state: dict, cid: str = 'secondary') -> dict:
        return {'cell_id': cid, 'passed': True, 'artifact_sha256': state['cells'][cid]['artifact']['sha256'],
                'evidence': ['SYNTHETIC-RECEIPT-ONLY']}

    def released(self) -> list[str]:
        matrix = json.loads((self.state / 'release/release-matrix.json').read_text(encoding='utf-8'))
        return [row['cell_id'] for row in matrix['cells']]

    def checksums(self) -> list[str]:
        return (self.state / 'release/SHA256SUMS.txt').read_text(encoding='utf-8').splitlines()

    def test_removed_passed_cell_leaves_current_release_but_retains_history_and_bytes(self) -> None:
        _, before = self.run_runner()
        artifact = self.state / 'release/secondary.bin'
        old_bytes = artifact.read_bytes()
        receipt = (self.state / 'work/secondary/receipt.json').read_bytes()
        self.select('primary')
        summary, after = self.run_runner()
        self.assertEqual(self.released(), ['primary'])
        self.assertEqual(len(self.checksums()), 1)
        self.assertTrue(self.checksums()[0].endswith('  primary.bin'))
        self.assertEqual(after['active_cells'], ['primary'])
        self.assertEqual(after['cells']['secondary'], before['cells']['secondary'])
        self.assertEqual(after['runs'][:-1], before['runs'])
        self.assertEqual(artifact.read_bytes(), old_bytes)
        self.assertEqual((self.state / 'work/secondary/receipt.json').read_bytes(), receipt)
        self.assertEqual(summary['run']['reused'], ['primary'])
        self.assertEqual(summary['run']['built'], [])

    def test_removed_unverified_cell_cannot_be_promoted_by_old_proof(self) -> None:
        self.configure(secondary='runtime-unverified')
        _, before = self.run_runner(3)
        self.select('primary')
        summary, after = self.run_runner(proofs=[self.proof(before)])
        self.assertEqual(summary['run']['runtime_promoted'], [])
        self.assertEqual(after['cells']['secondary'], before['cells']['secondary'])
        self.assertEqual(self.released(), ['primary'])
        self.assertEqual(len(self.checksums()), 1)

    def test_readding_unchanged_passed_cell_reuses_retained_artifact(self) -> None:
        _, before = self.run_runner()
        self.select('primary')
        self.run_runner()
        self.select('primary', 'secondary')
        summary, after = self.run_runner()
        self.assertEqual(summary['run']['built'], [])
        self.assertEqual(summary['run']['reused'], ['primary', 'secondary'])
        self.assertEqual(after['cells']['secondary']['attempts'], before['cells']['secondary']['attempts'])
        self.assertEqual(self.released(), ['primary', 'secondary'])
        self.assertEqual(len(self.checksums()), 2)

    def test_readding_changed_cell_invalidates_old_proof_then_builds(self) -> None:
        self.configure(secondary='runtime-unverified')
        _, before = self.run_runner(3)
        self.select('primary')
        self.run_runner()
        self.configure(secondary='runtime-unverified', new_source='changed')
        self.select('primary', 'secondary')
        summary, after = self.run_runner(3, proofs=[self.proof(before)])
        self.assertEqual(summary['run']['runtime_promoted'], [])
        self.assertEqual(summary['run']['built'], ['primary', 'secondary'])
        self.assertEqual(after['cells']['secondary']['attempts'], 2)
        self.assertNotEqual(after['cells']['secondary']['artifact']['sha256'], before['cells']['secondary']['artifact']['sha256'])
        self.assertEqual(len(self.checksums()), 1)

    def test_current_unverified_cell_can_still_be_promoted_without_rebuild(self) -> None:
        self.configure(secondary='runtime-unverified')
        _, before = self.run_runner(3)
        summary, after = self.run_runner(proofs=[self.proof(before)])
        self.assertEqual(summary['run']['runtime_promoted'], ['secondary'])
        self.assertEqual(summary['run']['built'], [])
        self.assertEqual(after['cells']['secondary']['state'], 'passed')
        self.assertEqual(after['cells']['secondary']['attempts'], 1)
        self.assertEqual(len(self.checksums()), 2)

    def test_primary_failure_still_removes_retired_cell_from_release(self) -> None:
        _, before = self.run_runner()
        self.select('primary')
        self.configure(primary='failed')
        summary, after = self.run_runner(2)
        self.assertEqual(summary['status'], 'FAILED_PRIMARY')
        self.assertEqual(self.released(), ['primary'])
        self.assertEqual(self.checksums(), [])
        self.assertEqual(after['cells']['secondary'], before['cells']['secondary'])

    def test_changed_primary_is_recorded_and_removed_previous_primary_is_retained(self) -> None:
        _, before = self.run_runner()
        self.select('secondary', primary='secondary')
        summary, after = self.run_runner()
        self.assertEqual(after['primary_cell'], 'secondary')
        self.assertEqual(after['active_cells'], ['secondary'])
        self.assertEqual(after['cells']['primary'], before['cells']['primary'])
        self.assertEqual(self.released(), ['secondary'])
        self.assertEqual(summary['run']['built'], ['secondary'])

    def test_legacy_session_without_active_cells_is_reconciled_on_resume(self) -> None:
        _, before = self.run_runner()
        before.pop('active_cells', None)
        (self.state / 'session.json').write_text(json.dumps(before), encoding='utf-8')
        self.select('primary')
        summary, after = self.run_runner()
        self.assertEqual(self.released(), ['primary'])
        self.assertEqual(after['cells']['secondary'], before['cells']['secondary'])
        self.assertEqual(summary['run']['built'], [])


def main() -> int:
    result = unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(ManifestScopeTests))
    if result.wasSuccessful():
        print('Northpoint manifest scope self-test: PASS')
        return 0
    return 1


if __name__ == '__main__':
    raise SystemExit(main())
