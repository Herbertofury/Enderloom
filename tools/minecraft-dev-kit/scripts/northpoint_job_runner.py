#!/usr/bin/env python3
from __future__ import annotations
import argparse, concurrent.futures, hashlib, json, os, pathlib, shutil, subprocess, sys, tempfile, time
from dataclasses import dataclass
from northpoint_compose import inventory

STATE_SCHEMA = 1
FINAL_STATES = {'passed', 'blocked', 'runtime-unverified', 'failed', 'cancelled'}
REUSABLE_STATES = {'passed', 'blocked', 'runtime-unverified'}


def sha256_file(path: pathlib.Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def atomic_json(path: pathlib.Path, value: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(prefix=path.name + '.', suffix='.tmp', dir=str(path.parent))
    os.close(fd)
    try:
        pathlib.Path(tmp).write_text(json.dumps(value, indent=2, sort_keys=True) + '\n', encoding='utf-8')
        os.replace(tmp, path)
    finally:
        pathlib.Path(tmp).unlink(missing_ok=True)


def now() -> str:
    return time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())


def load_json(path: pathlib.Path) -> dict:
    return json.loads(path.read_text(encoding='utf-8'))


def normalized_cell(cell: dict) -> dict:
    return {
        'id': str(cell['id']),
        'minecraft': str(cell['minecraft']),
        'loader': str(cell['loader']),
        'java': int(cell.get('java') or 0),
        'support_state': str(cell.get('support_state') or 'stable'),
        'primary': bool(cell.get('primary')),
    }


def driver_probe(driver: pathlib.Path, cell: dict, project: pathlib.Path, work_root: pathlib.Path, timeout: int) -> dict:
    probe_root = work_root / '.probe' / str(cell['id'])
    probe_root.mkdir(parents=True, exist_ok=True)
    cell_file = probe_root / 'cell.json'
    cell_file.write_text(json.dumps(cell, indent=2) + '\n', encoding='utf-8')
    if driver.suffix.lower() == '.py':
        cmd = [sys.executable, str(driver), '--probe', '--cell-json', str(cell_file), '--project', str(project)]
    else:
        cmd = [str(driver), '--probe', '--cell-json', str(cell_file), '--project', str(project)]
    try:
        cp = subprocess.run(cmd, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=min(timeout, 45))
    except Exception as exc:
        return {'protocol': 1, 'available': False, 'probe_error': type(exc).__name__}
    if cp.returncode != 0:
        # Backward-compatible drivers simply do not participate in environment
        # invalidation; their file hash still remains part of the fingerprint.
        return {'protocol': 0, 'available': False}
    lines = [line.strip() for line in cp.stdout.splitlines() if line.strip()]
    if not lines:
        return {'protocol': 0, 'available': False}
    try:
        value = json.loads(lines[-1])
    except Exception:
        return {'protocol': 0, 'available': False}
    return value if isinstance(value, dict) else {'protocol': 0, 'available': False}


def fingerprint(project: pathlib.Path, cell: dict, driver: pathlib.Path, config: dict, probe: dict) -> str:
    inv = inventory(project, cell)
    driver_sha = sha256_file(driver)
    payload = {
        'compose': inv['sha256'],
        'driver_sha256': driver_sha,
        'cell': normalized_cell(cell),
        'config': config,
        'driver_probe': probe,
    }
    return hashlib.sha256(json.dumps(payload, sort_keys=True, separators=(',', ':')).encode()).hexdigest()


def artifact_ok(record: dict, release_dir: pathlib.Path) -> bool:
    artifact = record.get('artifact') or {}
    rel = artifact.get('file')
    expected = artifact.get('sha256')
    if not rel or not expected:
        return False
    path = release_dir / rel
    return path.is_file() and sha256_file(path) == expected


def load_state(path: pathlib.Path, manifest: dict) -> dict:
    if path.exists():
        state = load_json(path)
        if state.get('schema_version') == STATE_SCHEMA:
            return state
    return {
        'schema_version': STATE_SCHEMA,
        'created_at': now(),
        'updated_at': now(),
        'primary_cell': manifest['primary_cell'],
        'cells': {},
        'runs': [],
    }


def driver_command(driver: pathlib.Path, cell_file: pathlib.Path, project: pathlib.Path, work: pathlib.Path, output: pathlib.Path) -> list[str]:
    if driver.suffix.lower() == '.py':
        return [sys.executable, str(driver), '--cell-json', str(cell_file), '--project', str(project), '--work', str(work), '--output', str(output)]
    return [str(driver), '--cell-json', str(cell_file), '--project', str(project), '--work', str(work), '--output', str(output)]


def run_driver(driver: pathlib.Path, cell: dict, project: pathlib.Path, work_root: pathlib.Path, release_dir: pathlib.Path, timeout: int) -> dict:
    cid = cell['id']
    work = work_root / cid
    if work.exists():
        shutil.rmtree(work)
    work.mkdir(parents=True, exist_ok=True)
    cell_file = work / 'cell.json'
    cell_file.write_text(json.dumps(cell, indent=2) + '\n', encoding='utf-8')
    raw_output = work / 'driver-output'
    raw_output.mkdir(parents=True, exist_ok=True)
    cp = subprocess.run(driver_command(driver, cell_file, project, work, raw_output), text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=timeout)
    if cp.returncode != 0:
        return {'state': 'failed', 'reason': (cp.stderr.strip() or cp.stdout.strip() or f'driver exited {cp.returncode}')[-12000:], 'evidence': []}
    lines = [line.strip() for line in cp.stdout.splitlines() if line.strip()]
    if not lines:
        return {'state': 'failed', 'reason': 'driver emitted no JSON receipt', 'evidence': []}
    try:
        result = json.loads(lines[-1])
    except Exception as exc:
        return {'state': 'failed', 'reason': f'driver receipt invalid JSON: {exc}: {lines[-1][:500]}', 'evidence': []}
    state = str(result.get('state') or 'failed')
    if state != 'passed':
        return {'state': state, 'reason': result.get('reason') or f'driver returned {state}', 'evidence': result.get('evidence') or []}
    artifact = pathlib.Path(str(result.get('artifact') or ''))
    if not artifact.is_absolute():
        artifact = raw_output / artifact
    artifact = artifact.resolve()
    root = raw_output.resolve()
    if artifact != root and root not in artifact.parents:
        return {'state': 'failed', 'reason': 'driver artifact escaped output root', 'evidence': []}
    if not artifact.is_file():
        return {'state': 'failed', 'reason': f'driver artifact missing: {artifact}', 'evidence': []}
    release_dir.mkdir(parents=True, exist_ok=True)
    suffix = ''.join(artifact.suffixes) or '.bin'
    name = f"{cid}{suffix}"
    tmp = release_dir / (name + '.tmp')
    shutil.copy2(artifact, tmp)
    final = release_dir / name
    os.replace(tmp, final)
    return {
        'state': 'passed',
        'reason': None,
        'artifact': {'file': name, 'sha256': sha256_file(final), 'size': final.stat().st_size},
        'evidence': result.get('evidence') or [],
        'driver_stdout_tail': '\n'.join(lines[-20:]),
    }


def write_release_outputs(state: dict, release_dir: pathlib.Path) -> None:
    rows = []
    sums = []
    for cid, rec in sorted(state['cells'].items()):
        artifact = rec.get('artifact') or {}
        row = {'cell_id': cid, 'state': rec.get('state'), 'fingerprint': rec.get('fingerprint'), 'artifact': artifact, 'reason': rec.get('reason')}
        rows.append(row)
        if rec.get('state') == 'passed' and artifact.get('file') and artifact.get('sha256'):
            sums.append(f"{artifact['sha256']}  {artifact['file']}")
    atomic_json(release_dir / 'release-matrix.json', {'schema_version': 1, 'generated_at': now(), 'cells': rows})
    (release_dir / 'SHA256SUMS.txt').write_text('\n'.join(sums) + ('\n' if sums else ''), encoding='utf-8')


def main() -> int:
    p = argparse.ArgumentParser(description='Run a resumable Northpoint target-first conversion matrix.')
    p.add_argument('--manifest', type=pathlib.Path, required=True)
    p.add_argument('--driver', type=pathlib.Path, required=True)
    p.add_argument('--state-dir', type=pathlib.Path, required=True)
    p.add_argument('--max-workers', type=int, default=0)
    p.add_argument('--timeout', type=int, default=180)
    args = p.parse_args()
    manifest = load_json(args.manifest.resolve())
    project = pathlib.Path(manifest['project_root']).resolve()
    driver = args.driver.resolve()
    state_dir = args.state_dir.resolve()
    release_dir = state_dir / 'release'
    work_root = state_dir / 'work'
    state_path = state_dir / 'session.json'
    cells = {str(c['id']): normalized_cell(c) for c in manifest['cells']}
    primary_id = str(manifest['primary_cell'])
    if primary_id not in cells:
        raise SystemExit('primary_cell is not in cells')
    cells[primary_id]['primary'] = True
    state = load_state(state_path, manifest)
    config = manifest.get('config') or {}
    run = {'started_at': now(), 'built': [], 'reused': [], 'failed': [], 'blocked': []}

    probes = {cid: driver_probe(driver, cell, project, work_root, args.timeout) for cid, cell in cells.items()}
    fps = {cid: fingerprint(project, cell, driver, config, probes[cid]) for cid, cell in cells.items()}
    for cid, cell in cells.items():
        rec = state['cells'].setdefault(cid, {'state': 'pending', 'attempts': 0, 'fingerprint': None, 'artifact': None, 'evidence': [], 'reason': None})
        if rec.get('fingerprint') != fps[cid]:
            rec.update({'state': 'stale' if rec.get('state') == 'passed' else 'pending', 'fingerprint': fps[cid], 'reason': 'inputs changed', 'artifact': rec.get('artifact')})
        elif rec.get('state') == 'passed' and not artifact_ok(rec, release_dir):
            rec.update({'state': 'stale', 'reason': 'promoted artifact missing or hash mismatch'})
    state['updated_at'] = now()
    atomic_json(state_path, state)

    def execute(cid: str) -> tuple[str, dict, bool]:
        rec = state['cells'][cid]
        if rec.get('fingerprint') == fps[cid] and rec.get('state') in REUSABLE_STATES:
            if rec.get('state') != 'passed' or artifact_ok(rec, release_dir):
                return cid, rec, False
        rec['state'] = 'building'; rec['attempts'] = int(rec.get('attempts') or 0) + 1; rec['reason'] = None
        result = run_driver(driver, cells[cid], project, work_root, release_dir, args.timeout)
        rec.update(result); rec['fingerprint'] = fps[cid]; rec['updated_at'] = now()
        return cid, rec, True

    cid, rec, built = execute(primary_id)
    (run['built'] if built else run['reused']).append(cid)
    atomic_json(state_path, state)
    if rec.get('state') != 'passed':
        (run['blocked'] if rec.get('state') in {'blocked', 'runtime-unverified'} else run['failed']).append(primary_id)
        run['finished_at'] = now(); state['runs'].append(run); state['updated_at'] = now(); atomic_json(state_path, state); write_release_outputs(state, release_dir)
        print(json.dumps({'status': 'FAILED_PRIMARY', 'run': run, 'state_file': str(state_path), 'release_dir': str(release_dir)}))
        return 2

    secondaries = [cid for cid in sorted(cells) if cid != primary_id]
    auto_workers = max(1, min(8, max(1, (os.cpu_count() or 2) - 1)))
    workers = args.max_workers if args.max_workers > 0 else auto_workers
    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as pool:
        futures = {pool.submit(execute, cid): cid for cid in secondaries}
        for fut in concurrent.futures.as_completed(futures):
            cid, rec, built = fut.result()
            (run['built'] if built else run['reused']).append(cid)
            if rec.get('state') == 'passed':
                pass
            elif rec.get('state') in {'blocked', 'runtime-unverified'}:
                run['blocked'].append(cid)
            else:
                run['failed'].append(cid)
            atomic_json(state_path, state)

    run['built'].sort(); run['reused'].sort(); run['failed'].sort(); run['blocked'].sort(); run['finished_at'] = now()
    state['runs'].append(run); state['updated_at'] = now(); atomic_json(state_path, state)
    write_release_outputs(state, release_dir)
    status = 'PASS' if not run['failed'] and not run['blocked'] else 'PARTIAL'
    print(json.dumps({'status': status, 'run': run, 'state_file': str(state_path), 'release_dir': str(release_dir)}))
    return 0 if status == 'PASS' else 3

if __name__ == '__main__':
    raise SystemExit(main())