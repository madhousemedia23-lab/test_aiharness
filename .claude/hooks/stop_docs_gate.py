#!/usr/bin/env python3
"""Stop hook: refuse to end the turn if product paths are dirty without docs/.

Runs when Claude Code wants to mark its turn complete. If git status shows
modifications under product roots (scripts/, src/, harness-video/, …) but
nothing under docs/ has been touched, exit 2 to keep the turn alive and
inject a message telling the model what to do.

Bypass: CLAUDE_DOCS_HOOK_BYPASS=1.
"""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]

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
DOCS_PREFIX = "docs/"
TODO_REL = ".ai/todo/todo.md"


def _bypass() -> bool:
    return os.environ.get("CLAUDE_DOCS_HOOK_BYPASS") == "1"


def _git_status_paths() -> list[str]:
    try:
        result = subprocess.run(
            ["git", "status", "--porcelain=v1"],
            cwd=REPO_ROOT,
            capture_output=True,
            text=True,
            timeout=5,
        )
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return []
    paths: list[str] = []
    for line in result.stdout.splitlines():
        if len(line) < 4:
            continue
        path = line[3:]
        if " -> " in path:
            path = path.split(" -> ", 1)[1]
        paths.append(path.strip().strip('"'))
    return paths


def main() -> int:
    if _bypass():
        return 0
    paths = _git_status_paths()
    if not paths:
        return 0
    product_dirty = [p for p in paths if any(p.startswith(r) for r in PRODUCT_PREFIXES)]
    if not product_dirty:
        return 0
    docs_dirty = any(p.startswith(DOCS_PREFIX) for p in paths)
    todo_dirty = TODO_REL in paths
    if docs_dirty and todo_dirty:
        return 0
    missing: list[str] = []
    if not docs_dirty:
        missing.append("docs/ has no changes for this work")
    if not todo_dirty:
        missing.append(f"{TODO_REL} has no changes for this work")
    sample = ", ".join(product_dirty[:5])
    if len(product_dirty) > 5:
        sample += f", … (+{len(product_dirty) - 5} more)"
    print(
        "BLOCKED by .claude/hooks/stop_docs_gate.py\n"
        f"  product paths dirty: {sample}\n"
        "  problems: " + "; ".join(missing) + "\n"
        "\n"
        "Required before ending the turn:\n"
        "  1. Update docs/ for every product surface you added or changed.\n"
        "  2. Update .ai/todo/todo.md with `{claude}` markers + `# ai:` notes.\n"
        "  3. Append changelog + `## Last touched` footers to touched docs.\n"
        "\n"
        "Escape hatch: set CLAUDE_DOCS_HOOK_BYPASS=1 if intentional.",
        file=sys.stderr,
    )
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
