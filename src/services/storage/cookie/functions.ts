import { logger } from '@/utils/logger';

const isClient = typeof window !== 'undefined';

/** Escape special regex characters in a string */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Client-side cookie storage adapter with JSON serialization.
 *
 * Uses `document.cookie` — all cookies are accessible to JavaScript.
 * **Limitation:** `HttpOnly` flag cannot be set from client-side code.
 * For sensitive data (auth tokens, session IDs), use server-side cookies
 * via Next.js `cookies()` from `next/headers` instead.
 *
 * Features:
 * - SSR-safe (returns fallback on server)
 * - Auto-sets `SameSite=Lax` and `Secure` on HTTPS
 * - JSON serialization with BigInt support
 *
 * @example
 * import { customCookieStorage } from '@/services/storage';
 *
 * // Set a cookie (expires in 7 days)
 * customCookieStorage.set('preferences', { theme: 'dark' }, {
 *   maxAge: 60 * 60 * 24 * 7,
 * });
 *
 * // Get with typed fallback
 * const prefs = customCookieStorage.get('preferences', { theme: 'light' });
 *
 * // Remove
 * customCookieStorage.remove('preferences');
 */

export const customCookieStorage = {
  get<T>(name: string, fallback: T): T {
    if (!isClient) return fallback;

    try {
      const match = document.cookie.match(new RegExp('(^| )' + escapeRegExp(name) + '=([^;]+)'));
      if (!match?.[2]) return fallback;

      return JSON.parse(decodeURIComponent(match[2])) as T;
    } catch (err) {
      logger.error(`cookie.get: failed to parse ${name}`, err);

      return fallback;
    }
  },

  set(name: string, value: unknown, options?: { path?: string; expires?: Date; maxAge?: number }) {
    if (!isClient) return;

    try {
      const cookieValue = encodeURIComponent(
        JSON.stringify(value, (_k, v) => (typeof v === 'bigint' ? v.toString() : v)),
      );
      let cookieStr = `${name}=${cookieValue}`;

      cookieStr += `; path=${options?.path ?? '/'}`;
      cookieStr += '; SameSite=Lax';

      if (window.location.protocol === 'https:') {
        cookieStr += '; Secure';
      }

      if (options?.expires) cookieStr += `; expires=${options.expires.toUTCString()}`;
      if (options?.maxAge) cookieStr += `; max-age=${options.maxAge}`;

      document.cookie = cookieStr;
    } catch (err) {
      logger.error(`cookie.set: failed to save ${name}`, err);
    }
  },

  remove(name: string, path = '/') {
    if (!isClient) return;

    try {
      document.cookie = `${name}=; path=${path}; max-age=0`;
    } catch (err) {
      logger.error(`cookie.remove: failed to remove ${name}`, err);
    }
  },
};
