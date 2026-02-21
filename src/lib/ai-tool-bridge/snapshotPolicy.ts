import {
  AI_BRIDGE_SNAPSHOT_IGNORED_TOOL_IDS,
  AI_BRIDGE_STORAGE_NAMESPACE,
  AI_BRIDGE_STORAGE_SEPARATOR,
} from './contracts';

const IGNORED_TOOL_IDS = new Set<string>(AI_BRIDGE_SNAPSHOT_IGNORED_TOOL_IDS);

export const isToolSnapshotStorageKey = (key: string): boolean => {
  if (!key.startsWith(`${AI_BRIDGE_STORAGE_NAMESPACE}${AI_BRIDGE_STORAGE_SEPARATOR}`)) {
    return false;
  }

  const parts = key.split(AI_BRIDGE_STORAGE_SEPARATOR);
  const [, toolId, field] = parts;
  if (!toolId || !field) {
    return false;
  }

  if (IGNORED_TOOL_IDS.has(toolId)) {
    return false;
  }

  return true;
};

export const splitToolSnapshotStorageKey = (key: string) => {
  const [namespace, toolId, field] = key.split(AI_BRIDGE_STORAGE_SEPARATOR);
  return { namespace, toolId, field };
};

export const parseSnapshotStoredValue = (raw: string): unknown => {
  try {
    const parsed = JSON.parse(raw) as { value?: unknown };
    return typeof parsed === 'object' && parsed !== null && 'value' in parsed ? parsed.value : parsed;
  } catch {
    return raw;
  }
};
