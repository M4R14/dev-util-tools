export const AI_BRIDGE_SCHEMA_TITLES = {
  request: 'AIToolRequest',
  response: 'AIToolResponse',
} as const;

export const AI_BRIDGE_REQUEST_REQUIRED_FIELDS = ['tool', 'operation'] as const;

export const AI_BRIDGE_DEFAULT_INPUT: unknown = '';
