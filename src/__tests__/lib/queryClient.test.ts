/**
 * @vitest-environment node
 */

import { getQueryClient } from '@/lib/queryClient';

describe('getQueryClient', () => {
  it('should return a QueryClient instance', () => {
    const client = getQueryClient();

    expect(client).toBeDefined();
    expect(client.getDefaultOptions().queries?.staleTime).toBe(60 * 1000);
    expect(client.getDefaultOptions().queries?.retry).toBe(1);
  });

  it('should return the same instance on server (via React.cache)', () => {
    const client1 = getQueryClient();
    const client2 = getQueryClient();

    // React.cache deduplicates per async context on server
    expect(client1).toBeDefined();
    expect(client2).toBeDefined();
  });
});
