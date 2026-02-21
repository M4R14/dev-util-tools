export const AI_BRIDGE_SCHEMA_TITLES = {
  request: 'AIToolRequest',
  response: 'AIToolResponse',
} as const;

export const AI_BRIDGE_REQUEST_REQUIRED_FIELDS = ['tool', 'operation'] as const;

export const AI_BRIDGE_DEFAULT_INPUT: unknown = '';

export const AI_BRIDGE_STORAGE_NAMESPACE = 'devpulse';
export const AI_BRIDGE_STORAGE_SEPARATOR = ':';
export const AI_BRIDGE_SNAPSHOT_IGNORED_TOOL_IDS = ['settings'] as const;
