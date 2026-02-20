# Timezone Converter

| Field | Value |
|---|---|
| **ToolID** | `timezone-converter` |
| **Route** | `/timezone-converter` |
| **Component** | `TimezoneConverter.tsx` |
| **Hook** | `useTimezoneConverter` |
| **Lib** | dayjs + timezone plugin |

## Description
Convert dates and times across different global timezones with instant result updates, quick-target shortcuts, and copy support.

## Files
- `src/components/tools/TimezoneConverter.tsx`
- `src/hooks/useTimezoneConverter.ts`

## Usage Pattern
- Input: Date/time picker, source timezone, target timezone
- Output: Converted timestamp card with timezone abbreviation and preview
- Actions: Set now, Swap, Copy converted result, Quick target zone buttons

## UI
- Uses `ToolLayout`, `Input`, `Button`, `CopyButton`
- Includes source/target summary cards and compact action toolbar
- Provides quick target timezone chips (UTC/ET/London/Tokyo/Bangkok/Sydney)

## Related

- [UI Building Blocks](../09-ui-building-blocks.md) — Component API and layout patterns
- [Tool Registry](../04-tool-registry.md) — Tool metadata & routing
- [Directory Map](../03-directory-map.md) — File locations
- [Types & Interfaces](../06-types-and-interfaces.md) — ToolID & types
- [Build, Env & Conventions](../08-build-env-conventions.md) — Naming & env vars
