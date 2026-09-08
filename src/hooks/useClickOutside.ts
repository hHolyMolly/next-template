'use client';

import { useEffect } from 'react';

import { useLatestRef } from '@/hooks/useLatestRef';

import type { RefObject } from 'react';

/**
 * Invoke a handler on pointer interaction outside the given element(s).
 *
 * - Single `pointerdown` listener — covers mouse, touch and pen without
 *   the double-fire of `mousedown` + `touchstart` on touch devices.
 * - Capture phase, so a `stopPropagation()` inside the page can't
 *   suppress the outside-close behavior.
 * - Accepts an array of refs for split UIs (dropdown panel + its trigger).
 *
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * useClickOutside(ref, () => setIsOpen(false), isOpen);
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null> | RefObject<T | null>[],
  handler: (event: PointerEvent) => void,
  enabled = true,
): void {
  const handlerRef = useLatestRef(handler);
  // The array wrapper may be a fresh literal each render — read it through
  // a ref at event time instead of keying the effect on it.
  const refsRef = useLatestRef(Array.isArray(ref) ? ref : [ref]);

  useEffect(() => {
    if (!enabled) return;

    const listener = (event: PointerEvent) => {
      const target = event.target as Node;
      const inside = refsRef.current.some((r) => r.current?.contains(target));
      if (!inside) handlerRef.current(event);
    };

    document.addEventListener('pointerdown', listener, true);
    return () => document.removeEventListener('pointerdown', listener, true);
  }, [enabled, handlerRef, refsRef]);
}
