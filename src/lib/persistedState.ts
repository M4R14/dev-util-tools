import type { z } from 'zod';

/**
 * Reading and writing localStorage without letting it take the app down.
 *
 * `UserPreferencesContext` used to call `JSON.parse(localStorage.getItem('favorites'))` directly
 * inside a `useState` initialiser, in a provider mounted above every ErrorBoundary. A single
 * malformed byte in that key rendered a blank page — root with zero children, no message, and no
 * way back except opening devtools and clearing storage by hand.
 *
 * Every failure mode here degrades to the caller's fallback instead:
 *
 * - `localStorage` throwing on access (Safari private mode, blocked cookies)
 * - malformed JSON
 * - well-formed JSON of the wrong shape (an old schema, a hand-edited value)
 * - `setItem` throwing on quota exhaustion
 *
 * Corrupt values are not deleted here. Callers persist their state on mount, so the bad value is
 * overwritten on the next write, and a reader with no side effects is easier to reason about.
 */

const warn = (key: string, problem: string) => {
  console.warn(`[storage] ignoring "${key}" — ${problem}. Falling back to the default.`);
};

/** Raw string read. Returns null when absent or unreadable; never throws. */
export const readPersistedRaw = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    warn(key, 'localStorage is unavailable');
    return null;
  }
};

/** Raw string write. Returns false when storage rejected it; never throws. */
export const writePersistedRaw = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    warn(key, 'localStorage rejected the write (quota or private mode)');
    return false;
  }
};

/** Removes a key. Never throws. */
export const removePersisted = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch {
    // Nothing useful to do — the value is already unreachable.
  }
};

/**
 * Reads JSON and validates it against `schema`. Anything unexpected yields `fallback`.
 *
 * The schema is what makes this safe against the second failure mode: `favorites` holding
 * `"a-string"` parses fine as JSON and then breaks whatever calls `.includes()` on it later,
 * far from the cause.
 */
export const readPersisted = <T>(key: string, schema: z.ZodType<T>, fallback: T): T => {
  const raw = readPersistedRaw(key);
  if (raw === null) return fallback;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    warn(key, 'it is not valid JSON');
    return fallback;
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    warn(key, result.error.issues.map((issue) => issue.message).join('; '));
    return fallback;
  }

  return result.data;
};

/** Serialises and writes JSON. Returns false when storage rejected it; never throws. */
export const writePersisted = (key: string, value: unknown): boolean => {
  try {
    return writePersistedRaw(key, JSON.stringify(value));
  } catch {
    warn(key, 'the value could not be serialised');
    return false;
  }
};
