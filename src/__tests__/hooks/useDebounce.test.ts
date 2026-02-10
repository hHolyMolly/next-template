import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/hooks/useDebounce';

describe('useDebounce', () => {
  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('debounces value updates', () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'hello' },
    });

    rerender({ value: 'world' });
    expect(result.current).toBe('hello');

    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe('world');

    vi.useRealTimers();
  });

  it('cancels previous timer on rapid updates', () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 200), {
      initialProps: { value: 'a' },
    });

    rerender({ value: 'b' });
    act(() => vi.advanceTimersByTime(100));
    rerender({ value: 'c' });
    act(() => vi.advanceTimersByTime(200));

    expect(result.current).toBe('c');

    vi.useRealTimers();
  });
});
