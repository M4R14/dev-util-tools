# UUID Generator

| Field | Value |
|---|---|
| **ToolID** | `uuid-generator` |
| **Route** | `/uuid-generator` |
| **Component** | `UUIDGenerator.tsx` |
| **Hook** | `useUUIDGenerator` |
| **Lib** | — |

## Description
Create Version 4 UUIDs (GUIDs). Supports batch generation, copy, and download.

## Files
- `src/components/tools/UUIDGenerator.tsx`
- `src/hooks/useUUIDGenerator.ts`

## Usage Pattern
- Options: Quantity, uppercase, hyphens, etc.
- Output: List of UUIDs
- Actions: Generate, Copy, Download, Clear

## UI
- Uses `ToolLayout`, `Input`, `Slider`, `Switch`, `CopyButton`, `Button`, `Card`

## Related

- [UI Building Blocks](../09-ui-building-blocks.md) — Component API and layout patterns
- [Tool Registry](../04-tool-registry.md) — Tool metadata & routing
- [Directory Map](../03-directory-map.md) — File locations
- [Types & Interfaces](../06-types-and-interfaces.md) — ToolID & types
- [Build, Env & Conventions](../08-build-env-conventions.md) — Naming & env vars
