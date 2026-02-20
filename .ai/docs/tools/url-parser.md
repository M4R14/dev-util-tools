# URL Parser

| Field | Value |
|---|---|
| **ToolID** | `url-parser` |
| **Route** | `/url-parser` |
| **Component** | `UrlParser.tsx` (with sub-components) |
| **Hook** | `useUrlParser` |
| **Lib** | `urlUtils.ts` |

## Description
Parse, encode, and decode URLs. Supports query param editing and live preview.

## Files
- `src/components/tools/UrlParser.tsx`
- `src/components/tools/url-parser/UrlComponentInput.tsx`
- `src/components/tools/url-parser/UrlComponents.tsx`
- `src/components/tools/url-parser/UrlInputSection.tsx`
- `src/components/tools/url-parser/UrlQueryParams.tsx`
- `src/hooks/useUrlParser.ts`
- `src/lib/urlUtils.ts`

## Usage Pattern
- Input: URL string
- Output: Parsed components, editable query params
- Actions: Encode, Decode, Copy, Clear

## UI
- Uses `ToolLayout`, `Input`, `Button`, `CopyButton`, `Card`

## Related

- [UI Building Blocks](../09-ui-building-blocks.md) — Component API and layout patterns
- [Tool Registry](../04-tool-registry.md) — Tool metadata & routing
- [Directory Map](../03-directory-map.md) — File locations
- [Types & Interfaces](../06-types-and-interfaces.md) — ToolID & types
- [Build, Env & Conventions](../08-build-env-conventions.md) — Naming & env vars
