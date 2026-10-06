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
 * Transport: the axios `request()` helper (`instance.ts`) for the external
 * backend and for own routes alike. URL resolution goes through `http.ts`:
 * `resolveAppUrl()` for own routes (absolute, so axios never glues them onto
 * the backend `baseURL`), `resolveApiUrl()` / `API_PATHS` for the backend.
 * Server-side prefetch of your OWN data: never self-fetch the /api route —
 * prefetch with the same `queryKey` and the underlying function as `queryFn`
 * (`{ ...healthQuery, queryFn: getHealth }` in `[locale]/page.tsx`). Consume
 * a pending-dehydrated query with `useSuspenseQuery` (see HealthStatus).
 */

import { queryOptions } from '@tanstack/react-query';

import { STALE_TIMES } from '@/lib/queryClient';
import { resolveAppUrl } from '@/services/api/http';
import { request } from '@/services/api/instance';

// ---------- DTO ----------------------------------------------------------------

export type HealthResponse = {
  status: 'ok';
  timestamp: string;
  uptimeSeconds: number;
};

// ---------- Queries ------------------------------------------------------------

export const healthQuery = queryOptions({
  queryKey: ['health'] as const,
  // Own route → absolute app URL (axios ignores `baseURL` for absolute URLs).
  // TanStack's `signal` is forwarded so unmount/refetch cancels the request.
  queryFn: ({ signal }) =>
    request<HealthResponse>({ url: resolveAppUrl('/api/health'), method: 'GET' }, signal),
  staleTime: STALE_TIMES.dynamic,
});
