#!/usr/bin/env python3
"""Minecraft Dev Kit workbench, using the canonical Northpoint production engine."""
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import zipfile

from northpoint_execution import atomic_json, new_run_id, run_logged, sha256_file, workspace_lock
from northpoint_production_driver import java_major, javac_major
from northpoint_source_intake import inspect_project

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / 'scripts'
RUNNER = SCRIPTS / 'northpoint_job_runner.py'
DRIVER = SCRIPTS / 'northpoint_production_driver.py'


def load(path: Path) -> dict:
    value = json.loads(path.read_text(encoding='utf-8'))
    if not isinstance(value, dict):
        raise ValueError(f'expected a JSON object: {path}')
    return value


def status(root: Path) -> dict:
    manifest = load(root / 'manifest.json')
    state_path = root / 'state' / 'session.json'
    state = load(state_path) if state_path.is_file() else {}
    cells = []
    for cell in manifest['cells']:
        record = state.get('cells', {}).get(cell['id'], {})
        artifact = dict(record.get('artifact') or {})
        if artifact:
            path = (root / 'state' / 'release' / artifact['file']).resolve()
            if not path.is_relative_to((root / 'state' / 'release').resolve()):
                raise ValueError('saved artifact escapes release directory')
            artifact.update(path=str(path), integrity_verified=path.is_file() and sha256_file(path) == artifact['sha256'])
        cells.append({'id': cell['id'], 'minecraft': cell['minecraft'], 'loader': cell['loader'],
                      'state': record.get('state', 'pending'), 'attempts': record.get('attempts', 0),
                      'artifact': artifact or None, 'reason': record.get('reason')})
    return {'schema_version': 1, 'workspace': str(root), 'project': manifest['project_root'],
            'cells': cells, 'last_run': (state.get('runs') or [None])[-1],
            'all_passed': bool(cells) and all(c['state'] == 'passed' and
                           c['artifact'] and c['artifact']['integrity_verified'] for c in cells)}


def run_workspace(root: Path, timeout: int, *, proofs: Path | None = None) -> int:
    with workspace_lock(root):
        manifest = load(root / 'manifest.json')
        source = Path(manifest['project_root']).resolve()
        if not source.is_dir():
            raise ValueError(f'source project is unavailable; saved work was preserved: {source}')
        run_id = new_run_id()
        command = [sys.executable, str(RUNNER), '--manifest', str(root / 'manifest.json'),
                   '--driver', str(DRIVER), '--state-dir', str(root / 'state'), '--timeout', str(timeout)]
        if proofs:
            command += ['--runtime-proofs', str(proofs.resolve())]
        atomic_json(root / 'active.json', {'run_id': run_id, 'state': 'running', 'command': command})
        print(f'Workspace: {root}', flush=True)
        print(f'Live evidence: {root / "runs" / run_id}', flush=True)
        cp = run_logged(command, directory=root / 'runs' / run_id, name='runner',
                        timeout=(timeout + 75) * max(1, len(manifest['cells'])))
        result = status(root)
        result.update(run_id=run_id, runner_exit=cp.returncode)
        atomic_json(root / 'active.json', {'run_id': run_id, 'state': 'finished', 'runner_exit': cp.returncode})
        atomic_json(root / 'result.json', result)
        print(json.dumps(result, indent=2))
        if cp.returncode not in {0, 2, 3}:
            print(cp.stderr, file=sys.stderr)
        return cp.returncode


