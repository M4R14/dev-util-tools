/**
 * Theme vocabulary, kept out of `ThemeContext.tsx` so that file exports only its provider and hook.
 */

/** What the user chose. `system` follows the OS for as long as it stays selected. */
export type ThemePreference = 'light' | 'dark' | 'system';

/** What actually gets painted — `system` resolved against the OS. */
export type ResolvedTheme = 'light' | 'dark';

/** Also the order the header button cycles through. */
export const THEME_PREFERENCES: ThemePreference[] = ['light', 'dark', 'system'];

export const THEME_STORAGE_KEY = 'theme';

export const DARK_COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

/**
 * Stored as a bare string rather than JSON so installs holding the previous format — a raw `dark`
 * or `light` — keep their choice instead of being reset to the default on first load.
 */
export const isThemePreference = (value: string | null): value is ThemePreference =>
  value !== null && (THEME_PREFERENCES as string[]).includes(value);

export const nextThemePreference = (current: ThemePreference): ThemePreference =>
  THEME_PREFERENCES[(THEME_PREFERENCES.indexOf(current) + 1) % THEME_PREFERENCES.length];
