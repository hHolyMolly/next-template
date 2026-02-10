'use client';

import { useEffect } from 'react';

/**
 * Hook for locking page scroll.
 *
 * @example
 * useScrollLock(isModalOpen);
 */
export function useScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (!isLocked) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isLocked]);
}
