# UUID Generator

| Field | Value |
|---|---|
| **ToolID** | `uuid-generator` |
| **Route** | `/uuid-generator` |
| **Component** | `UUIDGenerator.tsx` |
| **Hook** | `useUUIDGenerator` |
| **Lib** | — |

## Description
Create Version 4 UUIDs (GUIDs) with a UI optimized for fast batch generation workflows.

## Files
- `src/components/tools/UUIDGenerator.tsx`
- `src/components/tools/uuid-generator/*`
- `src/hooks/useUUIDGenerator.ts`

## Usage Pattern
- Options: Quantity (input + slider + quick presets), uppercase, hyphens
- Output: List of UUIDs
- Actions: Generate, Copy row, Copy all, Download, Clear
- Shareability: Options sync with URL query (`?q=&hy=&up=`) for reproducible links

## UI
- Uses `ToolLayout`, `Input`, `Slider`, `Switch`, `CopyButton`, `Button`, `Card`
- UI/UX highlights:
  - Quick quantity presets (`1`, `5`, `10`, `25`, `50`, `100`)
  - Format preview block that updates with casing/hyphen options
  - Result header status badges (item count + secure `crypto.randomUUID` availability)
  - Mobile-friendly per-row copy action visibility

## Related

- [Shareable URL State Features](../features/shareable-url-state-features.md) — Query key coverage and share behavior
- [UI Building Blocks](../09-ui-building-blocks.md) — Component API and layout patterns
- [Tool Registry](../04-tool-registry.md) — Tool metadata & routing
- [Directory Map](../03-directory-map.md) — File locations
- [Types & Interfaces](../06-types-and-interfaces.md) — ToolID & types
- [Build, Env & Conventions](../08-build-env-conventions.md) — Naming & env vars
