#!/usr/bin/env python3
"""Execute lock-aware Variant Foundry Blockbench recipes in a durable workspace.

The executor copies the approved source .bbmodel per variant, applies only the
already-compiled additive recipe batch through the pinned/capability-discovered
headless Blockbench MCP backend, validates geometry + animations, and optionally
captures contact-sheet evidence. Exact successful outputs are hash-reused.
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import json
import os
import re
import shutil
import sys
from pathlib import Path
from typing import Any

import variant_foundry_blockbench as bb

SCHEMA_VERSION = 1
REQUIRED_TOOLS = {
    "bbmodel_info",
    "bbmodel_edit",
    "bbmodel_validate",
    "bbmodel_validate_animations",
}


def canonical_bytes(value: Any) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def digest(value: Any) -> str:
    return hashlib.sha256(canonical_bytes(value)).hexdigest()


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", value.lower()).strip("_") or "variant"


def atomic_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(path.name + f".tmp-{os.getpid()}")
    tmp.write_text(json.dumps(value, indent=2, sort_keys=True, ensure_ascii=False) + "\n", encoding="utf-8")
    os.replace(tmp, path)


def read_recipes(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict) or value.get("schema_version") != 1:
        raise ValueError("authoring recipe document must be schema_version=1")
    if value.get("state") != "ready":
        raise ValueError("authoring recipe document is unresolved-active; missing bindings must be fixed before execution")
    recipes = value.get("recipes")
    if not isinstance(recipes, list) or not recipes:
        raise ValueError("authoring recipe document has no recipes")
    for i, recipe in enumerate(recipes):
        if not isinstance(recipe, dict) or recipe.get("state") != "ready" or not isinstance(recipe.get("variant_id"), str):
            raise ValueError(f"recipes[{i}] is not execution-ready")
        blockbench = (recipe.get("routes") or {}).get("blockbench")
        if not isinstance(blockbench, dict) or not isinstance(blockbench.get("operations"), list):
            raise ValueError(f"recipes[{i}] has no Blockbench operation route")
    return value


def tool_text(result: dict[str, Any]) -> str:
    parts = []
    for item in result.get("content") or []:
        if isinstance(item, dict) and item.get("type") == "text" and isinstance(item.get("text"), str):
            parts.append(item["text"])
    return "\n".join(parts)


def tool_json(result: dict[str, Any], name: str) -> dict[str, Any]:
    if result.get("isError"):
        raise RuntimeError(f"{name} failed: {tool_text(result)[:4000]}")
    for item in result.get("content") or []:
        if isinstance(item, dict) and item.get("type") == "text" and isinstance(item.get("text"), str):
            try:
                value = json.loads(item["text"])
            except json.JSONDecodeError:
                continue
            if isinstance(value, dict):
                return value
    return {"content_sha256": digest(result), "text": tool_text(result)}


def extract_contact_sheet(result: dict[str, Any], output_dir: Path) -> dict[str, Any]:
    if result.get("isError"):
        return {"state": "failed", "reason": tool_text(result)[:4000]}
    output_dir.mkdir(parents=True, exist_ok=True)
    files: list[dict[str, Any]] = []
    label = "view"
    index = 0
    for item in result.get("content") or []:
        if not isinstance(item, dict):
            continue
        if item.get("type") == "text" and isinstance(item.get("text"), str):
            text = item["text"]
            label = slug(text.split(":", 1)[0]) if ":" in text else slug(text)
        elif item.get("type") == "image" and isinstance(item.get("data"), str):
            mime = str(item.get("mimeType") or "")
            if mime != "image/png":
                continue
            raw = base64.b64decode(item["data"], validate=True)
            name = f"{index:02d}-{label}.png"
            path = output_dir / name
            path.write_bytes(raw)
            files.append({"path": str(path), "sha256": sha256_file(path), "size": len(raw)})
            index += 1
    return {"state": "passed" if files else "failed", "images": files, "count": len(files)}


def execution_identity(
    source_model: Path,
    recipes_path: Path,
    recipe: dict[str, Any],
    command: list[str],
    render_mode: str,
) -> dict[str, Any]:
    return {
        "schema_version": 1,
        "source_model_sha256": sha256_file(source_model),
        "recipes_document_sha256": sha256_file(recipes_path),
        "recipe_sha256": recipe.get("recipe_sha256") or digest(recipe),
        "executor_sha256": sha256_file(Path(__file__).resolve()),
        "blockbench_adapter_sha256": sha256_file(Path(bb.__file__).resolve()),
        "server_command_sha256": digest(command),
        "render_mode": render_mode,
    }


def reusable(receipt_path: Path, identity: dict[str, Any]) -> dict[str, Any] | None:
    if not receipt_path.is_file():
        return None
    try:
        receipt = json.loads(receipt_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None
    model_path = Path(str(receipt.get("output_model") or ""))
    if (
        receipt.get("state") == "passed"
        and receipt.get("identity") == identity
        and model_path.is_file()
        and sha256_file(model_path) == receipt.get("output_sha256")
    ):
        result = dict(receipt)
        result["reuse_state"] = "reused"
        return result
    return None


def execute(
    recipes_path: Path,
    source_model: Path,
    workspace: Path,
    *,
    server_command_json: Path | None = None,
    protocol: str = bb.DEFAULT_PROTOCOL,
    timeout: float = bb.DEFAULT_TIMEOUT,
    render_mode: str = "auto",
    overwrite: bool = False,
) -> dict[str, Any]:
    recipes_path = recipes_path.resolve()
    source_model = source_model.resolve()
    workspace = workspace.resolve()
    if render_mode not in {"off", "auto", "require"}:
        raise ValueError("render_mode must be off, auto or require")
    if timeout <= 0:
        raise ValueError("timeout must be positive")
    if not source_model.is_file() or source_model.suffix.lower() != ".bbmodel":
        raise ValueError(f"source model must be an existing .bbmodel: {source_model}")
    doc = read_recipes(recipes_path)
    declared_model = str(doc.get("model_file") or "")
    if declared_model and Path(declared_model).name != source_model.name:
        raise ValueError(
            f"recipe bindings expect model {Path(declared_model).name!r}, "
            f"but source is {source_model.name!r}"
        )
    workspace.mkdir(parents=True, exist_ok=True)
    command = bb.load_server_command(server_command_json, [workspace])

    prepared: list[dict[str, Any]] = []
    for recipe in doc["recipes"]:
        variant_id = recipe["variant_id"]
        variant_dir = workspace / "variants" / slug(variant_id)
        model_path = variant_dir / source_model.name
        receipt_path = variant_dir / "execution-receipt.json"
        identity = execution_identity(source_model, recipes_path, recipe, command, render_mode)
        cached = reusable(receipt_path, identity)
        prepared.append({
            "recipe": recipe,
            "variant_id": variant_id,
            "variant_dir": variant_dir,
            "model_path": model_path,
            "receipt_path": receipt_path,
            "identity": identity,
            "cached": cached,
        })

    results: list[dict[str, Any]] = []
    pending = [row for row in prepared if row["cached"] is None]
    for row in prepared:
        if row["cached"] is not None:
            results.append(row["cached"])

    if pending:
        with bb.MCPStdioClient(command, timeout=timeout) as client:
            initialized = client.initialize(protocol)
            tools = client.list_tools()
            names = sorted({row["name"] for row in tools if isinstance(row, dict) and isinstance(row.get("name"), str)})
            missing = sorted(REQUIRED_TOOLS - set(names))
            if missing:
                raise RuntimeError(f"Blockbench backend is missing required authoring tools: {missing}")
            backend = {
                "protocol_version": initialized.get("protocolVersion"),
                "server_info": initialized.get("serverInfo"),
                "server_command_sha256": digest(command),
                "tools_sha256": digest(names),
                "tools": names,
                "pinned_default_commit": bb.PINNED_JASON_COMMIT,
            }
            if render_mode == "require" and "bbmodel_contact_sheet" not in names:
                raise RuntimeError("render evidence is required but bbmodel_contact_sheet is unavailable")

            for row in pending:
                recipe = row["recipe"]
                variant_dir: Path = row["variant_dir"]
                model_path: Path = row["model_path"]
                receipt_path: Path = row["receipt_path"]
                variant_dir.mkdir(parents=True, exist_ok=True)
                relative_model = model_path.relative_to(workspace).as_posix()
                receipt: dict[str, Any] = {
                    "schema_version": 1,
                    "variant_id": row["variant_id"],
                    "identity": row["identity"],
                    "state": "running",
                    "reuse_state": "completed",
                    "source_model": str(source_model),
                    "output_model": str(model_path),
                    "backend": backend,
                }
                atomic_json(receipt_path, receipt)
                try:
                    if model_path.exists():
                        if not overwrite:
                            raise ValueError(f"variant model already exists with non-matching receipt: {model_path}")
                        model_path.unlink()
                    shutil.copyfile(source_model, model_path)
                    receipt["source_copy_sha256"] = sha256_file(model_path)

                    info_result = client.call_tool("bbmodel_info", {"file": relative_model})
                    info = tool_json(info_result, "bbmodel_info")
                    revision = info.get("revision")
                    if not isinstance(revision, str) or not revision:
                        raise RuntimeError("bbmodel_info did not return a revision")

                    operations = ((recipe.get("routes") or {}).get("blockbench") or {}).get("operations") or []
                    if operations:
                        edit_result = client.call_tool("bbmodel_edit", {
                            "file": relative_model,
                            "expected_revision": revision,
                            "operations": operations,
                        })
                        edit = tool_json(edit_result, "bbmodel_edit")
                    else:
                        edit = {"state": "no-operations", "revision": revision}

                    validation_result = client.call_tool("bbmodel_validate", {"file": relative_model})
                    validation = tool_json(validation_result, "bbmodel_validate")
                    animation_result = client.call_tool("bbmodel_validate_animations", {"file": relative_model})
                    animation_validation = tool_json(animation_result, "bbmodel_validate_animations")

                    render: dict[str, Any] = {"state": "disabled"}
                    if render_mode != "off":
                        if "bbmodel_contact_sheet" not in names:
                            render = {"state": "unavailable", "reason": "bbmodel_contact_sheet is not exposed"}
                        else:
                            try:
                                sheet_result = client.call_tool("bbmodel_contact_sheet", {
                                    "file": relative_model,
                                    "views": ["front", "right", "back", "left", "three-quarter", "top"],
                                    "size": 256,
                                    "orthographic": True,
                                    "lighting": "flat",
                                })
                                render = extract_contact_sheet(sheet_result, variant_dir / "visual-evidence")
                            except Exception as exc:
                                render = {"state": "failed", "reason": str(exc)}
                        if render_mode == "require" and render.get("state") != "passed":
                            raise RuntimeError(f"required contact-sheet evidence failed: {render}")

                    receipt.update({
                        "state": "passed",
                        "operation_count": len(operations),
                        "model_info_before": info,
                        "edit_result": edit,
                        "validation": validation,
                        "animation_validation": animation_validation,
                        "render": render,
                        "output_sha256": sha256_file(model_path),
                        "output_size": model_path.stat().st_size,
                        "routes_remaining": {
                            "texture": recipe.get("routes", {}).get("texture", []),
                            "runtime_physics": recipe.get("routes", {}).get("runtime_physics", []),
                            "runtime_effects": recipe.get("routes", {}).get("runtime_effects", []),
                        },
                    })
                    atomic_json(receipt_path, receipt)
                    results.append(receipt)
                except Exception as exc:
                    receipt.update({"state": "failed", "reason": str(exc)})
                    if model_path.is_file():
                        receipt["output_sha256"] = sha256_file(model_path)
                        receipt["output_size"] = model_path.stat().st_size
                    atomic_json(receipt_path, receipt)
                    results.append(receipt)

    results.sort(key=lambda row: str(row.get("variant_id")))
    failed = [row for row in results if row.get("state") != "passed"]
    evidence_results = [
        {key: value for key, value in row.items() if key != "reuse_state"}
        for row in results
    ]
    evidence = {
        "schema_version": 1,
        "state": "passed" if not failed else "failed",
        "recipes": str(recipes_path),
        "source_model": str(source_model),
        "variant_count": len(results),
        "passed": len(results) - len(failed),
        "failed": len(failed),
        "results": evidence_results,
    }
    evidence_path = workspace / "execution-evidence.json"
    atomic_json(evidence_path, evidence)
    summary = {
        "schema_version": 1,
        "state": evidence["state"],
        "recipes": str(recipes_path),
        "source_model": str(source_model),
        "workspace": str(workspace),
        "variant_count": evidence["variant_count"],
        "passed": evidence["passed"],
        "failed": evidence["failed"],
        "evidence": str(evidence_path),
        "evidence_sha256": sha256_file(evidence_path),
        "results": results,
    }
    atomic_json(workspace / "execution-summary.json", summary)
    return summary


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--recipes", type=Path, required=True)
    ap.add_argument("--source-model", type=Path, required=True)
    ap.add_argument("--workspace", type=Path, required=True)
    ap.add_argument("--server-command-json", type=Path)
    ap.add_argument("--protocol", default=bb.DEFAULT_PROTOCOL)
    ap.add_argument("--timeout", type=float, default=bb.DEFAULT_TIMEOUT)
    ap.add_argument("--render", choices=["off", "auto", "require"], default="auto")
    ap.add_argument("--overwrite", action="store_true")
    args = ap.parse_args(argv)
    try:
        result = execute(
            args.recipes,
            args.source_model,
            args.workspace,
            server_command_json=args.server_command_json,
            protocol=args.protocol,
            timeout=args.timeout,
            render_mode=args.render,
            overwrite=args.overwrite,
        )
        print(json.dumps(result, indent=2, sort_keys=True, ensure_ascii=False))
        return 0 if result["state"] == "passed" else 2
    except (OSError, ValueError, json.JSONDecodeError, RuntimeError, bb.MCPProtocolError) as exc:
        print(json.dumps({"state": "error", "reason": str(exc)}, indent=2), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
