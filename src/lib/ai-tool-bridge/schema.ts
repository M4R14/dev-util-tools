import { AI_TOOL_CATALOG } from './catalog';

export const AI_BRIDGE_SCHEMA = {
  request: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'AIToolRequest',
    type: 'object',
    required: ['tool', 'operation'],
    properties: {
      tool: { type: 'string', enum: AI_TOOL_CATALOG.map((item) => item.id) },
      operation: { type: 'string' },
      input: {},
      options: { type: 'object', additionalProperties: true },
    },
    additionalProperties: false,
  },
  response: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'AIToolResponse',
    type: 'object',
    required: ['ok', 'tool', 'operation'],
    properties: {
      ok: { type: 'boolean' },
      tool: { type: 'string', enum: AI_TOOL_CATALOG.map((item) => item.id) },
      operation: { type: 'string' },
      result: {},
      error: { type: 'string' },
      errorDetails: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          message: { type: 'string' },
          supportedOperations: { type: 'array', items: { type: 'string' } },
          supportedTools: {
            type: 'array',
            items: { type: 'string', enum: AI_TOOL_CATALOG.map((item) => item.id) },
          },
          didYouMean: { type: 'string' },
          hints: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
      },
      problem: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          title: { type: 'string' },
          status: { type: 'number' },
          detail: { type: 'string' },
        },
        additionalProperties: false,
      },
    },
    additionalProperties: false,
  },
} as const;
