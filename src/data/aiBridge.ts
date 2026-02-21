export const AI_BRIDGE_TOOL_METADATA = {
  'json-formatter': {
    description: 'Prettify, minify, or validate JSON strings.',
    usageTips: [
      'Provide JSON as string input.',
      'Use operation=format with options.indent for stable output.',
    ],
  },
  'xml-formatter': {
    description: 'Prettify, minify, or validate XML strings.',
    usageTips: [
      'Provide raw XML text in input.',
      'Use operation=minify before transport if payload size matters.',
    ],
  },
  'base64-tool': {
    description: 'Encode plain text to Base64 or decode Base64 to plain text.',
    usageTips: [
      'Use encode for raw text input.',
      'Use decode only when input is valid Base64.',
    ],
  },
  'case-converter': {
    description: 'Convert input text into snake/kebab/camel/pascal case.',
    usageTips: [
      'Set options.target to snake|kebab|camel|pascal.',
      'Input may contain spaces, underscores, or mixed casing.',
    ],
  },
  'url-parser': {
    description: 'Parse URL into components and query parameters.',
    usageTips: [
      'Include protocol for strict parsing.',
      'Inspect result.params for query key/value pairs.',
    ],
  },
  'diff-viewer': {
    description: 'Compare two texts and return stats with optional line-level diff.',
    usageTips: [
      'Pass input as object { original, modified }.',
      'Set options.includeLines=false for stats-only results.',
    ],
  },
  'thai-date-converter': {
    description: 'Format or parse Thai date values.',
    usageTips: [
      'Use format with ISO-like date strings.',
      'Use parse with Thai Buddhist-era date strings.',
    ],
  },
} as const;

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
}

const snapshot = window.DevPulseAI.getSnapshot();
console.log(snapshot);

const batch = window.DevPulseAI.runBatch([
  { tool: 'base64-tool', operation: 'decode', input: 'eyJhIjoxfQ==' },
  { tool: 'json-formatter', operation: 'format', input: '{"a":1}', options: { indent: 2 } }
]);
console.log(batch);`;

export const QUERY_EXAMPLE_SNIPPET = `/ai-bridge?tool=json-formatter&op=format&input={"a":1}
/ai-bridge?tool=case-converter&op=convert&input=hello%20world&options={"target":"snake"}
/ai-bridge?payload={"tool":"diff-viewer","operation":"compare","input":{"original":"a","modified":"b"}}
/ai-bridge?tool=url-parser&op=parse&input=example.com&mode=result-only
/ai-bridge?tool=json-formatter&op=format&input={"a":1}&includeCatalog=false
/ai-bridge/catalog.json
/ai-bridge/spec.json`;

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
  {
    label: 'Catalog JSON',
    value: '/ai-bridge/catalog.json',
  },
  {
    label: 'Spec JSON',
    value: '/ai-bridge/spec.json',
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
    summary: 'Return tools, supported operations, descriptions, usage tips, and examples.',
  },
  {
    path: '/ai-bridge/spec',
    title: 'Schema Endpoint',
    summary: 'Return JSON Schema for request/response contracts.',
  },
];
