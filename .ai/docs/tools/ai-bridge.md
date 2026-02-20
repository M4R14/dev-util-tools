# AI Agent Bridge

| Field | Value |
|---|---|
| **ToolID** | `ai-bridge` |
| **Route** | `/ai-bridge` |
| **Component** | `AIAgentBridge.tsx` |
| **Runner** | `src/lib/aiToolBridge.ts` |

## Description
Machine-readable bridge that lets AI/browser agents run selected DevPulse tools without manual UI interaction.

Additional machine endpoints:
- `/ai-bridge` executes tool requests and returns result/error payload
- `/ai-bridge/catalog` returns available tools + operations (discovery only)
- `/ai-bridge/spec` returns JSON schema for request/response (contract validation)
- `/ai-bridge/catalog.json` returns static discovery JSON (curl-friendly)
- `/ai-bridge/spec.json` returns static schema JSON (curl-friendly)

## Files

- `src/components/AIAgentBridge.tsx`
- `src/components/ai-bridge/BridgeHeroCard.tsx`
- `src/components/ai-bridge/EndpointNavigatorCard.tsx`
- `src/components/ai-bridge/ExecutionModesCard.tsx`
- `src/components/ai-bridge/QuickstartCard.tsx`
- `src/components/ai-bridge/RunQueryCard.tsx`
- `src/components/ai-bridge/LiveResponseCard.tsx`
- `src/data/aiBridge.ts`
- `src/lib/aiBridgeQuery.ts`
- `src/lib/aiToolBridge.ts`
- `vite.config.ts` (build plugin emits static `catalog.json` / `spec.json`)

## How to Use

1. Open `/ai-bridge` once to initialize browser API `window.DevPulseAI`.
2. Discover capabilities with `window.DevPulseAI.catalog()`.
3. Execute tool operations with `window.DevPulseAI.run(request)`.
4. Or pass query parameters to `/ai-bridge` for one-shot execution and read JSON from the response panel (or `#ai-bridge-output` in `mode=result-only`).
5. Use `/ai-bridge/catalog` and `/ai-bridge/spec` when you need discovery/schema only.
6. Use `/ai-bridge/catalog.json` and `/ai-bridge/spec.json` for static-hosting machine fetch (e.g. `curl`).

## Hosting Notes

- On static hosting (e.g. GitHub Pages), `curl` to SPA routes like `/ai-bridge` returns HTML.
- Use static JSON endpoints for machine-fetch:
  - `/ai-bridge/catalog.json`
  - `/ai-bridge/spec.json`
- Dynamic tool execution over pure HTTP requires optional backend/serverless runtime.

## `window.DevPulseAI` API

`window.DevPulseAI` is available only when `/ai-bridge` page is loaded.

- `window.DevPulseAI.catalog()`
  - Returns list of tools and supported operations.
- `window.DevPulseAI.run(request)`
  - Executes one request and returns deterministic response:
  - `{ ok: true, result }` style success data in `result`
  - `{ ok: false, error, errorDetails }` on failure

Example:

```js
const catalog = window.DevPulseAI.catalog();

const response = window.DevPulseAI.run({
  tool: 'json-formatter',
  operation: 'format',
  input: '{"name":"devpulse","ok":true}',
  options: { indent: 2 }
});

if (response.ok) {
  console.log(response.result);
} else {
  console.error(response.error, response.errorDetails);
}
```

## Request Shape

```ts
{
  tool: 'json-formatter' | 'xml-formatter' | 'base64-tool' | 'case-converter' | 'url-parser' | 'diff-viewer' | 'thai-date-converter',
  operation: string,
  input?: unknown,
  options?: Record<string, unknown>
}
```

## Examples

```js
window.DevPulseAI.run({
  tool: 'json-formatter',
  operation: 'format',
  input: '{"a":1,"b":2}',
  options: { indent: 2 }
});
```

```js
window.DevPulseAI.run({
  tool: 'case-converter',
  operation: 'convert',
  input: 'Hello World',
  options: { target: 'snake' }
});
```

```text
/ai-bridge?tool=base64-tool&op=encode&input=hello
/ai-bridge?tool=case-converter&op=convert&input=hello%20world&options={"target":"camel"}
/ai-bridge?payload={"tool":"diff-viewer","operation":"compare","input":{"original":"a","modified":"b"}}
/ai-bridge?tool=json-formatter&op=format&input={"a":1}&includeCatalog=false
/ai-bridge?tool=url-parser&op=parse&input=example.com&mode=result-only
/ai-bridge/catalog.json
/ai-bridge/spec.json
/ai-bridge/catalog
/ai-bridge/spec
```

## Notes

- Encode JSON query values (`input`, `options`, `payload`) when building URLs programmatically.
- Responses are deterministic JSON with `{ ok, tool, operation, result?, error? }`.
- For `mode=result-only`, rendered output is exposed at `<pre id="ai-bridge-output">...</pre>`.
- This bridge is client-side and intended for browser-controlled agents.
- Error responses include `errorDetails` with `code`, plus supported values/suggestions when possible.
