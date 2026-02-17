# Timezone Converter

| Field | Value |
|---|---|
| **ToolID** | `timezone-converter` |
| **Route** | `/timezone-converter` |
| **Component** | `TimezoneConverter.tsx` |
| **Hook** | `useTimezoneConverter` |
| **Lib** | dayjs + timezone plugin |

## Description
Convert dates and times across different global timezones. Supports instant conversion and copy.

## Files
- `src/components/tools/TimezoneConverter.tsx`
- `src/hooks/useTimezoneConverter.ts`

## Usage Pattern
- Input: Date/time picker, source timezone
- Output: Converted time in target timezone(s)
- Actions: Copy, Clear

## UI
- Uses `ToolLayout`, `Input`, `Button`, `CopyButton`

## Related

- [UI Building Blocks](../09-ui-building-blocks.md) — Component API and layout patterns
- [Tool Registry](../04-tool-registry.md) — Tool metadata & routing
- [Directory Map](../03-directory-map.md) — File locations
- [Types & Interfaces](../06-types-and-interfaces.md) — ToolID & types
- [Build, Env & Conventions](../08-build-env-conventions.md) — Naming & env vars
