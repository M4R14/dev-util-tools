# Password Generator

| Field | Value |
|---|---|
| **ToolID** | `password-gen` |
| **Route** | `/password-gen` |
| **Component** | `PasswordGenerator.tsx` |
| **Hook** | `usePasswordGenerator` |
| **Lib** | `passwordStrength.ts` |

## Description
Create secure, random passwords with customizable options and strength meter.

## Files
- `src/components/tools/PasswordGenerator.tsx`
- `src/hooks/usePasswordGenerator.ts`
- `src/lib/passwordStrength.ts`

## Usage Pattern
- Options: Length, uppercase, lowercase, numbers, symbols
- Output: Generated password and strength indicator (label, color, percent, message)
- Actions: Generate, Copy

## UI
- Uses `ToolLayout`, `Card`, `Button`, `CopyButton`
- Inputs are rendered as custom controls (`input[type=range]` + clickable option cards)

## Related

- [UI Building Blocks](../09-ui-building-blocks.md) — Component API and layout patterns
- [Tool Registry](../04-tool-registry.md) — Tool metadata & routing
- [Directory Map](../03-directory-map.md) — File locations
- [Types & Interfaces](../06-types-and-interfaces.md) — ToolID & types
- [Build, Env & Conventions](../08-build-env-conventions.md) — Naming & env vars
