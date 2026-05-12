# Conventions

Where new things go in this repository, what to name them, and what shape they should take.

## TL;DR

- **Harness** lives under `.ai/` (protocols, todo, **baseline docs**), `.cursor/`, `.claude/`. **Product docs** live under repo root **`docs/`** as soon as you have product code; **product naming and script layout** are documented there — **not** in this file.
- **Protocols** live at `.ai/protocols/<NAME>_PROTOCOL.md` in `SCREAMING_SNAKE_CASE`. **Cursor rules** live at `.cursor/rules/<kebab-name>.mdc` in `kebab-case` and never duplicate protocol content.
- **Baseline doc files** under `.ai/docs/` use `kebab-case.md` and follow a fixed section order (see "Doc shape" below).
- **Diagrams** are Mermaid, inline in the doc that owns them. No binary images unless a human asks.
- **Actor markers** (`{cursor}` / `{claude}`) appear on every assistant-edited todo line and at the bottom of every assistant-edited doc.
- **Never delete** todo lines or doc changelog entries — append or amend only.

## Directory rules

| Path | What lives here | What does NOT live here |
|------|------------------|--------------------------|
| `.ai/protocols/` | Canonical working-agreement protocols. | Narrative architecture (that is under `.ai/docs/`). |
| `.ai/todo/` | Three Todo MD files only: `todo.md`, `someday.md`, `todo.archive.md`. | Anything else. |
| `.ai/docs/` | **Baseline** documentation: blueprint, architecture, conventions, flows, glossary for the harness. | Product user guides (use root `docs/`). |
| `.cursor/rules/` | Cursor `.mdc` rules. Each new protocol gets a matching pointer rule. | Markdown that isn't a Cursor rule. |
| `.claude/commands/` | Claude slash commands. | Rules; protocols. |
| `.claude/skills/` | Claude skills. | Rules; protocols. |
| `docs/` (repo root) | **Product / application** documentation — add when you have product code to document. | Baseline harness docs (those stay in `.ai/docs/`). |
| `docs/flows/` | Product workflow docs (when `docs/` exists). | Baseline harness flows (use `.ai/docs/flows/`). |
| Root | `README.md`, `AGENTS.md`, `CLAUDE.md`, baseline config (`.editorconfig`, `.gitignore`, `.vscode/`). | Long-form harness docs (use `.ai/docs/`). |
| `scripts/`, `src/`, `app/`, … *(product code at repo root)* | **Product** source — document under **`docs/`** per [`.ai/protocols/DOCS_MAINTENANCE_PROTOCOL.md`](../protocols/DOCS_MAINTENANCE_PROTOCOL.md). | Harness conventions here — do not add per-script rows to this baseline file. |

## Naming

| Thing | Pattern | Example |
|-------|---------|---------|
| Protocol | `<NAME>_PROTOCOL.md` (SCREAMING_SNAKE_CASE) | `DOCS_MAINTENANCE_PROTOCOL.md` |
| Cursor rule | `<kebab-name>.mdc` | `docs-maintenance.mdc` |
| Baseline doc file | `<kebab-name>.md` under `.ai/docs/` | `architecture.md`, `documentation-update-flow.md` |
| Baseline flow file | `<noun-or-verb-phrase>-flow.md` under `.ai/docs/flows/` | `documentation-update-flow.md` |
| Product doc file | `<kebab-name>.md` under `docs/` | `scripts/weather-time.md` |
| Mermaid asset (when extracted) | `<kebab-name>.mmd` under `.ai/docs/diagrams/` or `docs/diagrams/` | `repo-blueprint.mmd` |
| Binary asset (rare) | `<kebab-name>.<ext>` under `.ai/docs/assets/` or `docs/assets/` | `landing-screenshot.png` |
| Todo task line | `- [ ] Short imperative title +Project @ai #area (Priority) {cursor\|claude}` | `- [ ] Add docs-sync hook +DX @ai #devtools (B) {cursor}` |
| Todo `# ai:` note | `# ai: <short brief>` immediately under the task | `# ai: Updated README.md map and architecture diagram.` |

## Doc shape (required)

Every file under root `README.md`, `.ai/docs/**`, and root `docs/**` (when present) follows this order:

```text
# Title
## TL;DR              (3–6 bullets, readable in 20 seconds)
## <Body sections>    (most useful order for the reader)
## Diagram            (Mermaid, when structural)
## Examples           (at least one for non-trivial docs)
## Changelog          (append-only)
## Last touched
{cursor|claude} YYYY-MM-DD
```

