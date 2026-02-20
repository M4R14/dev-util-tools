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
- `src/components/tools/thai-date/DateFormatCard.tsx`
- `src/components/tools/thai-date/DatePickerInput.tsx`
- `src/components/tools/thai-date/TextParserInput.tsx`
- `src/components/tools/thai-date/ParserResultSection.tsx`
- `src/hooks/useThaiDateConverter.ts`
- `src/lib/thaiDate.ts`

## Usage Pattern
- Input: Text or picker (day/month/year)
- Output: All Thai date formats, ISO, and parsed details
- Actions: Switch input mode, quick date presets (yesterday/today/tomorrow), Copy, Copy all formats, Reset
- Share: URL sync via query keys `date`, `parse`, `pd`, `pm`, `py`, `pmf`

## UI
- Uses `ToolLayout`, `Input`, `Button`, `CopyButton`, `Switch`, `Card`
- Current Time panel highlights:
  - Live badge and auto-refresh Thai date-time display (updates every second)
  - ISO block with timezone badge and one-click copy
  - Extra quick-copy timestamps: Unix seconds and Unix milliseconds
- Date Converter panel highlights:
  - Two-column layout on desktop (`lg+`): controls/summary on the left, format outputs on the right
  - Inline A.D./B.E. year summary cards
  - Quick preset buttons for fast date shifting
  - Header actions for `Today` reset and `Copy all` formatted outputs
  - Shared reusable `DateFormatCard` for format rows/cards to keep styles and copy UX consistent
- Parser Result highlights:
  - Parser workspace uses two columns on desktop (`xl+`): input controls on the left and output panel on the right
  - Input Mode uses segmented action buttons for faster mode switching on mobile/desktop
  - Output panel has dedicated header/status and sticky behavior on desktop for easier result scanning
  - Three-column layout on desktop (`lg+`): parsed input preview, directional arrow, and result panel
  - Compact parsed format cards with index badges and per-row copy action (via shared card component)

## Related

- [Shareable URL State Features](../features/shareable-url-state-features.md) — Query key coverage and URL sync behavior
- [UI Building Blocks](../09-ui-building-blocks.md) — Component API and layout patterns
- [Tool Registry](../04-tool-registry.md) — Tool metadata & routing
- [Directory Map](../03-directory-map.md) — File locations
- [Types & Interfaces](../06-types-and-interfaces.md) — ToolID & types
- [Build, Env & Conventions](../08-build-env-conventions.md) — Naming & env vars
