# Web Features

Last updated: 2026-02-20

DevPulse feature documentation is split into focused files for easier maintenance and faster lookup.

## Scope Snapshot

- Product type: Single-page developer utility suite
- Tool count: 18 tools
- AI capability: Gemini assistant + machine-readable AI Bridge
- Runtime model: Client-side app (optional external API for Gemini)

## Highlight UX Features

- Command Palette: instant tool search and navigation via `Cmd+K` / `Ctrl+K`.
- Keyboard-First: arrow keys, `Enter`, and `Escape` are first-class navigation actions.
- Dark Mode: theme toggle with persisted preference across sessions.

## Feature Docs Map

| File | Focus |
|---|---|
| `tool-features.md` | Tool-by-tool capabilities, routes, and usage scope |
| `platform-ux-features.md` | Navigation, search, personalization, accessibility, resilience |
| `ai-automation-features.md` | AI Smart Assistant and AI Bridge endpoints/capabilities |
| `delivery-ops-features.md` | Build, performance, deployment, environment, and quality workflow |

## Category Summary

- Formatters: 2
- Converters: 7
- Generators: 2
- Viewers & Utilities: 6
- AI: 1

## Source of Truth

- Tool metadata: `src/data/tools.tsx`
- Tool IDs: `src/types.ts`
- Route wiring: `src/App.tsx`
- Tool map docs: `.ai/docs/04-tool-registry.md`

## Related

- [Tool Features](./tool-features.md)
- [Platform UX Features](./platform-ux-features.md)
- [AI & Automation Features](./ai-automation-features.md)
- [Delivery & Ops Features](./delivery-ops-features.md)
- [Tool Registry](../04-tool-registry.md)
