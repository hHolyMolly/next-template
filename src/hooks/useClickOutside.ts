'use client';

import { useEffect, useCallback } from 'react';

/**
 * Hook for tracking clicks outside an element.
 * Handler is memoized via useCallback so parent doesn't need useCallback.
 *
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * useClickOutside(ref, () => setIsOpen(false));
 */
export function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: (event: MouseEvent | TouchEvent) => void,
): void {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableHandler = useCallback(handler, []);

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      stableHandler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, stableHandler]);
}
