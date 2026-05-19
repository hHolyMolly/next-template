'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { debounce } from '@/utils/debounce';

/**
 * Debounce a changing value. `debounced` updates after `delay` ms of silence.
 *
 * @example
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebounce(search, 300);
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Debounce a callback. The returned function is stable across renders
 * and always calls the latest version of the wrapped callback.
 *
 * @example
 * const onSearch = useDebouncedCallback((q: string) => fetch(q), 300);
 * <input onChange={(e) => onSearch(e.target.value)} />
 */
export function useDebouncedCallback<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay: number,
): (...args: Args) => void {
  const fnRef = useRef(fn);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const debounced = useRef(
    // eslint-disable-next-line react-hooks/refs -- ref accessed at call time, not render.
    debounce((...args: Args) => fnRef.current(...args), delay),
  );

  return useCallback((...args: Args) => debounced.current(...args), []);
}
