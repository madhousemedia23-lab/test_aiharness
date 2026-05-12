# Product docs

## TL;DR

- Primary product: `harness-video/` — Remotion animated explainer of the project harness (7 scenes, 93s).
- Supporting script: `scripts/weather_time.py` — standalone Python CLI.
- Harness/baseline docs live under `.ai/docs/` — not here.

## Contents

| Doc | What it answers |
|-----|----------------|
| `docs/README.md` | This index |
| `docs/architecture.md` | Product components and how they relate |
| `docs/conventions.md` | Naming and layout standards for product code |
| `docs/harness-video/README.md` | Full reference for the `harness-video/` Remotion project |
| `docs/scripts/weather-time.md` | CLI reference for `scripts/weather_time.py` |

## Quick start

```bash
# Harness explainer video (primary)
cd harness-video && npm install && npm start   # Remotion Studio
cd harness-video && npm run render            # render MP4

# Weather CLI
python3 scripts/weather_time.py --demo
```

## Changelog

- 2026-05-12 — re-bootstrapped; added harness-video as primary product {claude}

## Last touched
{claude} 2026-05-12
