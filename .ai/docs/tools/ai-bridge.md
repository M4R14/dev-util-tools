# AI Agent Bridge

| Field         | Value                     |
| ------------- | ------------------------- |
| **ToolID**    | `ai-bridge`               |
| **Route**     | `/ai-bridge`              |
| **Component** | `AIAgentBridge.tsx`       |
| **Runner**    | `src/lib/aiToolBridge.ts` |

## Overview

Machine-readable bridge that allows AI/browser agents to execute selected DevPulse tools without manual UI interaction.

## Endpoints

| Endpoint                  | Purpose                                                                      |
| ------------------------- | ---------------------------------------------------------------------------- |
| `/ai-bridge`              | Execute tool requests and return result/error payload                        |
| `/ai-bridge/catalog`      | Discovery endpoint: tools + operations + description + usage tips + examples |
| `/ai-bridge/spec`         | JSON schema endpoint for request/response validation                         |
| `/ai-bridge/catalog.json` | Static discovery JSON (curl-friendly)                                        |
| `/ai-bridge/spec.json`    | Static schema JSON (curl-friendly)                                           |

## Hosting Limits — read this before planning an integration

DevPulse deploys to **GitHub Pages** (`.github/workflows/deploy.yml` → `upload-pages-artifact`).
That is static file hosting: there is no server process, so **the bridge cannot execute anything
over plain HTTP**. This is a property of the deployment, not a gap in the code.

| Capability                              | HTTP-only agent (curl/fetch) | Browser-driving agent |
| --------------------------------------- | ---------------------------- | --------------------- |
| Discovery — `catalog.json`, `spec.json` | ✅ works                     | ✅ works              |
| Execution — `run`, `runBatch`           | ❌ **impossible**            | ✅ works              |

`curl /ai-bridge?tool=...` returns the SPA's HTML shell, never a result: the response is produced
by JavaScript after the page boots. Verified against a production build, not assumed.

**Execution therefore requires an agent that can run JavaScript** — Playwright, Claude in Chrome,
Puppeteer, or anything else that drives a real browser. Two ways in, in order of preference:

1. Navigate to `/ai-bridge?...&mode=result-only` and read the page text. No JS evaluation needed;
   `JSON.parse(document.body.innerText)` returns the response.
2. `await window.DevPulseAI.run(...)` if the agent can evaluate JavaScript.

### Why there is no MCP server

An MCP server would open this up to agents without a browser, but it does not fit the current
deployment:

- **Remote MCP (HTTP/SSE)** needs a long-running server. GitHub Pages cannot host one.
- **stdio MCP** needs no hosting — it is an npm package the user runs locally — but that is a
  separate distribution channel (publish, version, install docs) rather than a change to this app.

If anyone picks this up later, the groundwork is already done: the runner core is framework-free,
and **11 of the 12 tools execute unmodified in plain Node**. Only `xml-to-json` fails, because
`convertXmlToJson` validates with `DOMParser`; it would need `@xmldom/xmldom` or an injected
parser. Everything else — including `crypto.getRandomValues`, `btoa`/`atob`, `jose` and
`jwt-decode` — already works outside a browser.

Adding a serverless endpoint (Cloudflare Workers, Vercel) wrapping `runAITool` is the other route
to HTTP execution, at the cost of leaving static hosting behind.

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

1. `window.DevPulseAI` is already there — on every route, from app start. No need to visit
   `/ai-bridge` first. `index.html` also advertises it via `<meta name="devpulse-ai-bridge">`.
2. Discover capabilities with `await window.DevPulseAI.catalog()`, or one tool with
   `await window.DevPulseAI.describe(toolId)`.
3. Execute with `await window.DevPulseAI.run(request)`.
4. For one-shot execution without evaluating JS, pass query params to `/ai-bridge` with
   `mode=result-only` and read the page text.
5. For discovery/schema only, use `/ai-bridge/catalog.json` and `/ai-bridge/spec.json`.

## Browser API

Installed app-wide in `App.tsx`, so it survives navigation. All methods are **async**: the runner
is lazy-imported on first call to keep it out of the eager bundle.

- `window.DevPulseAI.catalog()`
  - Returns tools, operations, examples, and usage tips.
- `window.DevPulseAI.run(request)`
  - Executes one request.
  - Success: `{ ok: true, result }`
  - Failure: `{ ok: false, error, errorDetails, problem }`
- `window.DevPulseAI.describe(toolId)`
  - One catalog entry instead of all twelve. Cheaper on an agent's context; throws with the
    supported list and a `didYouMean` suggestion for an unknown id.
- `window.DevPulseAI.runBatch(requests[], { stopOnError? })`
  - Runs requests in order. Every response carries `index`, so a caller can still map results to
    requests when `stopOnError` truncates the array.

`getSnapshot()` was removed in `version: 2`. It scanned localStorage for `devpulse:<tool>:<field>`
keys that nothing ever wrote — tool state lives in the query string — so it always returned an
empty object while the docs advertised it as a resume/handoff feature.

### Reliability

Each catalog entry carries `reliability`:

| Value                 | Meaning                                                                                                                                            |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `exact`               | The answer depends on an algorithm a language model reproduces unreliably — checksums, unicode-safe base64, diffing, base64url. **Call the tool.** |
| `llm-can-approximate` | A capable model usually gets this right unaided; the tool is a convenience and a consistency guarantee.                                            |

