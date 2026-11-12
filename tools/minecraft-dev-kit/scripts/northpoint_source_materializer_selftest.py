#!/usr/bin/env python3
"""Exercise the v6.3 command surface against the maintained production materializer."""
import json
import pathlib
import subprocess
import sys
import tempfile
from northpoint_simple_conversion_smoke import make_old_mod
from northpoint_target_26_3 import tree_digest
from port_source_materializer import materialize, ConversionBlock
from port_intake import inspect

HERE = pathlib.Path(__file__).resolve().parent
with tempfile.TemporaryDirectory(prefix="materializer-interface-") as td:
    root = pathlib.Path(td)
    source, target = root / "source", root / "target"
    make_old_mod(source)
    before = tree_digest(source)
    assert inspect(source, "fabric")["detected"]["loaders"] == ["fabric"]
    cp = subprocess.run([sys.executable, str(HERE / "port_26_3_pipeline.py"), str(source),
                         "--loader", "fabric", "--output", str(target), "--mod-id", "simpleport",
                         "--materialize-source"], capture_output=True, text=True)
    assert cp.returncode == 0, cp.stderr
    result = json.loads(cp.stdout)
    assert result["materialized_source"] and result["materialization"]["source_unchanged"]
    assert tree_digest(source) == before
    assert (target / "src/main/java/com/example/SimplePort.java").read_bytes() == (source / "src/main/java/com/example/SimplePort.java").read_bytes()
    metadata = json.loads((target / "src/main/resources/fabric.mod.json").read_text())
    assert metadata["depends"]["minecraft"] == "~26.3"
    assert "fabric" not in metadata["depends"] and "fabric-api" in metadata["depends"]
    assert "fabric-metadata-target-dependencies" in result["materialization"]["applied_rule_ids"]
    ledger = json.loads((target / "porting-ledger.json").read_text())
    rows = {row["id"]: row for row in ledger["items"]}
    assert rows["surface:java_sources"]["status"] == "missing"
    assert rows["semantic:fabric-old-loom-remap-plugin"]["status"] == "missing"
    assert result["initial_missing_surfaces"] == sum(r["status"] == "missing" for r in rows.values())
    target_before = tree_digest(target)
    for out, mod_id in ((target, "simpleport"), (source / "nested", "simpleport"),
                        (source, "simpleport"), (root, "simpleport"), (root / "renamed", "othermod")):
        try:
            materialize(source, out, "fabric", mod_id)
        except ConversionBlock:
            pass
        else:
            raise AssertionError(f"unsafe conversion accepted: {out}, {mod_id}")
    assert tree_digest(source) == before and tree_digest(target) == target_before
    # Reject an unproven legacy version translation, without altering source input.
    metadata_path = source / "src/main/resources/fabric.mod.json"
    versioned = json.loads(metadata_path.read_text())
    versioned["depends"]["fabric"] = ">=0.92"
    metadata_path.write_text(json.dumps(versioned))
    versioned_digest = tree_digest(source)
    try:
        materialize(source, root / "versioned", "fabric", "simpleport")
    except ConversionBlock as exc:
        assert "versioned legacy fabric" in str(exc)
    else:
        raise AssertionError("unproven legacy dependency constraint was accepted")
    assert tree_digest(source) == versioned_digest
    # Metadata lookalikes must never be treated as loader declarations.
    fake = root / "fake"; fake.mkdir()
    (fake / "notfabric.mod.json").write_text('{"id":"fake"}')
    assert inspect(fake, "fabric")["detected"]["loaders"] == []
print("Northpoint source materializer compatibility self-test: PASS")
