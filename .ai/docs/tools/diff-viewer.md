# Diff Viewer

| Field | Value |
|---|---|
| **ToolID** | `diff-viewer` |
| **Route** | `/diff-viewer` |
| **Component** | `DiffViewer.tsx` |
| **Hook** | `useDiffViewer` |
| **Lib** | `diffUtils.ts` (diff lib) |

## Description
Compare two texts side-by-side and view differences. Supports unified and split view, copy, and stats.

## Files
- `src/components/tools/DiffViewer.tsx`
- `src/hooks/useDiffViewer.ts`
- `src/lib/diffUtils.ts`

## Usage Pattern
- Input: Two textareas (A, B)
- Output: Highlighted diff (side-by-side or inline)
- Actions: Copy, Clear, Toggle view

## UI
- Uses `ToolLayout`, `Textarea`, `CopyButton`, `Button`, `Card`

## Related

- [UI Building Blocks](../09-ui-building-blocks.md) — Component API and layout patterns
- [Tool Registry](../04-tool-registry.md) — Tool metadata & routing
- [Directory Map](../03-directory-map.md) — File locations
- [Types & Interfaces](../06-types-and-interfaces.md) — ToolID & types
- [Build, Env & Conventions](../08-build-env-conventions.md) — Naming & env vars
