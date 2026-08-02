import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { readPersistedRaw, writePersistedRaw } from '../lib/platform/persistedState';
import {
  DARK_COLOR_SCHEME_QUERY,
  THEME_STORAGE_KEY,
  isThemePreference,
  nextThemePreference,
  type ResolvedTheme,
  type ThemePreference,
} from '../lib/platform/theme';

const prefersDark = () => window.matchMedia(DARK_COLOR_SCHEME_QUERY).matches;

interface ThemeContextType {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
  /** Cycles light → dark → system, for the compact header button. */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  /**
   * This used to read the OS preference only when nothing was stored, then write a concrete
   * 'light' or 'dark' on the first toggle — after which the app never followed the OS again, not
   * even when it switched at sunset, and there was no way back short of clearing localStorage.
   * Keeping 'system' as a stored value of its own is what makes that reversible.
   */
  const [theme, setThemeState] = useState<ThemePreference>(() => {
    const stored = readPersistedRaw(THEME_STORAGE_KEY);
    return isThemePreference(stored) ? stored : 'system';
  });

  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() =>
    prefersDark() ? 'dark' : 'light',
  );

  // Only listen while 'system' is selected — an explicit choice should not move on its own.
  useEffect(() => {
    if (theme !== 'system') return;

    const query = window.matchMedia(DARK_COLOR_SCHEME_QUERY);
    const onChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light');
    };

    setSystemTheme(query.matches ? 'dark' : 'light');
    query.addEventListener('change', onChange);

    return () => query.removeEventListener('change', onChange);
  }, [theme]);

  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme;

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    writePersistedRaw(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = useCallback((next: ThemePreference) => setThemeState(next), []);

  const toggleTheme = useCallback(() => {
    setThemeState(nextThemePreference);
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
