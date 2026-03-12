'use client';

import { useEffect, useLayoutEffect } from 'react';

/**
 * SSR-safe replacement for `useLayoutEffect`.
 * Uses `useLayoutEffect` on the client and `useEffect` on the server
 * to suppress React's SSR warning.
 *
 * @example
 * useIsomorphicLayoutEffect(() => {
 *   // Measure DOM elements, synchronize with layout, etc.
 * }, [dependency]);
 */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
