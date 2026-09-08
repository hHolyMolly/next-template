'use client';

import { useSyncExternalStore, useCallback } from 'react';

// One MediaQueryList per query string for the whole app — `getSnapshot`
// runs on every store check, and `window.matchMedia()` allocates + parses
// the query each call.
const mqlCache = new Map<string, MediaQueryList>();

function getMediaQueryList(query: string): MediaQueryList {
  let mql = mqlCache.get(query);
  if (!mql) {
    mql = window.matchMedia(query);
    mqlCache.set(query, mql);
  }
  return mql;
}

/**
 * Hook for tracking media query state.
 * Uses useSyncExternalStore for safe SSR hydration.
 * Returns `false` on the server.
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      const mediaQuery = getMediaQueryList(query);
      mediaQuery.addEventListener('change', callback);
      return () => mediaQuery.removeEventListener('change', callback);
    },
    [query],
  );

  const getSnapshot = useCallback(() => getMediaQueryList(query).matches, [query]);

  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
