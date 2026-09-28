#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import sys
import tempfile
import threading
import types
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

HERE = Path(__file__).resolve().parent


def load(name: str, filename: str):
    spec = importlib.util.spec_from_file_location(name, HERE / filename)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


clay_adapter = load("clay_adapter_test", "variant_foundry_clay_adapter.py")
mymeshy = load("mymeshy_adapter_test", "variant_foundry_mymeshy_adapter.py")


def clay_fixture(root: Path) -> None:
    package = types.ModuleType("clay")
    config = types.ModuleType("clay.config")
    pipeline = types.ModuleType("clay.pipeline")
    schemas = types.ModuleType("clay.schemas")

    class GenMode:
        image = "image"
        text = "text"

    class Request:
        def __init__(self, **kwargs):
            self.__dict__.update(kwargs)

    class Asset:
        def __init__(self, path):
            self.path = str(path)
            self.provider = "fixture-clay"
            self.format = "glb"
            self.triangles = 123

    class Pipeline:
        def __init__(self, cfg):
            self.cfg = cfg

        def run(self, request, out_path=None):
            assert request.seed == 77
            assert request.mode == "image"
            path = Path(out_path)
            path.write_bytes(Path(request.image_path).read_bytes() + b"-clay")
            return Asset(path)

    config.load_config = lambda path="": {"config": path}
    pipeline.Pipeline = Pipeline
    schemas.GenerationRequest = Request
    schemas.GenMode = GenMode
    sys.modules["clay"] = package
    sys.modules["clay.config"] = config
    sys.modules["clay.pipeline"] = pipeline
    sys.modules["clay.schemas"] = schemas


class Handler(BaseHTTPRequestHandler):
    calls = []
    mock_mode = False

    def log_message(self, fmt, *args):
        return

    def send_json(self, value, code=200):
        body = json.dumps(value).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        Handler.calls.append(("GET", self.path))
        if self.path == "/api/system":
            self.send_json({"version": "fixture", "mock_mode": Handler.mock_mode, "active": {"image_to_3d": "fixture"}})
        elif self.path == "/api/jobs/job1":
            self.send_json({"id": "job1", "status": "done", "asset_id": "asset1"})
        elif self.path == "/api/assets/asset1/model.glb":
            body = b"fixture-glb"
            self.send_response(200)
            self.send_header("Content-Type", "model/gltf-binary")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        else:
            self.send_json({"error": "not found"}, 404)

    def do_POST(self):
        Handler.calls.append(("POST", self.path))
        length = int(self.headers.get("Content-Length", "0"))
        self.rfile.read(length)
        if self.path == "/api/jobs/image-to-3d":
            self.send_json({"id": "job1", "status": "queued"})
        else:
            self.send_json({"ok": True})


def main() -> int:
    with tempfile.TemporaryDirectory() as td:
        root = Path(td)
        inp = root / "concept.png"
        inp.write_bytes(b"image-fixture")
        params = root / "params.json"
        params.write_text(json.dumps({"mode": "image"}), encoding="utf-8")

        clay_fixture(root)
        clay_out = root / "clay.glb"
        code = clay_adapter.main([
            "--input", str(inp), "--output", str(clay_out),
            "--seed", "77", "--params", str(params),
        ])
        assert code == 0
        assert clay_out.read_bytes() == b"image-fixture-clay"

        server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        endpoint = f"http://127.0.0.1:{server.server_port}"
        try:
            my_out = root / "mymeshy.glb"
            code = mymeshy.main([
                "--input", str(inp), "--output", str(my_out),
                "--seed", "77", "--params", str(params), "--endpoint", endpoint,
            ])
            assert code == 0
            assert my_out.read_bytes() == b"fixture-glb"
            assert ("POST", "/api/jobs/image-to-3d") in Handler.calls
            assert ("GET", "/api/jobs/job1") in Handler.calls

            Handler.mock_mode = True
            mock_out = root / "mock.glb"
            code = mymeshy.main([
                "--input", str(inp), "--output", str(mock_out),
                "--seed", "77", "--params", str(params), "--endpoint", endpoint,
            ])
            assert code == 2
            assert not mock_out.exists()
        finally:
            server.shutdown()
            server.server_close()

        print(json.dumps({"status": "passed", "clay": True, "mymeshy": True, "mock_rejected": True}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
