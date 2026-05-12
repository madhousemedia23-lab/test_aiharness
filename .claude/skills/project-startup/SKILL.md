---
name: project-startup
description: >-
  One-stop baseline harness setup: Todo MD, GitHub (/github-setup),
  push_transport (HTTPS+PAT vs SSH), ship (/git-push-verify), docs classifier,
  actor markers. Use for greenfield, onboarding, first push, or "wire GitHub".
---

# Project startup (harness template)

## When to use

- Greenfield repo, new contributor, first GitHub connection, or explicit request for **full startup**.

## What to do

1. Follow **[`.ai/docs/flows/project-startup.md`](../../../.ai/docs/flows/project-startup.md)** — canonical ordered checklist (steps 0–7).
2. Obey **session hooks** in [`.claude/settings.local.json`](../settings.local.json): mandatory reads, `session-init.sh`, `pre-push-check.sh`, write/docs gates.
3. **Commands:** `/project-startup` (this checklist), `/github-setup`, `/git-push-verify` — see [`.claude/commands/`](../commands/).
4. **Actor markers:** use **`{claude}`** on todo lines and doc changelogs you touch from Claude Code; **`{cursor}`** when the last editor was Cursor (per [`TODO_MD_AGENT_PROTOCOL.md`](../../../.ai/protocols/TODO_MD_AGENT_PROTOCOL.md)).

## Cursor twin

Project skill for Cursor Chat: **`.cursor/skills/project-startup/SKILL.md`**. Always-on pointer rule: **`.cursor/rules/project-startup.mdc`**.
