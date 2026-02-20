# JSON Formatter

| Field | Value |
|---|---|
| **ToolID** | `json-formatter` |
| **Route** | `/json-formatter` |
| **Component** | `JSONFormatter.tsx` |
| **Hook** | `useJsonFormatter` |
| **Lib** | — |

## Description
Prettify, minify, and validate JSON data. Supports error highlighting and copy-to-clipboard.

## Files
- `src/components/tools/JSONFormatter.tsx`
- `src/hooks/useJsonFormatter.ts`

## Usage Pattern
- Input: Paste or type JSON in a textarea
- Output: Formatted JSON with syntax highlighting
- Actions: Format, Minify, Copy, Clear, indent selection (`2/4/8`)
- Shareability: Input text and indent sync with URL query (`?input=...&indent=...`) for link sharing

## UI
- Uses `ToolLayout`, `Textarea`, `CopyButton`, `CodeHighlight`

## Related

- [Shareable URL State Features](../features/shareable-url-state-features.md) — Query key coverage and share behavior
- [UI Building Blocks](../09-ui-building-blocks.md) — Component API and layout patterns
- [Tool Registry](../04-tool-registry.md) — Tool metadata & routing
- [Directory Map](../03-directory-map.md) — File locations
- [Types & Interfaces](../06-types-and-interfaces.md) — ToolID & types
- [Build, Env & Conventions](../08-build-env-conventions.md) — Naming & env vars
