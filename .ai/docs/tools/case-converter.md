# Case Converter

| Field | Value |
|---|---|
| **ToolID** | `case-converter` |
| **Route** | `/case-converter` |
| **Component** | `CaseConverter.tsx` |
| **Hook** | `useCaseConverter` |
| **Lib** | `caseUtils.ts` |

## Description
Switch between camelCase, PascalCase, snake_case, kebab-case, and more. Supports batch conversion and copy.

## Files
- `src/components/tools/CaseConverter.tsx`
- `src/hooks/useCaseConverter.ts`
- `src/lib/caseUtils.ts`

## Usage Pattern
- Input: Textarea for source text
- Output: Multiple case formats (auto-generated)
- Actions: Copy each result, Clear
- Share: URL sync via query key `input`

## UI
- Uses `ToolLayout`, `Textarea`, `CopyButton`, `Button`

## Related

- [Shareable URL State Features](../features/shareable-url-state-features.md) — Query key coverage and URL sync behavior
- [UI Building Blocks](../09-ui-building-blocks.md) — Component API and layout patterns
- [Tool Registry](../04-tool-registry.md) — Tool metadata & routing
- [Directory Map](../03-directory-map.md) — File locations
- [Types & Interfaces](../06-types-and-interfaces.md) — ToolID & types
- [Build, Env & Conventions](../08-build-env-conventions.md) — Naming & env vars
