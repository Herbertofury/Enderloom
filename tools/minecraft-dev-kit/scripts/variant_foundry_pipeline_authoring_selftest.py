#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("pipeline_authoring", HERE / "variant_foundry_pipeline.py")
mod = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = mod
assert SPEC.loader is not None
SPEC.loader.exec_module(mod)

TOOLS = [
    "bbmodel_info",
    "bbmodel_edit",
    "bbmodel_validate",
    "bbmodel_validate_animations",
    "bbmodel_contact_sheet",
]
PNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="

FAKE = r'''#!/usr/bin/env python3
import argparse,base64,hashlib,json,sys
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument("--root",required=True);a=p.parse_args()
root=Path(a.root)
TOOLS=%r
PNG=%r
def revision(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()
for line in sys.stdin:
    try: msg=json.loads(line)
    except Exception: continue
    if "id" not in msg: continue
    rid=msg["id"]; method=msg.get("method"); params=msg.get("params") or {}
    if method=="initialize":
        result={"protocolVersion":params.get("protocolVersion"),"capabilities":{"tools":{}},"serverInfo":{"name":"pipeline-authoring-fixture","version":"1"}}
    elif method=="tools/list":
        result={"tools":[{"name":n,"description":"fixture","inputSchema":{"type":"object"}} for n in TOOLS]}
    elif method=="tools/call":
        name=params.get("name"); args=params.get("arguments") or {}; file=args.get("file")
        path=(root/file) if file else None
        if name=="bbmodel_info":
            result={"content":[{"type":"text","text":json.dumps({"revision":revision(path),"format":"free","name":"fixture"})}],"isError":False}
        elif name=="bbmodel_edit":
            doc=json.loads(path.read_text())
            doc["variant_foundry_operations"]=args.get("operations",[])
            path.write_text(json.dumps(doc,sort_keys=True))
            result={"content":[{"type":"text","text":json.dumps({"revision":revision(path),"results":[{"ok":True}]})}],"isError":False}
        elif name=="bbmodel_validate":
            result={"content":[{"type":"text","text":json.dumps({"valid":True})}],"isError":False}
        elif name=="bbmodel_validate_animations":
            result={"content":[{"type":"text","text":json.dumps({"valid":True,"animations":0})}],"isError":False}
        elif name=="bbmodel_contact_sheet":
            content=[]
            for view in args.get("views",["front"]):
                content.append({"type":"text","text":view+": scratch/"+view+".png"})
                content.append({"type":"image","data":PNG,"mimeType":"image/png"})
            result={"content":content,"isError":False}
        else:
            result={"content":[{"type":"text","text":"unsupported"}],"isError":True}
    else:
        sys.stdout.write(json.dumps({"jsonrpc":"2.0","id":rid,"error":{"code":-32601,"message":"unknown"}})+"\n");sys.stdout.flush();continue
    sys.stdout.write(json.dumps({"jsonrpc":"2.0","id":rid,"result":result},separators=(",",":"))+"\n");sys.stdout.flush()
''' % (TOOLS, PNG)


def dump(path: Path, value) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2), encoding="utf-8")


