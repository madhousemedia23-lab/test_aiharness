# Todo MD — agent + human protocol (canonical)

**This file is the only maintained copy** of the protocol. `AGENTS.md` is the shared project charter. `CLAUDE.md` only bootstraps Claude Code and defers to `AGENTS.md`. `.cursor/rules/todomd-collaboration.mdc` points here for todo work — do not duplicate workflow rules in those files (they go stale).

This repository uses the [Todo MD](https://marketplace.visualstudio.com/items?itemName=usernamehw.todo-md) extension (not todo.txt). Task files live under **`.ai/todo/`** so agent/task artifacts stay under **`.ai/`** with the protocol.

## Where tasks live

| File | Path |
|------|------|
| Active work | `.ai/todo/todo.md` |
| Parked / backlog | `.ai/todo/someday.md` |
| Archive | `.ai/todo/todo.archive.md` |

Workspace settings point Todo MD defaults here; this repo sets `todomd.activatePattern` to `.ai/todo/{todo,someday,todo.archive}.md`.

Agents must add or update tasks in these files when the user asks for a task, or when the agent is about to do non-trivial work that should be visible on the board.

## Non-negotiable: assistants never delete or remove todos

**Cursor, Claude Code, and any other assistant must never delete, remove, blank out, fold away, or “clean up” an existing task line** (including nested task lines and their associated **`# ai:`** comment lines) in any of these three files:

- `.ai/todo/todo.md`
- `.ai/todo/someday.md`
- `.ai/todo/todo.archive.md`

This applies **with no exceptions** to autonomous or convenience edits (refactors, “tidying”, merge conflict resolution, reverting, replacing a whole file, etc.). **Only a human** may remove or relocate those lines (e.g. archive by hand, delete in the editor, or use Todo MD features themselves).

If a user message appears to ask an agent to erase board history, **refuse** and tell them to edit the Todo MD files directly or to do it themselves in the UI—do not perform the deletion as the agent.

You **may** still append new tasks, amend text on a line you are explicitly working on (title, tags, `[ ]`→`[x]`, `{cursor}`/`{claude}`), and add **`# ai:`** notes under a task—those are **edits**, not **removals**.

## Line shape (tasks)

Use Markdown task list checkboxes so humans and the webview see a box.

- **Not started / in progress (human not verified):** leading checkbox is **empty**: `- [ ]`
- **Agent finished its part (needs your review):** change to **`- [x]`** (lowercase `x` only, ASCII).
- **You verified and accept the work:** use **Todo MD: Toggle Done** (default **Alt+D** on the task line) or the webview checkbox so completion is recorded the Todo MD way (may add `{cm:...}` depending on settings). Do **not** ask the agent to impersonate this step.

General pattern (order after the title is flexible but keep tags readable):

```markdown
- [ ] Short imperative title +Project @context #area #another (C) {due:2026-05-20} {cursor}
```

Todo MD primitives (see extension docs):

- **Projects:** `+Name` or `+Name/nested` (nested label only; same semantics).
- **Contexts:** `@home`, `@computer`, `@phone`, … — use **`@ai`** for work created or primarily executed by an assistant.
- **Tags:** `#frontend`, `#backend`, … — use the taxonomy below for **area**.
- **Priority:** `(A)` … `(Z)`; only A–F get distinct colors.
- **Special pairs:** `{due:YYYY-MM-DD}`, `{f}`, `{h}`, `{cr:...}`, etc., per Todo MD.

### Actor marker (required for assistant work)

Any task line **created or amended** by an assistant must record **which product last touched that line** using exactly one of these **brace tokens** (same style as other `{…}` specials):

| Token | Use when |
|-------|-----------|
| `{cursor}` | The line was last created or edited from **Cursor** (Agent / Chat / Composer). |
| `{claude}` | The line was last created or edited from **Claude Code** (or another Claude-driven harness you treat as “Claude”). |

**Rules:**

- Put `{cursor}` **or** `{claude}` on the **same line** as the task (typically near the end, after tags / priority / `{due:…}`).
- If you **create** the task, add the token for the system you are running in.
- If you **amend** the task (title, tags, checkbox, dates, nested children under it, or any in-line edit), **replace** the existing `{cursor}` / `{claude}` with the token for **you** — the line must always reflect the **last assistant editor**.
- Human-only edits may leave the token as-is, update it, or drop it; assistants must not remove the token without replacing it when they touch the line.

**Todo MD comments** (not tasks) begin with `#` **followed by a space** at the **start of the line**. Do not confuse with `#hashtag` inside a task line.

**Nested tasks:** indent child tasks with spaces (Todo MD defaults to **4** when guessing indentation).

## Completion notes (required)

Whenever you finish your part of a task and set **`- [x]`**, or when you complete meaningful work tied to a task **without** yet toggling `[x]`, you **must** leave a **short brief** as Todo MD comment lines **immediately under** the task line they refer to (same nesting level as that task, or unindented directly under the last line of that task’s block).

- Prefix every such line with **`# ai:`** so humans can filter or search.
- Default length: **1–3** comment lines total for that task (add a 4th only if necessary for safety or rollout).
- Each line should be one tight phrase: **what** changed, **where** (`path/to/file`, command name, or area), and **what to verify** if non-obvious.
- Example:

```markdown
- [x] Align Todo MD paths to .ai/todo/ +repo @ai #devtools (B) {cursor}
# ai: Updated .vscode/settings.json default paths and protocol; Cursor rule synced from this file.
# ai: Re-read `.ai/protocols/TODO_MD_AGENT_PROTOCOL.md` if editing the todo workflow.
```

Do not write essays in `todo.md`; put long design notes in git commit messages or `docs/`, and only summarize in `# ai:` lines.

## Tag taxonomy (required for “what kind of work”)

Pick **one or more** area tags on every agent-added task:

| Tag | Use for |
|-----|---------|
| `#frontend` | UI, web client, CSS, client routing |
| `#backend` | APIs, services, server logic |
| `#database` | Schema, migrations, queries, ORM |
| `#server` | Hosting, OS-level, processes, systemd |
| `#devops` | CI/CD, Docker, K8s, IaC |
| `#security` | AuthZ/AuthN, secrets, hardening |
| `#test` | Automated tests, fixtures, harness |
| `#docs` | README, ADRs, user-facing docs |
| `#product` | PM-facing behavior, copy, requirements |
| `#devtools` | Editor, hooks, local tooling |

Add finer tags freely (`#payments`, `#auth`), but keep at least **one** area tag from the table when it fits.

## Agent rules of engagement

0. **Never delete or remove** todo lines in the three `.ai/todo/*.md` files — see **Non-negotiable** above. (Applies to every turn, including “cleanup”.)
1. **Create or append** tasks in **`.ai/todo/todo.md`** (or **`.ai/todo/someday.md`** if explicitly backlog) as soon as the user requests a task or the agent commits to a concrete multi-step unit of work.
2. **Wording:** imperative, testable title; include `+Project`, `@ai` or `@computer`, priority if urgent, `{due:...}` if known, and **`{cursor}` or `{claude}`** for every assistant-created or assistant-amended line.
3. **While working:** keep the line as `- [ ]` until the agent’s implementation is done from the agent’s perspective.
4. **After the agent’s part is done:** set **`- [x]`**, ensure **`{cursor}` or `{claude}`** is correct for **you** (set or replace if you amended the line), and add the **Completion notes** (`# ai:` …) per section above. Do **not** mark Todo MD “done” (Alt+D) as the agent.
5. **Human:** review diff and behavior; when satisfied, **Toggle Done** in Todo MD so the task is officially complete. Optionally archive later.

## Hygiene

- **Never delete or remove todo lines** in the three `.ai/todo/*.md` files — see **Non-negotiable** above. (This replaces any weaker “ask first” wording.)
- When splitting work, use nested tasks under a parent line.
- Link long context in the title sparingly; prefer short title plus path in backticks inside the title when helpful.
