# AI Agent Bridge

| Field | Value |
|---|---|
| **ToolID** | `ai-bridge` |
| **Route** | `/ai-bridge` |
| **Component** | `AIAgentBridge.tsx` |
| **Runner** | `src/lib/aiToolBridge.ts` |

## Overview

Machine-readable bridge that allows AI/browser agents to execute selected DevPulse tools without manual UI interaction.

## Endpoints

| Endpoint | Purpose |
|---|---|
| `/ai-bridge` | Execute tool requests and return result/error payload |
| `/ai-bridge/catalog` | Discovery endpoint: tools + operations + description + usage tips + examples |
| `/ai-bridge/spec` | JSON schema endpoint for request/response validation |
| `/ai-bridge/catalog.json` | Static discovery JSON (curl-friendly) |
| `/ai-bridge/spec.json` | Static schema JSON (curl-friendly) |

## Hosting Notes

- On static hosting (for example GitHub Pages), `curl` to SPA routes like `/ai-bridge` returns HTML.
- For machine fetch on static hosting, use:
  - `/ai-bridge/catalog.json`
  - `/ai-bridge/spec.json`
- Pure HTTP dynamic execution requires an optional backend/serverless runtime.

## Main Files

- `src/components/AIAgentBridge.tsx`
- `src/components/ai-bridge/BridgeHeroCard.tsx`
- `src/components/ai-bridge/EndpointNavigatorCard.tsx`
- `src/components/ai-bridge/ExecutionModesCard.tsx`
- `src/components/ai-bridge/QuickstartCard.tsx`
- `src/components/ai-bridge/RunQueryCard.tsx`
- `src/components/ai-bridge/LiveResponseCard.tsx`
- `src/data/aiBridge.ts`
- `src/lib/aiBridgeQuery.ts`
- `src/lib/aiToolBridge.ts` (public facade export)
- `src/lib/ai-tool-bridge/*` (internal modules)
- `vite.config.ts` (emits static `catalog.json` / `spec.json`)

## Quick Usage

1. Open `/ai-bridge` once to initialize `window.DevPulseAI`.
2. Discover capabilities with `window.DevPulseAI.catalog()`.
3. Execute with `window.DevPulseAI.run(request)`.
4. For one-shot execution, pass query params to `/ai-bridge` and read response JSON.
5. For discovery/schema only, use `/ai-bridge/catalog` and `/ai-bridge/spec`.

## Browser API

`window.DevPulseAI` is available only when `/ai-bridge` is loaded.

- `window.DevPulseAI.catalog()`
  - Returns tools, operations, examples, and usage tips.
- `window.DevPulseAI.run(request)`
  - Executes one request.
  - Success: `{ ok: true, result }`
  - Failure: `{ ok: false, error, errorDetails, problem }`
- `window.DevPulseAI.runBatch(requests[])`
  - Executes requests sequentially and returns a response array.
- `window.DevPulseAI.getSnapshot()`
  - Returns persisted `devpulse:*` tool input snapshot for resume/handoff flows.

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
/ai-bridge/catalog
/ai-bridge/spec
/ai-bridge/catalog.json
/ai-bridge/spec.json
```

## Response Notes

- Responses are deterministic JSON with `{ ok, tool, operation, result?, error? }`.
- Failures include RFC7807-style `problem` and `errorDetails.hints[]`.
- `mode=result-only` renders output at `<pre id="ai-bridge-output">...</pre>`.
- `Run Query` UI includes stable semantic attributes (`data-action`, `data-testid`) for browser agents.

## Internal Execution Flow

1. Normalize request (`normalizeToolRequest`)
2. Validate shape (`assertToolRequestShape`)
3. Parse query payload (`parsePayloadParam` / `parseQueryRequest`) with zod guards when request comes from URL
4. Resolve runner (`resolveToolRunner`) and build execution context (`buildToolExecutionContext`)
5. Execute handler
6. Convert errors to API envelope (`toValidationErrorResponse` / `toExecutionErrorResponse`)

## Internal Module Responsibilities

| File/Module | Responsibility |
|---|---|
| `src/lib/ai-tool-bridge/contracts.ts` | Shared runtime/schema constants (required fields, defaults, storage namespace) |
| `src/lib/ai-tool-bridge/schema.ts` | JSON schema generated from shared contracts + catalog enum |
| `src/lib/ai-tool-bridge/validators.ts` | Request/option/input validation + request normalization (zod-backed) |
| `src/lib/aiBridgeQuery.ts` | Query-string to request parser + URL query normalization (zod-guarded parsing) |
| `src/lib/ai-tool-bridge/registry.ts` | Tool runner registry, execution context builder, registry diagnostics |
| `src/lib/ai-tool-bridge/handlers/*` | Tool-specific execution logic |
| `src/lib/ai-tool-bridge/errorTaxonomy.ts` | Stable error code -> problem metadata mapping |
| `src/lib/ai-tool-bridge/errorResponse.ts` | Convert thrown errors to API response envelope |
| `src/lib/ai-tool-bridge/snapshotPolicy.ts` | Snapshot key/filter/parse policy |
| `src/lib/ai-tool-bridge/snapshot.ts` | Collect persisted tool snapshot using snapshot policy |
| `src/lib/ai-tool-bridge/index.ts` | Public exports + sub-level barrels (`BridgeCore`, `BridgePolicy`) |

## Change-Safe Checklist

Use this checklist before/after changes under `src/lib/ai-tool-bridge/*`:

1. If adding/removing a tool, update `catalog.ts` and `registry.ts` in the same commit.
2. Run registry diagnostics to keep catalog and runners aligned:
   - `getToolRegistryDiagnostics()`
   - `assertToolRegistryConsistency()`
3. Keep validators and handlers in sync:
   - New operation -> update allowed values in `validators.ts` and matching handler logic.
4. Keep error contract stable:
   - Use `errorTaxonomy.ts` and `errorResponse.ts` for new error codes/classes.
5. If request/response shape changes, update `contracts.ts` and `schema.ts` together.
6. If persistence/snapshot behavior changes, update both `snapshotPolicy.ts` and `snapshot.ts`.
7. Add/update table-driven tests in `runners.test.ts` for success and invalid paths.
8. Run validation:
   - `npm run typecheck`
   - `npm run lint`
