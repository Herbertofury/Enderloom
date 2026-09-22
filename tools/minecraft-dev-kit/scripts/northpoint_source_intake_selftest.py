#!/usr/bin/env python3
import json, pathlib, subprocess, sys, tempfile

SCRIPT = pathlib.Path(__file__).with_name('northpoint_source_intake.py')

def write(root, rel, text):
    p=root/rel; p.parent.mkdir(parents=True, exist_ok=True); p.write_text(text, encoding='utf-8')

def run(project):
    cp=subprocess.run([sys.executable,str(SCRIPT),'--project',str(project)],text=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    assert cp.returncode == 0, (cp.stdout,cp.stderr)
    return json.loads([x for x in cp.stdout.splitlines() if x.strip()][-1])

with tempfile.TemporaryDirectory(prefix='northpoint-intake-') as td:
    root=pathlib.Path(td)/'fabricmod'; root.mkdir()
    write(root,'gradle.properties','minecraft_version=1.21.1\nloader_version=0.16.10\n')
    write(root,'build.gradle','plugins { id "fabric-loom" }\ntasks.withType(JavaCompile).configureEach { it.options.release = 21 }\n')
    write(root,'gradlew','#!/bin/sh\n')
    write(root,'src/main/resources/fabric.mod.json',json.dumps({'schemaVersion':1,'id':'intakeproof','version':'1.0.0','entrypoints':{'main':['x.Main']}}))
    write(root,'src/main/resources/intakeproof.mixins.json','{"required":true,"package":"x.mixin","mixins":["ProofMixin"]}\n')
    write(root,'src/main/java/x/Main.java','package x; public class Main {}\n')
    got=run(root)
    assert got['build']['mode']=='gradle', got
    assert got['loader']=='fabric' and got['mod_id']=='intakeproof', got
    assert got['minecraft']=='1.21.1' and got['java']==21, got
    assert got['source_counts']['java']==1 and got['source_counts']['mixins']>=1, got
    assert got['proposed_config']['build']['mode']=='gradle', got
    assert got['source_sha256'], got

    forge=pathlib.Path(td)/'forgemod'; forge.mkdir()
    write(forge,'gradle.properties','minecraft_version=1.20.1\n')
    write(forge,'build.gradle','java { toolchain.languageVersion = JavaLanguageVersion.of(17) }\n')
    write(forge,'src/main/resources/META-INF/mods.toml','modLoader="javafml"\n[[mods]]\nmodId="forgeproof"\n')
    write(forge,'src/main/java/x/Main.java','package x; public class Main {}\n')
    got=run(forge)
    assert got['loader']=='forge' and got['mod_id']=='forgeproof', got
    assert got['minecraft']=='1.20.1' and got['java']==17, got

print('Northpoint source intake self-test: PASS')