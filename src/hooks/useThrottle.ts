'use client';

import { useCallback, useEffect, useRef } from 'react';

/**
 * Throttle a callback to at most once per `delay` ms (leading + trailing edge).
 *
 * @example
 * const onScroll = useThrottle(() => setY(window.scrollY), 100);
 * useEventListener('scroll', onScroll);
 */
export function useThrottle<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay: number,
): (...args: Args) => void {
  const fnRef = useRef(fn);
  const lastCall = useRef(0);
  const trailing = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  useEffect(
    () => () => {
      if (trailing.current) clearTimeout(trailing.current);
    },
    [],
  );

  return useCallback(
    (...args: Args) => {
      const now = Date.now();
      const remaining = delay - (now - lastCall.current);

      if (remaining <= 0) {
        lastCall.current = now;
        fnRef.current(...args);
        return;
      }

      if (trailing.current) clearTimeout(trailing.current);
      trailing.current = setTimeout(() => {
        lastCall.current = Date.now();
        fnRef.current(...args);
      }, remaining);
    },
    [delay],
  );
}
