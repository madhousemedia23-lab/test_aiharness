# Project startup — one-stop flow (baseline harness)

**Single checklist** for humans and agents when adopting or greenfielding this template: todos, GitHub, push auth, first ship, docs, and enforcement surfaces. Canonical contracts remain in **`.ai/protocols/`** — this file orchestrates *where to go*, not duplicate rules.

## When to use this flow

- New clone / new machine / new contributor onboarding.
- First connection to GitHub for this repo.
- You want **one ordered path** instead of hunting `README.md`, `AGENTS.md`, and `.claude/commands/` separately.

## 0 — Read the charter (agents)

| Harness | First read |
|---------|------------|
| **Cursor** | [`AGENTS.md`](../../../AGENTS.md) + this file + [docs-surface-classifier.md](docs-surface-classifier.md) before structural doc edits. |
| **Claude Code** | [`CLAUDE.md`](../../../CLAUDE.md) → [`AGENTS.md`](../../../AGENTS.md); session hooks enforce mandatory reads — see [`architecture.md`](../architecture.md). |

## 1 — Task board (Todo MD)

| Step | Action |
|------|--------|
| 1.1 | Ensure **`.ai/todo/todo.md`**, **`someday.md`**, **`todo.archive.md`** exist (opening lines: `# Active tasks`, `# Someday / backlog`, `# Archive`). Cursor: [`project-init.mdc`](../../../.cursor/rules/project-init.mdc). Claude: `session-init.sh` on SessionStart. |
| 1.2 | Rules: [`TODO_MD_AGENT_PROTOCOL.md`](../../protocols/TODO_MD_AGENT_PROTOCOL.md). **Never delete** task lines as an assistant; use **`{cursor}`** or **`{claude}`** on lines you touch. |

## 2 — GitHub connection

| Step | Action |
|------|--------|
| 2.1 | If **`.ai/config/project.json`** is missing → run **`/github-setup`** (definition: [`github-setup.md`](../../../.claude/commands/github-setup.md)). |
| 2.2 | Config shape: `github.repo_url` (always HTTPS browser URL), `github.username`, optional **`github.push_transport`**: `"https"` (default) or `"ssh"`. **Never** store PATs or keys in the repo. |
| 2.3 | **Remote:** HTTPS URL from `repo_url`, **or** `git@github.com:<owner>/<repo>.git` when using SSH — same step as in `/github-setup`. |

## 3 — Push authentication

| `push_transport` | How to push | Agent note |
|------------------|-------------|--------------|
| **`https`** (default) | PAT in the one-shot URL when an agent runs push; see [`git-push-verify.md`](../../../.claude/commands/git-push-verify.md) Step 5a. | [`pre-push-check.sh`](../../../.claude/hooks/pre-push-check.sh) **blocks** bare `git push` until PAT workflow is followed (Claude Code Bash). |
| **`ssh`** | Local SSH keys; `origin` must be SSH. First run: verify host key `SHA256:…` against [GitHub SSH fingerprints](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/githubs-ssh-key-fingerprints). | Same hook **allows** `git push` when `push_transport` is `"ssh"`. |

## 4 — First ship to GitHub

| Step | Action |
|------|--------|
| 4.1 | Run **`/git-push-verify`** ([`git-push-verify.md`](../../../.claude/commands/git-push-verify.md)): stage → commit → push → `fetch` + `git log origin/<branch>` to verify. |
| 4.2 | Default branch may be **`main`** or **`master`** — use `git branch --show-current` and match remote (rename locally if needed: `git branch -M main`). |
| 4.3 | If the remote was empty, one normal **`git push -u origin <branch>`** is enough; if you **rewrote** history, use **`git push --force-with-lease`** only when you intend to replace remote history. |

## 5 — Documentation and product surfaces

| Step | Action |
|------|--------|
| 5.1 | **Before** any structural markdown edit: [docs-surface-classifier.md](docs-surface-classifier.md) → label **Product-only** / **Harness-only** / **Both**. |
| 5.2 | Follow [documentation-update-flow.md](documentation-update-flow.md) and [`DOCS_MAINTENANCE_PROTOCOL.md`](../../protocols/DOCS_MAINTENANCE_PROTOCOL.md): harness → **`README.md`** + **`.ai/docs/*`**; product code → root **`docs/*`**. |
| 5.3 | Changelog + **`## Last touched`** with **`{cursor}`** or **`{claude}`** matching the harness that edited the file. |

## 6 — Skills and rules map (quick reference)

| Surface | Path | Role |
|---------|------|------|
| **Cursor rule (always on)** | [`project-startup.mdc`](../../../.cursor/rules/project-startup.mdc) | Points agents at this flow + project skill. |
| **Cursor project skill** | [`SKILL.md` (Cursor)](../../../.cursor/skills/project-startup/SKILL.md) | Invoked for “startup”, “greenfield”, “wire GitHub”, “first push”. |
| **Claude slash command** | [`project-startup.md`](../../../.claude/commands/project-startup.md) | `/project-startup` — same checklist for Claude Code terminal. |
| **Claude project skill** | [`SKILL.md` (Claude)](../../../.claude/skills/project-startup/SKILL.md) | Same triggers as Cursor skill. |
| **Ship workflow** | [`git-push-verify.md`](../../../.claude/commands/git-push-verify.md) | Stage / commit / push / verify. |
| **Repo connection** | [`github-setup.md`](../../../.claude/commands/github-setup.md) | `/github-setup`. |

## 7 — Optional product toolchain

When **`scripts/`**, **`src/`**, or other product roots appear: document under **root [`docs/README.md`](../../../docs/README.md)** per classifier; add real install/lint/test commands to **[`AGENTS.md`](../../../AGENTS.md)** “Commands and verification”.

## Changelog

- 2026-05-12 — fixed relative links from `flows/` to repo root (three `..` segments) {cursor}
- 2026-05-12 — initial **project startup** one-stop flow; links Cursor/Claude skills, `/project-startup`, `/github-setup`, `/git-push-verify`, Todo MD, docs classifier, SSH/HTTPS push {cursor}

## Last touched
{cursor} 2026-05-12
