import { cache } from 'react';
import { QueryClient } from '@tanstack/react-query';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
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
