export const AI_BRIDGE_TOOL_METADATA = {
  'json-formatter': {
    reliability: 'llm-can-approximate',
    description: 'Prettify, minify, or validate JSON strings.',
    usageTips: [
      'Provide JSON as string input.',
      'Use operation=format with options.indent for stable output.',
    ],
  },
  'xml-formatter': {
    reliability: 'llm-can-approximate',
    description: 'Prettify, minify, or validate XML strings.',
    usageTips: [
      'Provide raw XML text in input.',
      'Use operation=minify before transport if payload size matters.',
    ],
  },
  'base64-tool': {
    reliability: 'exact',
    description: 'Encode plain text to Base64 or decode Base64 to plain text.',
    usageTips: ['Use encode for raw text input.', 'Use decode only when input is valid Base64.'],
  },
  'case-converter': {
    reliability: 'llm-can-approximate',
    description: 'Convert input text into snake/kebab/camel/pascal case.',
    usageTips: [
      'Set options.target to snake|kebab|camel|pascal.',
      'Input may contain spaces, underscores, or mixed casing.',
    ],
  },
  'url-parser': {
    reliability: 'llm-can-approximate',
    description: 'Parse URL into components and query parameters.',
    usageTips: [
      'Include protocol for strict parsing.',
      'Inspect result.params for query key/value pairs.',
    ],
  },
  'diff-viewer': {
    reliability: 'exact',
    description: 'Compare two texts and return stats with optional line-level diff.',
    usageTips: [
      'Pass input as object { original, modified }.',
      'Set options.includeLines=false for stats-only results.',
    ],
  },
  'thai-date-converter': {
    reliability: 'exact',
    description: 'Format or parse Thai date values.',
    usageTips: [
      'Use format with ISO-like date strings.',
      'Use parse with Thai Buddhist-era date strings.',
    ],
  },
  'thai-id': {
    reliability: 'exact',
    description: 'Analyze, validate, format, or generate a 13-digit Thai national ID.',
    usageTips: [
      'validate returns { valid } from the checksum digit; analyze returns the full breakdown.',
      'generate takes no input and returns a checksum-valid sample ID, for test data only.',
    ],
  },
  'jwt-decoder': {
    reliability: 'exact',
    description:
      'Decode a JWT into header, payload, and time claims. Never verifies the signature.',
    usageTips: [
      'Every response includes signatureVerified: false — decoding proves nothing about authenticity.',
      'Use claims when only the payload matters; use decode for header, algorithm, and expiry.',
    ],
  },
  'xml-to-json': {
    reliability: 'llm-can-approximate',
    description: 'Convert an XML document into structured JSON.',
    usageTips: [
      'Set options.includeAttributes=false to drop @attributes keys.',
      'Repeated sibling elements collapse into arrays.',
    ],
  },
  'uuid-generator': {
    reliability: 'exact',
    description: 'Generate version 4 UUIDs. Output is random, so repeated calls differ.',
    usageTips: [
      'Use options.quantity (1-100); options.hyphens and options.uppercase shape the format.',
      'input is ignored for this tool.',
    ],
  },
  'password-gen': {
    reliability: 'exact',
    description: 'Generate a secure random password. Output is random, so repeated calls differ.',
    usageTips: [
      'Use options.length (4-64) and the includeUpper/Lower/Numbers/Symbols flags.',
      'Returns poolSize and strength alongside the password; input is ignored.',
    ],
  },
} as const;

export const REQUEST_SHAPE_SNIPPET = `{
  tool: 'json-formatter' | 'xml-formatter' | 'base64-tool' | 'case-converter' | 'url-parser'
      | 'diff-viewer' | 'thai-date-converter' | 'thai-id' | 'jwt-decoder' | 'xml-to-json'
      | 'uuid-generator' | 'password-gen',
  operation: string,
  input?: unknown,
  options?: Record<string, unknown>
}`;

export const WINDOW_API_SNIPPET = `// Available on every page, not just /ai-bridge, and it survives navigation.
// Methods are async: the tool runners are loaded on first call.
if (!window.DevPulseAI) {
  await new Promise((resolve) =>
    window.addEventListener('devpulse-ai-ready', resolve, { once: true })
  );
}

const catalog = await window.DevPulseAI.catalog();

const response = await window.DevPulseAI.run({
  tool: 'url-parser',
  operation: 'parse',
  input: 'https://example.com/path?a=1'
});

if (response.ok) {
  console.log(response.result);
} else {
  console.error(response.error, response.errorDetails);
}

// One tool instead of the whole catalog — cheaper on context.
const tool = await window.DevPulseAI.describe('thai-id');
// reliability === 'exact' means: do not attempt this in your head, call the tool.

// Each response carries its index; stopOnError halts at the first failure.
const batch = await window.DevPulseAI.runBatch(
  [
    { tool: 'base64-tool', operation: 'decode', input: 'eyJhIjoxfQ==' },
    { tool: 'json-formatter', operation: 'format', input: '{"a":1}', options: { indent: 2 } }
  ],
  { stopOnError: true }
);`;

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
