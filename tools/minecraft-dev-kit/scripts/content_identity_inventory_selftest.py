#!/usr/bin/env python3
"""Bounded source/JAR content-identity and release-parity regressions."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
import zipfile

from content_identity_inventory import inventory
from content_parity_audit import audit

HERE = Path(__file__).resolve().parent
SOUNDS = {
    "ambient.chime": {"sounds": [{"name": "minecraft:block.note_block.chime", "type": "event"}],
                      "subtitle": "subtitles.fixture.chime"},
    "nested/echo": {"sounds": ["minecraft:ambient/cave"]},
}


def json_bytes(value) -> bytes:
    return json.dumps(value, sort_keys=True).encode("utf-8")


def write_tree(root: Path, files: dict[str, bytes]) -> Path:
    for name, data in files.items():
        path = root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
    return root


def write_jar(path: Path, files: dict[str, bytes]) -> Path:
    with zipfile.ZipFile(path, "w", compression=zipfile.ZIP_DEFLATED) as jar:
        for name, data in sorted(files.items()):
            jar.writestr(name, data)
    return path


class SoundInventoryTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)

    def test_sound_events_across_supported_layouts(self):
        expected_ids = {"fixture:ambient.chime", "fixture:nested/echo"}
        for prefix in ("", "src/main/resources/", "src/client/resources/", "src/generated/resources/"):
            for archive in (False, True):
                with self.subTest(prefix=prefix, archive=archive):
                    files = {prefix + "assets/fixture/sounds.json": json_bytes(SOUNDS)}
                    path = (write_jar(self.root / "layout.jar", files) if archive
                            else write_tree(self.root / (prefix.replace("/", "_") or "pack"), files))
                    before = {name: hashlib.sha256(data).hexdigest() for name, data in files.items()}
                    result = inventory(path)
                    self.assertEqual(result["entry_count"], 2)
                    self.assertEqual(result["counts"]["category"], {"sound-event": 2})
                    self.assertEqual({row["id"] for row in result["entries"]}, expected_ids)
                    for row in result["entries"]:
                        value = SOUNDS[row["id"].split(":", 1)[1]]
                        data = json_bytes(value)
                        self.assertEqual(row["path"], "assets/fixture/sounds.json")
                        self.assertEqual(row["size"], len(data))
                        self.assertEqual(row["sha256"], hashlib.sha256(data).hexdigest())
                    self.assertEqual(inventory(path), result)
                    if archive:
                        with zipfile.ZipFile(path) as jar:
                            after = {name: hashlib.sha256(jar.read(name)).hexdigest() for name in files}
                    else:
                        after = {name: hashlib.sha256((path / name).read_bytes()).hexdigest() for name in files}
                    self.assertEqual(before, after)

    def test_namespaces_and_existing_asset_families(self):
        files = {
            "assets/first/sounds.json": json_bytes(SOUNDS),
            "assets/second/sounds.json": json_bytes({"ambient.chime": SOUNDS["ambient.chime"]}),
            "assets/first/models/item/bell.json": b'{}',
            "assets/first/lang/en_us.json": json_bytes({"subtitles.fixture.chime": "Chime"}),
            "assets/first/textures/item/bell.png": b'fixture-image-bytes',
            "assets/first/particles/spark.json": b'{}',
            "data/first/recipes/bell.json": b'{}',
            "fabric.mod.json": json_bytes({"id": "first"}),
            "sounds.json": json_bytes({"not-a-pack-event": {}}),
            "assets/first/nested/sounds.json": json_bytes({"not-an-event-manifest": {}}),
            "assets/first/readme.json": b'{}',
        }
        result = inventory(write_jar(self.root / "mixed.jar", files))
        self.assertEqual(result["counts"]["category"], {"sound-event": 3, "model": 1,
                         "translation-key": 1, "texture": 1, "particle": 1, "data-registry": 1, "mod-id": 1})
        self.assertEqual({row["id"] for row in result["entries"] if row["category"] == "sound-event"},
                         {"first:ambient.chime", "first:nested/echo", "second:ambient.chime"})

    def test_generated_duplicate_roots_do_not_inflate_counts(self):
        files = {prefix + "assets/fixture/sounds.json": json_bytes(SOUNDS)
                 for prefix in ("src/main/resources/", "src/generated/resources/")}
        source = write_tree(self.root / "duplicates", files)
        result = inventory(source)
        self.assertEqual(result["entry_count"], 2)
        self.assertEqual(result["notes"], [])
        changed = {**SOUNDS, "ambient.chime": {"sounds": ["minecraft:block/bell/use"]}}
        write_tree(source, {"src/generated/resources/assets/fixture/sounds.json": json_bytes(changed)})
        result = inventory(source)
        self.assertEqual(result["entry_count"], 2)
        self.assertTrue(any(note["id"] == "duplicate-identity-different-bytes" for note in result["notes"]))

    def test_bad_json_is_reported_and_empty_manifest_is_empty(self):
        bad = inventory(write_jar(self.root / "bad.jar", {"assets/fixture/sounds.json": b'{broken'}))
        self.assertEqual(bad["entry_count"], 0)
        self.assertEqual(bad["notes"], [{"id": "unparsed-sounds-json", "path": "assets/fixture/sounds.json"}])
        empty = inventory(write_jar(self.root / "empty.jar", {"assets/fixture/sounds.json": b'{}'}))
        self.assertEqual(empty["entry_count"], 0)
        self.assertEqual(empty["notes"], [])

    def test_parity_blocks_missing_events_and_preserves_exclusion_rules(self):
        source = write_tree(self.root / "source", {"src/main/resources/assets/fixture/sounds.json": json_bytes(SOUNDS)})
        source_inventory = inventory(source)
        missing = write_jar(self.root / "missing.jar", {
            "assets/fixture/sounds.json": json_bytes({"ambient.chime": SOUNDS["ambient.chime"]})})
        result = audit(source_inventory, missing)
        self.assertEqual(result["status"], "FAIL")
        self.assertEqual([row["id"] for row in result["missing"]], ["fixture:nested/echo"])
        self.assertEqual(result["counts"]["missing_categories"], {"sound-event": 1})
        whole_manifest_missing = write_jar(self.root / "no-sounds.jar", {"fabric.mod.json": b'{"id":"fixture"}'})
        self.assertEqual(len(audit(source_inventory, whole_manifest_missing)["missing"]), 2)
        exclusion = {"category": "sound-event", "id": "fixture:nested/echo",
                     "status": "intentionally_excluded", "reason": "Explicit fixture exclusion"}
        self.assertEqual(audit(source_inventory, missing, [exclusion])["status"], "PASS")
        self.assertEqual(audit(source_inventory, missing, [{**exclusion, "reason": ""}])["status"], "FAIL")
        self.assertEqual(audit(source_inventory, missing, [{**exclusion, "status": "pending"}])["status"], "FAIL")
        complete = write_jar(self.root / "complete.jar", {"assets/fixture/sounds.json": json_bytes(SOUNDS)})
        self.assertEqual(audit(source_inventory, complete)["status"], "PASS")

    def test_real_inventory_and_release_gate_cli(self):
        source = write_tree(self.root / "source", {"src/main/resources/assets/fixture/sounds.json": json_bytes(SOUNDS)})
        target = write_jar(self.root / "target.jar", {
            "assets/fixture/sounds.json": json_bytes({"ambient.chime": SOUNDS["ambient.chime"]})})
        before = target.read_bytes()
        source_json = self.root / "source-inventory.json"
        cp = subprocess.run([sys.executable, str(HERE / "content_identity_inventory.py"), str(source),
                             "--json-out", str(source_json)], capture_output=True, text=True, timeout=30)
        self.assertEqual(cp.returncode, 0, cp.stderr)
        self.assertEqual(json.loads(source_json.read_text())["entry_count"], 2)
        for fail_on_missing, code in ((False, 0), (True, 3)):
            args = [sys.executable, str(HERE / "content_parity_audit.py"), str(source_json), str(target)]
            if fail_on_missing:
                args.append("--fail-on-missing")
            cp = subprocess.run(args, capture_output=True, text=True, timeout=30)
            self.assertEqual(cp.returncode, code, cp.stderr)
            result = json.loads(cp.stdout)
            self.assertEqual(result["status"], "FAIL")
            self.assertEqual(result["missing"][0]["id"], "fixture:nested/echo")
        self.assertEqual(target.read_bytes(), before)


# Directory names are specified in Minecraft Java 1.21's "Directory renames":
# https://www.minecraft.net/en-us/article/minecraft-java-edition-1-21
# The byte fixtures below test inventory, not command execution or NBT validity.
class DataPathInventoryTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)

    @staticmethod
    def files(legacy=False, prefix=""):
        function_dir = "functions" if legacy else "function"
        structure_dir = "structures" if legacy else "structure"
        return {
            prefix + f"data/fixture/{function_dir}/load.mcfunction": b"say inventory fixture\n",
            prefix + f"data/fixture/{function_dir}/nested/functions/tick.mcfunction": b"# nested identity\n",
            prefix + f"data/fixture/{structure_dir}/house.nbt": b"\x0a\x00\x00\x00",
            prefix + f"data/fixture/{structure_dir}/nested/structures/arch.snbt": b"{size:[1,1,1]}",
        }

    @staticmethod
    def keys(result):
        return {(row["category"], row.get("subtype"), row["id"]) for row in result["entries"]}

    def test_legacy_and_modern_paths_across_source_and_archive_layouts(self):
        expected = {("function", None, "fixture:load"),
                    ("function", None, "fixture:nested/functions/tick"),
                    ("structure-template", None, "fixture:house"),
                    ("structure-template", None, "fixture:nested/structures/arch")}
        for legacy in (False, True):
            for prefix in ("", "src/main/resources/", "src/client/resources/", "src/generated/resources/"):
                for archive in (False, True):
                    with self.subTest(legacy=legacy, prefix=prefix, archive=archive):
                        files = self.files(legacy, prefix)
                        target = self.root / f"layout-{legacy}-{prefix.replace('/', '_') or 'pack'}"
                        path = write_jar(target.with_suffix('.jar'), files) if archive else write_tree(target, files)
                        before = path.read_bytes() if archive else {n: (path / n).read_bytes() for n in files}
                        result = inventory(path)
                        self.assertEqual(self.keys(result), expected)
                        self.assertEqual(result["entry_count"], 4)
                        self.assertEqual(result["counts"]["category"], {"function": 2, "structure-template": 2})
                        self.assertEqual(result["notes"], [])
                        for row in result["entries"]:
                            payload = files[prefix + row["path"]]
                            self.assertEqual(row["sha256"], hashlib.sha256(payload).hexdigest())
                            self.assertEqual(row["size"], len(payload))
                        self.assertEqual(inventory(path), result)
                        after = path.read_bytes() if archive else {n: (path / n).read_bytes() for n in files}
                        self.assertEqual(before, after)

    def test_cross_version_parity_and_saved_legacy_inventory(self):
        for old_source in (False, True):
            source = inventory(write_tree(self.root / f"source-{old_source}", self.files(old_source)))
            for old_target in (False, True):
                with self.subTest(source_legacy=old_source, target_legacy=old_target):
                    target = write_jar(self.root / f"target-{old_target}.jar", self.files(old_target))
                    result = audit(source, target)
                    self.assertEqual(result["status"], "PASS")
                    self.assertEqual((result["source_count"], result["target_count"]), (4, 4))
                    self.assertEqual(result["missing"], [])
                    self.assertEqual(result["extras"], [])
        # A pre-fix saved inventory already uses these category/id values.
        legacy = {"input": "historical-source", "entries": [
            {"category": "function", "id": "fixture:load", "path": "data/fixture/functions/load.mcfunction"},
            {"category": "structure-template", "id": "fixture:house", "path": "data/fixture/structures/house.nbt"},
        ]}
        self.assertEqual(audit(legacy, self.root / "target-False.jar")["status"], "PASS")

    def test_missing_modern_content_blocks_parity(self):
        source = inventory(write_tree(self.root / "source", self.files()))
        expected = self.keys(source)
        self.assertEqual(len(expected), 4)
        for path in self.files():
            with self.subTest(missing=path):
                files = self.files()
                del files[path]
                target = write_jar(self.root / "missing.jar", files)
                result = audit(source, target)
                self.assertEqual(result["status"], "FAIL")
                self.assertEqual(result["counts"]["missing"], 1)
                self.assertEqual(result["missing"][0]["path"], path)
        empty = write_jar(self.root / "empty.jar", {"pack.mcmeta": b"{}"})
        result = audit(source, empty)
        self.assertEqual(result["status"], "FAIL")
        self.assertEqual(result["counts"]["missing_categories"], {"function": 2, "structure-template": 2})

    def test_duplicate_aliases_preserve_hash_conflict_diagnostics(self):
        files = self.files(True, "src/main/resources/")
        files.update(self.files(False, "src/generated/resources/"))
        path = write_tree(self.root / "source", files)
        result = inventory(path)
        self.assertEqual(result["entry_count"], 4)
        self.assertEqual(result["notes"], [])
        changed = path / "src/generated/resources/data/fixture/function/load.mcfunction"
        changed.write_bytes(b"say different payload\n")
        result = inventory(path)
        self.assertEqual(result["entry_count"], 4)
        self.assertEqual(len(result["notes"]), 1)
        note = result["notes"][0]
        self.assertEqual(note["id"], "duplicate-identity-different-bytes")
        self.assertEqual(note["identity"], ["function", None, "fixture:load"])
        self.assertEqual(set(note["paths"]), {"data/fixture/function/load.mcfunction", "data/fixture/functions/load.mcfunction"})

    def test_exact_families_namespaces_and_prefix_boundaries(self):
        files = {
            "data/first/function/same.mcfunction": b"# first",
            "data/second/function/same.mcfunction": b"# second",
            "data/first/structure/same.nbt": b"structure bytes",
            "data/first/worldgen/structure/same.json": b"{}",
            "data/first/tags/function/same.json": b'{"values":[]}',
            "data/first/functionality/wrong.mcfunction": b"# ignored",
            "data/first/structure_extra/wrong.nbt": b"ignored",
            "data/first/nested/function/wrong.mcfunction": b"# ignored",
            "data/first/nested/structure/wrong.nbt": b"ignored",
            "data/first/function/wrong.nbt": b"ignored",
            "data/first/structure/wrong.mcfunction": b"# ignored",
            "data/first/function/backup.mcfunction.bak": b"# ignored",
            "assets/first/function/wrong.mcfunction": b"# ignored",
            "src/main/java/data/first/function/wrong.mcfunction": b"# ignored",
        }
        result = inventory(write_jar(self.root / "families.jar", files))
        self.assertEqual(self.keys(result), {
            ("function", None, "first:same"), ("function", None, "second:same"),
            ("structure-template", None, "first:same"),
            ("data-registry", "worldgen/structure", "first:same"),
            ("tag", None, "first:function/same"),
        })
        self.assertEqual(result["entry_count"], 5)
        self.assertEqual(result["notes"], [])

    def test_exclusions_remain_exact_and_evidence_required(self):
        source = inventory(write_tree(self.root / "source", self.files()))
        files = self.files()
        del files["data/fixture/function/load.mcfunction"]
        target = write_jar(self.root / "missing.jar", files)
        exclusion = {"category": "function", "id": "fixture:load", "status": "intentionally_excluded",
                     "reason": "Explicitly excluded by this synthetic test"}
        self.assertEqual(audit(source, target, [exclusion])["status"], "PASS")
        for field, value in (("category", "structure-template"), ("id", "other:load"),
                             ("status", "pending"), ("reason", "")):
            with self.subTest(field=field):
                self.assertEqual(audit(source, target, [{**exclusion, field: value}])["status"], "FAIL")

    def test_real_inventory_and_parity_cli(self):
        source = write_tree(self.root / "source", self.files())
        source_json = self.root / "source.json"
        proc = subprocess.run([sys.executable, str(HERE / "content_identity_inventory.py"), str(source),
                               "--json-out", str(source_json)], capture_output=True, text=True, timeout=30)
        self.assertEqual(proc.returncode, 0, proc.stderr)
        self.assertEqual(json.loads(source_json.read_text())["entry_count"], 4)
        for missing, expected_status, code in ((True, "FAIL", 3), (False, "PASS", 0)):
            files = self.files()
            if missing:
                del files["data/fixture/function/load.mcfunction"]
                del files["data/fixture/structure/house.nbt"]
            target = write_jar(self.root / "target.jar", files)
            before = target.read_bytes()
            args = [sys.executable, str(HERE / "content_parity_audit.py"), str(source_json), str(target)]
            for strict in (False, True):
                with self.subTest(missing=missing, strict=strict):
                    proc = subprocess.run(args + (["--fail-on-missing"] if strict else []),
                                          capture_output=True, text=True, timeout=30)
                    self.assertEqual(proc.returncode, code if strict else 0, proc.stderr)
                    result = json.loads(proc.stdout)
                    self.assertEqual(result["status"], expected_status)
                    self.assertEqual(result["counts"]["missing"], 2 if missing else 0)
            self.assertEqual(target.read_bytes(), before)


if __name__ == "__main__":
    unittest.main(verbosity=2)
