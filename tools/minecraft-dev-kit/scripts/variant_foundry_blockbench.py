#!/usr/bin/env python3
"""Pinned, capability-discovered Blockbench headless adapter for Variant Foundry.

This module talks MCP over stdio and keeps Blockbench as an authoring backend rather
than a second source of truth. The default backend is Jason Gardner's headless
Blockbench MCP at a pinned commit; callers may supply another exact argv through a
JSON file for offline/local installations.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import queue
import shutil
import subprocess
import sys
import threading
from pathlib import Path
from typing import Any

PINNED_JASON_COMMIT = "6295e20af26ec0f67bc81a5e95dac98db85a1801"
PINNED_JASON_PACKAGE = f"github:jasonjgardner/blockbench-mcp-plugin#{PINNED_JASON_COMMIT}"
DEFAULT_PROTOCOL = "2025-06-18"
DEFAULT_TIMEOUT = 45.0
REQUIRED_HEADLESS_TOOLS = {
    "bbmodel_info",
    "bbmodel_outline",
    "bbmodel_edit",
    "bbmodel_validate",
    "bbmodel_validate_animations",
    "bbmodel_sample_pose",
    "bbmodel_render",
    "bbmodel_contact_sheet",
}
ALLOWED_TOOL_PREFIXES = ("bbmodel_",)
ALLOWED_EXACT_TOOLS = {"blockbench_launch"}


def canonical_hash(value: Any) -> str:
    payload = json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def default_server_command(roots: list[Path]) -> list[str]:
    npx = shutil.which("npx")
    if npx is None:
        raise ValueError("npx is unavailable; install Node.js or provide --server-command-json with a local pinned headless server")
    command: list[str]
    if os.name == "nt":
        command = ["cmd", "/c", npx, "-y", PINNED_JASON_PACKAGE]
    else:
        command = [npx, "-y", PINNED_JASON_PACKAGE]
    for root in roots:
        command += ["--root", str(root)]
    command.append("--no-web-links")
    return command


def load_server_command(path: Path | None, roots: list[Path]) -> list[str]:
    if path is None:
        return default_server_command(roots)
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, list) or not data or not all(isinstance(x, str) and x for x in data):
        raise ValueError("--server-command-json must contain a non-empty JSON string array")
    return data


def safe_tool(name: str) -> bool:
    return name in ALLOWED_EXACT_TOOLS or name.startswith(ALLOWED_TOOL_PREFIXES)


class MCPProtocolError(RuntimeError):
    pass


class MCPStdioClient:
    def __init__(self, command: list[str], *, timeout: float = DEFAULT_TIMEOUT):
        if not command:
            raise ValueError("empty MCP server command")
        self.command = list(command)
        self.timeout = timeout
        self._next_id = 1
        self._messages: queue.Queue[dict[str, Any] | BaseException] = queue.Queue()
        self._stderr: list[str] = []
        try:
            self.process = subprocess.Popen(
                self.command,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                encoding="utf-8",
                errors="replace",
                bufsize=1,
            )
        except OSError as exc:
            raise MCPProtocolError(f"failed to launch Blockbench MCP server: {exc}") from exc
        if self.process.stdin is None or self.process.stdout is None or self.process.stderr is None:
            self.process.kill()
            raise MCPProtocolError("failed to open Blockbench MCP stdio pipes")
        self._stdout_thread = threading.Thread(target=self._read_stdout, daemon=True)
        self._stderr_thread = threading.Thread(target=self._read_stderr, daemon=True)
        self._stdout_thread.start()
        self._stderr_thread.start()

    def _read_stdout(self) -> None:
        assert self.process.stdout is not None
        try:
            for line in self.process.stdout:
                text = line.strip()
                if not text:
                    continue
                try:
                    value = json.loads(text)
                except json.JSONDecodeError:
                    self._messages.put(MCPProtocolError(f"non-JSON MCP stdout: {text[:300]}"))
                    return
                if isinstance(value, dict):
                    self._messages.put(value)
                else:
                    self._messages.put(MCPProtocolError("MCP stdout message was not an object"))
                    return
        except BaseException as exc:
            self._messages.put(exc)

    def _read_stderr(self) -> None:
        assert self.process.stderr is not None
        for line in self.process.stderr:
            self._stderr.append(line.rstrip())
            if len(self._stderr) > 2000:
                del self._stderr[:500]

    def _send(self, message: dict[str, Any]) -> None:
        if self.process.poll() is not None:
            raise MCPProtocolError(self._process_exit_message("MCP server exited before request"))
        assert self.process.stdin is not None
        self.process.stdin.write(json.dumps(message, separators=(",", ":"), ensure_ascii=False) + "\n")
        self.process.stdin.flush()

    def _process_exit_message(self, prefix: str) -> str:
        code = self.process.poll()
        tail = "\n".join(self._stderr[-20:])
        return f"{prefix}; exit={code}; stderr_tail={tail!r}"

    def request(self, method: str, params: dict[str, Any] | None = None) -> Any:
        request_id = self._next_id
        self._next_id += 1
        self._send({"jsonrpc": "2.0", "id": request_id, "method": method, "params": params or {}})
        while True:
            try:
                message = self._messages.get(timeout=self.timeout)
            except queue.Empty as exc:
                raise MCPProtocolError(self._process_exit_message(f"timeout waiting for MCP response to {method}")) from exc
            if isinstance(message, BaseException):
                raise MCPProtocolError(str(message))
            if message.get("id") != request_id:
                continue
            if "error" in message:
                raise MCPProtocolError(f"MCP {method} error: {message['error']}")
            if "result" not in message:
                raise MCPProtocolError(f"MCP {method} response had no result")
            return message["result"]

    def notify(self, method: str, params: dict[str, Any] | None = None) -> None:
        self._send({"jsonrpc": "2.0", "method": method, "params": params or {}})

    def initialize(self, protocol: str = DEFAULT_PROTOCOL) -> dict[str, Any]:
        result = self.request("initialize", {
            "protocolVersion": protocol,
            "capabilities": {},
            "clientInfo": {"name": "enderloom-variant-foundry", "version": "1.0"},
        })
        if not isinstance(result, dict) or not isinstance(result.get("protocolVersion"), str):
            raise MCPProtocolError("MCP initialize returned an invalid result")
        self.notify("notifications/initialized")
        return result

    def list_tools(self) -> list[dict[str, Any]]:
        tools: list[dict[str, Any]] = []
        cursor: str | None = None
        seen_cursors: set[str] = set()
        while True:
            params = {"cursor": cursor} if cursor else {}
            result = self.request("tools/list", params)
            if not isinstance(result, dict) or not isinstance(result.get("tools"), list):
                raise MCPProtocolError("tools/list returned an invalid result")
            for row in result["tools"]:
                if isinstance(row, dict) and isinstance(row.get("name"), str):
                    tools.append(row)
            next_cursor = result.get("nextCursor")
            if not next_cursor:
                break
            if not isinstance(next_cursor, str) or next_cursor in seen_cursors:
                raise MCPProtocolError("tools/list returned an invalid/repeated cursor")
            seen_cursors.add(next_cursor)
            cursor = next_cursor
        return tools

    def call_tool(self, name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        if not safe_tool(name):
            raise ValueError(f"tool is outside the safe Blockbench headless allowlist: {name}")
        result = self.request("tools/call", {"name": name, "arguments": arguments})
        if not isinstance(result, dict):
            raise MCPProtocolError("tools/call returned an invalid result")
        return result

    def close(self) -> None:
        if self.process.poll() is not None:
            return
        try:
            if self.process.stdin:
                self.process.stdin.close()
        except OSError:
            pass
        try:
            self.process.terminate()
            self.process.wait(timeout=2)
        except (OSError, subprocess.TimeoutExpired):
            try:
                self.process.kill()
            except OSError:
                pass

    def __enter__(self) -> "MCPStdioClient":
        return self

    def __exit__(self, exc_type, exc, tb) -> None:
        self.close()


def capability_report(initialized: dict[str, Any], tools: list[dict[str, Any]], command: list[str]) -> dict[str, Any]:
    names = sorted({row["name"] for row in tools if isinstance(row.get("name"), str)})
    missing = sorted(REQUIRED_HEADLESS_TOOLS - set(names))
    return {
        "schema_version": 1,
        "state": "ready" if not missing else "incomplete",
        "protocol_version": initialized.get("protocolVersion"),
        "server_info": initialized.get("serverInfo"),
        "server_command": command,
        "server_command_sha256": canonical_hash(command),
        "tool_count": len(names),
        "tools": names,
        "tools_sha256": canonical_hash(names),
        "required_tools": sorted(REQUIRED_HEADLESS_TOOLS),
        "missing_required_tools": missing,
        "pinned_default": {
            "repository": "jasonjgardner/blockbench-mcp-plugin",
            "commit": PINNED_JASON_COMMIT,
            "package": PINNED_JASON_PACKAGE,
        },
    }


def write_json(path: Path | None, value: Any) -> None:
    if path is None:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, sort_keys=True, ensure_ascii=False) + "\n", encoding="utf-8")


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--root", type=Path, action="append", required=True, help="Allowed model root; repeatable")
    ap.add_argument("--server-command-json", type=Path, help="Exact argv JSON array for a local/offline MCP server")
    ap.add_argument("--protocol", default=DEFAULT_PROTOCOL)
    ap.add_argument("--timeout", type=float, default=DEFAULT_TIMEOUT)
    sub = ap.add_subparsers(dest="command", required=True)
    doctor = sub.add_parser("doctor", help="Initialize backend and verify the required headless tool surface")
    doctor.add_argument("--receipt", type=Path)
    tools_cmd = sub.add_parser("tools", help="List discovered MCP tools and schemas")
    tools_cmd.add_argument("--json-out", type=Path)
    call = sub.add_parser("call", help="Call one safe headless Blockbench tool")
    call.add_argument("--tool", required=True)
    call.add_argument("--args-json", type=Path, help="JSON object of tool arguments; defaults to {}")
    call.add_argument("--receipt", type=Path)
    args = ap.parse_args(argv)

    try:
        if args.timeout <= 0:
            raise ValueError("--timeout must be positive")
        roots = [root.resolve() for root in args.root]
        for root in roots:
            if not root.is_dir():
                raise ValueError(f"Blockbench root does not exist or is not a directory: {root}")
        command = load_server_command(args.server_command_json, roots)
        with MCPStdioClient(command, timeout=args.timeout) as client:
            initialized = client.initialize(args.protocol)
            tools = client.list_tools()
            report = capability_report(initialized, tools, command)
            if args.command == "doctor":
                write_json(args.receipt, report)
                print(json.dumps(report, indent=2, sort_keys=True, ensure_ascii=False))
                return 0 if report["state"] == "ready" else 2
            if args.command == "tools":
                result = {"capability": report, "tool_definitions": tools}
                write_json(args.json_out, result)
                print(json.dumps(result, indent=2, sort_keys=True, ensure_ascii=False))
                return 0
            tool_names = set(report["tools"])
            if args.tool not in tool_names:
                raise ValueError(f"Blockbench backend does not expose tool: {args.tool}")
            tool_args: dict[str, Any] = {}
            if args.args_json:
                value = json.loads(args.args_json.read_text(encoding="utf-8"))
                if not isinstance(value, dict):
                    raise ValueError("--args-json must contain a JSON object")
                tool_args = value
            result = client.call_tool(args.tool, tool_args)
            receipt = {
                "schema_version": 1,
                "backend": report,
                "tool": args.tool,
                "arguments_sha256": canonical_hash(tool_args),
                "result_sha256": canonical_hash(result),
                "is_error": bool(result.get("isError")),
                "result": result,
            }
            write_json(args.receipt, receipt)
            print(json.dumps(receipt, indent=2, sort_keys=True, ensure_ascii=False))
            return 2 if receipt["is_error"] else 0
    except (OSError, ValueError, json.JSONDecodeError, MCPProtocolError) as exc:
        print(json.dumps({"state": "error", "reason": str(exc)}, indent=2), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
