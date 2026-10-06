'use client';

import { useCallback, useRef, useSyncExternalStore } from 'react';

import { logger } from '@/utils/logger';

type Setter<T> = (value: T | ((prev: T) => T)) => void;

// Same-tab sync: the `storage` event only fires in OTHER tabs, so writes
// notify every subscribed hook instance through this registry.
const keyListeners = new Map<string, Set<() => void>>();

// Snapshot cache keyed by raw string — `useSyncExternalStore` requires
// `getSnapshot` to return a REFERENTIALLY stable value while the store is
// unchanged (a fresh `JSON.parse` object every call would loop forever).
const snapshotCache = new Map<string, { raw: string | null; value: unknown }>();

function emit(key: string) {
  keyListeners.get(key)?.forEach((cb) => cb());
}

function readRaw(key: string): string | null {
  // Reads can throw too (Safari lockdown mode, sandboxed iframes, blocked
  // site data) — a SecurityError during render would take the tree down.
  try {
    return window.localStorage.getItem(key);
  } catch (err) {
    logger.warn(`useLocalStorage: failed to read "${key}"`, err);
    return null;
  }
}

function readSnapshot<T>(key: string, initialValue: T): T {
  const raw = readRaw(key);
  const cached = snapshotCache.get(key);
  if (cached && cached.raw === raw) return cached.value as T;

  let value: unknown = initialValue;
  if (raw !== null) {
    try {
      value = JSON.parse(raw) as unknown;
    } catch (err) {
      logger.warn(`useLocalStorage: failed to parse "${key}"`, err);
    }
  }
  snapshotCache.set(key, { raw, value });
  return value as T;
}

/**
 * Reactive wrapper around `localStorage` built on `useSyncExternalStore`:
 * - SSR-safe — renders `initialValue` on the server and during hydration
 *   (React uses `getServerSnapshot` until hydration completes), then
 *   switches to the stored value. Components mounted AFTER hydration read
 *   storage on their first render; components in the initial HTML may show
 *   `initialValue` for one frame — gate on a mounted flag if that matters.
 * - Same-tab sync — two components with the same key see each other's writes.
 * - Cross-tab sync via the `storage` event, including removal/`clear()`.
 * - JSON serialization.
 *
 * `initialValue` is captured on first render — pass a literal freely, later
 * changes to it are ignored (this is what makes object defaults safe).
 *
 * @example
 * const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
 */
export function useLocalStorage<T>(key: string, initialValue: T): readonly [T, Setter<T>] {
  const initialRef = useRef(initialValue);

  const subscribe = useCallback(
    (callback: () => void) => {
      let set = keyListeners.get(key);
      if (!set) {
        set = new Set();
        keyListeners.set(key, set);
      }
      set.add(callback);

      const onStorage = (e: StorageEvent) => {
        // `key === null` means storage.clear(); the storageArea guard skips
        // sessionStorage events.
        if (e.storageArea === window.localStorage && (e.key === key || e.key === null)) {
          callback();
        }
      };
      window.addEventListener('storage', onStorage);

      return () => {
        set.delete(callback);
        if (set.size === 0) keyListeners.delete(key);
        window.removeEventListener('storage', onStorage);
      };
    },
    [key],
  );

  const getSnapshot = useCallback(() => readSnapshot(key, initialRef.current), [key]);
  const getServerSnapshot = useCallback(() => initialRef.current, []);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const set: Setter<T> = useCallback(
    (v) => {
      const prev = readSnapshot(key, initialRef.current);
      const next = typeof v === 'function' ? (v as (p: T) => T)(prev) : v;
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch (err) {
        logger.warn(`useLocalStorage: failed to write "${key}"`, err);
      }
      emit(key);
    },
    [key],
  );

  return [value, set] as const;
}
