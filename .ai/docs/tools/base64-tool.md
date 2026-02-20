# Base64 Tool

| Field | Value |
|---|---|
| **ToolID** | `base64-tool` |
| **Route** | `/base64-tool` |
| **Component** | `Base64Tool.tsx` |
| **Hook** | `useBase64` |
| **Lib** | — |

## Description
Encode and decode strings/files to Base64. Supports text and file input, with instant conversion.

## Files
- `src/components/tools/Base64Tool.tsx`
- `src/hooks/useBase64.ts`

## Usage Pattern
- Input: Textarea or file upload
- Output: Encoded/decoded Base64 string
- Actions: Encode, Decode, Copy, Clear

## UI
- Uses `ToolLayout`, `Textarea`, `CopyButton`, `Input`, `Button`

## Related

- [UI Building Blocks](../09-ui-building-blocks.md) — Component API and layout patterns
- [Tool Registry](../04-tool-registry.md) — Tool metadata & routing
- [Directory Map](../03-directory-map.md) — File locations
- [Types & Interfaces](../06-types-and-interfaces.md) — ToolID & types
- [Build, Env & Conventions](../08-build-env-conventions.md) — Naming & env vars
