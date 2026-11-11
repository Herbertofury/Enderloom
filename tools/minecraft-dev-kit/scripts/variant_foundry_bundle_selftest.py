#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import os
import stat
import sys
import subprocess
import unittest
from unittest import mock
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("bundle", HERE / "variant_foundry_bundle.py")
mod = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = mod
assert SPEC.loader is not None
SPEC.loader.exec_module(mod)


def dump(path: Path, value) -> None:
    path.write_text(json.dumps(value, sort_keys=True), encoding="utf-8")


class BundleTransactionTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.output = self.root / "bundle"
        self.subject = self.root / "subject.json"
        self.plans = self.root / "plans.json"
        dump(self.subject, {"id": "fixture:mob"})
        dump(self.plans, {"plans": []})
        self.first = self.root / "first.bin"
        self.last = self.root / "last.bin"
        self.first.write_bytes(b"first original")
        self.last.write_bytes(b"last original")
        self.manifest = self.build()

    def build(self):
        return mod.build_manifest(
            subject_path=self.subject, plan_path=self.plans,
            assets=[("a-first", self.first), ("z-last", self.last)],
            evidence=[("proof", self.first)], minecraft="26.3",
            loader="neoforge", backend="fixture",
        )

    def assert_clean_failure(self) -> None:
        self.assertFalse((self.output / "model-bundle.json").exists())
        self.assertFalse(self.output.exists() and any(self.output.iterdir()))
        self.assertEqual(list(self.root.glob(".bundle.build-*")), [])

    def assert_retry(self) -> None:
        self.assertEqual(mod.compile_bundle(self.output, self.manifest)["state"], "compiled")
        self.assertEqual(mod.compile_bundle(self.output, self.manifest)["state"], "reused")
        self.assertEqual(len(list((self.output / "objects").rglob("*"))), 5)
        self.assertEqual(self.first.read_bytes(), b"first original")
        self.assertEqual(self.last.read_bytes(), b"last original")
        self.assertEqual(list(self.root.glob(".bundle.build-*")), [])

    def test_changed_last_asset_does_not_poison_new_output(self) -> None:
        self.last.write_bytes(b"changed")
        with self.assertRaisesRegex(ValueError, "integrity verification"):
            mod.compile_bundle(self.output, self.manifest)
        self.assert_clean_failure()
        self.last.write_bytes(b"last original")
        self.assert_retry()

    def test_missing_last_asset_preserves_existing_empty_output(self) -> None:
        self.output.mkdir()
        self.last.unlink()
        with self.assertRaises(FileNotFoundError):
            mod.compile_bundle(self.output, self.manifest)
        self.assertTrue(self.output.is_dir())
        self.assert_clean_failure()
        self.last.write_bytes(b"last original")
        self.assert_retry()

    @unittest.skipIf(os.name == "nt", "POSIX permission modes")
    def test_existing_private_output_keeps_permission_mode(self) -> None:
        self.output.mkdir(mode=0o700)
        original = stat.S_IMODE(self.output.stat().st_mode)
        mod.compile_bundle(self.output, self.manifest)
        self.assertEqual(stat.S_IMODE(self.output.stat().st_mode), original)
        self.assertEqual(original, 0o700)

    @unittest.skipUnless(hasattr(os, "setxattr"), "extended attributes unavailable")
    def test_existing_output_keeps_supported_extended_attributes(self) -> None:
        self.output.mkdir()
        try:
            os.setxattr(self.output, "user.bundle-test", b"original metadata")
        except OSError as exc:
            self.skipTest(f"fixture filesystem lacks user attributes: {exc}")
        mod.compile_bundle(self.output, self.manifest)
        self.assertEqual(os.getxattr(self.output, "user.bundle-test"), b"original metadata")

    def test_partial_copy_failure_cleans_staging_and_allows_retry(self) -> None:
        copy = mod.shutil.copyfile
        calls = []
        def fail_copy(src, dst):
            calls.append(src)
            self.assertFalse(self.output.exists())
            if len(calls) == 2:
                Path(dst).write_bytes(b"partial")
                raise OSError("injected copy error")
            return copy(src, dst)
        with mock.patch.object(mod.shutil, "copyfile", side_effect=fail_copy):
            with self.assertRaisesRegex(OSError, "injected copy"):
                mod.compile_bundle(self.output, self.manifest)
        self.assertEqual(len(calls), 2)
        self.assert_clean_failure()
        self.assert_retry()

    def test_manifest_failure_keeps_release_invisible(self) -> None:
        def fail_manifest(path, data):
            self.assertFalse(self.output.exists())
            Path(path).write_bytes(data[:13])
            raise OSError("injected manifest error")
        with mock.patch.object(mod, "write_atomic", side_effect=fail_manifest):
            with self.assertRaisesRegex(OSError, "injected manifest"):
                mod.compile_bundle(self.output, self.manifest)
        self.assert_clean_failure()
        self.assert_retry()

    def test_publish_failure_allows_retry(self) -> None:
        with mock.patch.object(Path, "rename", side_effect=PermissionError("injected rename error")):
            with self.assertRaisesRegex(PermissionError, "injected rename"):
                mod.compile_bundle(self.output, self.manifest)
        self.assert_clean_failure()
        self.assert_retry()

    def test_foreign_output_is_preserved(self) -> None:
        self.output.mkdir()
        sentinel = self.output / "keep.bin"
        sentinel.write_bytes(b"unrelated original")
        with self.assertRaisesRegex(ValueError, "non-empty"):
            mod.compile_bundle(self.output, self.manifest)
        self.assertEqual(sentinel.read_bytes(), b"unrelated original")
        self.assertEqual(list(self.output.iterdir()), [sentinel])
        sentinel.unlink()
        self.output.rmdir()
        self.output.write_bytes(b"file original")
        with self.assertRaises(OSError):
            mod.compile_bundle(self.output, self.manifest)
        self.assertEqual(self.output.read_bytes(), b"file original")

    def test_concurrent_foreign_output_is_not_overwritten(self) -> None:
        rename = Path.rename
        def publish(src, dst):
            dst.mkdir()
            (dst / "keep.bin").write_bytes(b"concurrent original")
            return rename(src, dst)
        with mock.patch.object(Path, "rename", publish):
            with self.assertRaisesRegex(ValueError, "non-empty"):
                mod.compile_bundle(self.output, self.manifest)
        self.assertEqual((self.output / "keep.bin").read_bytes(), b"concurrent original")
        self.assertFalse((self.output / "model-bundle.json").exists())
        self.assertEqual(list(self.root.glob(".bundle.build-*")), [])

    def test_existing_corrupt_or_different_bundle_is_preserved(self) -> None:
        mod.compile_bundle(self.output, self.manifest)
        saved = (self.output / "model-bundle.json").read_bytes()
        changed = dict(self.manifest, subject_id="fixture:other")
        with self.assertRaisesRegex(ValueError, "immutable bundle"):
            mod.compile_bundle(self.output, changed)
        obj = self.output / self.manifest["assets"][0]["object_path"]
        obj.write_bytes(b"corrupt original")
        with self.assertRaisesRegex(ValueError, "missing or corrupt"):
            mod.compile_bundle(self.output, self.manifest)
        self.assertEqual(obj.read_bytes(), b"corrupt original")
        self.assertEqual((self.output / "model-bundle.json").read_bytes(), saved)

    def race(self, different: bool) -> None:
        # Independent processes meet at publication, after both passed preflight
        # and built complete objects. This exercises actual directory-rename rules.
        other = self.manifest
        if different:
            alternate = self.root / "alternate.bin"
            alternate.write_bytes(b"alternate content")
            other = mod.build_manifest(
                subject_path=self.subject, plan_path=self.plans,
                assets=[("other", alternate)], minecraft="26.3",
                loader="neoforge", backend="fixture",
            )
        paths = [self.root / "manifest-0.json", self.root / "manifest-1.json"]
        for path, value in zip(paths, [self.manifest, other]):
            dump(path, value)
        script = r'''
import importlib.util, json, sys, time
from pathlib import Path
source, manifest, output, ready, peer = map(Path, sys.argv[1:])
spec = importlib.util.spec_from_file_location("bundle", source)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
rename = Path.rename
def synchronized_rename(self, destination):
    ready.write_text("ready", encoding="utf-8")
    deadline = time.monotonic() + 15
    while not peer.exists():
        if time.monotonic() > deadline:
            raise TimeoutError("publisher rendezvous timed out")
        time.sleep(0.01)
    return rename(self, destination)
Path.rename = synchronized_rename
try:
    print(json.dumps(mod.compile_bundle(output, json.loads(manifest.read_text(encoding="utf-8")))))
except ValueError as exc:
    print(json.dumps({"state": "rejected", "reason": str(exc)}))
'''
        procs = []
        try:
            for i, path in enumerate(paths):
                procs.append(subprocess.Popen([
                    sys.executable, "-c", script, str(HERE / "variant_foundry_bundle.py"),
                    str(path), str(self.output), str(self.root / f"ready-{i}"),
                    str(self.root / f"ready-{1-i}"),
                ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True))
            results = []
            for proc in procs:
                stdout, stderr = proc.communicate(timeout=25)
                self.assertEqual(proc.returncode, 0, stderr)
                results.append(json.loads(stdout))
        finally:
            for proc in procs:
                if proc.poll() is None:
                    proc.kill()
                proc.communicate()
        states = sorted(row["state"] for row in results)
        self.assertEqual(states, ["compiled", "rejected" if different else "reused"])
        winner = json.loads((self.output / "model-bundle.json").read_text(encoding="utf-8"))
        self.assertIn(winner, [self.manifest, other])
        self.assertEqual(mod.compile_bundle(self.output, winner)["state"], "reused")
        self.assertEqual(list(self.root.glob(".bundle.build-*")), [])
        if different:
            rejected = next(row for row in results if row["state"] == "rejected")
            self.assertIn("immutable bundle", rejected["reason"])

    def test_concurrent_identical_publishers_reuse_verified_winner(self) -> None:
        self.race(False)

    def test_concurrent_different_publishers_preserve_one_winner(self) -> None:
        self.race(True)


def transaction_regressions() -> None:
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(BundleTransactionTests)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    if not result.wasSuccessful():
        raise AssertionError("bundle transaction regressions failed")


def main() -> int:
    transaction_regressions()
    with tempfile.TemporaryDirectory() as td:
        root = Path(td)
        subject = root / "subject.json"
        plans = root / "plans.json"
        dna = root / "dna.json"
        model = root / "creeper.bbmodel"
        texture = root / "creeper.png"
        duplicate = root / "copy.bin"
        evidence = root / "provider-receipt.json"
        output = root / "bundle"

        dump(subject, {"schema_version": 1, "id": "bloom_and_boom:creeper_female"})
        dump(plans, {"schema_version": 1, "plans": [
            {"variant_id": "bloom_and_boom:creeper_female@minecraft:snowy_plains"},
            {"variant_id": "bloom_and_boom:creeper_female@minecraft:swamp"},
        ]})
        dump(dna, {"schema_version": 1, "profiles": []})
        model.write_bytes(b"bbmodel-fixture-v1")
        texture.write_bytes(b"texture-fixture-v1")
        duplicate.write_bytes(b"texture-fixture-v1")
        evidence.write_text('{"provider":"fixture","state":"succeeded"}', encoding="utf-8")

        assets = [
            ("editable-model", model),
            ("texture", texture),
            ("duplicate-proof", duplicate),
        ]
        manifest = mod.build_manifest(
            subject_path=subject,
            plan_path=plans,
            biome_dna_path=dna,
            assets=assets,
            minecraft="26.3",
            loader="neoforge",
            backend="enderloom-skeletal",
            evidence=[("provider-job-receipt", evidence)],
        )
        assert manifest["asset_count"] == 3
        assert manifest["evidence_count"] == 1
        assert manifest["evidence"][0]["role"] == "provider-job-receipt"
        assert manifest["unique_object_count"] == 3
        assert len(manifest["variant_ids"]) == 2

        first = mod.compile_bundle(output, manifest)
        assert first["state"] == "compiled"
        second = mod.compile_bundle(output, manifest)
        assert second["state"] == "reused"
        assert second["bundle_id"] == first["bundle_id"]

        object_files = [p for p in (output / "objects").rglob("*") if p.is_file()]
        assert len(object_files) == 3
        saved = json.loads((output / "model-bundle.json").read_text(encoding="utf-8"))
        assert saved["bundle_id"] == manifest["bundle_id"]

        texture.write_bytes(b"texture-fixture-v2")
        changed = mod.build_manifest(
            subject_path=subject,
            plan_path=plans,
            biome_dna_path=dna,
            assets=assets,
            minecraft="26.3",
            loader="neoforge",
            backend="enderloom-skeletal",
            evidence=[("provider-job-receipt", evidence)],
        )
        assert changed["bundle_id"] != manifest["bundle_id"]
        try:
            mod.compile_bundle(output, changed)
        except ValueError as exc:
            assert "immutable bundle" in str(exc)
        else:
            raise AssertionError("mutating an existing immutable bundle should fail")

        print(json.dumps({
            "status": "passed",
            "bundle_id": manifest["bundle_id"],
            "assets": manifest["asset_count"],
            "unique_objects": manifest["unique_object_count"],
            "evidence": manifest["evidence_count"],
        }, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
