#!/usr/bin/env python3
"""Exact descriptor remapping and real JVM overload-selection regressions."""
from __future__ import annotations

import hashlib
import itertools
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

from api_reference_migration import audit
from classfile_symbol_index import build_index, parse_class
from mapping_bridge import bridge, descriptor_variants, remap_descriptor
from mapping_lineage import parse_tiny_v2

HERE = Path(__file__).resolve().parent


def class_index(mapping, source="source", target="mojang_named"):
    return {"namespaces": [source, target], "classes": [
        {"names": {source: old, target: new}} for old, new in mapping.items()]}


class MappingBridgeTest(unittest.TestCase):
    def test_overlapping_aliases_are_replaced_once(self):
        indexes = [class_index({"p/A": "p/B", "p/B": "p/C"})]
        for original, expected in [
            ("(Lp/A;Lp/B;)Lp/A;", "(Lp/B;Lp/C;)Lp/B;"),
            ("([Lp/A;[[Lp/B;I)[[Lp/A;", "([Lp/B;[[Lp/C;I)[[Lp/B;"),
            ("Lp/A;", "Lp/B;"),
            ("(Lp/B;Lp/A;)Lp/B;", "(Lp/C;Lp/B;)Lp/C;"),
        ]:
            with self.subTest(original=original):
                result = remap_descriptor(indexes, original, "source", "mojang_named")
                self.assertEqual(result["descriptor"], expected)
                self.assertEqual(result["status"], "RESOLVED")
                self.assertEqual(result["unresolved"], [])

    def test_cycles_and_token_order_preserve_each_original_type(self):
        mapping = {"p/A": "p/B", "p/B": "p/C", "p/C": "p/A"}
        for order in itertools.permutations(mapping):
            for rows in (mapping, dict(reversed(list(mapping.items())))):
                original = "(" + "".join("L" + name + ";" for name in order) + ")L" + order[0] + ";"
                expected = "(" + "".join("L" + mapping[name] + ";" for name in order) + ")L" + mapping[order[0]] + ";"
                with self.subTest(order=order, rows=list(rows)):
                    self.assertEqual(remap_descriptor([class_index(rows)], original, "source", "mojang_named")["descriptor"], expected)

    def test_unknown_types_stay_explicitly_unresolved(self):
        result = remap_descriptor([class_index({"p/A": "p/B", "p/B": "p/C"})],
                                  "(Lp/A;Lp/Unknown;Lp/B;)Lp/Unknown;", "source", "mojang_named")
        self.assertEqual(result["descriptor"], "(Lp/B;Lp/Unknown;Lp/C;)Lp/Unknown;")
        self.assertEqual(result["status"], "PARTIAL")
        self.assertEqual([row["class"] for row in result["unresolved"]], ["p/Unknown", "p/Unknown"])

    def test_primitives_same_namespace_and_nested_classes(self):
        indexes = [class_index({"p/A": "p/B", "p/B": "p/C", "p/A$Inner": "p/B$Inner"})]
        for descriptor in ("I", "[[J", "(ZBCSIJFD)V", "(Lp/A;[Lp/B;)Lp/A$Inner;"):
            self.assertEqual(remap_descriptor(indexes, descriptor, "source", "source")["descriptor"], descriptor)
        self.assertEqual(remap_descriptor(indexes, "(Lp/A$Inner;Lp/A;)Lp/B;", "source", "mojang_named")["descriptor"],
                         "(Lp/B$Inner;Lp/B;)Lp/C;")
        self.assertEqual(remap_descriptor([], "(I[[D)V", "source", "missing")["status"], "RESOLVED")

    def test_transitive_mapping_indexes_and_descriptor_variants(self):
        first = parse_tiny_v2("tiny\t2\t0\tsource\tmid\nc\tp/A\tp/M\nc\tp/B\tp/N\n"
                              "c\tp/Owner\tp/MidOwner\n\tm\t(Lp/A;Lp/B;)Lp/A;\told\tintermediate\n")
        second = parse_tiny_v2("tiny\t2\t0\tmid\tmojang_named\nc\tp/M\tp/B\nc\tp/N\tp/C\n"
                               "c\tp/MidOwner\tp/TargetOwner\n\tm\t(Lp/M;Lp/N;)Lp/M;\tintermediate\tnew\n")
        for indexes in ([first, second], [second, first]):
            result = bridge(indexes, "source", "p/Owner", "old", "(Lp/A;Lp/B;)Lp/A;")
            self.assertEqual(result["members"]["mojang_named"], "new")
            self.assertEqual(result["descriptor_by_namespace"], {
                "source": "(Lp/A;Lp/B;)Lp/A;", "mid": "(Lp/M;Lp/N;)Lp/M;", "mojang_named": "(Lp/B;Lp/C;)Lp/B;"})
            self.assertEqual(descriptor_variants(indexes, "Lp/A;", "source")["mojang_named"], "Lp/B;")

    def test_real_classfile_audit_cli_and_jvm_overload(self):
        javac, java = shutil.which("javac"), shutil.which("java")
        self.assertTrue(javac and java, "real javac/java are required for this mapping regression")
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            prefix = "net/minecraft/fixture/"
            source_desc = f"(L{prefix}A;L{prefix}B;)L{prefix}A;"
            expected = f"(L{prefix}B;L{prefix}C;)L{prefix}B;"
            tiny = (f"tiny\t2\t0\tsource\tmojang_named\nc\t{prefix}A\t{prefix}B\n"
                    f"c\t{prefix}B\t{prefix}C\nc\t{prefix}SourceOwner\t{prefix}TargetOwner\n"
                    f"\tm\t{source_desc}\toldName\tnewName\n")
            index = parse_tiny_v2(tiny)
            index_path = root / "mapping.json"
            index_path.write_text(json.dumps(index), encoding="utf-8")
            original_index = index_path.read_bytes()
            common = "package net.minecraft.fixture; "
            source_files = {
                "A.java": common + "public class A {}",
                "B.java": common + "public class B {}",
                "SourceOwner.java": common + "public class SourceOwner { public static A oldName(A first, B second) { return first; } }",
                "Caller.java": "package fixture; public class Caller { public static net.minecraft.fixture.A call(net.minecraft.fixture.A first, net.minecraft.fixture.B second) { return net.minecraft.fixture.SourceOwner.oldName(first, second); } }",
            }
            target_files = {
                "B.java": common + "public class B {}",
                "C.java": common + "public class C {}",
                "TargetOwner.java": common + "public class TargetOwner { public static B newName(B first, C second) { return first; } public static C newName(C first, C second) { return second; } }",
                "InvokeMapping.java": r'''import java.lang.invoke.*;
public class InvokeMapping {
  public static void main(String[] args) throws Throwable {
    MethodType type = MethodType.fromMethodDescriptorString(args[0], InvokeMapping.class.getClassLoader());
    MethodHandle handle = MethodHandles.lookup().findStatic(net.minecraft.fixture.TargetOwner.class, "newName", type);
    Object first = type.parameterType(0).getConstructor().newInstance();
    Object second = type.parameterType(1).getConstructor().newInstance();
    Object result = handle.invokeWithArguments(first, second);
    if (!(result instanceof net.minecraft.fixture.B) || result != first) {
      throw new AssertionError("wrong overload selected: " + type);
    }
    System.out.println("PASS correct overload " + type);
  }
}''',
            }
            def compile_files(label, files):
                sources, classes = root / label, root / (label + "-classes")
                sources.mkdir(); classes.mkdir()
                for name, content in files.items():
                    (sources / name).write_text(content, encoding="utf-8")
                cp = subprocess.run([javac, "-d", str(classes), *[str(sources / name) for name in files]],
                                    capture_output=True, text=True, timeout=30)
                self.assertEqual(cp.returncode, 0, cp.stderr)
                return classes
            source_classes = compile_files("source", source_files)
            target_classes = compile_files("target", target_files)
            original_classes = {str(p): hashlib.sha256(p.read_bytes()).hexdigest() for p in root.rglob("*.class")}
            source_owner = parse_class((source_classes / (prefix + "SourceOwner.class")).read_bytes())
            self.assertEqual(next(m["descriptor"] for m in source_owner["methods"] if m["name"] == "oldName"), source_desc)
            report = audit(source_classes, "source", [index], build_index(target_classes))
            self.assertEqual(report["status"], "PASS", report)
            calls = [row for row in report["member_references"] if row["translation"]["source"]["name"] == "oldName"]
            self.assertEqual(len(calls), 1)
            self.assertEqual(calls[0]["translation"]["target"]["descriptor"], expected)
            args = [sys.executable, str(HERE / "mapping_bridge.py"), "--index", str(index_path),
                    "--namespace", "source", "--class", prefix + "SourceOwner", "--member", "oldName", "--descriptor", source_desc]
            cp = subprocess.run(args, capture_output=True, text=True, timeout=30)
            self.assertEqual(cp.returncode, 0, cp.stderr)
            mapped = json.loads(cp.stdout)["descriptor_by_namespace"]["mojang_named"]
            self.assertEqual(mapped, expected)
            run = subprocess.run([java, "-cp", str(target_classes), "InvokeMapping", mapped],
                                 capture_output=True, text=True, timeout=30)
            self.assertEqual(run.returncode, 0, run.stdout + run.stderr)
            self.assertIn("PASS correct overload", run.stdout)
            self.assertEqual(index_path.read_bytes(), original_index)
            self.assertEqual(original_classes, {str(p): hashlib.sha256(p.read_bytes()).hexdigest() for p in root.rglob("*.class")})


if __name__ == "__main__":
    unittest.main(verbosity=2)
