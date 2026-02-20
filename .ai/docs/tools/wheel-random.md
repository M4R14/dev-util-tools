# Wheel Random

| Field | Value |
|---|---|
| **ToolID** | `wheel-random` |
| **Route** | `/wheel-random` |
| **Component** | `WheelRandomTool.tsx` |
| **Hook** | _(none)_ |
| **Lib** | _(none)_ |

## Description
External helper page for quick access to [wheelrandom.com](https://wheelrandom.com/) with copy-ready wheel item lists and usage ideas.

## Files
- `src/components/tools/WheelRandomTool.tsx`

## Usage Pattern
- Input: Open external wheel + optional sample item list copy
- Output: Random spin result (computed by external service)
- Actions: Open external tool, Copy sample wheel items

## UI
- Uses `ToolLayout`, `Card`, `Button`, `CopyButton`

## Related

- [UI Building Blocks](../09-ui-building-blocks.md) — Component API and layout patterns
- [Tool Registry](../04-tool-registry.md) — Tool metadata & routing
- [Directory Map](../03-directory-map.md) — File locations
- [Types & Interfaces](../06-types-and-interfaces.md) — ToolID & types
- [Build, Env & Conventions](../08-build-env-conventions.md) — Naming & env vars
