# XML to JSON

| Field | Value |
|---|---|
| **ToolID** | `xml-to-json` |
| **Route** | `/xml-to-json` |
| **Component** | `XMLToJson.tsx` |
| **Hook** | `useXmlToJson` |
| **Lib** | `xmlToJson.ts` |

## Description
Convert XML documents into structured JSON with optional attribute preservation and JSON syntax highlighting via `highlight.js`.

## Files
- `src/components/tools/XMLToJson.tsx`
- `src/hooks/useXmlToJson.ts`
- `src/lib/xmlToJson.ts`

## Usage Pattern
- Input: Paste XML text
- Output: JSON preview (syntax highlighted by `highlight.js`)
- Actions: Convert, Copy, Clear, Include/Exclude attributes
- Share: URL sync via query keys `input` and `attrs`

## UI
- Uses `ToolLayout`, `Textarea`, `Switch`, `CopyButton`, `CodeHighlight`, `Button`
- `CodeHighlight` renders JSON output using `highlight.js`

## Related

- [Shareable URL State Features](../features/shareable-url-state-features.md) — Query key coverage and URL sync behavior
- [UI Building Blocks](../09-ui-building-blocks.md) — Component API and layout patterns
- [Tool Registry](../04-tool-registry.md) — Tool metadata & routing
- [Directory Map](../03-directory-map.md) — File locations
- [Types & Interfaces](../06-types-and-interfaces.md) — ToolID & types
- [Build, Env & Conventions](../08-build-env-conventions.md) — Naming & env vars
