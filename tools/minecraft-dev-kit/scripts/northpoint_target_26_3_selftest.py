#!/usr/bin/env python3
from __future__ import annotations

import json
import pathlib
import tempfile

from northpoint_target_26_3 import materialize_port, tree_digest


def write(path: pathlib.Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def fake_pipeline(path: pathlib.Path) -> None:
    write(path, '''#!/usr/bin/env python3
import argparse, json, pathlib
p=argparse.ArgumentParser(); p.add_argument('source'); p.add_argument('--loader'); p.add_argument('--output'); p.add_argument('--mod-id'); p.add_argument('--mod-name'); p.add_argument('--group'); p.add_argument('--mod-version'); a=p.parse_args()
out=pathlib.Path(a.output)
def w(rel,text):
 x=out/rel; x.parent.mkdir(parents=True,exist_ok=True); x.write_text(text,encoding='utf-8')
if a.loader == 'fabric':
 w('build.gradle', "plugins { id 'net.fabricmc.fabric-loom' version '${loom_version}' }\\ndependencies { implementation 'net.fabricmc:fabric-loader:${loader_version}' }\\ntasks.withType(JavaCompile).configureEach { options.release = 25 }\\n")
 w('gradle.properties','minecraft_version=26.3\\nloader_version=0.19.5\\nloom_version=1.17-SNAPSHOT\\nfabric_api_version=0.161.0+26.3\\nmod_version='+a.mod_version+'\\nmaven_group='+a.group+'\\narchives_base_name='+a.mod_id+'\\n')
 w('gradle/wrapper/gradle-wrapper.properties','distributionUrl=https\\\\://services.gradle.org/distributions/gradle-9.6.0-bin.zip\\n')
 w('src/main/java/com/example/modid/Stub.java','package com.example.modid; public class Stub {}\\n')
 w('src/client/java/com/example/modid/StubClient.java','package com.example.modid; public class StubClient {}\\n')
 w('src/main/resources/fabric.mod.json',json.dumps({'schemaVersion':1,'id':a.mod_id,'version':'${version}','name':a.mod_name,'environment':'*','depends':{'fabricloader':'>=0.19.5','minecraft':'~26.3','java':'>=25','fabric-api':'*'}},indent=2)+'\\n')
else:
 w('build.gradle', "plugins { id 'java-library'; id 'net.neoforged.moddev' version '2.0.147' }\\njava.toolchain.languageVersion = JavaLanguageVersion.of(25)\\n")
 w('gradle.properties','minecraft_version=26.3\\nminecraft_version_range=[26.3]\\nneo_version=26.3.0.7-beta\\nmod_id='+a.mod_id+'\\nmod_name='+a.mod_name+'\\nmod_license=All Rights Reserved\\nmod_version='+a.mod_version+'\\nmod_group_id='+a.group+'\\n')
 w('gradle/wrapper/gradle-wrapper.properties','distributionUrl=https\\\\://services.gradle.org/distributions/gradle-9.2.1-bin.zip\\n')
 w('src/main/java/com/example/examplemod/Stub.java','package com.example.examplemod; public class Stub {}\\n')
 w('src/main/templates/META-INF/neoforge.mods.toml','license="${mod_license}"\\n[[mods]]\\nmodId="${mod_id}"\\nversion="${mod_version}"\\ndisplayName="${mod_name}"\\n[[dependencies.${mod_id}]]\\nmodId="neoforge"\\nversionRange="[${neo_version},)"\\n[[dependencies.${mod_id}]]\\nmodId="minecraft"\\nversionRange="${minecraft_version_range}"\\n')
w('devkit-evidence/semantic-port-plan.json',json.dumps({'tasks':[]},indent=2)+'\\n')
w('porting-ledger.json',json.dumps({'schema_version':1,'items':[]},indent=2)+'\\n')
w('devkit-26.3-lock.json',json.dumps({'target':{'minecraft':'26.3','loader':a.loader,'java':25}},indent=2)+'\\n')
''')


def fabric_case(root: pathlib.Path, pipeline: pathlib.Path) -> None:
    source, output = root / "fabric-source", root / "fabric-target"
    write(source / "gradle.properties", "minecraft_version=1.21\nversion=1.2.3\ngroup=com.example\nmodmenu_version=11.0.1\ncustom_flag=enabled\n")
    write(source / "build.gradle", """plugins { id 'net.fabricmc.fabric-loom-remap' version '1.7.4' }
repositories {
    maven { url = 'https://maven.terraformersmc.com/releases' }
}
dependencies {
    minecraft "com.mojang:minecraft:${project.minecraft_version}"
    implementation "net.fabricmc:fabric-loader:0.16.0"
    modImplementation "com.terraformersmc:modmenu:${project.modmenu_version}"
}
""")
    write(source / "gradle/libs.versions.toml", "[versions]\nhelper = \"1.2.3\"\n")
    write(source / "libs/local-helper.jar", "local-jar-placeholder\n")
    write(source / "buildSrc/src/main/groovy/BuildHelpers.groovy", "class BuildHelpers {}\n")
    write(source / "gradlew", "#!/bin/sh\nexit 0\n")
    (source / "gradlew").chmod(0o755)
    write(source / "gradle/wrapper/gradle-wrapper.jar", "wrapper-placeholder\n")
    write(source / "src/main/resources/fabric.mod.json", json.dumps({
        "schemaVersion": 1, "id": "modid", "version": "${version}", "name": "Legacy Example",
        "authors": ["Fixture"], "entrypoints": {"main": ["com.example.ExampleMod"]},
        "depends": {"fabricloader": ">=0.16.0", "minecraft": "~1.21", "java": ">=21", "fabric-api": "*"},
    }, indent=2) + "\n")
    write(source / "src/main/resources/modid.mixins.json", '{"required":true,"compatibilityLevel":"JAVA_21","mixins":[]}\n')
    write(source / "src/main/java/com/example/ExampleMod.java", "package com.example; import net.minecraft.resources.ResourceLocation; public class ExampleMod { ResourceLocation id; }\n")
    before = tree_digest(source)
    manifest = materialize_port(source, output, "fabric", pipeline_script=pipeline)
    assert before == tree_digest(source) == manifest["source"]["sha256"]
    assert {"fabric-metadata-target-dependencies", "resource-location-to-identifier", "legacy-mixin-java-level"} <= set(manifest["applied_rule_ids"])
    assert "Identifier" in (output / "src/main/java/com/example/ExampleMod.java").read_text()
    assert json.loads((output / "src/main/resources/modid.mixins.json").read_text())["compatibilityLevel"] == "JAVA_25"
    assert "gradle-9.6.0-bin.zip" in (output / "gradle/wrapper/gradle-wrapper.properties").read_text()
    target_props = (output / "gradle.properties").read_text()
    assert "minecraft_version=26.3" in target_props
    assert "modmenu_version=11.0.1" in target_props and "custom_flag=enabled" in target_props
    preserved = (output / "northpoint-preserved.gradle").read_text()
    assert "https://maven.terraformersmc.com/releases" in preserved
    assert "com.terraformersmc:modmenu:${project.modmenu_version}" in preserved
    assert "com.mojang:minecraft:" not in preserved
    assert "net.fabricmc:fabric-loader:" not in preserved
    target_build = (output / "build.gradle").read_text()
    assert 'apply from: file("northpoint-preserved.gradle")' in target_build
    assert (output / "gradle/libs.versions.toml").is_file()
    assert (output / "libs/local-helper.jar").is_file()
    assert (output / "buildSrc/src/main/groovy/BuildHelpers.groovy").is_file()
    assert set(manifest["preserved_gradle_properties"]) >= {"modmenu_version", "custom_flag"}
    assert manifest["preserved_build_files"]["gradle"] == 1
    assert manifest["preserved_build_files"]["libs"] == 1
    assert manifest["preserved_build_files"]["buildSrc"] == 1
    assert manifest["preserved_gradle_blocks"] == {"repositories": 1, "dependencies": 1}


def neoforge_case(root: pathlib.Path, pipeline: pathlib.Path) -> None:
    source, output = root / "neo-source", root / "neo-target"
    write(source / "gradle.properties", """minecraft_version=1.21.1
minecraft_version_range=[1.21.1]
neo_version=21.1.251
loader_version_range=[1,)
mod_id=examplemod
mod_name=Example Mod
mod_license=All Rights Reserved
mod_version=1.0.0
mod_group_id=com.example.examplemod
""")
    write(source / "gradlew", "#!/bin/sh\nexit 0\n")
    (source / "gradlew").chmod(0o755)
    write(source / "gradle/wrapper/gradle-wrapper.jar", "wrapper-placeholder\n")
    write(source / "src/main/templates/custom/banner.txt", "preserve-template\n")
    write(source / "src/main/templates/META-INF/neoforge.mods.toml", """modLoader="javafml"
loaderVersion="${loader_version_range}"
license="${mod_license}"
authors="Fixture Author"
[[mods]]
modId="${mod_id}"
version="${mod_version}"
displayName="${mod_name}"
description='''Preserve me.'''
[[dependencies.${mod_id}]]
modId="neoforge"
type="required"
versionRange="[21.1.251,)"
ordering="NONE"
side="BOTH"
[[dependencies.${mod_id}]]
modId="minecraft"
type="required"
versionRange="[1.21.1]"
ordering="NONE"
side="BOTH"
""")
    write(source / "src/main/resources/assets/examplemod/lang/en_us.json", '{"item.examplemod.example":"Example"}\n')
    write(source / "src/main/java/com/example/examplemod/ExampleMod.java", """package com.example.examplemod;
import net.minecraft.world.item.Item;
import net.minecraft.world.level.block.state.BlockBehaviour;
class ExampleMod {
 Object a = BLOCKS.registerSimpleBlock("example_block", BlockBehaviour.Properties.of().strength(2.0f));
 Object b = ITEMS.registerSimpleItem("example_item", new Item.Properties().stacksTo(1));
}
""")
    write(source / "src/main/java/com/example/examplemod/Config.java", "package com.example.examplemod; import net.minecraft.resources.ResourceLocation; class Config { ResourceLocation id; }\n")
    before = tree_digest(source)
    manifest = materialize_port(source, output, "neoforge", pipeline_script=pipeline)
    assert before == tree_digest(source) == manifest["source"]["sha256"]
    assert manifest["source"]["loader"] == "neoforge" and manifest["source"]["minecraft"] == "1.21.1"
    rules = set(manifest["applied_rule_ids"])
    assert {
        "neoforge-metadata-target-schema",
        "neoforge-register-simple-block-properties-factory",
        "neoforge-register-simple-item-properties-factory",
        "resource-location-to-identifier",
    } <= rules, rules
    java = (output / "src/main/java/com/example/examplemod/ExampleMod.java").read_text()
    assert 'registerSimpleBlock("example_block", p -> p.strength(2.0f))' in java
    assert 'registerSimpleItem("example_item", p -> p.stacksTo(1))' in java
    assert "Identifier" in (output / "src/main/java/com/example/examplemod/Config.java").read_text()
    meta = (output / "src/main/templates/META-INF/neoforge.mods.toml").read_text()
    assert "modLoader=" not in meta and "loaderVersion=" not in meta
    assert 'authors="Fixture Author"' in meta and "Preserve me." in meta
    assert 'versionRange="[${neo_version},)"' in meta
    assert 'versionRange="${minecraft_version_range}"' in meta
    props = (output / "gradle.properties").read_text()
    assert "neo_version=26.3.0.7-beta" in props
    assert "gradle-9.2.1-bin.zip" in (output / "gradle/wrapper/gradle-wrapper.properties").read_text()
    assert (output / "src/main/resources/assets/examplemod/lang/en_us.json").is_file()
    assert (output / "src/main/templates/custom/banner.txt").read_text() == "preserve-template\n"


def main() -> int:
    with tempfile.TemporaryDirectory(prefix="northpoint-target-263-") as td:
        root = pathlib.Path(td)
        pipeline = root / "fake_port_pipeline.py"
        fake_pipeline(pipeline)
        fabric_case(root, pipeline)
        neoforge_case(root, pipeline)
    print("Northpoint 26.3 target materialization self-test: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
