#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("bb", HERE / "variant_foundry_blockbench.py")
mod = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = mod
assert SPEC.loader is not None
SPEC.loader.exec_module(mod)

TOOLS = [
    "bbmodel_info",
    "bbmodel_outline",
    "bbmodel_edit",
    "bbmodel_validate",
    "bbmodel_validate_animations",
    "bbmodel_sample_pose",
    "bbmodel_render",
    "bbmodel_contact_sheet",
    "bbmodel_list_textures",
]

FAKE = r'''#!/usr/bin/env python3
import json,sys
TOOLS = %r
for line in sys.stdin:
    try: msg=json.loads(line)
    except Exception: continue
    if "id" not in msg: continue
    rid=msg["id"]; method=msg.get("method"); params=msg.get("params") or {}
    if method=="initialize":
        result={"protocolVersion":params.get("protocolVersion"),"capabilities":{"tools":{}},"serverInfo":{"name":"fake-blockbench-headless","version":"1"}}
    elif method=="tools/list":
        cursor=params.get("cursor")
        if not cursor:
            names=TOOLS[:4]; result={"tools":[{"name":n,"description":"fixture","inputSchema":{"type":"object"}} for n in names],"nextCursor":"page2"}
        elif cursor=="page2":
            names=TOOLS[4:]; result={"tools":[{"name":n,"description":"fixture","inputSchema":{"type":"object"}} for n in names]}
        else:
            result={"tools":[]}
    elif method=="tools/call":
        result={"content":[{"type":"text","text":json.dumps({"tool":params.get("name"),"arguments":params.get("arguments")},sort_keys=True)}],"isError":False}
    else:
        sys.stdout.write(json.dumps({"jsonrpc":"2.0","id":rid,"error":{"code":-32601,"message":"unknown"}})+"\n");sys.stdout.flush();continue
    sys.stdout.write(json.dumps({"jsonrpc":"2.0","id":rid,"result":result},separators=(",",":"))+"\n");sys.stdout.flush()
''' % TOOLS


def main() -> int:
    with tempfile.TemporaryDirectory() as td:
        root = Path(td)
        server = root / "fake_server.py"
        server.write_text(FAKE, encoding="utf-8")
        command = [sys.executable, str(server)]
        with mod.MCPStdioClient(command, timeout=5) as client:
            init = client.initialize()
            tools = client.list_tools()
            report = mod.capability_report(init, tools, command)
            assert report["state"] == "ready"
            assert report["missing_required_tools"] == []
            assert len(report["tools"]) == len(TOOLS)
            result = client.call_tool("bbmodel_info", {"path": "creeper.bbmodel"})
            assert result["isError"] is False
            payload = json.loads(result["content"][0]["text"])
            assert payload == {"arguments": {"path": "creeper.bbmodel"}, "tool": "bbmodel_info"}
            try:
                client.call_tool("execute_script", {})
            except ValueError as exc:
                assert "safe Blockbench headless allowlist" in str(exc)
            else:
                raise AssertionError("unsafe tool should be rejected")

        command_json = root / "server.json"
        command_json.write_text(json.dumps(command), encoding="utf-8")
        receipt = root / "doctor.json"
        code = mod.main([
            "--root", str(root), "--server-command-json", str(command_json),
            "--timeout", "5", "doctor", "--receipt", str(receipt),
        ])
        assert code == 0
        doctor = json.loads(receipt.read_text(encoding="utf-8"))
        assert doctor["state"] == "ready"
        assert doctor["tools_sha256"]

        args_file = root / "args.json"
        args_file.write_text(json.dumps({"path": "model.bbmodel"}), encoding="utf-8")
        call_receipt = root / "call.json"
        code = mod.main([
            "--root", str(root), "--server-command-json", str(command_json),
            "--timeout", "5", "call", "--tool", "bbmodel_validate",
            "--args-json", str(args_file), "--receipt", str(call_receipt),
        ])
        assert code == 0
        called = json.loads(call_receipt.read_text(encoding="utf-8"))
        assert called["tool"] == "bbmodel_validate"
        assert called["is_error"] is False

        print(json.dumps({"status": "passed", "tools": len(TOOLS), "pinned_commit": mod.PINNED_JASON_COMMIT}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
