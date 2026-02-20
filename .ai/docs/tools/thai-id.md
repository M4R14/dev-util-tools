# Thai ID Decoder

| Field | Value |
|---|---|
| **ToolID** | `thai-id` |
| **Route** | `/thai-id` |
| **Component** | `ThaiIdTool.tsx` |
| **Hook** | `useThaiId` |
| **Lib** | `thaiId.ts` |

## Description
Decode Thai national ID digits by position, validate checksum (13th digit), and generate sample valid IDs via `generateThaiId`.

## Files
- `src/components/tools/ThaiIdTool.tsx`
- `src/hooks/useThaiId.ts`
- `src/lib/thaiId.ts`

## Usage Pattern
- Input: Thai ID value (13 digits, accepts pasted formatted values)
- Output: Decoded sections (person type, location digits, household, person order, checksum)
- Actions: Generate (via `generateThaiId`), Analyze, Copy formatted ID, Clear
- Share: URL sync via query key `input`

## UI
- Uses `ToolLayout`, `Input`, `Button`, `CopyButton`
- Includes full reference list for person type meaning in digit 1 (`1-8`)

## Core Logic
- `src/lib/thaiId.ts`
  - `generateThaiId()` generates a valid 13-digit Thai ID with correct checksum.

## Related

- [Shareable URL State Features](../features/shareable-url-state-features.md) — Query key coverage and URL sync behavior
- [UI Building Blocks](../09-ui-building-blocks.md) — Component API and layout patterns
- [Tool Registry](../04-tool-registry.md) — Tool metadata & routing
- [Directory Map](../03-directory-map.md) — File locations
- [Types & Interfaces](../06-types-and-interfaces.md) — ToolID & types
- [Build, Env & Conventions](../08-build-env-conventions.md) — Naming & env vars
