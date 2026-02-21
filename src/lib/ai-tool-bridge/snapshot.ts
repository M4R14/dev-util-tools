import { AI_BRIDGE_STORAGE_NAMESPACE } from './contracts';
import {
  isToolSnapshotStorageKey,
  parseSnapshotStoredValue,
  splitToolSnapshotStorageKey,
} from './snapshotPolicy';
import type { AIToolSnapshot } from './types';

export const getAIToolSnapshot = (): AIToolSnapshot => {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return {
      capturedAt: new Date().toISOString(),
      storageNamespace: AI_BRIDGE_STORAGE_NAMESPACE,
      state: {},
    };
  }

  const state: Record<string, Record<string, unknown>> = {};

  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key || !isToolSnapshotStorageKey(key)) {
      continue;
    }

    const { namespace, toolId, field } = splitToolSnapshotStorageKey(key);
    if (!namespace || !toolId || !field) {
      continue;
    }

    const raw = window.localStorage.getItem(key);
    if (!raw) {
      continue;
    }

    const value = parseSnapshotStoredValue(raw);

    state[toolId] = state[toolId] ?? {};
    state[toolId][field] = value;
  }

  return {
    capturedAt: new Date().toISOString(),
    storageNamespace: AI_BRIDGE_STORAGE_NAMESPACE,
    state,
  };
};
