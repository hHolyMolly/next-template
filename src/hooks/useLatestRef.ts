'use client';

import { useEffect, useRef } from 'react';

import type { RefObject } from 'react';

/**
 * Keep a ref pointing at the latest value without retriggering effects.
 *
 * The standard pattern for "stable callback identity, fresh closure":
 * event-listener and timer hooks read `ref.current` at CALL time instead of
 * closing over a stale render's value.
 *
 * @example
 * const savedHandler = useLatestRef(handler);
 * useEffect(() => {
 *   const listener = (e: Event) => savedHandler.current(e);
 *   target.addEventListener(event, listener);
 *   return () => target.removeEventListener(event, listener);
 * }, [event, target]);
 */
export function useLatestRef<T>(value: T): RefObject<T> {
  const ref = useRef(value);

  // Assigned in an effect (not during render) to stay concurrent-safe.
  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
}