Skipping a section is fine when not relevant (e.g. a small glossary doesn't need a diagram), but the **Changelog** and **Last touched** footer are required on every file.

## Cross-linking

- From `.ai/docs/`: `[protocol](../protocols/DOCS_MAINTENANCE_PROTOCOL.md)`, `[README](../../README.md)`.
- From `docs/` (product): link up to repo root with `../` as appropriate.
- Code, file, and folder names use backticks: `` `.ai/todo/todo.md` ``.

## When you add a new top-level folder

Classify the folder:

- **Harness folder** (under `.ai/` except product-only code, `.cursor/`, `.claude/`, or new root config that is part of the template): update `README.md`, `.ai/docs/architecture.md`, this file, and the protocol only if a new trigger appears.
- **Product folder** (`scripts/`, `src/`, `app/`, …): update root **`docs/*`** (product package). **Do not** add product-specific rows here or expand `.ai/docs/architecture.md` with script names. Optional: one `README.md` map row pointing to `docs/README.md`.

## When you add a new file class

A "file class" is the first appearance of a kind of file — first `.mdc`, first protocol, first `Dockerfile` **for the harness template**, etc.

- **Harness / template file class:** update this file and `.ai/docs/architecture.md` to describe where that class lives **in the harness**.
- **Product file class** (first `.py` in `scripts/`, first app migration): document naming and layout under root **`docs/`** (e.g. `docs/conventions.md`). **Do not** add product file-class rows to this baseline conventions file.

## When you add a new protocol

1. Create `.ai/protocols/<NAME>_PROTOCOL.md`.
2. Create `.cursor/rules/<kebab-name>.mdc` as a pointer rule with `alwaysApply: true`.
3. Update `AGENTS.md` working agreements + paths table.
4. Update `CLAUDE.md` to mention it.
5. Update `README.md` golden rules table.
6. Update `.ai/docs/architecture.md` Protocols table.
7. Add a changelog line to every touched file.

## When you add a Claude command or skill

1. Create the file under `.claude/commands/` or `.claude/skills/`.
2. Update `.ai/docs/architecture.md` `.claude/` table.
3. No protocol needed unless it introduces a new working agreement.

## When you add a Claude hook

Hooks live in `.claude/settings.local.json` under `hooks.<EventName>`. Common events: `SessionStart`, `PreToolUse`, `PostToolUse`.

1. Add the hook entry to `.claude/settings.local.json`.
2. Update `.ai/docs/architecture.md` hooks table with the event, matcher, and purpose.
3. If the hook enforces a working agreement (e.g. mandatory-reads reminder, docs-update check), document that rule in `CLAUDE.md` **and** `AGENTS.md` as well — the hook is an enforcement mechanism, not the rule definition.
4. Append a changelog line to every touched file.

**Current hooks and what they enforce:**

| Hook | Script | Enforces |
|------|--------|---------|
| `SessionStart` | inline | Creates sentinel; prints blocked-until-read notice |
| `PreToolUse` (`.*`) | `.claude/hooks/pre-tool-check.sh` | **Hard block** on all tools except `Read` until `AGENTS.md` is read — outputs `{"decision":"block"}` JSON |
| `PostToolUse` (`Read`) | `.claude/hooks/post-tool-read.sh` | Removes sentinel once `AGENTS.md` confirmed read; unblocks all tools |
| `PostToolUse` (`Edit\|Write`) | inline | Docs + todo checklist after every file edit |

Hook scripts live in `.claude/hooks/`. When adding a new hook that enforces a working agreement, add a row to this table and document it in `AGENTS.md` as well.

## Anti-patterns

- **Don't** duplicate protocol content into `.ai/docs/` or rules. Link to the protocol.
- **Don't** put baseline harness narrative under repo root `docs/` — use **`.ai/docs/`**.
- **Don't** put ad-hoc markdown under `.ai/` except `protocols/`, `todo/*.md`, and the baseline package under `.ai/docs/`.
- **Don't** commit binary images without an explicit human request.
- **Don't** delete a doc file. Add a deprecation banner and a changelog line.
- **Don't** document product `scripts/*.py` or `src/**` layout in **this** file — use root **`docs/`** (see `docs/conventions.md` for product naming when you create it).

## Examples

- **New file `src/index.ts` (first TypeScript file in product `src/`):**
  - Add or update **`docs/conventions.md`**, **`docs/architecture.md`**, and link from **`docs/README.md`**.
  - **Do not** add `src/` naming tables to this baseline file.

- **New Cursor rule `src-naming.mdc`:**
  - File created with `alwaysApply: true` and `description:` frontmatter.
  - `.ai/docs/architecture.md` rule table gets a row.
  - This file updated if the rule encodes a new **harness** naming convention.

## Changelog

- 2026-05-12 — updated hooks table to show hard-blocking PreToolUse mechanism; added hooks/ scripts column {claude}
- 2026-05-12 — added PostToolUse hook to current-hooks table; updated conventions to reflect docs+todo inline enforcement {claude}
- 2026-05-12 — added "When you add a Claude hook" section; documents SessionStart hook pattern and enforcement rule {claude}
- 2026-05-12 — routed **product** folders/file classes to root `docs/`; removed product `scripts/` rows from baseline tables {cursor}
- 2026-05-12 — added `scripts/` directory rule + first-`.py` file-class naming row + example {cursor}
- 2026-05-12 — note: the line above placed **product** `scripts/` guidance in baseline by mistake; superseded by routing product layout to root `docs/` per DOCS_MAINTENANCE_PROTOCOL {cursor}
- 2026-05-12 — baseline docs path `.ai/docs/`; root `docs/` reserved for product; fixed directory rules {cursor}
- 2026-05-12 — initial conventions doc (was under `docs/`) {cursor}

## Last touched
{claude} 2026-05-12
