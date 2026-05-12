# Project agents charter

Use this file as the **human + agent** contract for how work is done in this repository.

## Purpose

Describe in one short paragraph what this project is for once you know the stack and goal.

## Where configuration lives

| Layer | Path | Notes |
|--------|------|--------|
| Cursor project skills | `.cursor/skills/` | Optional **project** skills (e.g. `project-startup/SKILL.md`) — load for greenfield / GitHub / first-push workflows. |
| Cursor rules (loaded by Cursor) | `.cursor/rules/` | `.mdc` with YAML frontmatter. These are what Cursor applies automatically. |
| Claude Code project memory | `CLAUDE.md` | Short bootstrap only — **full charter is `AGENTS.md`**. |
| Claude Code commands & skills | `.claude/commands/`, `.claude/skills/` | **Claude Code only** — slash commands (`/project-startup`, `/github-setup`, `/git-push-verify`, …), **skills** (`project-startup`, …), hooks live here at repo root (not under `.ai/`). |
| AI protocols, task board & baseline docs | `.ai/` | **`protocols/`** — canonical contracts (Todo MD, Docs Maintenance). **`todo/`** — Todo MD files. **`.ai/docs/`** — baseline human-readable blueprint (architecture, conventions, flows, glossary). Cursor `.mdc` files point at `protocols/`; do not duplicate. |
| Product docs package (human-readable) | `docs/` (repo root) | **In use** — currently documents the `scripts/weather_time.py` CLI. API, domain, user guides for product code (`scripts/`, `src/`, …) live here per `.ai/protocols/DOCS_MAINTENANCE_PROTOCOL.md`. **Not** where baseline harness docs live (use `.ai/docs/`). |

## Working agreements

- **Todos:** read `.ai/protocols/TODO_MD_AGENT_PROTOCOL.md` and use `.ai/todo/*.md` whenever you touch the task board; assistant-edited task lines must carry **`{cursor}`** or **`{claude}`** per that file. **Never delete or remove lines** in `todo.md`, `someday.md`, or `todo.archive.md` — assistants only append or in-place edit; removals are **human-only**.
- **Docs:** read `.ai/protocols/DOCS_MAINTENANCE_PROTOCOL.md`. **Before** editing docs for a structural change, follow [`.ai/docs/flows/docs-surface-classifier.md`](.ai/docs/flows/docs-surface-classifier.md) (label **Product-only** / **Harness-only** / **Both**). **Harness** structural changes update `README.md` + relevant **`.ai/docs/*.md`** in the **same change**. **Product-only** changes update root **`docs/*.md`** (and optionally **one** `README.md` pointer) — **without** expanding `.ai/docs/architecture.md` / `conventions.md` with product script details. When a change touches **both**, update both surfaces. Changelog line + `{cursor}` / `{claude}` on each touched file. Diagrams are Mermaid. Never duplicate protocol content into `.ai/docs/` or `docs/`.
- Prefer small, reviewable changes; do not refactor unrelated code.
- Do not commit secrets; use environment variables and local-only files ignored by git.
- Match existing naming, formatting, and patterns in the codebase you touch.

## Commands and verification

List the real commands for this stack when you add one (install, lint, test, build). Until then, replace this section when the toolchain exists.

## Changelog

- 2026-05-12 — charter: `.cursor/skills/` row; Claude commands/skills list `/project-startup` + `project-startup` skill {cursor}
- 2026-05-12 — removed `Co-authored-by` from `/git-push-verify` canonical commit template and Cursor rule mirror; root commit message rewritten without trailer {cursor}
- 2026-05-12 — `/git-push-verify` canonical commit adds `Co-authored-by: Cursor <cursoragent@cursor.com>` (Git trailer); `.cursor/rules/git-push-verify.mdc` commit block aligned {cursor}
- 2026-05-12 — GitHub: optional `push_transport` ssh|https; SSH `origin` + host-key verify; pre-push hook allows SSH pushes; /github-setup + /git-push-verify + project-init updated {cursor}
- 2026-05-12 — added /git-push-verify command (.claude/commands/) + .cursor/rules/git-push-verify.mdc: stage, commit achievement summary, push PAT, fetch, verify, show repo info {claude}
- 2026-05-12 — added project-init.mdc Cursor rule: mirrors Claude Code hooks for Cursor (todo bootstrap, GitHub config check, PAT gate before push) {claude}
- 2026-05-12 — added session-init hook (todo bootstrap + GitHub config check), pre-push-check hook (PAT gate), /github-setup command, and .ai/config/project.json for repo connection {claude}
- 2026-05-12 — enforced mandatory session-start reads: CLAUDE.md hard block + SessionStart hook in .claude/settings.local.json {claude}
- 2026-05-12 — docs: mandatory `.ai/docs/flows/docs-surface-classifier.md` before structural doc edits {cursor}
- 2026-05-12 — docs working agreement: harness vs product-only surfaces per DOCS_MAINTENANCE_PROTOCOL {cursor}

## Last touched
{cursor} 2026-05-12
