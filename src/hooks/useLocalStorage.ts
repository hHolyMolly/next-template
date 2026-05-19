'use client';

import { useCallback, useEffect, useState } from 'react';

import { logger } from '@/utils/logger';

type Setter<T> = (value: T | ((prev: T) => T)) => void;

/**
 * Reactive wrapper around `localStorage` with:
 * - SSR safety — returns `initialValue` on the server, re-reads on hydration.
 * - Cross-tab sync via the `storage` event.
 * - JSON serialization.
 *
 * @example
 * const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
 */
export function useLocalStorage<T>(key: string, initialValue: T): readonly [T, Setter<T>] {
  const read = useCallback((): T => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initialValue;
    } catch (err) {
      logger.warn(`useLocalStorage: failed to read "${key}"`, err);
      return initialValue;
    }
  }, [key, initialValue]);

  const [value, setValue] = useState<T>(initialValue);

  // Hydrate from localStorage after mount to avoid SSR mismatches.
  useEffect(() => {
    setValue(read());
  }, [read]);

  const set: Setter<T> = useCallback(
    (v) => {
      setValue((prev) => {
        const next = typeof v === 'function' ? (v as (p: T) => T)(prev) : v;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch (err) {
          logger.warn(`useLocalStorage: failed to write "${key}"`, err);
        }
        return next;
      });
    },
    [key],
  );

  // Listen for changes from other tabs / windows.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key || e.newValue === null) return;
      try {
        setValue(JSON.parse(e.newValue) as T);
      } catch {
        // ignore malformed payloads
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key]);

  return [value, set] as const;
}
