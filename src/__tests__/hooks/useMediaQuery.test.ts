import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

describe('useMediaQuery', () => {
  let listeners: Map<string, Set<() => void>>;

  beforeEach(() => {
    listeners = new Map();

    vi.stubGlobal('matchMedia', (query: string) => {
      if (!listeners.has(query)) listeners.set(query, new Set());

      return {
        matches: query === '(max-width: 768px)',
        addEventListener: (_: string, cb: () => void) => listeners.get(query)!.add(cb),
        removeEventListener: (_: string, cb: () => void) => listeners.get(query)!.delete(cb),
      };
    });
  });

  it('returns true when media query matches', () => {
    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));
    expect(result.current).toBe(true);
  });

  it('returns false when media query does not match', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'));
    expect(result.current).toBe(false);
  });

  it('updates when query changes', () => {
    const { result, rerender } = renderHook(
      ({ query }: { query: string }) => useMediaQuery(query),
      { initialProps: { query: '(max-width: 768px)' } },
    );

    expect(result.current).toBe(true);

    rerender({ query: '(min-width: 1024px)' });
    expect(result.current).toBe(false);
  });

  it('responds to media query change events', () => {
    const query = '(max-width: 768px)';
    let currentMatches = true;

    vi.stubGlobal('matchMedia', (q: string) => {
      if (!listeners.has(q)) listeners.set(q, new Set());

      return {
        get matches() {
          return q === query ? currentMatches : false;
        },
        addEventListener: (_: string, cb: () => void) => listeners.get(q)!.add(cb),
        removeEventListener: (_: string, cb: () => void) => listeners.get(q)!.delete(cb),
      };
    });

    const { result } = renderHook(() => useMediaQuery(query));
    expect(result.current).toBe(true);

    act(() => {
      currentMatches = false;
      listeners.get(query)?.forEach((cb) => cb());
    });

    expect(result.current).toBe(false);
  });
});
