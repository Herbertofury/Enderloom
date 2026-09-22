#!/usr/bin/env python3
from __future__ import annotations

import json
import pathlib
import tempfile

from northpoint_target_26_3 import materialize_port, tree_digest


def write(path: pathlib.Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def main() -> int:
    with tempfile.TemporaryDirectory(prefix="northpoint-target-263-") as td:
        root = pathlib.Path(td)
        source = root / "source"
        output = root / "target"
        fake_pipeline = root / "fake_port_pipeline.py"

        write(source / "gradle.properties", "minecraft_version=1.21\nversion=1.2.3\ngroup=com.example\n")
        write(source / "build.gradle", "plugins { id 'net.fabricmc.fabric-loom-remap' version '1.17-SNAPSHOT' }\n")
        write(source / "gradlew", "#!/bin/sh\nexit 0\n")
        (source / "gradlew").chmod(0o755)
        write(source / "gradle/wrapper/gradle-wrapper.jar", "wrapper-placeholder\n")
        write(source / "src/main/resources/fabric.mod.json", json.dumps({
            "schemaVersion": 1,
            "id": "modid",
            "version": "${version}",
            "name": "Legacy Example",
            "authors": ["Fixture"],
            "entrypoints": {"main": ["com.example.ExampleMod"], "client": ["com.example.client.ExampleModClient"]},
            "mixins": ["modid.mixins.json", {"config": "modid.client.mixins.json", "environment": "client"}],
            "depends": {"fabricloader": ">=0.16.0", "minecraft": "~1.21", "java": ">=21", "fabric-api": "*"},
        }, indent=2) + "\n")
        write(source / "src/main/resources/modid.mixins.json", '{"required":true,"package":"com.example.mixin","compatibilityLevel":"JAVA_21","mixins":["ExampleMixin"]}\n')
        write(source / "src/client/resources/modid.client.mixins.json", '{"required":true,"package":"com.example.client.mixin","compatibilityLevel":"JAVA_21","client":["ExampleClientMixin"]}\n')
        write(source / "src/main/resources/assets/modid/lang/en_us.json", '{"item.modid.example":"Example"}\n')
        write(source / "src/main/java/com/example/ExampleMod.java", '''package com.example;
import net.minecraft.resources.ResourceLocation;
public class ExampleMod {
  public static ResourceLocation id(String path) { return ResourceLocation.fromNamespaceAndPath("modid", path); }
}
''')
        write(source / "src/client/java/com/example/client/ExampleModClient.java", "package com.example.client; public class ExampleModClient {}\n")

        write(fake_pipeline, '''#!/usr/bin/env python3
import argparse, json, pathlib
p=argparse.ArgumentParser(); p.add_argument('source'); p.add_argument('--loader'); p.add_argument('--output'); p.add_argument('--mod-id'); p.add_argument('--mod-name'); p.add_argument('--group'); p.add_argument('--mod-version'); a=p.parse_args()
out=pathlib.Path(a.output)
def w(rel,text):
 x=out/rel; x.parent.mkdir(parents=True,exist_ok=True); x.write_text(text,encoding='utf-8')
w('build.gradle', "plugins { id 'net.fabricmc.fabric-loom' version '${loom_version}' }\\ndependencies { implementation 'net.fabricmc:fabric-loader:${loader_version}' }\\ntasks.withType(JavaCompile).configureEach { options.release = 25 }\\n")
w('gradle.properties','minecraft_version=26.3\\nloader_version=0.19.5\\nloom_version=1.17-SNAPSHOT\\nfabric_api_version=0.161.0+26.3\\nmod_version='+a.mod_version+'\\nmaven_group='+a.group+'\\narchives_base_name='+a.mod_id+'\\n')
w('gradle/wrapper/gradle-wrapper.properties','distributionUrl=https\\\\://services.gradle.org/distributions/gradle-9.5.1-bin.zip\\n')
w('src/main/java/com/example/modid/Stub.java','package com.example.modid; public class Stub {}\\n')
w('src/client/java/com/example/modid/StubClient.java','package com.example.modid; public class StubClient {}\\n')
w('src/main/resources/fabric.mod.json',json.dumps({'schemaVersion':1,'id':a.mod_id,'version':'${version}','name':a.mod_name,'environment':'*','depends':{'fabricloader':'>=0.19.5','minecraft':'~26.3','java':'>=25','fabric-api':'*'}},indent=2)+'\\n')
w('devkit-evidence/semantic-port-plan.json',json.dumps({'tasks':[{'id':'resource-location-to-identifier'},{'id':'legacy-mixin-java-level'}]},indent=2)+'\\n')
w('porting-ledger.json',json.dumps({'schema_version':1,'items':[]},indent=2)+'\\n')
w('devkit-26.3-lock.json',json.dumps({'target':{'minecraft':'26.3','loader':'fabric','java':25}},indent=2)+'\\n')
''')

        before = tree_digest(source)
        manifest = materialize_port(source, output, "fabric", pipeline_script=fake_pipeline)
        after = tree_digest(source)
        assert before == after == manifest["source"]["sha256"], manifest
        assert manifest["source_unchanged"] is True
        assert manifest["source"]["minecraft"] == "1.21"
        assert manifest["target"]["minecraft"] == "26.3"
        assert "resource-location-to-identifier" in manifest["applied_rule_ids"]
        assert "legacy-mixin-java-level" in manifest["applied_rule_ids"]
        assert not list((output / "src").rglob("Stub*.java"))

        java = (output / "src/main/java/com/example/ExampleMod.java").read_text(encoding="utf-8")
        assert "Identifier" in java and "ResourceLocation" not in java, java
        main_mixin = json.loads((output / "src/main/resources/modid.mixins.json").read_text(encoding="utf-8"))
        client_mixin = json.loads((output / "src/client/resources/modid.client.mixins.json").read_text(encoding="utf-8"))
        assert main_mixin["compatibilityLevel"] == "JAVA_25"
        assert client_mixin["compatibilityLevel"] == "JAVA_25"
        meta = json.loads((output / "src/main/resources/fabric.mod.json").read_text(encoding="utf-8"))
        assert meta["name"] == "Legacy Example" and meta["authors"] == ["Fixture"]
        assert meta["entrypoints"]["main"] == ["com.example.ExampleMod"]
        assert meta["depends"]["minecraft"] == "~26.3"
        assert meta["depends"]["java"] == ">=25"
        assert (output / "src/main/resources/assets/modid/lang/en_us.json").is_file()
        assert (output / "gradle/wrapper/gradle-wrapper.jar").is_file()
        wrapper_props = (output / "gradle/wrapper/gradle-wrapper.properties").read_text(encoding="utf-8")
        assert "gradle-9.5.1-bin.zip" in wrapper_props
        assert (output / "devkit-evidence/northpoint-conversion.json").is_file()

    print("Northpoint 26.3 target materialization self-test: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
