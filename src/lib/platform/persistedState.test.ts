import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import {
  readPersisted,
  readPersistedRaw,
  removePersisted,
  writePersisted,
  writePersistedRaw,
} from './persistedState';

const KEY = 'test-key';
const schema = z.array(z.string());

/** vitest runs without a DOM here, so localStorage is stubbed rather than mocked over. */
const installStorage = (overrides: Partial<Storage> = {}) => {
  const store = new Map<string, string>();
  const storage: Storage = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => void store.set(key, value),
    removeItem: (key) => void store.delete(key),
    clear: () => store.clear(),
    key: (index) => [...store.keys()][index] ?? null,
    get length() {
      return store.size;
    },
    ...overrides,
  };

  vi.stubGlobal('localStorage', storage);
  return store;
};

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('readPersisted', () => {
  it('returns the stored value when it matches the schema', () => {
    installStorage().set(KEY, JSON.stringify(['a', 'b']));

    expect(readPersisted(KEY, schema, [])).toEqual(['a', 'b']);
  });

  it('returns the fallback when the key is absent', () => {
    installStorage();

    expect(readPersisted(KEY, schema, ['default'])).toEqual(['default']);
  });

  it('returns the fallback for malformed JSON instead of throwing', () => {
    // This exact input used to blank the entire app: the throw escaped a useState initialiser in
    // a provider mounted above every ErrorBoundary.
    installStorage().set(KEY, '{oops not json');

    expect(() => readPersisted(KEY, schema, [])).not.toThrow();
    expect(readPersisted(KEY, schema, [])).toEqual([]);
    expect(console.warn).toHaveBeenCalled();
  });

  it('returns the fallback for valid JSON of the wrong shape', () => {
    installStorage().set(KEY, '"a-string-not-an-array"');

    expect(readPersisted(KEY, schema, [])).toEqual([]);
  });

  it('returns the fallback when localStorage itself throws', () => {
    installStorage({
      getItem: () => {
        throw new Error('SecurityError');
      },
    });

    expect(readPersisted(KEY, schema, ['safe'])).toEqual(['safe']);
  });

  it('leaves the corrupt value in place for the caller to overwrite', () => {
    const store = installStorage();
    store.set(KEY, 'not json');

    readPersisted(KEY, schema, []);

    expect(store.get(KEY)).toBe('not json');
  });
});

describe('writePersisted', () => {
  it('serialises and stores the value', () => {
    const store = installStorage();

    expect(writePersisted(KEY, ['x'])).toBe(true);
    expect(store.get(KEY)).toBe('["x"]');
  });

  it('reports failure instead of throwing when storage rejects the write', () => {
    installStorage({
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    });

    expect(writePersisted(KEY, ['x'])).toBe(false);
    expect(console.warn).toHaveBeenCalled();
  });

  it('reports failure instead of throwing on a circular value', () => {
    installStorage();
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    expect(writePersisted(KEY, circular)).toBe(false);
  });
});

describe('raw helpers', () => {
  it('round-trips a bare string without JSON quoting', () => {
    const store = installStorage();

    writePersistedRaw(KEY, 'dark');

    expect(store.get(KEY)).toBe('dark');
    expect(readPersistedRaw(KEY)).toBe('dark');
  });

  it('returns null rather than throwing when storage is unavailable', () => {
    installStorage({
      getItem: () => {
        throw new Error('SecurityError');
      },
    });

    expect(readPersistedRaw(KEY)).toBeNull();
  });

  it('removes a key without throwing when storage is unavailable', () => {
    installStorage({
      removeItem: () => {
        throw new Error('SecurityError');
      },
    });

    expect(() => removePersisted(KEY)).not.toThrow();
  });
});
