# harness-video

## TL;DR

- Remotion animated explainer of how the project harness works.
- 7 scenes, 93 seconds, 1280×720 @ 30fps, dark terminal aesthetic.
- Scene 1 uses a real Cursor IDE screenshot (`public/cursor-ide.png`).
- Preview: `cd harness-video && npm start`

## Scenes

| # | Title | Duration | What it shows |
|---|-------|----------|---------------|
| 01 | Cursor + Claude Code — Session Start | 15s | Real Cursor screenshot; SessionStart hook; 4 files loaded |
| 02 | Task Received | 10s | User message in terminal; todo.md task created |
| 03 | Claude Code Writes the Script | 15s | Code editor; PostToolUse hook checklist |
| 04 | Docs Surface Classifier | 12s | Gate A/B; PRODUCT-ONLY; new surface → CREATE |
| 05 | Docs Package Updated | 15s | New doc + updates; hook fires after each write |
| 06 | Task Board Updated | 10s | [ ] → [x]; `{claude}` marker; # ai: note |
| 07 | Two Actors, One Harness | 20s | Cursor path + Claude Code path converging on shared protocols |

## Usage

```bash
cd harness-video
npm install              # first time only
npm start                # Remotion Studio — live preview
npm run render           # render to out/harness-video.mp4
```

## Assets

| File | Purpose |
|------|---------|
| `public/cursor-ide.png` | Real Cursor IDE screenshot used in Scene 01 |

## Changelog

- 2026-05-12 — re-created; added real Cursor screenshot; dual-actor Scene 7 {claude}

## Last touched
{claude} 2026-05-12
