/**
 * TanStack Query definitions.
 *
 * This file is the canonical example for adding a new API resource:
 *   1. Define the response DTO type.
 *   2. Build the query with `queryOptions()` — one definition reused by
 *      `useQuery` on the client AND `prefetchQuery` on the server
 *      (see `src/app/[locale]/page.tsx` for the SSR + HydrationBoundary flow).
 *   3. Pick a `staleTime` from `STALE_TIMES` in `@/lib/queryClient`.
 *
 * All API I/O in the app should go through TanStack Query — never fetch
 * directly from a component. That guarantees a single cache, automatic
 * deduplication, devtools insight, and consistent loading states.
 */

import { queryOptions } from '@tanstack/react-query';

import { urls } from '@/configs/constants/urls';
import { STALE_TIMES } from '@/lib/queryClient';

// ---------- DTO ----------------------------------------------------------------

export type HealthResponse = {
  status: 'ok';
  timestamp: string;
  uptimeSeconds: number;
};

// ---------- Queries ------------------------------------------------------------

/**
 * On the server (SSR prefetch) relative URLs don't resolve — use the
 * absolute site URL there and a same-origin relative path in the browser.
 */
const apiBase = () => (typeof window === 'undefined' ? urls.website : '');

export const healthQuery = queryOptions({
  queryKey: ['health'] as const,
  queryFn: async ({ signal }): Promise<HealthResponse> => {
    const response = await fetch(`${apiBase()}/api/health`, { signal });
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    return (await response.json()) as HealthResponse;
  },
  staleTime: STALE_TIMES.dynamic,
});
