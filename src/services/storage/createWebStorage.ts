import { logger } from '@/utils/logger';

const isClient = typeof window !== 'undefined';

type WebStorageAdapter = {
  get<T>(key: string, fallback: T): T;
  set(key: string, value: unknown): boolean;
  remove(key: string): void;
};

const bigintReplacer = (_: string, v: unknown) => (typeof v === 'bigint' ? v.toString() : v);

/**
 * Creates a type-safe wrapper around `localStorage` or `sessionStorage`.
 *
 * Both adapters share the same logic; only the underlying `Storage` differs.
 *
 * @example
 * const local  = createWebStorage(() => window.localStorage);
 * const session = createWebStorage(() => window.sessionStorage);
 */
export function createWebStorage(getStorage: () => Storage): WebStorageAdapter {
  return {
    get<T>(key: string, fallback: T): T {
      if (!isClient) return fallback;

      try {
        const raw = getStorage().getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (err) {
        logger.error(`storage.get: failed to parse ${key}`, err);
        return fallback;
      }
    },

    set(key: string, value: unknown): boolean {
      if (!isClient) return false;

      try {
        getStorage().setItem(key, JSON.stringify(value, bigintReplacer));
        return true;
      } catch (err) {
        if (err instanceof DOMException && err.name === 'QuotaExceededError') {
          logger.error(
            `storage.set: QuotaExceededError for "${key}". Storage is full.`,
          );
        } else {
          logger.error(`storage.set: failed to save ${key}`, err);
        }
        return false;
      }
    },

    remove(key: string) {
      if (!isClient) return;

      try {
        getStorage().removeItem(key);
      } catch (err) {
        logger.error(`storage.remove: failed to remove ${key}`, err);
      }
    },
  };
}