This is the field that tells an agent _why_ the bridge is worth calling at all. `thai-id`,
`base64-tool`, `diff-viewer`, `jwt-decoder`, `uuid-generator`, `password-gen` and
`thai-date-converter` are `exact`.

## Request Shape

```ts
{
  tool: 'json-formatter' | 'xml-formatter' | 'base64-tool' | 'case-converter' | 'url-parser'
      | 'diff-viewer' | 'thai-date-converter' | 'thai-id' | 'jwt-decoder' | 'xml-to-json'
      | 'uuid-generator' | 'password-gen',
  operation: string,
  input?: unknown,
  options?: Record<string, unknown>
}
```

| Tool                  | Operations                          |
| --------------------- | ----------------------------------- |
| `json-formatter`      | format, minify, validate            |
| `xml-formatter`       | format, minify, validate            |
| `xml-to-json`         | convert                             |
| `base64-tool`         | encode, decode                      |
| `case-converter`      | convert                             |
| `url-parser`          | parse                               |
| `diff-viewer`         | compare                             |
| `thai-date-converter` | format, parse                       |
| `thai-id`             | analyze, validate, format, generate |
| `jwt-decoder`         | decode, claims                      |
| `uuid-generator`      | generate                            |
| `password-gen`        | generate                            |

`uuid-generator` and `password-gen` ignore `input` and take their configuration from `options`.

## Examples

```js
const catalog = await window.DevPulseAI.catalog();

const response = await window.DevPulseAI.run({
  tool: 'json-formatter',
  operation: 'format',
  input: '{"name":"devpulse","ok":true}',
  options: { indent: 2 },
});

if (response.ok) {
  console.log(response.result);
} else {
  console.error(response.error, response.errorDetails);
}
```

```js
// Available on every route and it survives navigation — installed in App.tsx, not in the
// /ai-bridge component. Methods are async because the runners are lazy-loaded on first call,
// which keeps ~10 kB gzipped out of the eager bundle for visitors who never use the bridge.
await window.DevPulseAI.run({
  tool: 'case-converter',
  operation: 'convert',
  input: 'Hello World',
  options: { target: 'snake' },
});
```

The object exists from app start, so `window.DevPulseAI` is itself the readiness check. Agents
that would rather listen can wait for the `devpulse-ai-ready` CustomEvent on `window`.
`window.DevPulseAI.version` is bumped when the shape changes.

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

- Responses have a stable JSON shape: `{ ok, tool, operation, result?, error? }`.
- Most tools are pure transforms: same request in, same `result` out. The two generators
  (`uuid-generator`, `password-gen`) intentionally return new random values per call, so do not
  treat a repeated request as a cache hit.
- `jwt-decoder` never verifies signatures; every response carries `signatureVerified: false`.
- Failures include RFC7807-style `problem` and `errorDetails.hints[]`.
- `mode=result-only` renders **nothing but** `<pre id="ai-bridge-output">`: App.tsx skips
  `MainLayout` for this mode, so `JSON.parse(document.body.innerText)` works directly and an agent
  does not have to know the selector. Measured: page text went from 673 characters (sidebar,
  header, footer) to exactly the response.
- Note that `document.title` stays at the static index.html title in this mode, because the layout
  that sets it is not rendered. Machine consumers do not read it; humans should use `mode=full`.
- `Run Query` UI includes stable semantic attributes (`data-action`, `data-testid`) for browser agents.

## Internal Execution Flow

1. Normalize request (`normalizeToolRequest`)
2. Validate shape (`assertToolRequestShape`)
3. Parse query payload (`parsePayloadParam` / `parseQueryRequest`) with zod guards when request comes from URL
4. Resolve runner (`resolveToolRunner`) and build execution context (`buildToolExecutionContext`)
5. Execute handler
6. Convert errors to API envelope (`toValidationErrorResponse` / `toExecutionErrorResponse`)

## Internal Module Responsibilities

| File/Module                               | Responsibility                                                                 |
| ----------------------------------------- | ------------------------------------------------------------------------------ |
| `src/lib/ai-tool-bridge/contracts.ts`     | Shared runtime/schema constants (required fields, defaults, storage namespace) |
| `src/lib/ai-tool-bridge/schema.ts`        | JSON schema generated from shared contracts + catalog enum                     |
| `src/lib/ai-tool-bridge/validators.ts`    | Request/option/input validation + request normalization (zod-backed)           |
| `src/lib/aiBridgeQuery.ts`                | Query-string to request parser + URL query normalization (zod-guarded parsing) |
| `src/lib/ai-tool-bridge/registry.ts`      | Tool runner registry, execution context builder, registry diagnostics          |
| `src/lib/ai-tool-bridge/handlers/*`       | Tool-specific execution logic                                                  |
| `src/lib/ai-tool-bridge/errorTaxonomy.ts` | Stable error code -> problem metadata mapping                                  |
| `src/lib/ai-tool-bridge/errorResponse.ts` | Convert thrown errors to API response envelope                                 |
| `src/lib/ai-tool-bridge/index.ts`         | Public exports + sub-level barrels (`BridgeCore`, `BridgePolicy`)              |

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
6. Add/update table-driven tests in `runners.test.ts` for success and invalid paths.
7. Run validation:
   - `npm run typecheck`
   - `npm run lint`
