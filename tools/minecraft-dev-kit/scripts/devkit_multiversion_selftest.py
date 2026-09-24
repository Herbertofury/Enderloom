#!/usr/bin/env python3
"""Shared-source preservation controls and optional real Stonecutter/JVM workflow.

--real invokes the actual pinned plugin; the default structural controls do NOT.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import zipfile

import devkit_multiversion as mv
from northpoint_production_driver_selftest import fixture


def project(path: Path, version: str, value: str) -> dict:
    fixture(path)
    shutil.rmtree(path/'overlays')
    (path/'src/main/java/example/Version.java').write_text(
        'package example;\npublic final class Version {\n'
        f'  public static final String MC="{version}";\n'
        f'  public static final String API="{value}";\n' + '}\n')
    (path/'src/main/java/example/Smoke.java').write_text('''package example;
public final class Smoke {
 public static void main(String[] args) {
  new ProofMod().onInitialize();
  if (!ProofMod.initialized) throw new AssertionError("initialization lost");
  System.out.println("RUNTIME:" + Version.MC + ":" + Version.API);
 }
}
''')
    cfg=mv.read(path/'northpoint.project.json')
    cfg['runtime']['stdout_contains']='RUNTIME:'+version+':'+value
    mv.atomic_json(path/'northpoint.project.json',cfg)
    metadata=mv.read(path/'src/main/resources/fabric.mod.json')
    metadata['depends']['minecraft']=version
    mv.atomic_json(path/'src/main/resources/fabric.mod.json',metadata)
    mv.put(path,'src/main/kotlin/example/Optional.kt', ('package example\n// Preserved Kotlin variant\nval variant = "'+value+'"\n').encode())
    mv.put(path,'src/main/resources/assets/stoneproof/build/run/opaque.bin',b'\x00\x01\xffsource-owned-resource')
    return {'project':str(path),'minecraft':version,'loader':'fabric','java':25}


def unit(root: Path):
    old=project(root/'old','26.2','legacy');new=project(root/'new','26.3','modern')
    mv.put(Path(new['project']),'src/main/java/example/Added.java',b'package example; public class Added {}\n')
    before={v['minecraft']:mv.inventory(Path(v['project'])) for v in (old,new)}
    out=root/'project with spaces'
    manifest=mv.export_project([old,new],out)
    assert manifest['stonecutter_version']=='0.9.8'
    assert manifest['conditional_files'], manifest
    assert 'src/main/java/example/Version.java' in manifest['conditional_files']
    assert (out/'targets/26.2-fabric/build/northpoint.project.json').is_file()
    assert (out/'overrides/26.3-fabric/src/main/java/example/Added.java').is_file()
    assert (out/'src/main/resources/assets/stoneproof/build/run/opaque.bin').is_file()
    assert (out/'.devkit/worker/scripts/devkit.py').is_file()
    assert (out/'.devkit/worker/scripts/devkit_multiversion.py').read_bytes()==Path(mv.__file__).read_bytes()
    # Structural test oracle only: full raw variants stand in for generated output.
    # --real below independently requires actual plugin output, never this oracle.
    for variant in (old,new):
        cid=mv.target_id(variant['minecraft'],variant['loader'])
        for p in manifest['shared_files']:
            if p.endswith(('.java','.kt')):
                mv.put(out,'versions/'+cid+'/build/generated/stonecutter/'+p[4:],before[variant['minecraft']][p])
        staged=root/('projection-'+cid)
        report=mv.stage_target(out,cid,staged)
        assert report['baseline_parity'] and mv.inventory(staged)==before[variant['minecraft']]
        assert mv.stage_target(out,cid,staged)['reused']
    assert all(mv.inventory(Path(v['project']))==before[v['minecraft']] for v in (old,new))
    for bad in ['../escape','C:/escape','.', '/absolute','bad\\name']:
        try:mv.safe(out,bad)
        except ValueError:pass
        else:raise AssertionError('unsafe path accepted '+bad)
    assert mv.merge_code({'a':b'/*old*/\n','b':b'/*new*/\n'},'b') is None
    notes=b'package x;\n/* notes\n * OLD note\n */\nclass Test {}\n'
    assert mv.merge_code({'a':notes,'b':notes.replace(b'OLD',b'NEW')},'b') is None
    assert mv.merge_code({'a':b'old\r\n','b':b'new\n'},'b') is not None
    assert mv.merge_code({'a':b'val x="""old"""\n','b':b'val x="""new"""\n'},'b') is None
    assert mv.merge_code({'a':b'//? if true\n','b':b'//? if false\n'},'b') is None
    # One target has inserted statements; another has a larger replacement.
    code=mv.merge_code({'a':b'head\none\ntwo\nend\n','b':b'head\nchanged\nend\n','c':b'head\none\ninsert\ntwo\nend\n'},'b')
    assert code and all(mv.selector(c).encode() in code for c in ['a','b','c'])
    assert not mv.build_passed({'exit':0,'status':{'cells':[{'state':'failed','artifact':{'integrity_verified':True}}]}})
    assert not mv.build_passed({'exit':0,'status':{'cells':[{'state':'passed','artifact':None}]}})
    assert not mv.build_passed({'exit':0,'status':{'cells':[]}})
    assert mv.build_passed({'exit':0,'status':{'cells':[{'state':'passed','artifact':{'integrity_verified':True}}]}})
    # Never overwrite authored controller changes on target extension.
    controller=out/'stonecutter.gradle.kts';controller.write_text(controller.read_text()+'// custom edit\n')
    try:mv.add_target(out,project(root/'third','26.4','future'))
    except ValueError as exc:assert 'user edits' in str(exc)
    else:raise AssertionError('controller was overwritten')
    assert '// custom edit' in controller.read_text()
    (Path(old['project'])/'.env').write_text('secret=do-not-export')
    try:mv.export_project([old],root/'secret-export')
    except ValueError:pass
    else:raise AssertionError('secret exported')
    assert not (root/'secret-export').exists()
    print('Structural controls PASS: shared branches, exact projections, resource/build parity, scope, credentials, collision, source immutability and no false build pass')


def real(root: Path,gradle: Path | None):
    left=project(root/'left','26.2','legacy');right=project(root/'right','26.3','modern')
    out=root/'real project with spaces'
    mv.export_project([left,right],out)
    args=[sys.executable,str(Path(mv.__file__).with_name('devkit.py')),'matrix-build','--workspace',str(out),'--timeout','600']
    if gradle:args+=['--gradle',str(gradle)]
    def build(extra=(),good=True):
        cp=subprocess.run(args+list(extra),text=True,capture_output=True,timeout=900)
        if good and cp.returncode:raise AssertionError(cp.stdout+'\n'+cp.stderr)
        if not good:assert cp.returncode!=0, 'invalid Java was reported passing'
        return mv.read(out/'.devkit/build-results.json')
    first=build();assert first['all_builds_passed'] and not first['all_runtime_verified']
    assert set(first['targets'])=={'26.2-fabric','26.3-fabric'}
    hashes={cid:r['status']['cells'][0]['artifact']['sha256'] for cid,r in first['targets'].items()}
    for cid in first['targets']:
        source=out/'.devkit/materialized'/cid/'src/main/java/example/Version.java'
        assert '//? if sc_' not in source.read_text(),source.read_text()
        original=Path(left['project'] if cid=='26.2-fabric' else right['project'])
        assert mv.inventory(source.parents[4])==mv.inventory(original), 'flatten changed native source variant'
    second=build()
    for cid,r in second['targets'].items():
        assert r['status']['last_run']['built']==[] and r['status']['cells'][0]['attempts']==1,r
        assert r['status']['cells'][0]['artifact']['sha256']==hashes[cid]
    # Common edit must reach both native builds.
    shared=out/'src/main/java/example/ProofMod.java'
    shared.write_text(shared.read_text().replace('initialized = true','initialized = !false'))
    third=build()
    assert all(r['status']['cells'][0]['attempts']==2 for r in third['targets'].values())
    assert all('!false' in (out/'.devkit/materialized'/cid/'src/main/java/example/ProofMod.java').read_text() for cid in third['targets'])
    # Target-only invalid source must fail only that target, retain the other proof.
    over=out/'overrides/26.2-fabric/src/main/java/example/ProofMod.java'
    mv.put(out,over.relative_to(out).as_posix(),b'not valid Java\n')
    failed=build(['--target','26.2-fabric'],good=False)
    assert not failed['all_builds_passed']
    assert failed['targets']['26.3-fabric']['status']['cells'][0]['attempts']==2
    over.unlink();recovered=build(['--target','26.2-fabric'])
    assert recovered['all_builds_passed']
    old_attempts={cid:r['status']['cells'][0]['attempts'] for cid,r in recovered['targets'].items()}
    new=project(root/'later','26.4','future')
    # Use known JDK25 for a simulated future source fixture; no claimed Minecraft26.4 support.
    added=mv.add_target(out,new,gradle=gradle)
    assert Path(added['backup']).is_dir()
    assert '26.4-fabric' in added['targets']
    final=build()
    assert final['all_builds_passed']
    for cid,n in old_attempts.items():
        assert final['targets'][cid]['status']['cells'][0]['attempts']==n, 'adding a target rebuilt unchanged native source'
    assert final['targets']['26.4-fabric']['status']['cells'][0]['attempts']==1
    for cid in old_attempts:
        assert '!false' in (out/'.devkit/materialized'/cid/'src/main/java/example/ProofMod.java').read_text()
    package=mv.archive_project(out,root/'multiversion-source.zip')
    with zipfile.ZipFile(package['file']) as z:
        assert z.testzip() is None
        assert all('\\\\' not in name for name in z.namelist()), z.namelist()
        assert '.devkit/build-results.json' in z.namelist()
        for line in z.read('MULTIVERSION-SHA256SUMS.txt').decode().splitlines():
            digest,name=line.split('  ',1);assert hashlib.sha256(z.read(name)).hexdigest()==digest
    mv.atomic_json(root/'REAL-PROOF.json',{'status':'PASS','plugin':mv.STONECUTTER,'targets':list(final['targets']),
        'actual_stonecutter_and_javac_and_jvm':True,'minecraft_runtime':'NOT_TESTED_BY_THIS_FIXTURE',
        'cases':['real-conditional-generation','original-source-parity','shared-edit-propagation','no-rebuild-resume',
                 'target-specific-failure-isolation','recovery','add-target-preserves-edits-and-proof','portable-source-package'],
        'workspace':str(out)})
    print('Actual Stonecutter + native javac/JAR/JVM multiversion workflow PASS:',out)


def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--real',action='store_true');p.add_argument('--gradle',type=Path);p.add_argument('--output',type=Path)
    a=p.parse_args();root=a.output or Path(tempfile.mkdtemp(prefix='devkit-multiversion-'));root.mkdir(parents=True,exist_ok=True)
    unit(root/'unit')
    if a.real:real(root/'real',a.gradle or (Path(shutil.which('gradle')) if shutil.which('gradle') else None))
    return 0

if __name__=='__main__':raise SystemExit(main())
