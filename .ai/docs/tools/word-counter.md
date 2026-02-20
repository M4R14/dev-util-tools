# Word Counter

| Field | Value |
|---|---|
| **ToolID** | `word-counter` |
| **Route** | `/word-counter` |
| **Component** | `WordCounterTool.tsx` |
| **Hook** | _(none)_ |
| **Lib** | _(none)_ |

## Description
External helper page for quick access to [wordcounter.net](https://wordcounter.net/) with copy-ready sample texts and metric reference.

## Files
- `src/components/tools/WordCounterTool.tsx`

## Usage Pattern
- Input: Open external site + optional sample text copy
- Output: Word/character/readability metrics (computed by external service)
- Actions: Open external tool, Copy sample snippets

## UI
- Uses `ToolLayout`, `Card`, `Button`, `CopyButton`

## Related

- [UI Building Blocks](../09-ui-building-blocks.md) — Component API and layout patterns
- [Tool Registry](../04-tool-registry.md) — Tool metadata & routing
- [Directory Map](../03-directory-map.md) — File locations
- [Types & Interfaces](../06-types-and-interfaces.md) — ToolID & types
- [Build, Env & Conventions](../08-build-env-conventions.md) — Naming & env vars
