# Glossary

Project-specific terms used across the harness and documentation. When a term in code, a doc, or a chat starts feeling overloaded, define it here.

## TL;DR

- **Harness** = the agent + human contract layer (`.ai/protocols/`, `.ai/todo/`, `.cursor/`, `.claude/`, `AGENTS.md`, `CLAUDE.md`, root config).
- **Baseline docs** = **`.ai/docs/`** — blueprint for the template that ships with every project; always maintained with structural changes to the baseline.
- **Product docs** = repo root **`docs/`** — use it whenever **product code** exists (`scripts/`, `src/`, …); it is not optional for documenting that code.
- **Protocol** = the canonical contract under `.ai/protocols/`.
- **Rule** = a Cursor `.mdc` file under `.cursor/rules/` that points at a protocol.
- **Actor marker** = the `{cursor}` or `{claude}` token that records which assistant last touched a line or file.
- **Doc surface classifier** = [`.ai/docs/flows/docs-surface-classifier.md`](flows/docs-surface-classifier.md) — mandatory gate before editing docs on structural changes.

## Terms

| Term | Definition |
|------|------------|
| **Harness** | Everything that defines how agents and humans work together: `.ai/protocols/`, `.ai/todo/`, `.cursor/rules/`, `.claude/`, `AGENTS.md`, `CLAUDE.md`, and root config files. |
| **Baseline docs** | Markdown under **`.ai/docs/`** plus the root **`README.md`** front door. Describes the baseline repo layout, harness wiring, and template conventions. Ships with every copy of this template. |
| **Product docs** | Markdown under repo root **`docs/`** once that tree exists. Describes the application or library you build on top of the baseline — not the harness itself. |
| **Protocol** | A `.ai/protocols/<NAME>_PROTOCOL.md` file. The **only maintained copy** of a working agreement. Cursor rules and docs link to it; they never restate it. |
| **Charter** | `AGENTS.md`. The shared working-agreements document for humans and agents. Points at the protocols. |
| **Pointer rule** | A Cursor `.mdc` file whose entire purpose is to defer to a protocol. Examples: `todomd-collaboration.mdc`, `docs-maintenance.mdc`. |
| **Baseline rule** | `.cursor/rules/foundations.mdc`. Engineering habits applied on every Cursor turn. |
| **Actor marker** | The `{cursor}` or `{claude}` token. On a Todo MD task line, it records the last assistant editor. On a doc file, it appears in the `## Last touched` footer and on each changelog line. |
| **Doc surface classifier** | [`.ai/docs/flows/docs-surface-classifier.md`](flows/docs-surface-classifier.md). A short **mandatory** checklist (Gates A/B + label) that routes a structural change to **Product-only**, **Harness-only**, or **Both** doc targets so agents never put product CLI tables into `.ai/docs/*`. |
| **Trigger** | An event listed in `.ai/protocols/DOCS_MAINTENANCE_PROTOCOL.md` that obligates a documentation update. |
| **Target** | A file that must be updated in response to a trigger (e.g. `README.md`, `.ai/docs/architecture.md`, or a file under `docs/`). |
| **Same change** | The git change that introduces a structural change must also contain the corresponding doc updates. |
| **Escape hatch** | The `<!-- TODO(docs): … -->` HTML comment + a matching `- [ ]` task in `.ai/todo/todo.md` for provisional structural decisions. |
| **Structural change** | Any change to folders, file classes, features, functions, commands, dependencies, or external surfaces — anything a new contributor would need to learn. |
| **File class** | The first appearance of a kind of file in the repo. Triggers a conventions update. |
| **Todo MD** | The VS Code extension for task tracking. Reads `.ai/todo/{todo,someday,todo.archive}.md` per `.vscode/settings.json`. |
| **`{cursor}`** / **`{claude}`** | Actor markers for Cursor vs Claude Code as last assistant editor. |
| **`# ai:`** | Prefix for Todo MD comment lines authored by an assistant (completion notes). |

## Anti-terms (avoid these in this repo)

| Avoid | Use instead |
|-------|-------------|
| "Spec" | **Protocol** for working agreements; **architecture** for system shape. |
| "The docs folder" (ambiguous) | **`.ai/docs/`** (baseline) or **`docs/`** (product). |
| "Wiki" | In-repo markdown only — pick baseline vs product path. |

## Examples

- "Baseline vs product" → Harness blueprint is in **`.ai/docs/`**; when you add `src/` and a public API, you add **`docs/api.md`** (or similar) under root **`docs/`**, not under `.ai/docs/`.
- "Pointer rule" → `.cursor/rules/docs-maintenance.mdc` points at `.ai/protocols/DOCS_MAINTENANCE_PROTOCOL.md` without duplicating its text.

## Changelog

- 2026-05-12 — added **Doc surface classifier** term; clarified product `docs/` is required when product code exists {cursor}
- 2026-05-12 — split **baseline docs** (`.ai/docs/`) vs **product docs** (`docs/`) {cursor}
- 2026-05-12 — initial glossary (was under `docs/`) {cursor}

## Last touched
{cursor} 2026-05-12
