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

from devkit_toolchains import ensure_jdk, java_pair, target_java
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
    native_path = root / 'native' / 'native-result.json'
    native = load(native_path) if native_path.is_file() else None
    if native:
        native = dict(native)
        native['artifact_match'] = any(c['artifact'] and c['artifact']['integrity_verified'] and
             c['artifact']['sha256'] == native.get('artifact_sha256') for c in cells)
        if not native['artifact_match']:
            native['state'] = 'stale-proof'
    return {'schema_version': 1, 'workspace': str(root), 'project': manifest['project_root'],
            'cells': cells, 'last_run': (state.get('runs') or [None])[-1], 'native_runtime': native,
            'all_passed': bool(cells) and all(c['state'] == 'passed' and
                           c['artifact'] and c['artifact']['integrity_verified'] for c in cells)}



def run_workspace(root: Path, timeout: int, *, proofs: Path | None = None, offline: bool = False) -> int:
    with workspace_lock(root):
        manifest = load(root / 'manifest.json')
        source = Path(manifest['project_root']).resolve()
        if not source.is_dir():
            raise ValueError(f'source project is unavailable; saved work was preserved: {source}')
        # Legacy manifests keep their already verified JDK unless it is unavailable.
        for cell in manifest['cells']:
            pinned = Path(cell['java_path']) if cell.get('java_path') else None
            jdk = ensure_jdk(int(cell['java']), explicit=pinned if pinned and pinned.is_file() else None, offline=offline)
            cell['java_path'] = jdk['java_path']
        atomic_json(root / 'manifest.json', manifest)
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
        # Include native proof plus the exact external dependency JARs that were
        # actually used. Keep source trees, account data and download caches out.
        native = root / 'native'
        if native.is_dir():
            for name in ['native-result.json', 'dependencies/dependency-lock.json',
                         'dependencies/provider-compatibility.json']:
                path = native / name
                if path.is_file(): files.add(path)
            dependency_lock = native / 'dependencies/dependency-lock.json'
            if dependency_lock.is_file():
                for row in load(dependency_lock).get('downloads', []):
                    path = native / 'dependencies/mods' / row['file']
                    if not path.is_file() or sha256_file(path) != row['sha256']:
                        raise ValueError('runtime dependency changed or missing: ' + row['file'])
                    files.add(path)
            for path in (native / 'runs').rglob('*') if (native / 'runs').is_dir() else []:
                if path.is_file() and ('commands' in path.parts or
                    (path.name in {'latest.log','debug.log','devkit-runtime-proof.json','template-origin.json'}) or
                    (path.name.startswith('devkit-') and path.suffix == '.png')):
                    files.add(path)
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
                'native_runtime records separately scoped world/render/sync/save-reopen proof, not exhaustive gameplay.\n'
                'Install the candidate with ALL JARs in native/dependencies/mods for the recorded target.\n'
                'Original embedded dependencies are preserved; Fabric selects the compatible external versions.\n'
                'Private source projects, account data and Gradle caches are not included.\n')
        return {'package': str(output), 'sha256': sha256_file(output), 'size': output.stat().st_size,
                'file_count': len(files), 'all_passed': snapshot['all_passed']}


