# Web Features

Last updated: 2026-02-20

DevPulse feature documentation is split into focused files for easier maintenance and faster lookup.

## Scope Snapshot

- Product type: Single-page developer utility suite
- Tool count: 18 tools
- AI capability: Gemini assistant + machine-readable AI Bridge
- Runtime model: Client-side app (optional external API for Gemini)

## Highlight UX Features

- Command Palette: instant tool search + quick actions via `Cmd+K` / `Ctrl+K` (`Open settings`, `Check updates`, `Clear offline cache`).
- Keyboard-First: arrow keys, `Enter`, and `Escape` are first-class navigation actions.
- Dark Mode: theme toggle with persisted preference across sessions.
- PWA Offline Mode: local tools remain usable after assets are cached on first online load.
- Background Update UX: when a new service-worker version is ready, the app shows `New version available` with a `Refresh` action.
- App Settings Page: `/settings` centralizes `Online/Offline`, install prompt, cache size, last update, `Check for updates`, and `Clear offline cache`.
- Mini Release Notes (Auto): blog includes an auto-generated release note sourced from recent commits/PR references.

## Shareable URL State

Coverage and query-key details are documented in [Shareable URL State Features](./shareable-url-state-features.md).

## Feature Docs Map

| File | Focus |
|---|---|
| `tool-features.md` | Tool-by-tool capabilities, routes, and usage scope |
| `command-palette-features.md` | Command palette triggers, keyboard flow, and action/tool execution behavior |
| `shareable-url-state-features.md` | Query-state sharing coverage and URL key contracts |
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
- [Command Palette Features](./command-palette-features.md)
- [Shareable URL State Features](./shareable-url-state-features.md)
- [Platform UX Features](./platform-ux-features.md)
- [AI & Automation Features](./ai-automation-features.md)
- [Delivery & Ops Features](./delivery-ops-features.md)
- [Tool Registry](../04-tool-registry.md)
