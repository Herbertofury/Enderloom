#!/usr/bin/env python3
"""Literal registration namespace regressions; optional real-JVM oracle."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
import zipfile

from registration_identity_inventory import inventory
from registration_parity_audit import audit

HERE = Path(__file__).resolve().parent
JAVA = shutil.which("java")
JAVAC = shutil.which("javac")


def write_tree(root: Path, files: dict[str, str]) -> Path:
    for name, content in files.items():
        path = root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
    return root


def ids(result: dict) -> set[tuple[str, str]]:
    return {(row["category"], row["id"]) for row in result["entries"]}


def registration(namespace: str, path: str = "token", family: str = "ITEM") -> str:
    return f'Registry.register(Registries.{family}, Identifier.of("{namespace}", "{path}"), new Object());'


class RegistrationNamespaceTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)

    def test_literal_namespace_never_uses_unrelated_mod_id(self):
        for constants in ('', 'String MOD_ID = "project";',
                          'String MOD_ID = "project"; String MODID = "another";'):
            with self.subTest(constants=constants):
                source = write_tree(self.root / "source", {"Fixture.java": constants + registration("foreign", "nested/token")})
                before = (source / "Fixture.java").read_bytes()
                result = inventory(source)
                self.assertEqual(ids(result), {("item", "foreign:nested/token")})
                self.assertEqual(result["entry_count"], 1)
                self.assertEqual(inventory(source), result)
                self.assertEqual((source / "Fixture.java").read_bytes(), before)

    def test_supported_identifier_and_registry_spellings(self):
        for registry in ("Registries", "BuiltInRegistries", "Registry"):
            for constructor in ("Identifier.of", "new Identifier", "new ResourceLocation", "ResourceLocation.of"):
                with self.subTest(registry=registry, constructor=constructor):
                    text = f'Registry.register(\n {registry}.BLOCK,\n {constructor}( "foreign.mod-2", "nested/token_3" ), new Object());'
                    source = write_tree(self.root / "syntax", {"Fixture.java": text})
                    self.assertEqual(ids(inventory(source)), {("block", "foreign.mod-2:nested/token_3")})

    def test_source_archives_and_namespace_collisions(self):
        files = {
            "src/main/java/One.java": 'String MOD_ID = "project";\n' + registration("first"),
            "src/main/java/Two.java": registration("second"),
            "src/main/java/Three.java": registration("first", family="BLOCK"),
            "src/main/java/Duplicate.java": registration("first"),
            "src/main/kotlin/Four.kt": registration("third", "nested/token"),
        }
        source = write_tree(self.root / "source", files)
        expected = {("item", "first:token"), ("item", "second:token"),
                    ("block", "first:token"), ("item", "third:nested/token")}
        self.assertEqual(ids(inventory(source)), expected)
        for suffix in (".zip", ".jar"):
            archive = self.root / ("source" + suffix)
            with zipfile.ZipFile(archive, "w") as zf:
                for name, content in sorted(files.items()):
                    zf.writestr(name, content)
            before = hashlib.sha256(archive.read_bytes()).hexdigest()
            self.assertEqual(ids(inventory(archive)), expected)
            self.assertEqual(hashlib.sha256(archive.read_bytes()).hexdigest(), before)

    def test_existing_variable_full_id_and_legacy_forms_unchanged(self):
        files = {
            "Default.java": 'String MOD_ID = "project";',
            "Variable.java": 'Registry.register(Registries.ITEM, Identifier.of(MOD_ID, "variable"), new Object());',
            "Full.java": 'Registry.register(Registries.BLOCK, Identifier.of("explicit:full"), new Object());',
            "Legacy.java": 'GameRegistry.registerItem(new Object(), "legacy");',
            "Deferred.java": 'DeferredRegister ITEMS = DeferredRegister.create(Registries.ITEM, MOD_ID); ITEMS.register("deferred", Object::new);',
        }
        source = write_tree(self.root / "source", files)
        self.assertEqual(ids(inventory(source)), {("item", "project:variable"),
                         ("block", "explicit:full"), ("item", "project:legacy"), ("item", "project:deferred")})
        # Keep existing conservative behavior for ambiguous variable namespaces.
        write_tree(source, {"Other.java": 'String MODID = "another";'})
        self.assertEqual(ids(inventory(source)), {("block", "explicit:full")})

    def test_parity_rejects_namespace_loss_and_only_exact_exclusions(self):
        source = write_tree(self.root / "source", {"Fixture.java": 'String MOD_ID = "project";' + registration("foreign")})
        wrong = write_tree(self.root / "wrong", {"Fixture.java": 'String MOD_ID = "project";' + registration("project")})
        correct = write_tree(self.root / "correct", {"Fixture.java": registration("foreign")})
        original = inventory(source)
        result = audit(original, wrong)
        self.assertEqual(result["status"], "FAIL")
        self.assertEqual(ids({"entries": result["missing"]}), {("item", "foreign:token")})
        self.assertEqual(ids({"entries": result["extras"]}), {("item", "project:token")})
        self.assertEqual(audit(original, correct)["status"], "PASS")
        exact = {"category": "item", "id": "foreign:token", "status": "intentionally_excluded", "reason": "Synthetic fixture removal"}
        self.assertEqual(audit(original, wrong, [exact])["status"], "PASS")
        for invalid in ({**exact, "id": "project:token"}, {**exact, "reason": ""}, {**exact, "status": "pending"}):
            self.assertEqual(audit(original, wrong, [invalid])["status"], "FAIL")

    def test_inventory_and_fail_on_missing_cli(self):
        source = write_tree(self.root / "source", {"Fixture.java": 'String MOD_ID = "project";' + registration("foreign")})
        wrong = write_tree(self.root / "wrong", {"Fixture.java": 'String MOD_ID = "project";' + registration("project")})
        manifest = self.root / "inventory.json"
        run = subprocess.run([sys.executable, str(HERE / "registration_identity_inventory.py"), str(source), "--json-out", str(manifest)], text=True, capture_output=True, timeout=30)
        self.assertEqual(run.returncode, 0, run.stderr)
        self.assertEqual(ids(json.loads(manifest.read_text())), {("item", "foreign:token")})
        run = subprocess.run([sys.executable, str(HERE / "registration_parity_audit.py"), str(manifest), str(wrong), "--fail-on-missing"], text=True, capture_output=True, timeout=30)
        self.assertEqual(run.returncode, 3, run.stderr)
        self.assertEqual(json.loads(run.stdout)["status"], "FAIL")

    @unittest.skipUnless(JAVA and JAVAC, "real Java oracle requires java and javac on PATH")
    def test_compiled_java_registration_ids_match_inventory(self):
        source = '''public class Fixture {
  static final String MOD_ID = "project";
  public static void main(String[] args) {
    Registry.register(Registries.ITEM, Identifier.of("foreign", "token"), new Object());
    Registry.register(Registries.BLOCK, new ResourceLocation("second", "nested/block"), new Object());
    Registry.register(Registries.ITEM, Identifier.of("third", "token"), new Object());
  }
}
class Registries { static final String ITEM = "item", BLOCK = "block"; }
class Identifier {
  final String value;
  Identifier(String namespace, String path) { value = namespace + ":" + path; }
  static Identifier of(String namespace, String path) { return new Identifier(namespace, path); }
  public String toString() { return value; }
}
class ResourceLocation extends Identifier {
  ResourceLocation(String namespace, String path) { super(namespace, path); }
}
class Registry {
  static void register(String category, Identifier id, Object value) {
    System.out.println(category + " " + id);
  }
}
'''
        project = write_tree(self.root / "java", {"Fixture.java": source})
        original = (project / "Fixture.java").read_bytes()
        classes = self.root / "classes"
        classes.mkdir()
        compile_result = subprocess.run([JAVAC, "-d", str(classes), str(project / "Fixture.java")], text=True, capture_output=True, timeout=30)
        self.assertEqual(compile_result.returncode, 0, compile_result.stderr)
        run = subprocess.run([JAVA, "-cp", str(classes), "Fixture"], text=True, capture_output=True, timeout=30)
        self.assertEqual(run.returncode, 0, run.stderr)
        actual = {tuple(line.split(" ", 1)) for line in run.stdout.splitlines()}
        self.assertEqual(actual, {("item", "foreign:token"), ("block", "second:nested/block"), ("item", "third:token")})
        self.assertEqual(ids(inventory(project)), actual)
        self.assertEqual((project / "Fixture.java").read_bytes(), original)


if __name__ == "__main__":
    if "--require-java" in sys.argv:
        sys.argv.remove("--require-java")
        if not JAVA or not JAVAC:
            raise SystemExit("--require-java needs both java and javac on PATH")
    unittest.main(verbosity=2)
