---
name: project-startup
description: >-
  One-stop baseline harness setup: Todo MD bootstrap, GitHub (/github-setup),
  push_transport (HTTPS+PAT vs SSH), first ship (/git-push-verify), docs
  classifier, actor markers. Use for greenfield repos, onboarding, "wire
  GitHub", first push, or startup checklist.
---

# Project startup (harness template)

## When to use

- User wants **easy project startup**, **full setup**, **GitHub connection**, or **first push**.
- Phrases: *greenfield*, *new repo*, *onboarding*, *one stop*, *startup checklist*, *PAT vs SSH*.

## What to do

1. Open and follow **[`.ai/docs/flows/project-startup.md`](../../../.ai/docs/flows/project-startup.md)** end-to-end (source of truth for ordering).
2. Respect **[`project-init.mdc`](../../../.cursor/rules/project-init.mdc)** on every session (todos, `project.json`, push rules).
3. **GitHub:** run through **`/github-setup`** per [`github-setup.md`](../../../.claude/commands/github-setup.md) if `.ai/config/project.json` is missing or the user wants to change the remote.
4. **Ship:** **`/git-push-verify`** per [`git-push-verify.md`](../../../.claude/commands/git-push-verify.md) — includes branch-aware verify; use **SSH** or **HTTPS** per `push_transport`.
5. **Docs:** before structural edits, [docs-surface-classifier.md](../../../.ai/docs/flows/docs-surface-classifier.md); update **`README.md`** + **`.ai/docs/*`** for harness-only changes; use **`{cursor}`** on changelog / `Last touched` when you edit from Cursor.

## Do not

- Skip **`AGENTS.md`** / charter reads when the session rules require them.
- Store PATs or SSH private keys in the repo.
- Delete todo lines or doc changelog lines (append / in-place edit only).

## Cross-surface

| Surface | Path |
|---------|------|
| Claude Code skill twin | `.claude/skills/project-startup/SKILL.md` |
| Slash command | `.claude/commands/project-startup.md` (`/project-startup`) |
