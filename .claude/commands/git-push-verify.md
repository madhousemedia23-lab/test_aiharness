# /git-push-verify — Stage, commit, push, and prove it landed on GitHub

Use this command to ship the current state of the project in one clean workflow.
Reads repo config from `.ai/config/project.json`. Never stores credentials.

---

## Step 1 — Confirm repo config

Read `.ai/config/project.json`. Extract `github.repo_url` and `github.username`.

If the file is missing or `repo_url` is empty, tell the user to run `/github-setup` first and stop.

Print: `Repo: <repo_url>`

---

## Step 2 — Show what will be committed

Run:
```bash
git status --short
git diff --stat HEAD 2>/dev/null || echo "(no previous commits — this will be the first)"
```

Print a clean summary of what's changing.

---

## Step 3 — Stage everything

```bash
git add -A
```

---

## Step 4 — Commit with the project achievement message

Run this commit command exactly. It is the canonical record of everything built in this project, with no AI references.

```bash
git commit -m "$(cat <<'COMMITMSG'
feat: project harness v1.0 — enforcement system, docs, and video explainer

Harness infrastructure:
- AGENTS.md charter: working agreements for all contributors
- CLAUDE.md: session-start mandatory reads block
- Two canonical protocols (.ai/protocols/):
    TODO_MD_AGENT_PROTOCOL.md  — task lifecycle, actor markers, never-delete rule
    DOCS_MAINTENANCE_PROTOCOL.md — harness vs product surface split, classifier gate
- .cursor/rules/: 3 auto-loaded pointer rule files (foundations, todomd, docs-maint)
- settings.local.json: SessionStart + PreToolUse + PostToolUse hooks wired

Hook enforcement system (.claude/hooks/):
- pre-tool-check.sh  — blocks all tools at session open until AGENTS.md is read
- post-tool-read.sh  — removes session sentinel after AGENTS.md confirmed read
- pre_write_gate.py  — blocks product writes without an open todo entry
- stop_docs_gate.py  — blocks turn end if product changed without docs update

Documentation system:
- docs-surface-classifier.md: mandatory Gate A/B before any structural doc edit
- documentation-update-flow.md: bootstrap vs update logic, new-surface decision tree
- Harness baseline docs (.ai/docs/): architecture, conventions, flows, glossary
- Product docs package (docs/): README, architecture, conventions, per-surface pages

Tooling and workflow:
- .vscode/settings.json: Todo MD paths wired to .ai/todo/
- .editorconfig, .gitignore
- /github-setup command: interactive repo connection, PAT-at-push-time auth
- /git-push-verify command: stage, commit, push, fetch, verify in one workflow

Product delivered:
- harness-video/: Remotion 8-scene explainer video (~120s, 1280x720, 30fps)
    Scene 00: Two-actor setup with real Cursor IDE screenshot
    Scene 01: Cursor rule auto-load mechanism
    Scene 02: Hook blocking — the bouncer
    Scene 03: Docs decision tree — how it knows what to create
    Scene 04: React frontend example — full walk-through
    Scene 05: Todo protocol lifecycle
    Scene 06: Full enforcement flow both tools
    Scene 07: Complete file map (18 nodes, 17 connections)
COMMITMSG
)"
```

If the commit fails because nothing is staged, report the git output and stop — do not force an empty commit.

---

## Step 5 — Ask for PAT and push

Tell the user:
> "Ready to push to `<repo_url>`. Please paste your GitHub Personal Access Token (it will be used once and never stored anywhere):"

Wait for the PAT.

Then push, masking the credential from output:

```bash
REPO_PATH=$(echo "<repo_url>" | sed 's|https://github.com/||')
git push "https://<username>:<PAT>@github.com/${REPO_PATH}.git" --set-upstream origin master 2>&1 | sed 's/<PAT>/****/g'
```

**Security — always enforce:**
- Never print the PAT in the conversation
- Never write the PAT to any file
- Use the PAT inline in the URL only, discard after the command exits
- If the push fails (wrong PAT, repo not created, etc.), tell the user the error and ask them to try again — do not retry automatically

---

## Step 6 — Fetch from origin and verify it landed

```bash
git fetch origin
git log origin/master --oneline -8
```

This confirms the commit is on the remote. Print the log so the user can see their commit hash and message.

---

## Step 7 — Show full remote repo info

Run all of these and display the results clearly:

```bash
# 1. Which remote we pushed to
git remote -v

# 2. Commit graph on origin
git log origin/master --oneline --graph -10

# 3. Repo stats via GitHub CLI (if installed)
gh repo view 2>/dev/null

# 4. Fallback if gh not available
gh repo view 2>/dev/null || echo "Visit $(git remote get-url origin) to view the repo on GitHub"
```

Format the output into three clear sections:
- **Remote** — the URL we pushed to
- **Commits on origin** — the graph log
- **Repo info** — output of `gh repo view` if available, otherwise the URL

---

## Step 8 — Close todo and print summary

Mark the task in `.ai/todo/todo.md`:
- Find the open `- [ ] Add /git-push-verify` line
- Change to `- [x]` with `{claude}` marker
- Add `# ai:` note: `Committed feat: project harness v1.0, pushed to <repo_url>, verified on origin/master.`

Print this final summary to the user:

```
✅  DONE

  Staged   : all tracked + untracked files
  Committed: feat: project harness v1.0 — enforcement system, docs, and video explainer
  Pushed   : origin/master → <repo_url>
  Verified : git fetch origin confirmed commit on remote
  Repo     : <repo_url>
```
