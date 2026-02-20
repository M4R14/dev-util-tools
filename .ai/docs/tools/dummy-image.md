# Dummy Image

| Field | Value |
|---|---|
| **ToolID** | `dummy-image` |
| **Route** | `/dummy-image` |
| **Component** | `DummyImageTool.tsx` |
| **Hook** | _(none)_ |
| **Lib** | _(none)_ |

## Description
External helper page for quick access to [dummyimage.com](https://www.dummyimage.com/) with copy-ready placeholder URL templates and common size presets.

## Files
- `src/components/tools/DummyImageTool.tsx`

## Usage Pattern
- Input: Open external generator + optional size/URL template copy
- Output: Placeholder image URL patterns (rendered by external service)
- Actions: Open external tool, Copy size presets, Copy URL templates

## UI
- Uses `ToolLayout`, `Card`, `Button`, `CopyButton`

## Related

- [UI Building Blocks](../09-ui-building-blocks.md) — Component API and layout patterns
- [Tool Registry](../04-tool-registry.md) — Tool metadata & routing
- [Directory Map](../03-directory-map.md) — File locations
- [Types & Interfaces](../06-types-and-interfaces.md) — ToolID & types
- [Build, Env & Conventions](../08-build-env-conventions.md) — Naming & env vars
