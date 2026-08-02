# VIN Generator & Decoder

| Field | Value |
|---|---|
| **ToolID** | `vin-tool` |
| **Route** | `/vin-tool` |
| **Component** | `VinTool.tsx` |
| **Hook** | _(none)_ |
| **Lib** | _(none)_ |

## Description
External helper page for [tetono.com/tools/vin](https://tetono.com/tools/vin/) — generates random 17-character VINs that follow ISO 3779 with a valid check digit (using WMI codes of vehicles assembled in Thailand, including EV brands), and decodes/validates any VIN pasted into the external tool.

## Files
- `src/components/tools/VinTool.tsx`

## Usage Pattern
- Input: Open external VIN generator/decoder
- Output: ISO 3779 structure reference (WMI / VDS / check digit / model year / plant / serial)
- Actions: Open external tool

## UI
- Uses `ToolLayout`, `Card`, `Button`
- Two-column layout: external tool card + capability list on the left, VIN position breakdown on the right

## Related

- [UI Building Blocks](../09-ui-building-blocks.md) — Component API and layout patterns
- [Tool Registry](../04-tool-registry.md) — Tool metadata & routing
- [Directory Map](../03-directory-map.md) — File locations
- [Types & Interfaces](../06-types-and-interfaces.md) — ToolID & types
- [Build, Env & Conventions](../08-build-env-conventions.md) — Naming & env vars
