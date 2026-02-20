# Crontab Guru

| Field | Value |
|---|---|
| **ToolID** | `crontab-guru` |
| **Route** | `/crontab-guru` |
| **Component** | `CrontabTool.tsx` |
| **Hook** | — (static) |
| **Lib** | — |

## Description
Generate and explain cron schedule expressions. Provides human-readable explanations and links to external resources.

## Files
- `src/components/tools/CrontabTool.tsx`

## Usage Pattern
- Input: Cron expression (text input)
- Output: Human-readable explanation, next run times
- Actions: Copy, Clear, External link

## UI
- Uses `ToolLayout`, `Input`, `Button`, `CopyButton`
- May link out to [crontab.guru](https://crontab.guru/)

## Related

- [UI Building Blocks](../09-ui-building-blocks.md) — Component API and layout patterns
- [Tool Registry](../04-tool-registry.md) — Tool metadata & routing
- [Directory Map](../03-directory-map.md) — File locations
- [Types & Interfaces](../06-types-and-interfaces.md) — ToolID & types
- [Build, Env & Conventions](../08-build-env-conventions.md) — Naming & env vars
