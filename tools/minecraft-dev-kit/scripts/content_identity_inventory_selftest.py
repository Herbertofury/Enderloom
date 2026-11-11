#!/usr/bin/env python3
"""Bounded source/JAR sound-identity and release-parity regressions."""
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


if __name__ == "__main__":
    unittest.main(verbosity=2)
