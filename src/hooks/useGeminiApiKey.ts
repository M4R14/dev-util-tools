import { useCallback, useState } from 'react';
import { obfuscate, deobfuscate } from '../lib/platform/obfuscation';
import {
  readPersistedRaw,
  removePersisted,
  writePersistedRaw,
} from '../lib/platform/persistedState';

export const GEMINI_KEY_STORAGE_KEY = 'devpulse_secure_config';

/**
 * Single owner of the stored Gemini key.
 *
 * Both the AI assistant's settings modal and the Settings page need to know whether a key exists
 * and to remove it; keeping the load/save/clear logic in one place is what stops those two
 * surfaces from disagreeing about where the key lives or how it is encoded.
 *
 * The stored value is obfuscated, NOT encrypted — see `src/lib/obfuscation.ts`. Anyone with access
 * to the browser profile can recover it. That limitation belongs in the UI copy, not hidden here.
 */
const loadApiKey = (): string => {
  const stored = readPersistedRaw(GEMINI_KEY_STORAGE_KEY);
  return stored ? deobfuscate(stored) : '';
};

export const useGeminiApiKey = () => {
  const [apiKey, setApiKeyState] = useState(loadApiKey);

  const saveApiKey = useCallback((next: string) => {
    setApiKeyState(next);
    writePersistedRaw(GEMINI_KEY_STORAGE_KEY, obfuscate(next));
  }, []);

  const clearApiKey = useCallback(() => {
    setApiKeyState('');
    removePersisted(GEMINI_KEY_STORAGE_KEY);
  }, []);

  return { apiKey, hasApiKey: apiKey.length > 0, saveApiKey, clearApiKey };
};
