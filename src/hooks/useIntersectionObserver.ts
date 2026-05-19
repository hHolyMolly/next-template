'use client';

import { type RefObject, useEffect, useState } from 'react';

type Options = IntersectionObserverInit & {
  /** Disconnect after the first intersection (useful for lazy loading). */
  freezeOnceVisible?: boolean;
};

/**
 * Subscribe to `IntersectionObserver` for a ref'd element.
 *
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * const entry = useIntersectionObserver(ref, { threshold: 0.2 });
 * const isVisible = !!entry?.isIntersecting;
 */
export function useIntersectionObserver<T extends Element>(
  ref: RefObject<T | null>,
  { freezeOnceVisible = false, root = null, rootMargin, threshold }: Options = {},
): IntersectionObserverEntry | null {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const frozen = entry?.isIntersecting && freezeOnceVisible;

  useEffect(() => {
    const node = ref.current;
    if (!node || frozen || typeof IntersectionObserver === 'undefined') return;

    const init: IntersectionObserverInit = { root };
    if (rootMargin !== undefined) init.rootMargin = rootMargin;
    if (threshold !== undefined) init.threshold = threshold;

    const observer = new IntersectionObserver(([next]) => {
      if (next) setEntry(next);
    }, init);

    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, root, rootMargin, threshold, frozen]);

  return entry;
}
