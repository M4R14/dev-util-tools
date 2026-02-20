export const REQUEST_SHAPE_SNIPPET = `{
  tool: 'json-formatter' | 'xml-formatter' | 'base64-tool' | 'case-converter' | 'url-parser' | 'diff-viewer' | 'thai-date-converter',
  operation: string,
  input?: unknown,
  options?: Record<string, unknown>
}`;

export const WINDOW_API_SNIPPET = `// Important: open /ai-bridge first so window.DevPulseAI is initialized.
const catalog = window.DevPulseAI.catalog();

const response = window.DevPulseAI.run({
  tool: 'url-parser',
  operation: 'parse',
  input: 'https://example.com/path?a=1'
});

if (response.ok) {
  console.log(response.result);
} else {
  console.error(response.error, response.errorDetails);
}`;

export const QUERY_EXAMPLE_SNIPPET = `/ai-bridge?tool=json-formatter&op=format&input={"a":1}
/ai-bridge?tool=case-converter&op=convert&input=hello%20world&options={"target":"snake"}
/ai-bridge?payload={"tool":"diff-viewer","operation":"compare","input":{"original":"a","modified":"b"}}
/ai-bridge?tool=url-parser&op=parse&input=example.com&mode=result-only
/ai-bridge?tool=json-formatter&op=format&input={"a":1}&includeCatalog=false`;

export const QUERY_TEMPLATES = [
  {
    label: 'JSON Format',
    value: '/ai-bridge?tool=json-formatter&op=format&input={"name":"devpulse","ok":true}',
  },
  {
    label: 'Base64 Encode',
    value: '/ai-bridge?tool=base64-tool&op=encode&input=hello%20world',
  },
  {
    label: 'URL Parse',
    value: '/ai-bridge?tool=url-parser&op=parse&input=https://example.com/path?a=1',
  },
  {
    label: 'Diff Compare',
    value:
      '/ai-bridge?payload={"tool":"diff-viewer","operation":"compare","input":{"original":"a","modified":"b"}}',
  },
] as const;

export type BridgeEndpointPath = '/ai-bridge' | '/ai-bridge/catalog' | '/ai-bridge/spec';

export const ENDPOINT_SPECS: Array<{
  path: BridgeEndpointPath;
  title: string;
  summary: string;
}> = [
  {
    path: '/ai-bridge',
    title: 'Execution Endpoint',
    summary: 'Run a tool request and return runtime result/error.',
  },
  {
    path: '/ai-bridge/catalog',
    title: 'Discovery Endpoint',
    summary: 'Return available tools and supported operations only.',
  },
  {
    path: '/ai-bridge/spec',
    title: 'Schema Endpoint',
    summary: 'Return JSON Schema for request/response contracts.',
  },
];
