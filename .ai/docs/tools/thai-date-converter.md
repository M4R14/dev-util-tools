# Thai Date Converter

| Field | Value |
|---|---|
| **ToolID** | `thai-date-converter` |
| **Route** | `/thai-date-converter` |
| **Component** | `thai-date/index.tsx` (with sub-components) |
| **Hook** | `useThaiDateConverter` |
| **Lib** | `thaiDate.ts` (dayjs) |

## Description
Convert Gregorian dates to Thai Buddhist Era (BE) formats. Supports text parsing, picker, and multiple output formats.

## Files
- `src/components/tools/thai-date/index.tsx`
- `src/components/tools/thai-date/CurrentTimeSection.tsx`
- `src/components/tools/thai-date/DateConverterSection.tsx`
- `src/components/tools/thai-date/DatePickerInput.tsx`
- `src/components/tools/thai-date/TextParserInput.tsx`
- `src/components/tools/thai-date/ParserResultSection.tsx`
- `src/hooks/useThaiDateConverter.ts`
- `src/lib/thaiDate.ts`

## Usage Pattern
- Input: Text or picker (day/month/year)
- Output: All Thai date formats, ISO, and parsed details
- Actions: Switch input mode, Copy, Reset

## UI
- Uses `ToolLayout`, `Input`, `Button`, `CopyButton`, `Switch`, `Card`

## Related

- [UI Building Blocks](../09-ui-building-blocks.md) — Component API and layout patterns
- [Tool Registry](../04-tool-registry.md) — Tool metadata & routing
- [Directory Map](../03-directory-map.md) — File locations
- [Types & Interfaces](../06-types-and-interfaces.md) — ToolID & types
- [Build, Env & Conventions](../08-build-env-conventions.md) — Naming & env vars