def wizard() -> int:
    """Interactive front door over the same tested CLI operations."""
    print('Minecraft Dev Kit | Build, recover, verify and package')
    print('1. Convert a source project   2. Resume a workspace   3. Set up Java   4. Inspect prerequisites')
    try:
        choice = input('Choose [1]: ').strip() or '1'
        if choice == '4': return main(['doctor'])
        if choice == '3':
            target = input('Minecraft version [26.3]: ').strip() or '26.3'
            return main(['setup', '--minecraft', target])
        if choice == '2':
            workspace = Path(input('Saved workspace folder: ').strip().strip('"')).expanduser().resolve()
            return main(['resume', '--workspace', str(workspace)])
        if choice != '1': raise ValueError('Choose 1, 2, 3 or 4')
        project = Path(input('Source project folder (you may drag it here): ').strip().strip('"')).expanduser().resolve()
        info = inspect_project(project)
        print('Detected:', info.get('mod_id') or project.name, '|', info.get('loader') or 'unknown loader', '| Minecraft', info.get('minecraft'))
        target = input('Target Minecraft version [26.3]: ').strip() or '26.3'
        suggested = info.get('loader') or 'fabric'
        loader = input(f'Target loader [{suggested}]: ').strip() or suggested
        workspace = Path.home() / '.minecraft-dev-kit/runs' / new_run_id()
        arguments = ['convert', '--project', str(project), '--minecraft', target, '--loader', loader,
                     '--workspace', str(workspace)]
        if loader == 'fabric' and target == '26.3':
            if (input('Also run native Minecraft, resolve dependencies and verify save/reopen? [Y/n]: ').strip().lower() or 'y') in {'y','yes'}:
                arguments.append('--verify')
        print('Your original source will remain untouched. Workspace:', workspace)
        code = main(arguments)
        snapshot = status(workspace)
        if any(c.get('artifact') and c['artifact']['integrity_verified'] for c in snapshot['cells']):
            output = workspace.parent / (workspace.name + '-candidate-and-evidence.zip')
            print(json.dumps(package(workspace, output), indent=2))
        return code
    except (EOFError, KeyboardInterrupt):
        print('Cancelled. Any already-created workspace is preserved.')
        return 130


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command', required=True)
    doctor = sub.add_parser('doctor', help='Inspect installed build prerequisites without changing them')
    doctor.add_argument('--java-path', type=Path)
    setup = sub.add_parser('setup', help='Provision and verify a private JDK; no administrator or PATH changes')
    setup.add_argument('--minecraft', default='26.3')
    setup.add_argument('--java', type=int)
    setup.add_argument('--offline', action='store_true')
    setup.add_argument('--managed-only', action='store_true')
    setup.add_argument('--refresh', action='store_true')
    deps = sub.add_parser('dependencies', help='Audit or install the exact-target required Fabric dependency closure')
    deps.add_argument('--jar', type=Path, action='append', required=True)
    deps.add_argument('--minecraft', required=True)
    deps.add_argument('--java', type=int)
    deps.add_argument('--loader-version', required=True)
    deps.add_argument('--output', type=Path, required=True)
    deps.add_argument('--audit-only', action='store_true')
    deps.add_argument('--offline', action='store_true')
    deps.add_argument('--projects', type=Path, help='JSON map of mod IDs to exact Modrinth project IDs')
    verify_parser = sub.add_parser('verify', help='Launch the exact Fabric 26.3 JAR; verify world, network and save/reopen')
    verify_parser.add_argument('--jar', type=Path, required=True)
    verify_parser.add_argument('--workspace', type=Path, required=True)
    verify_parser.add_argument('--template', type=Path)
    verify_parser.add_argument('--java-path', type=Path)
    verify_parser.add_argument('--offline', action='store_true')
    verify_parser.add_argument('--timeout', type=int, default=900)
    convert = sub.add_parser('convert', help='Build/convert through the real production engine; retain all evidence')
    convert.add_argument('--project', type=Path, required=True)
    convert.add_argument('--minecraft', required=True)
    convert.add_argument('--loader', choices=['fabric', 'forge', 'neoforge', 'quilt'], required=True)
    convert.add_argument('--java', type=int, help='Inferred from Minecraft when omitted')
    convert.add_argument('--offline', action='store_true')
    convert.add_argument('--java-path', type=Path)
    convert.add_argument('--workspace', type=Path)
    convert.add_argument('--timeout', type=int, default=600)
    convert.add_argument('--verify', action='store_true', help='Also run the native Fabric 26.3 world and persistence gate')
    resume = sub.add_parser('resume', help='Reuse exact-hash candidates; rebuild only invalidated inputs')
    resume.add_argument('--workspace', type=Path, required=True)
    resume.add_argument('--timeout', type=int, default=600)
    resume.add_argument('--runtime-proofs', type=Path)
    resume.add_argument('--offline', action='store_true')
    inspect = sub.add_parser('status', help='Read actual state and re-hash the saved candidate')
    inspect.add_argument('--workspace', type=Path, required=True)
    pack = sub.add_parser('package', help='Package real candidates, hashes and evidence without caches')
    pack.add_argument('--workspace', type=Path, required=True)
    pack.add_argument('--output', type=Path, required=True)
    sub.add_parser('wizard', help='Guided conversion, resume and setup without memorizing commands')
    args = parser.parse_args(argv)
    if hasattr(args, 'timeout') and args.timeout <= 0:
        parser.error('--timeout must be positive')
    if args.command == 'wizard':
        return wizard()
    if args.command == 'verify':
        from devkit_native import verify
        result = verify(args.jar, args.workspace, template=args.template, java_path=args.java_path,
                        timeout=args.timeout, offline=args.offline)
        print(json.dumps(result, indent=2))
        return 0 if result['state'] == 'runtime-smoke-verified' else 2
    if args.command == 'setup':
        jdk = ensure_jdk(args.java or target_java(args.minecraft), offline=args.offline,
                         managed_only=args.managed_only, refresh=args.refresh)
        print(json.dumps(dict(jdk, status='READY', minecraft=args.minecraft), indent=2))
        return 0
    if args.command == 'dependencies':
        from devkit_dependencies import audit, resolve
        version = args.java or target_java(args.minecraft)
        if args.audit_only:
            result = audit(args.jar, minecraft=args.minecraft, java=version, loader_version=args.loader_version)
            atomic_json(args.output.resolve() / 'dependency-audit.json', result)
        else:
            result = resolve(args.jar, args.output, minecraft=args.minecraft, java=version,
                             loader_version=args.loader_version, offline=args.offline,
                             projects=load(args.projects) if args.projects else None)
        print(json.dumps(result, indent=2))
        return 0 if result['state'] == 'complete' else 2
    if args.command == 'doctor':
        java = args.java_path or (Path(shutil.which('java')) if shutil.which('java') else None)
        pair = java_pair(java) if java else None
        print(json.dumps({'python': sys.version.split()[0], 'python_executable': sys.executable,
                          'jdk': pair, 'git': shutil.which('git'), 'production_driver': str(DRIVER),
                          'production_driver_sha256': sha256_file(DRIVER),
                          'next_action': None if pair else 'Run devkit setup --minecraft <target>'}, indent=2))
        return 0 if pair else 2
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
        major = args.java or target_java(args.minecraft)
        jdk = ensure_jdk(major, explicit=args.java_path, offline=args.offline)
        atomic_json(root / 'toolchain.json', jdk)
        cell = {'id': f'mc-{args.minecraft}-{args.loader}', 'minecraft': args.minecraft, 'loader': args.loader,
                'java': major, 'java_path': jdk['java_path'], 'primary': True}
        # Validate path-bearing identity before any worker invocation.
        from northpoint_job_runner import normalized_cell
        cell = normalized_cell(cell)
        atomic_json(root / 'intake.json', inspect_project(project))
        atomic_json(root / 'manifest.json', {'schema_version': 1, 'project_root': str(project),
                    'primary_cell': cell['id'], 'cells': [cell], 'config': {'zero_loss': True}})
        code = run_workspace(root, args.timeout, offline=args.offline)
        if args.verify:
            if args.minecraft != '26.3' or args.loader != 'fabric':
                print('This native automation targets Fabric 26.3. Candidate retained for its loader-specific runtime gate.',file=sys.stderr)
                return 2
            snapshot = status(root)
            cells = snapshot.get('cells', [])
            if not cells or not (cells[0].get('artifact') or {}).get('integrity_verified'): return code or 2
            from devkit_native import verify
            result = verify(Path(cells[0]['artifact']['path']), root/'native', timeout=args.timeout,
                            offline=args.offline, java_path=Path(jdk['java_path']))
            print(json.dumps(result, indent=2))
            return 0 if result['state'] == 'runtime-smoke-verified' else 2
        return code
    root = args.workspace.resolve()
    if args.command == 'resume':
        return run_workspace(root, args.timeout, proofs=args.runtime_proofs, offline=args.offline)
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
