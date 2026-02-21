import type { AIToolSnapshot } from './types';

export const getAIToolSnapshot = (): AIToolSnapshot => {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return {
      capturedAt: new Date().toISOString(),
      storageNamespace: 'devpulse',
      state: {},
    };
  }

  const state: Record<string, Record<string, unknown>> = {};

  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key || !key.startsWith('devpulse:')) {
      continue;
    }

    const [namespace, toolId, field] = key.split(':');
    if (!namespace || !toolId || !field || toolId === 'settings') {
      continue;
    }

    const raw = window.localStorage.getItem(key);
    if (!raw) {
      continue;
    }

    let value: unknown = raw;
    try {
      const parsed = JSON.parse(raw) as { value?: unknown };
      value = typeof parsed === 'object' && parsed !== null && 'value' in parsed ? parsed.value : parsed;
    } catch {
      value = raw;
    }

    state[toolId] = state[toolId] ?? {};
    state[toolId][field] = value;
  }

  return {
    capturedAt: new Date().toISOString(),
    storageNamespace: 'devpulse',
    state,
  };
};
