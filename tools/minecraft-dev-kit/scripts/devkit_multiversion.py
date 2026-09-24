#!/usr/bin/env python3
"""Real Stonecutter workspaces, shared edits and isolated native target builds.

Generation preserves source variants; only the real Gradle plugin preprocesses them.
Source generation is never a compatibility claim. Each target owns its build proof.
"""
from __future__ import annotations
import argparse
import difflib
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import subprocess
import sys
import tempfile
import zipfile
from typing import Any

from northpoint_execution import atomic_json, new_run_id, run_logged, sha256_file, workspace_lock
from devkit_toolchains import cache_home, download_verified, ensure_jdk, safe_extract, target_java

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = 'multiversion.json'
STONECUTTER = '0.9.8'
GRADLE = '9.6.0'
SKIP = {'.git', '.gradle', '.idea', '__pycache__', '.northpoint', 'build', 'out', 'run', 'runs', 'node_modules', 'devkit-evidence'}
SECRET_NAMES = {'.env', 'credentials.json', 'launcher_accounts.json', 'accounts.json', 'secrets.json'}
TOKEN = re.compile(r'"""[\s\S]*?"""|"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'|//[^\n]*|/\*[\s\S]*?\*/|[\w$]+|>>>?=?|<<=?|\+\+|--|&&|\|\||==|!=|<=|>=|->|::|\+=|-=|\*=|/=|\S')


def read(path: Path) -> dict:
    value = json.loads(path.read_text(encoding='utf-8'))
    if not isinstance(value, dict):
        raise ValueError(f'expected a JSON object: {path}')
    return value


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def code_hash(data: bytes) -> str:
    tokens = [m[0] for m in TOKEN.finditer(data.decode('utf-8')) if not m[0].startswith(('//', '/*'))]
    return sha(json.dumps(tokens, ensure_ascii=False).encode('utf-8'))


def safe(root: Path, relative: str) -> Path:
    p = PurePosixPath(relative)
    if not relative or p.is_absolute() or '..' in p.parts or '\\' in relative or ':' in relative or '\0' in relative:
        raise ValueError('unsafe workspace path: ' + relative)
    result = (root / relative).resolve()
    if result == root.resolve() or not result.is_relative_to(root.resolve()):
        raise ValueError('path escapes workspace: ' + relative)
    return result


def target_id(minecraft: str, loader: str) -> str:
    if not re.fullmatch(r'[0-9][A-Za-z0-9.+_-]*', minecraft) or loader not in {'fabric', 'forge', 'neoforge', 'quilt'}:
        raise ValueError('invalid Minecraft version or loader')
    return f'{minecraft}-{loader}'


def selector(cid: str) -> str:
    return 'sc_' + sha(cid.encode())[:16]


def inventory(root: Path, *, skip_generated: bool=True) -> dict[str, bytes]:
    """Retain source-owned files, including buildSrc and nested native dependencies."""
    result = {}
    for base, dirs, files in os.walk(root):
        for name in dirs:
            if (Path(base) / name).is_symlink():
                raise ValueError('source symlink requires explicit import: ' + str(Path(base) / name))
        protected = not skip_generated or 'src' in Path(base).relative_to(root).parts
        dirs[:] = sorted(d for d in dirs if protected or d not in SKIP)
        for name in sorted(files):
            path = Path(base) / name
            if path.is_symlink():
                raise ValueError('source symlink requires explicit import: ' + str(path))
            if name.lower() in SECRET_NAMES or name.lower().endswith(('.pem', '.key', '.p12', '.pfx')):
                raise ValueError('private credential file must not be exported: ' + str(path))
            rel = path.relative_to(root).as_posix()
            safe(root, rel)
            data = path.read_bytes()
            if name.endswith('.properties') and re.search(rb'(?im)^\s*[^#\n]*(?:password|token|secret)\s*[=:]\s*\S+', data):
                raise ValueError('credential-bearing properties must use environment variables: ' + str(path))
            result[rel] = data
    folded = [p.casefold() for p in result]
    if len(set(folded)) != len(folded):
        raise ValueError('case-colliding source paths are not portable to Windows')
    return result


def file_record(data: bytes, path: str) -> dict:
    row = {'sha256': sha(data), 'size': len(data)}
    if b'\r\n' in data and data.count(b'\n') == data.count(b'\r\n') and data.count(b'\r') == data.count(b'\r\n'):
        row['line_endings']='crlf'
    elif b'\r' not in data:row['line_endings']='lf'
    else:row['line_endings']='mixed'
    if path.endswith(('.java', '.kt')):
        try: row['code_sha256'] = code_hash(data)
        except UnicodeError: pass
    return row


def merge_code(variants: dict[str, bytes], active: str) -> bytes | None:
    """Share equal spans and preserve only divergent hunks behind exact constants.

    Comment/text-block/nested-preprocessor edge cases use exact file overlays rather
    than lossy escaping. No regex is allowed to rewrite program semantics here.
    """
    try: text = {cid: data.decode('utf-8').replace('\r\n','\n') for cid, data in variants.items()}
    except UnicodeError: return None
    if any('\r' in t or '//?' in t or '"""' in t or (t and not t.endswith('\n')) for t in text.values()): return None
    base = text[active].splitlines(keepends=True)
    edits = {}
    intervals = []
    for cid, value in text.items():
        lines = value.splitlines(keepends=True)
        changes = [(i,j,lines[a:b]) for tag,i,j,a,b in difflib.SequenceMatcher(None, base, lines, autojunk=False).get_opcodes() if tag != 'equal']
        edits[cid] = changes
        intervals.extend((i,j) for i,j,_ in changes)
    # Never insert directive comments inside an existing block comment.
    offsets=[0]
    for line in base:offsets.append(offsets[-1]+len(line))
    comment_spans=[(m.start(),m.end()) for m in TOKEN.finditer(text[active]) if m[0].startswith('/*')]
    if any(a < offsets[i] < b or a < offsets[j] < b for i,j in intervals for a,b in comment_spans):return None
    groups = []
    for start,end in sorted(intervals):
        if groups and start <= groups[-1][1]: groups[-1] = (groups[-1][0], max(end, groups[-1][1]))
        else: groups.append((start,end))
    output = []; cursor = 0
    for start,end in groups:
        output.extend(base[cursor:start]); alternatives = {}
        for cid in variants:
            content = []; pos = start
            for i,j,replacement in edits[cid]:
                if start <= i <= end and j <= end:
                    content.extend(base[pos:i]); content.extend(replacement); pos = j
            content.extend(base[pos:end]); alternatives[cid] = ''.join(content)
        if any('/*' in t or '*/' in t for t in alternatives.values()): return None
        order = [active] + sorted(cid for cid in variants if cid != active)
        for index,cid in enumerate(order):
            output.append(('//? if ' if index == 0 else '//?} else if ') + selector(cid) + ' {\n')
            content = alternatives[cid]
            output.append(content if cid == active or not content else '/*' + content[:-1] + '*/\n')
        output.append('//?}\n'); cursor = end
    output.extend(base[cursor:])
    return ''.join(output).encode('utf-8')


def flatten_generated(data: bytes, cid: str) -> bytes:
    """Remove only our own already-processed directives when importing a new target.

    Actual Stonecutter has already selected the active source; original comments
    outside divergent hunks survive. This is not a replacement preprocessor.
    """
    text = data.decode('utf-8').replace('\r\n','\n')
    marker = re.compile(r'(?m)^[ \t]*(?:\*/)?//\?\s*(if (sc_[a-f0-9]{16}) \{|\} else if (sc_[a-f0-9]{16}) \{|\})[ \t]*\n?')
    out=[]; pos=0; included=True; inside=False
    for m in marker.finditer(text):
        if included: out.append(text[pos:m.start()])
        if m[2]: inside=True; included=m[2] == selector(cid)
        elif m[3]: included=m[3] == selector(cid)
        elif inside: included=True; inside=False
        else: out.append(m[0])
        pos=m.end()
    if included: out.append(text[pos:])
    return ''.join(out).encode('utf-8')


def put(root: Path, rel: str, data: bytes) -> None:
    p = safe(root,rel); p.parent.mkdir(parents=True, exist_ok=True); p.write_bytes(data)
    if p.name in {'gradlew','devkit.sh','build-all.sh'}: p.chmod(0o755)


def write_scaffold(root: Path, manifest: dict) -> None:
    ids = list(manifest['targets']); active = manifest['active']
    quote = json.dumps
    settings = '''pluginManagement { repositories { gradlePluginPortal(); maven("https://maven.kikugie.dev/releases") } }
plugins { id("dev.kikugie.stonecutter") version "STONECUTTER" }
stonecutter {
    kotlinController = true
    create(rootProject) {
VERSIONS
        vcsVersion = ACTIVE
    }
}
rootProject.name = "enderloom-multiversion"
'''.replace('STONECUTTER',STONECUTTER).replace('VERSIONS','\n'.join('        version('+quote(cid)+', '+quote(row['minecraft'])+')' for cid,row in manifest['targets'].items())).replace('ACTIVE',quote(active))
    controller = 'plugins { id("dev.kikugie.stonecutter") }\nstonecutter active '+quote(active)+'\nstonecutter parameters {\n'
    controller += '\n'.join('    constants['+quote(selector(cid))+'] = current.project == '+quote(cid) for cid in ids)
    controller += '\n    constants.match(current.project.substringAfterLast(\'-\'), "fabric", "forge", "neoforge", "quilt")\n}\n'
    controller += 'tasks.register("buildAll") { dependsOn('+', '.join(quote(':'+cid+':nativeBuild') for cid in ids)+') }\n'
    sets=sorted({PurePosixPath(p).parts[1] for p in manifest['shared_files'] if p.startswith('src/') and len(PurePosixPath(p).parts)>2})
    build='''plugins { java }
// The outer project owns preprocessing; native builds keep their own wrappers,
// loader plugins and dependency graphs, avoiding cross-version plugin conflicts.
SETS
val generated = tasks.named("stonecutterGenerate")
tasks.register<Exec>("nativeBuild") {
    dependsOn(generated)
    workingDir(rootDir)
    val python = System.getenv("DEVKIT_PYTHON") ?: if (System.getProperty("os.name").startsWith("Windows")) "python" else "python3"
    commandLine(python, rootProject.file(".devkit/worker/scripts/devkit_multiversion.py"),
        "_native-build", "--workspace", rootDir, "--target", project.name)
}
tasks.named("build") { setDependsOn(listOf("nativeBuild")) }
'''
    build=build.replace('SETS','\n'.join(
        'sourceSets.maybeCreate('+quote(name)+')\nsourceSets.named('+quote(name)+') { java.srcDir(rootProject.file('+quote('src/'+name+'/kotlin')+')) }' for name in sets))
    generated_files={'settings.gradle.kts':settings, 'stonecutter.gradle.kts':controller,'build.gradle.kts':build,
      'gradle.properties':'org.gradle.jvmargs=-Xmx1G\norg.gradle.parallel=false\norg.gradle.caching=true\n',
      'build-all.sh':'#!/bin/sh\nset -eu\nROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)\nexec sh "$ROOT/.devkit/worker/devkit.sh" matrix-build --workspace "$ROOT" "$@"\n',
      'build-all.cmd':'@echo off\r\ncall "%~dp0.devkit\\worker\\devkit.cmd" matrix-build --workspace "%~dp0." %*\r\nexit /b %errorlevel%\r\n',
      '.gitignore':'.gradle/\nversions/\n.devkit/materialized/\n.devkit/runs/\n.devkit/logs/\n.devkit/locks/\n.devkit/build-results.json\n',
      'START-HERE.md':'''# Reusable Stonecutter conversion project

Edit `src/` once. Version differences are real Stonecutter conditions, with only
non-mergeable source/resource differences in `overrides/<target>/`.
Each `targets/<target>/build/` retains that version's full native build setup,
dependencies, mappings, access rules and Gradle wrapper. Do not replace them with
one guessed universal dependency version.

Run `build-all.cmd` on Windows or `sh build-all.sh` on Linux/macOS.
Use `--target VERSION-LOADER` to build one target; repeat it for a subset.
Add `--verify` for the existing Fabric 26.3 native world/restart probe.
Java and the exact outer Gradle are provisioned privately. `--offline` reuses caches.
The real Stonecutter plugin runs before the preserved native build for each target.

To import another completed native port without restarting the shared project:
`.devkit/worker/devkit.cmd matrix-add --workspace . --project NEW_NATIVE_SOURCE --minecraft VERSION --loader LOADER`
This preprocesses every existing target before factoring in the new variant. All
current shared-source and per-target build edits are carried forward. A backup is
retained. Custom edits to generated coordinator scripts require an explicit merge;
they are never silently overwritten.

`multiversion.json` records source provenance, file parity and exact target identities.
`.devkit/build-results.json` records each actual target result, JAR hash and proof.
Adding a target is not proof that an arbitrary Minecraft API is compatible. New
semantic migrations still need the converter/adapter and that target's native QA.
The original input source folders are never modified. No external provider, GitHub
or account credential is embedded in this workspace.
'''}
    manifest['scaffold_hashes']={}
    for name,text in generated_files.items():
        data=text.encode('utf-8'); put(root,name,data);manifest['scaffold_hashes'][name]=sha(data)
    worker=root/'.devkit/worker';worker.mkdir(parents=True,exist_ok=True)
    for folder in ['scripts','references']:
        source=ROOT/folder
        for base,dirs,files in os.walk(source):
            dirs[:]=[d for d in dirs if d not in SKIP]
            for name in files:
                if name.endswith('.pyc'):continue
                p=Path(base)/name;put(worker,p.relative_to(ROOT).as_posix(),p.read_bytes())
    for name in ['devkit.cmd','devkit.sh','bootstrap.ps1']:
        if (ROOT/name).is_file():put(worker,name,(ROOT/name).read_bytes())


def export_project(variants: list[dict], output: Path, *, active: str | None=None, provenance: dict | None=None) -> dict:
    """Atomically factor native source variants into a portable, buildable project."""
    output=output.resolve(); specs={}; sources={}
    for item in variants:
        cid=target_id(item['minecraft'],item['loader'])
        if cid in specs:raise ValueError('duplicate target: '+cid)
        project=Path(item['project']).resolve()
        if output==project or output.is_relative_to(project) or project.is_relative_to(output):
            raise ValueError('multiversion output and input source must be disjoint')
        if not project.is_dir():raise ValueError('missing native source: '+str(project))
        sources[cid]=inventory(project)
        specs[cid]={'minecraft':item['minecraft'],'loader':item['loader'],'java':int(item.get('java') or target_java(item['minecraft'])),
          'source_origin':str(project),'state':'imported-unverified','files':{p:file_record(d,p) for p,d in sources[cid].items()}}
    if not specs:raise ValueError('at least one target is required')
    active=active or next(reversed(specs))
    if active not in specs:raise ValueError('active target is not registered')
    if output.exists():raise ValueError('output already exists; use matrix-add instead of overwriting edits')
    output.parent.mkdir(parents=True,exist_ok=True)
    stage=Path(tempfile.mkdtemp(prefix=output.name+'.staging-',dir=output.parent))
    try:
        manifest={'schema_version':1,'stonecutter_version':STONECUTTER,'gradle_version':GRADLE,'active':active,
          'targets':specs,'shared_files':{},'conditional_files':[],'provenance':provenance or {},
          'verification':'not-built-from-shared-source','layout':'shared-source/native-build-isolation'}
        allpaths=set().union(*(set(s) for s in sources.values()))
        for p in sorted(allpaths):
            values={cid:files[p] for cid,files in sources.items() if p in files}
            is_src=p.startswith('src/')
            mergeable_text=not p.endswith(('.java','.kt')) or all(
                file_record(data,p)['line_endings']!='mixed' and b'//?' not in data for data in values.values())
            if is_src and len(values)==len(specs) and mergeable_text:
                content=next(iter(values.values())) if len(set(values.values()))==1 else (merge_code(values,active) if p.endswith(('.java','.kt')) else None)
                if content is not None:
                    put(stage,p,content);manifest['shared_files'][p]=file_record(content,p)
                    if len(set(values.values()))!=1:manifest['conditional_files'].append(p)
                    continue
            for cid,data in values.items():
                destination=('overrides/'+cid+'/' if is_src else 'targets/'+cid+'/build/')+p
                put(stage,destination,data)
        # Every input member is accounted for once in its target projection.
        manifest['counts']={'shared_files':len(manifest['shared_files']),'conditional_files':len(manifest['conditional_files']),
          'target_files':{cid:len(rows) for cid,rows in sources.items()}}
        write_scaffold(stage,manifest)
        manifest['authored_sha256']=authored_digest(stage)
        atomic_json(stage/MANIFEST,manifest)
        os.replace(stage,output)
        return manifest
    except BaseException:
        shutil.rmtree(stage,ignore_errors=True);raise


def authored_digest(root: Path) -> str:
    h=hashlib.sha256()
    for directory in ['src','overrides','targets']:
        path=root/directory
        if not path.exists():continue
        for p in sorted(path.rglob('*')):
            if p.is_symlink():raise ValueError('workspace symlink is not accepted: '+str(p))
            if p.is_file():h.update(p.relative_to(root).as_posix().encode());h.update(b'\0');h.update(p.read_bytes());h.update(b'\0')
    return h.hexdigest()


def gradle_command(*, offline: bool=False, explicit: Path | None=None) -> list[str]:
    if explicit:
        binary=explicit.resolve()
        if not binary.is_file():raise ValueError('explicit Gradle missing')
        return [str(binary)] if os.name!='nt' else ['cmd','/c',str(binary)]
    home=cache_home()/'gradle'/GRADLE
    receipt=home/'install.json'
    with workspace_lock(cache_home()/'locks'/('gradle-'+GRADLE)):
        if receipt.is_file():
            lock=read(receipt)
            if all(safe(home,p).is_file() and sha256_file(safe(home,p))==digest for p,digest in lock['files'].items()):
                binary=home/('gradle-'+GRADLE)/'bin'/('gradle.bat' if os.name=='nt' else 'gradle')
                return [str(binary)] if os.name!='nt' else ['cmd','/c',str(binary)]
        if offline:raise RuntimeError('outer Gradle '+GRADLE+' is not cached; initialize once online')
        from urllib.request import Request, urlopen
        url=f'https://services.gradle.org/distributions/gradle-{GRADLE}-bin.zip'
        with urlopen(Request(url+'.sha256'),timeout=30) as response:expected=response.read(256).decode().strip()
        archive=download_verified(url,cache_home()/'downloads'/('gradle-'+GRADLE+'.zip'),expected)
        stage=Path(tempfile.mkdtemp(prefix='gradle-stage-',dir=home.parent if home.parent.exists() else cache_home()))
        safe_extract(archive,stage)
        binary=stage/('gradle-'+GRADLE)/'bin'/'gradle'
        if binary.exists():binary.chmod(0o755)
        lock={'archive_sha256':expected,'files':{p.relative_to(stage).as_posix():sha256_file(p) for p in stage.rglob('*') if p.is_file()}}
        atomic_json(stage/'install.json',lock)
        home.parent.mkdir(parents=True,exist_ok=True)
        if home.exists():os.replace(home,home.with_name(home.name+'-replaced-'+new_run_id()))
        os.replace(stage,home)
    return gradle_command(offline=True)


def generate(root: Path, ids: list[str], *, timeout: int=600, offline: bool=False, gradle: Path | None=None) -> dict:
    manifest=read(root/MANIFEST)
    if any(cid not in manifest['targets'] for cid in ids):raise ValueError('unregistered target')
    jdk=ensure_jdk(25,offline=offline)
    env=dict(os.environ,JAVA_HOME=str(Path(jdk['java_path']).parent.parent),DEVKIT_PYTHON=sys.executable)
    env['PATH']=str(Path(jdk['java_path']).parent)+os.pathsep+env.get('PATH','')
    command=gradle_command(offline=offline,explicit=gradle)+['--no-daemon','--console=plain']
    if offline:command.append('--offline')
    command += [':'+cid+':stonecutterGenerate' for cid in ids]
    before=authored_digest(root)
    run=root/'.devkit/logs'/new_run_id()
    cp=run_logged(command,cwd=root,env=env,directory=run,name='stonecutter',timeout=timeout)
    if cp.returncode:raise RuntimeError('real Stonecutter failed; complete logs: '+str(run)+'\n'+cp.stdout[-8000:]+'\n'+cp.stderr[-4000:])
    if authored_digest(root)!=before:raise RuntimeError('source changed during Stonecutter generation')
    return {'process':str(run/'stonecutter.process.json'),'source_sha256':before,'plugin':STONECUTTER}


def stage_target(root: Path, cid: str, output: Path, *, flatten: bool=True) -> dict:
    manifest=read(root/MANIFEST);row=manifest['targets'][cid]
    generated=root/'versions'/cid/'build/generated/stonecutter'
    files={}
    buildroot=root/'targets'/cid/'build'
    if buildroot.is_dir():files.update(inventory(buildroot))
    src=root/'src'
    if src.exists():
        for relative,data in inventory(src,skip_generated=False).items():
            p='src/'+relative
            if p.endswith(('.java','.kt')):
                target=safe(generated,relative)
                if not target.is_file():raise RuntimeError('Stonecutter did not emit '+p+' for '+cid)
                data=target.read_bytes()
                if flatten:data=flatten_generated(data,cid)
                data=data.replace(b'\r\n',b'\n')
                if row['files'].get(p,{}).get('line_endings')=='crlf':data=data.replace(b'\n',b'\r\n')
            files[p]=data
    overlay=root/'overrides'/cid
    if overlay.is_dir():files.update(inventory(overlay,skip_generated=False))
    baseline=authored_digest(root)==manifest['authored_sha256']
    if baseline:
        expected=row['files']
        if set(files)!=set(expected):raise RuntimeError('target file parity changed: '+cid)
        for p,data in files.items():
            if sha(data)!=expected[p]['sha256']:raise RuntimeError('target source parity mismatch: '+cid+' / '+p)
    output=output.resolve()
    if output==root.resolve() or root.resolve().is_relative_to(output):raise ValueError('invalid materialization destination')
    if any(output.is_relative_to(root.resolve()/d) for d in ['src','overrides','targets','.devkit/worker']):
        raise ValueError('materialization must not overwrite authored inputs or tools')
    expected_files={p:sha(data) for p,data in files.items()}
    if output.is_dir() and {p:sha(d) for p,d in inventory(output).items()}==expected_files:
        return {'project':str(output),'baseline_parity':baseline,'files':len(files),'reused':True}
    output.parent.mkdir(parents=True,exist_ok=True)
    stage=Path(tempfile.mkdtemp(prefix=cid+'-',dir=output.parent))
    for p,data in files.items():put(stage,p,data)
    if output.exists():
        history=root/'.devkit/history'/cid/new_run_id();history.parent.mkdir(parents=True,exist_ok=True);os.replace(output,history)
    os.replace(stage,output)
    return {'project':str(output),'baseline_parity':baseline,'files':len(files),'reused':False}


def native_build(root: Path,cid: str,*,timeout: int=900,offline: bool=False,verify: bool=False) -> dict:
    from devkit import main as cli, status
    manifest=read(root/MANIFEST);row=manifest['targets'][cid]
    staged=stage_target(root,cid,root/'.devkit/materialized'/cid)
    run=root/'.devkit/runs'/cid
    if (run/'manifest.json').is_file():args=['resume','--workspace',str(run),'--timeout',str(timeout)]
    else:args=['convert','--project',staged['project'],'--workspace',str(run),'--minecraft',row['minecraft'],'--loader',row['loader'],'--java',str(row['java']),'--timeout',str(timeout)]
    if offline:args.append('--offline')
    if verify:args.append('--verify')
    code=cli(args)
    result=status(run)
    return {'target':cid,'exit':code,'source_projection':staged,'status':result}


def build_matrix(root: Path, ids: list[str] | None=None, *, timeout: int=900,offline: bool=False,gradle: Path | None=None,verify: bool=False) -> dict:
    root=root.resolve();manifest=read(root/MANIFEST);ids=ids or list(manifest['targets'])
    if len(set(ids))!=len(ids) or any(cid not in manifest['targets'] for cid in ids):raise ValueError('duplicate or unregistered target')
    with workspace_lock(root.parent/('.'+root.name+'-matrix-lock')):
        proof=generate(root,ids,timeout=timeout,offline=offline,gradle=gradle)
        previous=read(root/'.devkit/build-results.json') if (root/'.devkit/build-results.json').is_file() else {}
        results={key:value for key,value in previous.get('targets',{}).items() if key in manifest['targets']}
        for cid in ids:
            try:results[cid]=native_build(root,cid,timeout=timeout,offline=offline,verify=verify)
            except (ValueError,RuntimeError,OSError) as exc:results[cid]={'target':cid,'exit':1,'error':str(exc)}
            atomic_json(root/'.devkit/build-results.json',{'generation':proof,'targets':results,'requested_targets':ids,'complete':False})
        requested=[results[cid] for cid in ids]
        result={'generation':proof,'targets':results,'requested_targets':ids,'complete':all(cid in results for cid in ids),
          'all_builds_passed':all(build_passed(r) for r in requested),
          'all_runtime_verified':all((r.get('status',{}).get('native_runtime') or {}).get('state')=='runtime-smoke-verified' for r in requested)}
        atomic_json(root/'.devkit/build-results.json',result)
        return result


def build_passed(result: dict) -> bool:
    cells=result.get('status',{}).get('cells') or []
    return bool(cells) and result.get('exit') in {0,2,3} and all(
        c.get('state') in {'passed','runtime-unverified'} and
        (c.get('artifact') or {}).get('integrity_verified') for c in cells)



def add_target(root: Path, item: dict, *, timeout: int=900,offline: bool=False,gradle: Path | None=None) -> dict:
    root=root.resolve();old=read(root/MANIFEST);cid=target_id(item['minecraft'],item['loader'])
    if cid in old['targets']:raise ValueError('target already exists; edit its shared source or overrides')
    for p,digest in old['scaffold_hashes'].items():
        if not safe(root,p).is_file() or sha256_file(safe(root,p))!=digest:raise ValueError('coordinator has user edits; merge them explicitly before adding a target: '+p)
    with workspace_lock(root.parent/('.'+root.name+'-matrix-lock')):
        generate(root,list(old['targets']),timeout=timeout,offline=offline,gradle=gradle)
        scratch=Path(tempfile.mkdtemp(prefix=root.name+'-extend-',dir=root.parent));variants=[]
        try:
            for key,row in old['targets'].items():
                staged=stage_target(root,key,scratch/key,flatten=True)
                variants.append(dict(row,project=staged['project']))
            variants.append(item)
            replacement=scratch/'replacement'
            result=export_project(variants,replacement,active=cid,provenance={'extends':old.get('provenance',{}),'previous_targets':list(old['targets'])})
            for key,row in old['targets'].items():result['targets'][key]['source_origin']=row['source_origin']
            atomic_json(replacement/MANIFEST,result)
            # Keep exact existing candidate bytes, source projections and proof history.
            # Their absolute paths remain stable after the atomic workspace swap.
            for name in ['runs','materialized','history','logs']:
                retained=root/'.devkit'/name
                if retained.exists():shutil.copytree(retained,replacement/'.devkit'/name,dirs_exist_ok=True)
            if (root/'.devkit/build-results.json').is_file():
                shutil.copy2(root/'.devkit/build-results.json',replacement/'.devkit/build-results.json')
            backup=root.with_name(root.name+'-before-add-'+new_run_id())
            os.replace(root,backup)
            try:os.replace(replacement,root)
            except BaseException:os.replace(backup,root);raise
            result['backup']=str(backup)
            return result
        finally:shutil.rmtree(scratch,ignore_errors=True)


def archive_project(root: Path, output: Path) -> dict:
    root=root.resolve();output=output.resolve()
    if output.is_relative_to(root):raise ValueError('archive must be outside the multiversion project')
    output.parent.mkdir(parents=True,exist_ok=True)
    with zipfile.ZipFile(output,'x',compression=zipfile.ZIP_DEFLATED) as z:
        for p in sorted(root.rglob('*')):
            rel=p.relative_to(root)
            if p.is_symlink():raise ValueError('cannot package symlink')
            if rel.parts[0]=='versions' or any(part in {'.gradle','__pycache__'} for part in rel.parts):continue
            if rel.parts[:2] in {('.devkit','runs'),('.devkit','materialized'),('.devkit','history'),('.devkit','locks')}:continue
            if p.is_file():z.write(p,rel.as_posix())
        checksums=''.join(sha(z.read(name))+'  '+name+'\n' for name in z.namelist())
        z.writestr('MULTIVERSION-SHA256SUMS.txt',checksums)
    return {'file':str(output),'sha256':sha256_file(output),'size':output.stat().st_size}


def export_conversion(source: Path, target: Path, work: Path, conversion: dict) -> dict:
    """Normal production conversions automatically retain the reusable project."""
    original=conversion['source'];final=conversion['target']
    output=work/'multiversion'
    variants=[{'project':str(source),'minecraft':original['minecraft'],'loader':original['loader']},
              {'project':str(target),'minecraft':final['minecraft'],'loader':final['loader']}]
    manifest=export_project(variants,output,provenance={'conversion_rules':conversion.get('applied_rule_ids',[]),'source_sha256':original['sha256']})
    archive=archive_project(output,work/'evidence/multiversion-project.zip')
    return {'project':str(output),'archive':archive,'targets':list(manifest['targets']),'conditional_files':len(manifest['conditional_files']),
            'state':'generated-not-matrix-built','stonecutter_version':STONECUTTER}


def main(argv=None) -> int:
    p=argparse.ArgumentParser(description=__doc__);s=p.add_subparsers(dest='command',required=True)
    init=s.add_parser('init');init.add_argument('--project',type=Path,required=True);init.add_argument('--minecraft',required=True);init.add_argument('--loader',required=True);init.add_argument('--output',type=Path,required=True);init.add_argument('--java',type=int)
    for command in ['build','add','_native-build']:
        parser=s.add_parser(command);parser.add_argument('--workspace',type=Path,required=True);parser.add_argument('--timeout',type=int,default=900);parser.add_argument('--offline',action='store_true');parser.add_argument('--gradle',type=Path)
        if command=='add':
            parser.add_argument('--project',type=Path,required=True);parser.add_argument('--minecraft',required=True);parser.add_argument('--loader',required=True);parser.add_argument('--java',type=int)
        else:parser.add_argument('--target',action='append');parser.add_argument('--verify',action='store_true')
    args=p.parse_args(argv)
    if getattr(args,'timeout',1)<=0:p.error('timeout must be positive')
    if args.command=='init':result=export_project([vars(args)],args.output)
    elif args.command=='add':result=add_target(args.workspace,vars(args),timeout=args.timeout,offline=args.offline,gradle=args.gradle)
    elif args.command=='build':result=build_matrix(args.workspace,args.target,timeout=args.timeout,offline=args.offline,gradle=args.gradle,verify=args.verify)
    else:
        if len(args.target or [])!=1:p.error('exactly one target required')
        result=native_build(args.workspace,args.target[0],timeout=args.timeout,offline=args.offline,verify=args.verify)
    print(json.dumps(result,indent=2,default=str))
    if args.command=='_native-build':
        if getattr(args,'verify',False):return 0 if result.get('status',{}).get('all_passed') else result.get('exit') or 2
        return 0 if build_passed(result) else result.get('exit') or 2
    return 0 if (result.get('all_builds_passed',True) and (not getattr(args,'verify',False) or result.get('all_runtime_verified',False))) else 2


if __name__=='__main__':
    try:raise SystemExit(main())
    except (OSError,ValueError,RuntimeError,KeyError) as exc:
        print(json.dumps({'status':'ERROR','reason':str(exc)}),file=sys.stderr);raise SystemExit(1)
