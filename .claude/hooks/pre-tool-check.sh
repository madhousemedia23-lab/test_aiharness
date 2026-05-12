#!/bin/bash
# PreToolUse hook: blocks ALL tool calls until AGENTS.md has been read.
# Sentinel /tmp/.claude_must_read_agents is created by SessionStart.
# It is removed only by post-tool-read.sh when Read tool targets AGENTS.md.

python3 -c "
import sys, json, os

data = json.load(sys.stdin)
tool = data.get('tool_name', '')
sentinel = '/tmp/.claude_must_read_agents'

if os.path.exists(sentinel) and tool != 'Read':
    print(json.dumps({
        'decision': 'block',
        'reason': (
            'BLOCKED — AGENTS.md has not been read yet this session. '
            'Use the Read tool on AGENTS.md to unblock all other tools. '
            'This is mandatory every session, no exceptions.'
        )
    }))
"
