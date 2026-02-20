# Password Generator

| Field | Value |
|---|---|
| **ToolID** | `password-gen` |
| **Route** | `/password-gen` |
| **Component** | `PasswordGenerator.tsx` |
| **Hook** | `usePasswordGenerator` |
| **Lib** | `passwordStrength.ts` |

## Description
Create secure, random passwords with customizable options, visibility controls, and a strength/entropy summary.

## Files
- `src/components/tools/PasswordGenerator.tsx`
- `src/hooks/usePasswordGenerator.ts`
- `src/lib/passwordStrength.ts`

## Usage Pattern
- Options: Length slider (+ presets), uppercase, lowercase, numbers, symbols
- Output: Generated password with show/hide toggle and security summary (strength, pool size, entropy)
- Actions: Generate/Regenerate, Copy, toggle character sets

## UI
- Uses `ToolLayout`, `Button`, `CopyButton`, `Slider`, `Switch`
- Settings are keyboard-accessible (`Switch`) and prevent disabling all character sets
- Includes quick guidance panel for security best practices

## Related

- [UI Building Blocks](../09-ui-building-blocks.md) — Component API and layout patterns
- [Tool Registry](../04-tool-registry.md) — Tool metadata & routing
- [Directory Map](../03-directory-map.md) — File locations
- [Types & Interfaces](../06-types-and-interfaces.md) — ToolID & types
- [Build, Env & Conventions](../08-build-env-conventions.md) — Naming & env vars
