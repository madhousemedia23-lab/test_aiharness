#!/bin/bash
# PreToolUse hook: blocks any Bash call that contains "git push".
# Forces Claude to ask the user for their PAT before pushing — PAT is never saved to disk.

python3 - << 'PYEOF'
import sys, json

data = json.load(sys.stdin)
tool = data.get('tool_name', '')
cmd  = data.get('input', {}).get('command', '')

if tool == 'Bash' and 'git push' in cmd:
    config_path = '.ai/config/project.json'
    try:
        import json as _j
        with open(config_path) as f:
            cfg = _j.load(f)
        username = cfg.get('github', {}).get('username', '<username>')
        repo_url = cfg.get('github', {}).get('repo_url', 'https://github.com/<username>/<repo>')
    except Exception:
        username = '<username>'
        repo_url = 'https://github.com/<username>/<repo>'

    print(json.dumps({
        'decision': 'block',
        'reason': (
            'BLOCKED — git push requires a GitHub PAT (Personal Access Token). '
            'Ask the user: "Please provide your GitHub PAT to push now." '
            'Once you have it, push using:\n'
            f'  git push https://{username}:<PAT>@{repo_url.replace("https://", "")}.git\n'
            'Do NOT save the PAT to any file. Use it once for this push only.'
        )
    }))
PYEOF
