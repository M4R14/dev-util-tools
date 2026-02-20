# URL Parser

| Field | Value |
|---|---|
| **ToolID** | `url-parser` |
| **Route** | `/url-parser` |
| **Component** | `UrlParser.tsx` (with sub-components) |
| **Hook** | `useUrlParser` |
| **Lib** | `urlUtils.ts` |

## Description
Parse, encode, and decode URLs with live validation, canonical preview, and interactive query param management.

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
- Output: Canonical URL preview, parsed components, editable query params
- Actions: Encode, Decode, Copy, Clear, Add param, Remove param

## UI
- Uses `ToolLayout`, `Input`, `Textarea`, `Button`, `CopyButton`, `Card`
- Input panel shows URL status (`idle`/`valid`/`invalid`) and quick metadata (host, param count)
- Parsed components panel includes security badge and canonical URL field
- Query params panel supports add/remove rows and query-string copy

## Related

- [UI Building Blocks](../09-ui-building-blocks.md) — Component API and layout patterns
- [Tool Registry](../04-tool-registry.md) — Tool metadata & routing
- [Directory Map](../03-directory-map.md) — File locations
- [Types & Interfaces](../06-types-and-interfaces.md) — ToolID & types
- [Build, Env & Conventions](../08-build-env-conventions.md) — Naming & env vars
