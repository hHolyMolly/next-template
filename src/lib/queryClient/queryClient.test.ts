import { dehydrate } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import { getQueryClient } from '@/lib/queryClient';

describe('getQueryClient (dehydration policy)', () => {
  it('dehydrates PENDING queries so an un-awaited server prefetch reaches the client', () => {
    const qc = getQueryClient();
    void qc.prefetchQuery({ queryKey: ['pending'], queryFn: () => new Promise<never>(() => {}) });

    const state = dehydrate(qc);
    const entry = state.queries.find((q) => q.queryKey[0] === 'pending');
    expect(entry).toBeDefined();
    expect(entry?.state.status).toBe('pending');
    // The in-flight promise travels with the entry — HydrationBoundary resolves it.
    expect(entry?.promise).toBeInstanceOf(Promise);
  });

  it('still dehydrates successful queries and drops errored ones', async () => {
    const qc = getQueryClient();
    await qc.prefetchQuery({ queryKey: ['ok'], queryFn: () => Promise.resolve(1) });
    await qc.prefetchQuery({
      queryKey: ['bad'],
      queryFn: () => Promise.reject(new Error('nope')),
      retry: false,
    });

    const keys = dehydrate(qc).queries.map((q) => q.queryKey[0]);
    expect(keys).toContain('ok');
    expect(keys).not.toContain('bad');
  });

  it('fails fast instead of pausing requests offline (networkMode: always)', () => {
    const defaults = getQueryClient().getDefaultOptions();
    expect(defaults.queries?.networkMode).toBe('always');
    expect(defaults.mutations?.networkMode).toBe('always');
  });
});
