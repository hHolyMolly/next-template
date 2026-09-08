import { QueryClient } from '@tanstack/react-query';
import { cache } from 'react';

/**
 * Query stale times by data category.
 * Override per-query with `staleTime` option.
 */
export const STALE_TIMES = {
  /** Rarely changing data (config, settings) */
  static: 10 * 60 * 1000,
  /** Standard API data (lists, details) */
  standard: 60 * 1000,
  /** Frequently changing data (notifications, counters) */
  dynamic: 10 * 1000,
  /** Real-time data — always refetch */
  realtime: 0,
} as const;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIMES.standard,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
        // TanStack's default networkMode 'online' PAUSES requests while the
        // browser thinks it's offline — the promise neither resolves nor
        // rejects, so screens hold skeletons forever and submits spin
        // silently. 'always' lets the request fail fast (every error path
        // already handles it) and `refetchOnReconnect` recovers when the
        // network returns.
        networkMode: 'always',
      },
      mutations: {
        networkMode: 'always',
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * Returns a QueryClient instance.
 * On the server — deduplicates via React.cache() per request.
 * On the client — reuses the same singleton instance.
 *
 * `React.cache()` only works inside the React render path (Server
 * Components, generateMetadata). Calling `getQueryClient()` from a Route
 * Handler or Server Action creates a fresh client per call — fine for
 * one-off prefetching, but don't expect cross-call sharing there.
 */
const getServerQueryClient = cache(() => makeQueryClient());

export function getQueryClient() {
  if (typeof window === 'undefined') {
    return getServerQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
