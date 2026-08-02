import { describe, expect, it } from 'vitest';
import { THEME_PREFERENCES, isThemePreference, nextThemePreference } from './theme';

describe('isThemePreference', () => {
  it('accepts the bare strings written by the previous version', () => {
    // Storage held a raw `dark`/`light` before `system` existed. Rejecting those would silently
    // reset everyone's theme on upgrade.
    expect(isThemePreference('dark')).toBe(true);
    expect(isThemePreference('light')).toBe(true);
  });

  it('accepts the new system value', () => {
    expect(isThemePreference('system')).toBe(true);
  });

  it.each([['auto'], ['DARK'], [''], ['"dark"']])('rejects %s', (value) => {
    expect(isThemePreference(value)).toBe(false);
  });

  it('rejects null', () => {
    expect(isThemePreference(null)).toBe(false);
  });
});

describe('nextThemePreference', () => {
  it('cycles light → dark → system → light', () => {
    expect(nextThemePreference('light')).toBe('dark');
    expect(nextThemePreference('dark')).toBe('system');
    expect(nextThemePreference('system')).toBe('light');
  });

  it('returns to the start after one full cycle', () => {
    const cycled = THEME_PREFERENCES.reduce((current) => nextThemePreference(current), 'light');

    expect(cycled).toBe('light');
  });

  it('always lands on a valid preference', () => {
    for (const preference of THEME_PREFERENCES) {
      expect(THEME_PREFERENCES).toContain(nextThemePreference(preference));
    }
  });
});
