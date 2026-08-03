import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

/** Keep in sync with the inline bootstrap script in viewer/index.html. */
const STORAGE_KEY = 'lism-mock:theme';

/** Class toggled on `<html>`. Its token overrides live in viewer/src/viewer.css. */
const DARK_CLASS = 'set--dark';

function readStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'dark' || stored === 'light' ? stored : null;
  } catch {
    // localStorage can throw in private / sandboxed contexts.
    return null;
  }
}

function getInitialTheme(): Theme {
  const stored = readStoredTheme();
  if (stored) return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export interface ThemeState {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

/**
 * Dark mode state for the viewer.
 *
 * The `set--dark` class is applied to `<html>` (the same element the inline
 * bootstrap script in index.html touches) and the choice is persisted to
 * localStorage so a reload keeps the selected theme.
 */
export function useTheme(): ThemeState {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle(DARK_CLASS, theme === 'dark');
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Persisting is best-effort; the toggle still works for this session.
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, isDark: theme === 'dark', toggleTheme };
}
