#!/usr/bin/env python3
import json, pathlib, subprocess, sys, tempfile

from northpoint_source_intake import normalize_java_major, parse_java_hint

SCRIPT = pathlib.Path(__file__).with_name('northpoint_source_intake.py')

def write(root, rel, text):
    p=root/rel; p.parent.mkdir(parents=True, exist_ok=True); p.write_text(text, encoding='utf-8')

def run(project):
    cp=subprocess.run([sys.executable,str(SCRIPT),'--project',str(project)],text=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    assert cp.returncode == 0, (cp.stdout,cp.stderr)
    return json.loads([x for x in cp.stdout.splitlines() if x.strip()][-1])


def java_literal_checks(parent):
    literals = {'1.6': 6, '1.7': 7, '1.8': 8, '1_8': 8, '8': 8,
                '17': 17, '21': 21, '25': 25, ' 1.8 ': 8}
    for literal, expected in literals.items():
        assert normalize_java_major(literal) == expected, literal
    for literal in ('', '0', '1.0', '1.8.0', '17-ea', '${javaVersion}', '21x', '8_0'):
        assert normalize_java_major(literal) is None, literal

    hints = {
        'JavaVersion.VERSION_1_6': 6,
        'JavaVersion.VERSION_1_7': 7,
        'sourceCompatibility = JavaVersion.VERSION_1_8': 8,
        'JavaVersion.VERSION_1_9': 9,
        'JavaVersion.VERSION_1_10': 10,
        'JavaVersion.VERSION_17': 17,
        'JavaVersion.VERSION_21': 21,
        'JavaVersion.VERSION_25': 25,
        'options.release = 8': 8,
        'options.release.set(21)': 21,
        'JavaLanguageVersion.of(17)': 17,
        '<maven.compiler.source>1.8</maven.compiler.source>': 8,
        '<maven.compiler.release> 1.8 </maven.compiler.release>': 8,
        '<release>1.8</release>': 8,
        '<maven.compiler.release>21</maven.compiler.release>': 21,
        '<release>25</release>': 25,
        'JavaVersion.VERSION_1_8_PREVIEW': None,
        'JavaVersion.VERSION_21x': None,
        'options.release = 21x': None,
        'options.release = 21.0': None,
        '<release>1.8.0</release>': None,
        '<maven.compiler.source>${java.version}</maven.compiler.source>': None,
    }
    for hint, expected in hints.items():
        assert parse_java_hint(hint) == expected, hint

    # Exercise the public subprocess/JSON contract, not only the parser helper.
    projects = [
        ('gradle-enum', 'build.gradle', 'sourceCompatibility = JavaVersion.VERSION_1_8', 8),
        ('gradle-kotlin-enum', 'build.gradle.kts', 'java { sourceCompatibility = JavaVersion.VERSION_1_8 }', 8),
        ('maven-source', 'pom.xml', '<project><properties><maven.compiler.source>1.8</maven.compiler.source></properties></project>', 8),
        ('maven-release', 'pom.xml', '<project><configuration><release>1.8</release></configuration></project>', 8),
    ]
    for key in ('java_version', 'javaVersion', 'java_version_major', 'java.version'):
        for literal, expected in (('1.8', 8), ('8', 8), ('21', 21)):
            projects.append((key + '-' + literal, 'gradle.properties', key + '=' + literal, expected))
    projects.append(('invalid-property-fallback', 'gradle.properties', 'java_version=21x', 17))
    for name, filename, content, expected in projects:
        project = parent / name
        write(project, 'src/main/java/x/Main.java', 'package x; public class Main {}\n')
        if name == 'invalid-property-fallback':
            write(project, 'build.gradle', 'java.toolchain.languageVersion = JavaLanguageVersion.of(17)')
        write(project, filename, content)
        before = {p.relative_to(project).as_posix(): p.read_bytes()
                  for p in project.rglob('*') if p.is_file()}
        got = run(project)
        assert got['java'] == expected, (name, got)
        assert got['proposed_config']['source']['java'] == expected, (name, got)
        if got['build']['mode'] == 'javac':
            assert got['proposed_config']['build']['java'] == expected, (name, got)
        after = {p.relative_to(project).as_posix(): p.read_bytes()
                 for p in project.rglob('*') if p.is_file()}
        assert after == before, ('intake mutated source', name)
        assert run(project)['source_sha256'] == got['source_sha256'], name
    return {'normalization': len(literals) + 8, 'hints': len(hints), 'cli_projects': len(projects)}


with tempfile.TemporaryDirectory(prefix='northpoint-intake-') as td:
    root=pathlib.Path(td)/'fabricmod'; root.mkdir()
    write(root,'gradle.properties','minecraft_version=1.21.1\nloader_version=0.16.10\n')
    write(root,'build.gradle','plugins { id "fabric-loom" }\ntasks.withType(JavaCompile).configureEach { it.options.release = 21 }\n')
    write(root,'gradlew','#!/bin/sh\n')
    write(root,'src/main/resources/fabric.mod.json',json.dumps({'schemaVersion':1,'id':'intakeproof','version':'1.0.0','environment':'*','entrypoints':{'main':['x.Main']}}))
    write(root,'src/main/resources/intakeproof.mixins.json','{"required":true,"package":"x.mixin","mixins":["ProofMixin"]}\n')
    write(root,'src/main/java/x/Main.java','package x; public class Main {}\n')
    got=run(root)
    assert got['build']['mode']=='gradle', got
    assert got['loader']=='fabric' and got['mod_id']=='intakeproof', got
    assert got['minecraft']=='1.21.1' and got['java']==21, got
    assert got['source_counts']['java']==1 and got['source_counts']['mixins']>=1, got
    assert got['proposed_config']['build']['mode']=='gradle', got
    assert got['proposed_config']['runtime']['required'] is True, got
    assert got['runtime_scope']=='both', got
    assert got['proposed_config']['runtime']['scope']=='both', got
    assert got['source_sha256'], got

    forge=pathlib.Path(td)/'forgemod'; forge.mkdir()
    write(forge,'gradle.properties','minecraft_version=1.20.1\n')
    write(forge,'build.gradle','java { toolchain.languageVersion = JavaLanguageVersion.of(17) }\n')
    write(forge,'src/main/resources/META-INF/mods.toml','modLoader="javafml"\n[[mods]]\nmodId="forgeproof"\n')
    write(forge,'src/main/java/x/Main.java','package x; public class Main {}\n')
    got=run(forge)
    assert got['loader']=='forge' and got['mod_id']=='forgeproof', got
    assert got['minecraft']=='1.20.1' and got['java']==17, got
    assert got['runtime_scope']=='unknown', got
    write(forge,'northpoint.project.json',json.dumps({'schema_version':1,'runtime':{'required':True,'scope':'both'}}))
    got=run(forge)
    assert got['runtime_scope']=='both', got
    assert got['proposed_config']['runtime']['scope']=='both', got

    neo=pathlib.Path(td)/'neomod'; neo.mkdir()
    write(neo,'gradle.properties','minecraft_version=26.3\nmod_id=examplemod\nneo_version=26.3.0.7-beta\n')
    write(neo,'build.gradle','java.toolchain.languageVersion = JavaLanguageVersion.of(25)\n')
    write(neo,'gradlew','#!/bin/sh\n')
    write(neo,'src/main/templates/META-INF/neoforge.mods.toml','[[mods]]\nmodId="${mod_id}"\n')
    write(neo,'src/main/java/com/example/ExampleMod.java','package com.example; public class ExampleMod {}\n')
    got=run(neo)
    assert got['loader']=='neoforge', got
    assert got['mod_id']=='examplemod', got
    assert got['minecraft']=='26.3' and got['java']==25, got
    assert got['proposed_config']['mod_id']=='examplemod', got
    assert any('template placeholder' in warning for warning in got['warnings']), got

    client=pathlib.Path(td)/'clientmod'; client.mkdir()
    write(client,'gradle.properties','minecraft_version=1.21.1\n')
    write(client,'build.gradle','tasks.withType(JavaCompile).configureEach { it.options.release = 21 }\n')
    write(client,'src/main/resources/fabric.mod.json',json.dumps({'schemaVersion':1,'id':'clientproof','version':'1.0.0','environment':'client'}))
    write(client,'src/main/java/x/Client.java','package x; public class Client {}\n')
    got=run(client)
    assert got['runtime_scope']=='client', got
    assert got['proposed_config']['runtime']['scope']=='client', got

    java_checks = java_literal_checks(pathlib.Path(td) / 'java-literals')

print(json.dumps({'java_literal_checks': java_checks}, sort_keys=True))
print('Northpoint source intake self-test: PASS')
