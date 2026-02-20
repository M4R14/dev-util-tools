# Regex Tester

| Field | Value |
|---|---|
| **ToolID** | `regex-tester` |
| **Route** | `/regex-tester` |
| **Component** | `RegexTester.tsx` |
| **Hook** | — |
| **Lib** | — |

## Description
Test and debug regular expressions with live matching. Supports pattern, flags, and test string input.

## Files
- `src/components/tools/RegexTester.tsx`

## Usage Pattern
- Input: Regex pattern, flags, test string
- Output: Match results, highlighted matches
- Actions: Copy, Clear

## UI
- Uses `ToolLayout`, `Input`, `Button`, `CopyButton`, `Card`

## Related

- [UI Building Blocks](../09-ui-building-blocks.md) — Component API and layout patterns
- [Tool Registry](../04-tool-registry.md) — Tool metadata & routing
- [Directory Map](../03-directory-map.md) — File locations
- [Types & Interfaces](../06-types-and-interfaces.md) — ToolID & types
- [Build, Env & Conventions](../08-build-env-conventions.md) — Naming & env vars
