# AI & Automation Features

Last updated: 2026-08-02

This file describes AI-facing capabilities: user assistant and machine automation bridge.

> **Execution needs a browser.** DevPulse is hosted on GitHub Pages, so discovery
> (`catalog.json` / `spec.json`) is fetchable over plain HTTP but tool execution is not — the
> result is produced by JavaScript in the page. Agents that only speak HTTP can read the catalog
> and nothing more. See [AI Bridge → Hosting Limits](../tools/ai-bridge.md) for the full table and
> for why there is no MCP server.

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
- Catalog payload includes per-tool `description`, `reliability`, `usageTips`, and `examples` to reduce trial-and-error planning for agents.
- `reliability: 'exact'` marks the tools an agent should not attempt in its head (checksums, unicode base64, diffing, base64url).

### Browser API Surface

- `window.DevPulseAI.version` — currently `2`
- `window.DevPulseAI.catalog()`
- `window.DevPulseAI.describe(toolId)`
- `window.DevPulseAI.run(request)`
- `window.DevPulseAI.runBatch(requests[], { stopOnError? })`

All methods are async (the runner is lazy-loaded). The object is installed app-wide, so it is
available on every route, and `devpulse-ai-ready` is dispatched on `window` once it exists.
`index.html` advertises the bridge via `<meta name="devpulse-ai-bridge">` so an agent can discover
it without prior knowledge. `getSnapshot()` was removed in version 2 — it always returned `{}`.

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
