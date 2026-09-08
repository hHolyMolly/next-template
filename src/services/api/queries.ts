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
 *
 * URL resolution goes through `resolveApiUrl` (paths.ts) — the same rule
 * `serverFetch` uses. Note: SSR-prefetching your OWN /api routes is a
 * self-fetch (an extra HTTP round-trip into the same server); prefer calling
 * the underlying function directly when the data source lives in this app.
 */

import { queryOptions } from '@tanstack/react-query';

import { STALE_TIMES } from '@/lib/queryClient';
import { resolveApiUrl } from '@/services/api/paths';

// ---------- DTO ----------------------------------------------------------------

export type HealthResponse = {
  status: 'ok';
  timestamp: string;
  uptimeSeconds: number;
};

// ---------- Queries ------------------------------------------------------------

export const healthQuery = queryOptions({
  queryKey: ['health'] as const,
  queryFn: async ({ signal }): Promise<HealthResponse> => {
    const response = await fetch(resolveApiUrl('/api/health'), { signal });
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    return (await response.json()) as HealthResponse;
  },
  staleTime: STALE_TIMES.dynamic,
});
