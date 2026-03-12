'use client';

import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

/* ---------------------------------- Types --------------------------------- */

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

/* --------------------------------- Context -------------------------------- */

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'theme';

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(theme: Theme): ResolvedTheme {
  return theme === 'system' ? getSystemTheme() : theme;
}

function applyTheme(resolved: ResolvedTheme) {
  document.documentElement.setAttribute('data-theme', resolved);
}

/* ----------------------------- External Store ----------------------------- */

type ThemeState = { theme: Theme; resolved: ResolvedTheme };

const listeners = new Set<() => void>();
let currentState: ThemeState = { theme: 'system', resolved: 'light' };

const SERVER_SNAPSHOT: ThemeState = { theme: 'system', resolved: 'light' };

function getSnapshot(): ThemeState {
  return currentState;
}

function getServerSnapshot(): ThemeState {
  return SERVER_SNAPSHOT;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emitChange() {
  listeners.forEach((l) => l());
}

function setThemeExternal(newTheme: Theme) {
  const resolved = resolveTheme(newTheme);
  currentState = { theme: newTheme, resolved };
  applyTheme(resolved);
  try {
    localStorage.setItem(STORAGE_KEY, newTheme);
  } catch {
    // localStorage unavailable
  }
  emitChange();
}

/* ------------------------------ ThemeProvider ------------------------------ */

function ThemeProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Initialize from localStorage on mount
  useEffect(() => {
    let stored: Theme = 'system';
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === 'light' || raw === 'dark' || raw === 'system') stored = raw;
    } catch {
      // localStorage unavailable
    }
    setThemeExternal(stored);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      if (currentState.theme === 'system') {
        const resolved = getSystemTheme();
        currentState = { ...currentState, resolved };
        applyTheme(resolved);
        emitChange();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeExternal(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    const current = getSnapshot();
    setThemeExternal(current.resolved === 'light' ? 'dark' : 'light');
  }, []);

  const contextValue = useMemo(
    () => ({ theme: state.theme, resolvedTheme: state.resolved, setTheme, toggleTheme }),
    [state.theme, state.resolved, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

/* ---------------------------------- Hook ---------------------------------- */

function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Inline script to prevent FOUC (flash of unstyled content).
 * Add to <head> in root layout for instant theme application.
 *
 * @example
 * <head>
 *   <ThemeScript />
 * </head>
 */
function ThemeScript({ nonce }: { nonce?: string }) {
  const script = `
    (function() {
      try {
        var theme = localStorage.getItem(${JSON.stringify(STORAGE_KEY)});
        var resolved = theme;
        if (!theme || theme === 'system') {
          resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        document.documentElement.setAttribute('data-theme', resolved);
      } catch(e) {}
    })();
  `;

  return (
    <script nonce={nonce} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: script }} />
  );
}

export { ThemeProvider, ThemeScript, useTheme };
export type { Theme, ResolvedTheme, ThemeContextValue };
