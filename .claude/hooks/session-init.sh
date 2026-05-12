#!/bin/bash
# Session init: ensures todo files exist and GitHub config is present.
# Runs at SessionStart (after the AGENTS.md block in settings.local.json).

# --- 1. Bootstrap todo files ---

TODO_DIR=".ai/todo"
mkdir -p "$TODO_DIR"

CREATED=()

if [ ! -f "$TODO_DIR/todo.md" ]; then
    printf '# Active tasks\n\n' > "$TODO_DIR/todo.md"
    CREATED+=("todo.md")
fi

if [ ! -f "$TODO_DIR/someday.md" ]; then
    printf '# Someday / backlog\n\n' > "$TODO_DIR/someday.md"
    CREATED+=("someday.md")
fi

if [ ! -f "$TODO_DIR/todo.archive.md" ]; then
    printf '# Archive\n\n' > "$TODO_DIR/todo.archive.md"
    CREATED+=("todo.archive.md")
fi

if [ ${#CREATED[@]} -gt 0 ]; then
    echo ""
    echo "✓ Created missing todo files: ${CREATED[*]} (under .ai/todo/)"
fi

# --- 2. Check GitHub config ---

GITHUB_CONFIG=".ai/config/project.json"

if [ ! -f "$GITHUB_CONFIG" ]; then
    echo ""
    echo "========================================="
    echo "GITHUB SETUP NOT CONFIGURED"
    echo "No .ai/config/project.json found."
    echo "Run /github-setup to connect this project"
    echo "to a new or existing GitHub repository."
    echo "========================================="
fi
