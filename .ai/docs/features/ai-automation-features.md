# AI & Automation Features

Last updated: 2026-02-20

This file describes AI-facing capabilities: user assistant and machine automation bridge.

## AI Smart Assistant

Route: `/ai-assistant`

### Core Capabilities

- Conversational coding help with Gemini.
- Supports developer workflows: explanation, debugging hints, and code suggestions.
- Works with optional user-provided API key.

### Configuration & Runtime

- API layer: `src/services/gemini.ts`.
- UI composition: `src/components/tools/AIAssistant.tsx` + `src/components/tools/ai/*`.
- Environment key: `GEMINI_API_KEY` (optional) or in-app key storage flow.

## AI Bridge (Machine-Readable Automation)

Routes:

- `/ai-bridge`
- `/ai-bridge/catalog`
- `/ai-bridge/spec`

Static endpoints:

- `/ai-bridge/catalog.json`
- `/ai-bridge/spec.json`

### Bridge Purpose

- Deterministic, machine-readable tool execution for browser-controlled agents.
- Discovery-first pattern through catalog and schema endpoints.
- Catalog payload includes per-tool `examples` and `usage_tips` to reduce trial-and-error planning for agents.

### Browser API Surface

- `window.DevPulseAI.catalog()`
- `window.DevPulseAI.run(request)`

### Semantic UI Targeting

- AI Bridge query runner and response panels include stable `data-action` / `data-testid` attributes.
- High-traffic local tool inputs/actions include semantic data attributes so browser agents can target controls without relying on volatile Tailwind class names.

### Supported Tool Operations (Current)

- `json-formatter`: `format`, `minify`, `validate`
- `xml-formatter`: `format`, `minify`, `validate`
- `base64-tool`: `encode`, `decode`
- `case-converter`: `convert` (`snake|kebab|camel|pascal`)
- `url-parser`: `parse`
- `diff-viewer`: `compare`
- `thai-date-converter`: `format`, `parse`

## Static Hosting Note

On static hosting, direct curl to SPA routes returns HTML shell. Use `.json` endpoints for direct machine fetches.

## Related

- [Web Features](./web-features.md)
- [Tool Features](./tool-features.md)
- [AI Bridge Tool Doc](../tools/ai-bridge.md)
- [DevPulse AI Entry](../../README.ai.md)
