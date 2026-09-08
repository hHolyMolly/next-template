'use client';

import { type RefObject, useEffect, useState } from 'react';

type Options = IntersectionObserverInit & {
  /** Disconnect after the first intersection (useful for lazy loading). */
  freezeOnceVisible?: boolean;
};

type IntersectionResult = {
  entry: IntersectionObserverEntry | null;
  isIntersecting: boolean;
};

/**
 * Subscribe to `IntersectionObserver` for a ref'd element.
 *
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * const { isIntersecting } = useIntersectionObserver(ref, { threshold: 0.2 });
 */
export function useIntersectionObserver<T extends Element>(
  ref: RefObject<T | null>,
  { freezeOnceVisible = false, root = null, rootMargin, threshold }: Options = {},
): IntersectionResult {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const frozen = (entry?.isIntersecting ?? false) && freezeOnceVisible;

  // `threshold` may be an inline array literal — a fresh reference every
  // render. Key the effect on its VALUE so the observer isn't torn down
  // and recreated each render.
  const thresholdKey = JSON.stringify(threshold);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- thresholdKey stands in for threshold
  }, [ref, root, rootMargin, thresholdKey, frozen]);

  return { entry, isIntersecting: entry?.isIntersecting ?? false };
}
