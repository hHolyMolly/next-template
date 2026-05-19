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
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * Returns a QueryClient instance.
 * On the server — deduplicates via React.cache() per request.
 * On the client — reuses the same singleton instance.
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
