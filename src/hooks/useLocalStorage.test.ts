import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { useLocalStorage } from '@/hooks/useLocalStorage';

describe('useLocalStorage', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it('returns the initial value when storage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'fallback'));
    expect(result.current[0]).toBe('fallback');
  });

  it('hydrates from an existing stored value', () => {
    window.localStorage.setItem('key', JSON.stringify('stored'));
    const { result } = renderHook(() => useLocalStorage('key', 'fallback'));
    expect(result.current[0]).toBe('stored');
  });

  it('persists updates to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('key', 0));

    act(() => {
      result.current[1](42);
    });

    expect(result.current[0]).toBe(42);
    expect(window.localStorage.getItem('key')).toBe('42');
  });

  it('supports functional updates', () => {
    const { result } = renderHook(() => useLocalStorage('count', 1));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(2);
  });

  it('is stable with an object initialValue (no re-render loop)', () => {
    // Passing a fresh object literal every render used to loop forever;
    // the snapshot must stay referentially stable.
    const { result, rerender } = renderHook(() => useLocalStorage('obj', { a: 1 }));

    const first = result.current[0];
    rerender();
    expect(result.current[0]).toBe(first);
  });

  it('keeps two instances with the same key in sync (same tab)', () => {
    const { result: a } = renderHook(() => useLocalStorage('shared', 0));
    const { result: b } = renderHook(() => useLocalStorage('shared', 0));

    act(() => {
      a.current[1](7);
    });

    expect(b.current[0]).toBe(7);
  });

  it('reacts to cross-tab storage events, including removal', () => {
    const { result } = renderHook(() => useLocalStorage('xtab', 'initial'));

    act(() => {
      window.localStorage.setItem('xtab', JSON.stringify('from-other-tab'));
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'xtab',
          newValue: JSON.stringify('from-other-tab'),
          storageArea: window.localStorage,
        }),
      );
    });
    expect(result.current[0]).toBe('from-other-tab');

    act(() => {
      window.localStorage.removeItem('xtab');
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'xtab',
          newValue: null,
          storageArea: window.localStorage,
        }),
      );
    });
    // Removal falls back to the initial value — not the stale one.
    expect(result.current[0]).toBe('initial');
  });
});
