# XML Formatter

| Field | Value |
|---|---|
| **ToolID** | `xml-formatter` |
| **Route** | `/xml-formatter` |
| **Component** | `XMLFormatter.tsx` |
| **Hook** | `useXmlFormatter` |
| **Lib** | xml-formatter lib |

## Description
Prettify, minify, and validate XML data. Supports syntax highlighting and copy.

## Files
- `src/components/tools/XMLFormatter.tsx`
- `src/hooks/useXmlFormatter.ts`

## Usage Pattern
- Input: Paste or type XML in a textarea
- Output: Formatted XML with syntax highlighting
- Actions: Format, Minify, Copy, Clear
- Share: URL sync via query key `input`

## UI
- Uses `ToolLayout`, `Textarea`, `CopyButton`, `CodeHighlight`, `Button`

## Related

- [Shareable URL State Features](../features/shareable-url-state-features.md) — Query key coverage and URL sync behavior
- [UI Building Blocks](../09-ui-building-blocks.md) — Component API and layout patterns
- [Tool Registry](../04-tool-registry.md) — Tool metadata & routing
- [Directory Map](../03-directory-map.md) — File locations
- [Types & Interfaces](../06-types-and-interfaces.md) — ToolID & types
- [Build, Env & Conventions](../08-build-env-conventions.md) — Naming & env vars