def package(root: Path, output: Path) -> dict:
    """Package only explicit release/evidence paths, not caches, account files or secrets."""
    output = output.resolve()
    if output.is_relative_to(root.resolve()):
        raise ValueError('package output must be outside its workspace')
    with workspace_lock(root):
        snapshot = status(root)
        release = root / 'state' / 'release'
        rows = [row for row in snapshot['cells'] if row['artifact'] and
                row['state'] in {'passed', 'runtime-unverified'}]
        if not rows or any(not row['artifact']['integrity_verified'] for row in rows):
            raise ValueError('no intact candidate artifact is available to package')
        files = set()
        for row in rows:
            files.add(Path(row['artifact']['path']))
        for name in ['manifest.json', 'result.json', 'intake.json', 'state/session.json',
                     'state/release/release-matrix.json', 'state/release/SHA256SUMS.txt']:
            path = root / name
            if path.is_file():
                files.add(path)
        for cell in snapshot['cells']:
            work = root / 'state' / 'work' / cell['id']
            for name in ['cell.json', 'receipt.json', 'driver.stdout.txt', 'driver.stderr.txt', 'driver.process.json']:
                path = work / name
                if path.is_file():
                    files.add(path)
            if (work / 'evidence').is_dir():
                files.update(p for p in (work / 'evidence').rglob('*') if p.is_file())
        for path in files:
            if path.is_symlink() or not path.resolve().is_relative_to(root.resolve()):
                raise ValueError(f'unsafe package input: {path}')
        output.parent.mkdir(parents=True, exist_ok=True)
        # Exclusive creation: a package is immutable, never silently overwritten.
        with zipfile.ZipFile(output, 'x', compression=zipfile.ZIP_DEFLATED) as archive:
            hashes = []
            for path in sorted(files):
                rel = path.relative_to(root).as_posix()
                archive.write(path, rel)
                hashes.append(f'{sha256_file(path)}  {rel}')
            archive.writestr('PACKAGE-SHA256SUMS.txt', '\n'.join(hashes) + '\n')
            archive.writestr('VERIFICATION.json', json.dumps(snapshot, indent=2) + '\n')
            archive.writestr('READ-ME.txt',
                'Minecraft Dev Kit candidate and evidence bundle.\n'
                'Use VERIFICATION.json for the actual verification state of every cell.\n'
                'runtime-unverified means build evidence only; it is NOT a tested Minecraft release.\n'
                'Private source projects, account data and Gradle caches are not included.\n')
        return {'package': str(output), 'sha256': sha256_file(output), 'size': output.stat().st_size,
                'file_count': len(files), 'all_passed': snapshot['all_passed']}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command', required=True)
    doctor = sub.add_parser('doctor', help='Inspect installed build prerequisites without changing them')
    doctor.add_argument('--java-path', type=Path)
    convert = sub.add_parser('convert', help='Build/convert through the real production engine; retain all evidence')
    convert.add_argument('--project', type=Path, required=True)
    convert.add_argument('--minecraft', required=True)
    convert.add_argument('--loader', choices=['fabric', 'forge', 'neoforge', 'quilt'], required=True)
    convert.add_argument('--java', type=int, required=True)
    convert.add_argument('--java-path', type=Path)
    convert.add_argument('--workspace', type=Path)
    convert.add_argument('--timeout', type=int, default=600)
    resume = sub.add_parser('resume', help='Reuse exact-hash candidates; rebuild only invalidated inputs')
    resume.add_argument('--workspace', type=Path, required=True)
    resume.add_argument('--timeout', type=int, default=600)
    resume.add_argument('--runtime-proofs', type=Path)
    inspect = sub.add_parser('status', help='Read actual state and re-hash the saved candidate')
    inspect.add_argument('--workspace', type=Path, required=True)
    pack = sub.add_parser('package', help='Package real candidates, hashes and evidence without caches')
    pack.add_argument('--workspace', type=Path, required=True)
    pack.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    if hasattr(args, 'timeout') and args.timeout <= 0:
        parser.error('--timeout must be positive')
    if args.command == 'doctor':
        java = str(args.java_path.resolve()) if args.java_path else shutil.which('java')
        javac = str(Path(java).with_name('javac.exe' if os.name == 'nt' else 'javac')) if java else shutil.which('javac')
        print(json.dumps({'python': sys.version.split()[0], 'python_executable': sys.executable,
                          'java': java, 'java_major': java_major(java), 'javac_major': javac_major(javac),
                          'git': shutil.which('git'), 'production_driver': str(DRIVER),
                          'production_driver_sha256': sha256_file(DRIVER)}, indent=2))
        return 0 if java and javac and Path(javac).is_file() else 2
    if args.command == 'convert':
        project = args.project.resolve()
        if not project.is_dir():
            parser.error(f'project does not exist: {project}')
        root = args.workspace.resolve() if args.workspace else (Path.home() / '.minecraft-dev-kit' / 'runs' / new_run_id())
        if root == project or root.is_relative_to(project) or project.is_relative_to(root):
            parser.error('workspace and source project must be disjoint')
        if root.exists() and any(root.iterdir()):
            parser.error(f'workspace already contains data; use resume: {root}')
        root.mkdir(parents=True, exist_ok=True)
        cell = {'id': f'mc-{args.minecraft}-{args.loader}', 'minecraft': args.minecraft, 'loader': args.loader,
                'java': args.java, 'java_path': str(args.java_path.resolve()) if args.java_path else '', 'primary': True}
        # Validate path-bearing identity before any worker invocation.
        from northpoint_job_runner import normalized_cell
        cell = normalized_cell(cell)
        atomic_json(root / 'intake.json', inspect_project(project))
        atomic_json(root / 'manifest.json', {'schema_version': 1, 'project_root': str(project),
                    'primary_cell': cell['id'], 'cells': [cell], 'config': {'zero_loss': True}})
        return run_workspace(root, args.timeout)
    root = args.workspace.resolve()
    if args.command == 'resume':
        return run_workspace(root, args.timeout, proofs=args.runtime_proofs)
    if args.command == 'status':
        print(json.dumps(status(root), indent=2))
        return 0
    if args.command == 'package':
        print(json.dumps(package(root, args.output), indent=2))
        return 0
    return 2


if __name__ == '__main__':
    try:
        raise SystemExit(main())
    except (OSError, ValueError, RuntimeError, KeyError) as exc:
        print(json.dumps({'status': 'ERROR', 'reason': str(exc)}, indent=2), file=sys.stderr)
        raise SystemExit(1)
