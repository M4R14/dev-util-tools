# Diff Viewer

| Field | Value |
|---|---|
| **ToolID** | `diff-viewer` |
| **Route** | `/diff-viewer` |
| **Component** | `DiffViewer.tsx` |
| **Hook** | `useDiffViewer` |
| **Lib** | `diffUtils.ts` (diff lib) |

## Description
Compare two texts side-by-side and view differences. Supports unified/split view, change filtering, line wrapping toggle, copy, and inline stats.

## Files
- `src/components/tools/DiffViewer.tsx`
- `src/components/tools/diff-viewer/*`
- `src/hooks/useDiffViewer.ts`
- `src/lib/diffUtils.ts`

## Usage Pattern
- Input: Two textareas (A, B)
- Output: Highlighted diff (split or unified) with optional "changes only" filtering
- Actions: Load sample, Swap, Clear, Toggle view, Toggle line wrap, Copy unified diff
- Shareability: Original/modified text and view mode sync via URL query (`?original=&modified=&view=`)

## UI
- Uses `ToolLayout`, `Textarea`, `CopyButton`, `Button`
- Input panels show line/character metrics
- Toolbar includes quick controls and diff change summary

## Related

- [Shareable URL State Features](../features/shareable-url-state-features.md) — Query key coverage and share behavior
- [UI Building Blocks](../09-ui-building-blocks.md) — Component API and layout patterns
- [Tool Registry](../04-tool-registry.md) — Tool metadata & routing
- [Directory Map](../03-directory-map.md) — File locations
- [Types & Interfaces](../06-types-and-interfaces.md) — ToolID & types
- [Build, Env & Conventions](../08-build-env-conventions.md) — Naming & env vars
