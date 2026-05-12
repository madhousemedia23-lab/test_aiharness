# Product conventions

## TL;DR

- Scripts → `scripts/` (`snake_case.py`), each with `--demo`, `--json`, `--seed=N`.
- Self-contained projects → repo root (`kebab-case/` with own `package.json`).
- Every surface gets its own reference doc under `docs/`.

## Directory layout

| Path | What goes here |
|------|---------------|
| `scripts/` | Standalone Python CLI scripts |
| `harness-video/` | Remotion project (self-contained) |
| `docs/scripts/` | One reference doc per script |
| `docs/harness-video/` | Reference docs for harness-video |

## Naming

| Artefact | Convention | Example |
|----------|-----------|---------|
| Script file | `snake_case.py` | `weather_time.py` |
| Script doc | `kebab-case.md` | `weather-time.md` |
| Project dir | `kebab-case/` at root | `harness-video/` |
| Project doc | `README.md` under `docs/<name>/` | `docs/harness-video/README.md` |

## Changelog

- 2026-05-12 — re-bootstrapped {claude}

## Last touched
{claude} 2026-05-12
