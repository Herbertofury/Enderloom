#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("executor", HERE / "variant_foundry_blockbench_execute.py")
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
        result={"protocolVersion":params.get("protocolVersion"),"capabilities":{"tools":{}},"serverInfo":{"name":"fake-authoring","version":"1"}}
    elif method=="tools/list":
        result={"tools":[{"name":n,"description":"fixture","inputSchema":{"type":"object"}} for n in TOOLS]}
    elif method=="tools/call":
        name=params.get("name"); args=params.get("arguments") or {}; file=args.get("file")
        path=(root/file) if file else None
        if name=="bbmodel_info":
            payload={"revision":revision(path),"name":"fixture","format":"free"}
            result={"content":[{"type":"text","text":json.dumps(payload)}],"isError":False}
        elif name=="bbmodel_edit":
            doc=json.loads(path.read_text())
            doc["applied_operations"]=args.get("operations",[])
            path.write_text(json.dumps(doc,sort_keys=True))
            payload={"revision":revision(path),"results":[{"ok":True}]}
            result={"content":[{"type":"text","text":json.dumps(payload)}],"isError":False}
        elif name=="bbmodel_validate":
            result={"content":[{"type":"text","text":json.dumps({"valid":True,"file":file})}],"isError":False}
        elif name=="bbmodel_validate_animations":
            result={"content":[{"type":"text","text":json.dumps({"valid":True,"animations":0})}],"isError":False}
        elif name=="bbmodel_contact_sheet":
            content=[]
            for view in args.get("views",["front"]):
                content.append({"type":"text","text":view+": scratch/"+view+".png"})
                content.append({"type":"image","data":PNG,"mimeType":"image/png"})
            result={"content":content,"isError":False}
        else:
            result={"content":[{"type":"text","text":"unknown tool"}],"isError":True}
    else:
        sys.stdout.write(json.dumps({"jsonrpc":"2.0","id":rid,"error":{"code":-32601,"message":"unknown"}})+"\n");sys.stdout.flush();continue
    sys.stdout.write(json.dumps({"jsonrpc":"2.0","id":rid,"result":result},separators=(",",":"))+"\n");sys.stdout.flush()
''' % (TOOLS, PNG)


def main() -> int:
    with tempfile.TemporaryDirectory() as td:
        root = Path(td)
        source = root / "creeper.bbmodel"
        source.write_text(json.dumps({"meta":{"model_format":"free"},"name":"creeper","groups":[],"elements":[]}), encoding="utf-8")
        recipes = root / "recipes.json"
        recipe = {
            "schema_version": 1,
            "state": "ready",
            "model_file": source.name,
            "recipes": [{
                "schema_version": 1,
                "variant_id": "bloom_and_boom:creeper_female@minecraft:snowy_plains",
                "biome_id": "minecraft:snowy_plains",
                "state": "ready",
                "recipe_sha256": "a" * 64,
                "routes": {
                    "blockbench": {
                        "operations": [{
                            "op": "add_group",
                            "name": "snow_growth",
                            "origin": [0,0,0],
                            "rotation": [0,0,0],
                            "parent": "surface_growths",
                        }]
                    },
                    "texture": [{"kind":"texture-palette"}],
                    "runtime_physics": [{"kind":"secondary-motion"}],
                    "runtime_effects": [],
                },
            }],
        }
        recipes.write_text(json.dumps(recipe), encoding="utf-8")
        workspace = root / "work"
        server = root / "fake_server.py"
        server.write_text(FAKE, encoding="utf-8")
        command_json = root / "server.json"
        command_json.write_text(json.dumps([sys.executable, str(server), "--root", str(workspace)]), encoding="utf-8")

        first = mod.execute(
            recipes,
            source,
            workspace,
            server_command_json=command_json,
            timeout=5,
            render_mode="require",
        )
        assert first["state"] == "passed", first
        assert first["variant_count"] == 1
        result = first["results"][0]
        assert result["operation_count"] == 1
        assert result["render"]["state"] == "passed"
        assert result["render"]["count"] == 6
        output = Path(result["output_model"])
        assert output.is_file()
        edited = json.loads(output.read_text(encoding="utf-8"))
        assert edited["applied_operations"][0]["name"] == "snow_growth"
        assert result["routes_remaining"]["texture"]
        assert result["routes_remaining"]["runtime_physics"]

        server.unlink()
        second = mod.execute(
            recipes,
            source,
            workspace,
            server_command_json=command_json,
            timeout=5,
            render_mode="require",
        )
        assert second["state"] == "passed"
        assert second["results"][0]["reuse_state"] == "reused"
        assert second["results"][0]["output_sha256"] == result["output_sha256"]

        unresolved = root / "unresolved.json"
        bad = dict(recipe)
        bad["state"] = "unresolved-active"
        unresolved.write_text(json.dumps(bad), encoding="utf-8")
        try:
            mod.execute(unresolved, source, root / "bad-work", server_command_json=command_json)
        except ValueError as exc:
            assert "unresolved-active" in str(exc)
        else:
            raise AssertionError("unresolved recipes should never execute")

        print(json.dumps({
            "status":"passed",
            "variant":result["variant_id"],
            "render_count":result["render"]["count"],
            "reused_without_backend":True,
            "unresolved_blocked":True,
        }, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
