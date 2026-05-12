#!/usr/bin/env python3
"""PreToolUse blocker for product-path writes without a fresh todo entry.

Exit codes:
    0 = allow the tool call (path is harness, doc, or a same-session todo entry exists)
    2 = block the tool call (Claude Code surfaces the stderr message to the model)

Invocation:
    Claude Code pipes the tool event as JSON on stdin. We inspect only Write/Edit/Bash
    calls that introduce or modify content under a product root (scripts/, src/, app/, …,
    and any other new top-level folder that is not a known harness path).

Bypass:
    Set CLAUDE_DOCS_HOOK_BYPASS=1 in the environment to skip enforcement (intentional
    escape hatch for exploratory sessions).
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]

HARNESS_PREFIXES = (
    ".ai/",
    ".cursor/",
    ".claude/",
    ".vscode/",
    "docs/",
)
HARNESS_FILES = {
    "AGENTS.md",
    "CLAUDE.md",
    "README.md",
    ".gitignore",
    ".editorconfig",
}
PRODUCT_PREFIXES = (
    "scripts/",
    "src/",
    "app/",
    "lib/",
    "packages/",
    "services/",
    "frontend/",
    "backend/",
    "harness-video/",
)

TODO_PATH = REPO_ROOT / ".ai" / "todo" / "todo.md"
TODO_OPEN_LINE = re.compile(r"^- \[ \].*\{claude\}", re.MULTILINE)


def _bypass() -> bool:
    return os.environ.get("CLAUDE_DOCS_HOOK_BYPASS") == "1"


def _path_from_event(event: dict) -> str | None:
    tool = event.get("tool_name", "")
    inp = event.get("tool_input") or {}
    if tool in {"Write", "Edit", "MultiEdit"}:
        return inp.get("file_path") or inp.get("path")
    if tool == "Bash":
        command = inp.get("command", "")
        if not isinstance(command, str):
            return None
        match = re.search(r"mkdir\s+(?:-p\s+)?([\w./-]+)", command)
        if match:
            return match.group(1)
    return None


def _is_product_path(path: str) -> bool:
    norm = path
    try:
        rel = Path(path).resolve().relative_to(REPO_ROOT).as_posix()
        norm = rel
    except (ValueError, OSError):
        if norm.startswith("./"):
            norm = norm[2:]
        norm = norm.lstrip("/")
    if any(norm.startswith(h) for h in HARNESS_PREFIXES):
        return False
    if norm in HARNESS_FILES:
        return False
    if any(norm.startswith(p) for p in PRODUCT_PREFIXES):
        return True
    top = norm.split("/", 1)[0]
    if "/" in norm and not top.startswith("."):
        return True
    return False


def _todo_has_open_claude_entry() -> bool:
    if not TODO_PATH.exists():
        return False
    text = TODO_PATH.read_text(encoding="utf-8")
    return bool(TODO_OPEN_LINE.search(text))


def _todo_touched_recently() -> bool:
    """Return True if .ai/todo/todo.md is currently modified vs HEAD."""
    try:
        result = subprocess.run(
            ["git", "diff", "--name-only", "HEAD", "--", str(TODO_PATH)],
            cwd=REPO_ROOT,
            capture_output=True,
            text=True,
            timeout=5,
        )
        return bool(result.stdout.strip())
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


def main() -> int:
    if _bypass():
        return 0
    try:
        event = json.load(sys.stdin)
    except json.JSONDecodeError:
        return 0
    path = _path_from_event(event)
    if not path:
        return 0
    if not _is_product_path(path):
        return 0
    if _todo_has_open_claude_entry() or _todo_touched_recently():
        return 0
    print(
        "BLOCKED by .claude/hooks/pre_write_gate.py\n"
        f"  target: {path}\n"
        "  reason: this looks like product code, but .ai/todo/todo.md has no\n"
        "          open `- [ ] ... {claude}` entry for this task and is not\n"
        "          modified versus HEAD.\n"
        "\n"
        "Required before retry:\n"
        "  1. Append a `- [ ] <title> +Project @ai #area (B) {claude}` line\n"
        "     to .ai/todo/todo.md describing this work.\n"
        "  2. (Recommended) Read .ai/docs/flows/docs-surface-classifier.md and\n"
        "     write the label (Product-only / Harness-only / Both).\n"
        "\n"
        "Escape hatch: set CLAUDE_DOCS_HOOK_BYPASS=1 if this is intentional.",
        file=sys.stderr,
    )
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
