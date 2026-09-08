import { urls } from '@/configs/constants/urls';
import { isAbsoluteUrl } from '@/lib/origin';

/**
 * Centralized API path catalog. Keep every endpoint here so call sites stay
 * grep-able and refactors require a single touch point.
 *
 * Conventions:
 * - Static collections → string literals (`'/users'`).
 * - Dynamic resources → function returning a path (`user: (id) => \`/users/${id}\``).
 * - Group by resource. Sort alphabetically within a group.
 */
const API_PATHS = {
  // Example resource — replace with your own.
  todos: '/todos',
  todo: (id: string | number) => `/todos/${id}`,
} as const;

/** Shared request timeout policy (axios instance + serverFetch). */
export const DEFAULT_TIMEOUT_MS = 15_000;

/**
 * Resolve a path against the right base — the ONE rule for building request
 * URLs, shared by `serverFetch`, `queries.ts` and anything else that fetches.
 *
 * - Absolute URLs pass through untouched.
 * - External API paths use `NEXT_PUBLIC_SERVER_URL` when configured.
 * - Same-app paths (`/api/...`): relative in the browser; on the server
 *   (SSR prefetch) relative URLs cannot resolve, so the site's own absolute
 *   URL is used.
 */
export function resolveApiUrl(path: string): string {
  if (isAbsoluteUrl(path)) return path;

  if (urls.server.api) return `${urls.server.api}${path}`;

  return typeof window === 'undefined' ? `${urls.website}${path}` : path;
}

export default API_PATHS;