def main() -> int:
    with tempfile.TemporaryDirectory() as td:
        root = Path(td)
        source = root / "source"
        dump(source / "data/example/worldgen/biome/crystal_grove.json", {
            "has_precipitation": True,
            "temperature": 0.1,
            "downfall": 0.8,
            "effects": {
                "fog_color": 0x223344,
                "water_color": 0x335577,
                "sky_color": 0x7799CC,
                "foliage_color": 0x55AA66
            },
            "features": [["example:crystal_patch"]],
        })
        dump(source / "data/example/worldgen/placed_feature/crystal_patch.json", {
            "feature": "example:crystal_cluster",
            "placement": [],
        })
        dump(source / "data/example/worldgen/configured_feature/crystal_cluster.json", {
            "type": "minecraft:ore",
            "config": {"state": {"Name": "example:crystal_block"}},
        })

        subject = root / "subject.json"
        dump(subject, {
            "schema_version": 1,
            "id": "bloom_and_boom:creeper_female",
            "identity_anchors": ["creeper_face", "horns"],
            "region_locks": [
                {"region": "creeper_face", "lock": ["geometry", "uv"]},
                {"region": "horns", "lock": ["base-geometry"]},
            ],
            "variant_regions": {
                "eligible-geometry-regions": ["surface_growths"],
                "eligible-surface-regions": ["body_surface"],
                "eligible-motion-regions": ["vines"],
            },
        })

        model = root / "creeper.bbmodel"
        model.write_text(json.dumps({
            "meta": {"format_version": "5.0", "model_format": "free", "box_uv": False},
            "name": "creeper",
            "resolution": {"width": 16, "height": 16},
            "elements": [],
            "groups": [],
            "outliner": [],
            "textures": [],
        }), encoding="utf-8")
        source_sha = mod.sha256_file(model)

        bindings = root / "bindings.json"
        dump(bindings, {
            "schema_version": 1,
            "subject_id": "bloom_and_boom:creeper_female",
            "model_file": "creeper.bbmodel",
            "region_targets": {"surface_growths": ["surface_growths_anchor"]},
            "motion_targets": {"vines": ["vine_anchor"]},
            "texture_targets": {"body_surface": ["creeper.png"]},
            "templates": {
                "geometry": {
                    "faceted shards": {
                        "regions": ["surface_growths"],
                        "operations": [{
                            "op": "add_mesh_primitive",
                            "shape": "icosphere",
                            "diameter": 1.0,
                            "detail": 1,
                            "name": "vf_{biome_slug}_facet_{index}",
                            "parent": "{target}",
                        }],
                    },
                    "crystal clusters": {
                        "regions": ["surface_growths"],
                        "operations": [{
                            "op": "add_mesh_primitive",
                            "shape": "cone",
                            "diameter": 1.25,
                            "height": 2.5,
                            "sides": 5,
                            "name": "vf_{biome_slug}_crystal_{index}",
                            "parent": "{target}",
                        }],
                    },
                },
                "motif": {
                    "crystalline": {
                        "regions": ["surface_growths"],
                        "operations": [{
                            "op": "add_group",
                            "name": "vf_{biome_slug}_crystalline_{index}",
                            "origin": [0, 0, 0],
                            "rotation": [0, 0, 0],
                            "parent": "{target}",
                        }],
                    },
                },
            },
        })

        workspace = root / "workspace"
        authoring_workspace = workspace / "blockbench-authoring"
        fake_server = root / "fake_server.py"
        fake_server.write_text(FAKE, encoding="utf-8")
        command_json = root / "blockbench-server.json"
        command_json.write_text(
            json.dumps([sys.executable, str(fake_server), "--root", str(authoring_workspace)]),
            encoding="utf-8",
        )

        manifest = root / "pipeline.json"
        dump(manifest, {
            "schema_version": 1,
            "sources": ["source"],
            "subject": "subject.json",
            "authoring_bindings": "bindings.json",
            "authoring_execution": {
                "source_model": "creeper.bbmodel",
                "server_command_json": "blockbench-server.json",
                "render": "require",
                "timeout": 5,
            },
            "biomes": ["example:crystal_grove"],
            "mode": "full-phenotype",
            "seed": 77,
            "assets": [],
            "textures": [],
            "target": {
                "minecraft": "26.3",
                "loader": "neoforge",
                "backend": "enderloom-skeletal",
            },
        })

        first = mod.run_pipeline(manifest, workspace)
        assert first["state"] == "complete", first
        states = {row["stage"]: row for row in first["stages"]}
        assert states["authoring-recipes"]["semantic_state"] == "ready"
        assert states["runtime-contract"]["semantic_state"] == "ready"
        assert states["runtime-contract"]["proof_state"] == "contract-compiled-runtime-unverified"
        assert states["authoring-execution"]["semantic_state"] == "passed"
        assert states["authoring-execution"]["state"] == "completed"
        assert first["authoring_execution"]["passed"] == 1
        result = first["authoring_execution"]["results"][0]
        assert result["render"]["state"] == "passed"
        assert result["render"]["count"] == 6
        output_model = Path(result["output_model"])
        assert output_model.is_file()
        assert mod.sha256_file(model) == source_sha
        edited = json.loads(output_model.read_text(encoding="utf-8"))
        assert edited["variant_foundry_operations"]

        bundle_manifest = json.loads(Path(first["bundle"]["manifest"]).read_text(encoding="utf-8"))
        asset_roles = {row["role"] for row in bundle_manifest["assets"]}
        evidence_roles = {row["role"] for row in bundle_manifest["evidence"]}
        assert any(role.startswith("authoring-model:bloom_and_boom:creeper_female@") for role in asset_roles)
        assert "variant-runtime-contract" in asset_roles
        assert "authoring-recipes" in evidence_roles
        assert "authoring-execution-evidence" in evidence_roles
        assert any(role.startswith("authoring-execution-receipt:") for role in evidence_roles)
        assert len([role for role in evidence_roles if role.startswith("authoring-render:")]) == 6
        first_bundle = first["bundle"]["bundle_id"]

        fake_server.unlink()
        second = mod.run_pipeline(manifest, workspace)
        assert second["state"] == "complete"
        second_states = {row["stage"]: row for row in second["stages"]}
        assert second_states["authoring-recipes"]["state"] == "reused"
        assert second_states["runtime-contract"]["state"] == "reused"
        assert second_states["authoring-execution"]["state"] == "reused"
        assert second["bundle"]["bundle_id"] == first_bundle
        assert second["bundle"]["state"] == "reused"
        assert mod.sha256_file(model) == source_sha

        print(json.dumps({
            "status": "passed",
            "bundle_id": first_bundle,
            "variant_count": first["authoring_execution"]["variant_count"],
            "render_evidence": result["render"]["count"],
            "pipeline_reused_without_backend": True,
            "runtime_contract_packaged": True,
            "source_immutable": True,
        }, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
