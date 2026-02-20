# AI Agent Bridge

| Field | Value |
|---|---|
| **ToolID** | `ai-bridge` |
| **Route** | `/ai-bridge` |
| **Component** | `AIAgentBridge.tsx` |
| **Runner** | `src/lib/aiToolBridge.ts` |

## Description
Machine-readable bridge that lets AI/browser agents run selected DevPulse tools without manual UI interaction.

## How to Use

1. Open `/ai-bridge` once to initialize browser API `window.DevPulseAI`.
2. Discover capabilities with `window.DevPulseAI.catalog()`.
3. Execute tool operations with `window.DevPulseAI.run(request)`.
4. Or pass query parameters to `/ai-bridge` for one-shot execution and read JSON response from `#ai-bridge-response`.

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
```

## Notes

- Encode JSON query values (`input`, `options`, `payload`) when building URLs programmatically.
- Responses are deterministic JSON with `{ ok, tool, operation, result?, error? }`.
- This bridge is client-side and intended for browser-controlled agents.
