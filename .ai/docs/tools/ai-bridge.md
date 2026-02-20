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

## How to Use

1. Open `/ai-bridge` once to initialize browser API `window.DevPulseAI`.
2. Discover capabilities with `window.DevPulseAI.catalog()`.
3. Execute tool operations with `window.DevPulseAI.run(request)`.
4. Or pass query parameters to `/ai-bridge` for one-shot execution and read JSON response from `#ai-bridge-response`.
5. Use `/ai-bridge/catalog` and `/ai-bridge/spec` when you need discovery/schema only.

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
/ai-bridge/catalog
/ai-bridge/spec
```

## Notes

- Encode JSON query values (`input`, `options`, `payload`) when building URLs programmatically.
- Responses are deterministic JSON with `{ ok, tool, operation, result?, error? }`.
- This bridge is client-side and intended for browser-controlled agents.
- Error responses include `errorDetails` with `code`, plus supported values/suggestions when possible.
