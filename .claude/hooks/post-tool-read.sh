#!/bin/bash
# PostToolUse hook (Read): removes sentinel once AGENTS.md has been read.
# Only clears the block when the exact file AGENTS.md was the target.

python3 -c "
import sys, json, os

try:
    data = json.load(sys.stdin)
    path = data.get('tool_input', {}).get('file_path', '')
    sentinel = '/tmp/.claude_must_read_agents'
    if 'AGENTS.md' in path and os.path.exists(sentinel):
        os.remove(sentinel)
except Exception:
    pass
" 2>/dev/null

exit 0
