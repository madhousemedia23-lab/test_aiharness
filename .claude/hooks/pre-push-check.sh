#!/bin/bash
# PreToolUse hook: blocks Bash "git push" unless push uses SSH (see .ai/config/project.json).
# HTTPS pushes: forces Claude to ask for a PAT — never saved to disk.

python3 - << 'PYEOF'
import json
import sys

data = json.load(sys.stdin)
tool = data.get('tool_name', '')
cmd = data.get('input', {}).get('command', '')

if tool == 'Bash' and 'git push' in cmd:
    config_path = '.ai/config/project.json'
    push_transport = 'https'
    try:
        with open(config_path) as f:
            cfg = json.load(f)
        push_transport = str(cfg.get('github', {}).get('push_transport', 'https')).lower()
        username = cfg.get('github', {}).get('username', '<username>')
        repo_url = cfg.get('github', {}).get('repo_url', 'https://github.com/<username>/<repo>')
    except Exception:
        username = '<username>'
        repo_url = 'https://github.com/<username>/<repo>'

    if push_transport == 'ssh':
        # User authenticates with local SSH agent / keys; no PAT in-repo.
        sys.exit(0)

    print(
        json.dumps(
            {
                'decision': 'block',
                'reason': (
                    'BLOCKED — git push over HTTPS requires a GitHub PAT (Personal Access Token). '
                    'Either ask the user for a PAT, or set github.push_transport to "ssh" in '
                    '.ai/config/project.json and use an SSH remote (git@github.com:owner/repo.git). '
                    'Once you have a PAT, push using:\n'
                    f'  git push https://{username}:<PAT>@{repo_url.replace("https://", "")}.git\n'
                    'Do NOT save the PAT to any file. Use it once for this push only.'
                ),
            }
        )
    )
PYEOF
