# Claude Code context

## MANDATORY FIRST ACTION — NON-NEGOTIABLE

**Before doing anything else — before reading any other file, before writing any code, before answering any question about this repo — you MUST:**

1. `Read AGENTS.md` (repo root)
2. `Read .ai/protocols/TODO_MD_AGENT_PROTOCOL.md`
3. `Read .ai/protocols/DOCS_MAINTENANCE_PROTOCOL.md`
4. `Read .ai/docs/flows/docs-surface-classifier.md`

**Do not skip this. Do not defer it. Do not treat it as optional context.** These files contain the working agreements every action in this repo must follow. Skipping them has caused repeated rule violations. Read them first, every session, no exceptions.

---

Claude Code reads this file at session start. **Do not duplicate** the project charter here — follow **`AGENTS.md`** in full (paths, todos, working agreements).

**Claude-specific:** put slash-commands, skills, and hooks under **`.claude/`** at the repo root (`commands/`, `skills/`, etc.). Todo MD rules and paths live in **`.ai/protocols/TODO_MD_AGENT_PROTOCOL.md`** and **`.ai/todo/`** — same as for any other agent. Docs maintenance rules live in **`.ai/protocols/DOCS_MAINTENANCE_PROTOCOL.md`** — **before** structural doc edits, follow [`.ai/docs/flows/docs-surface-classifier.md`](.ai/docs/flows/docs-surface-classifier.md); then classify **harness vs product-only** per that protocol; update **`README.md`** + relevant **`.ai/docs/*.md`** for harness changes, and root **`docs/*.md`** for product changes, in the same change, with a `{claude}` actor marker on each touched file.

## What this repo is

One sentence describing the product or library.

## Verify before you claim done

Replace with real commands once the project has a toolchain (for example: `pnpm test`, `pytest`, `go test ./...`).

## Changelog

- 2026-05-12 — docs: point at mandatory doc-surface classifier before structural doc edits {cursor}
- 2026-05-12 — docs bootstrap: classify harness vs product-only per DOCS_MAINTENANCE_PROTOCOL {cursor}

## Last touched
{cursor} 2026-05-12
