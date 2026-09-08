'use client';

import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';

type BodyStyleSnapshot = {
  overflow: string;
  paddingRight: string;
  position: string;
  top: string;
  left: string;
  right: string;
  width: string;
};

// Module-level lock counter: nested consumers (modal opening a drawer)
// each take a lock; body styles are applied on the first and restored on
// the last, so an inner unlock can't unfreeze the page early.
let lockCount = 0;
let savedStyles: BodyStyleSnapshot | null = null;
let savedScrollY = 0;

function applyLock() {
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  savedScrollY = window.scrollY;

  const { style } = document.body;
  savedStyles = {
    overflow: style.overflow,
    paddingRight: style.paddingRight,
    position: style.position,
    top: style.top,
    left: style.left,
    right: style.right,
    width: style.width,
  };

  // iOS Safari requires position: fixed to prevent background scroll
  style.overflow = 'hidden';
  style.position = 'fixed';
  style.top = `-${savedScrollY}px`;
  style.left = '0';
  style.right = '0';
  style.width = '100%';

  if (scrollbarWidth > 0) {
    style.paddingRight = `${scrollbarWidth}px`;
  }
}

function releaseLock() {
  if (!savedStyles) return;
  Object.assign(document.body.style, savedStyles);
  savedStyles = null;

  // Restore scroll position after unlocking
  window.scrollTo(0, savedScrollY);
}

/**
 * Hook for locking page scroll.
 * Handles scrollbar width compensation, iOS Safari quirks, and nested
 * consumers (reference-counted — the page unlocks when the LAST lock goes).
 *
 * Don't combine with Radix Dialog/Sheet — Radix manages body scroll itself
 * and the two would fight over `document.body.style`.
 *
 * @example
 * useScrollLock(isModalOpen);
 */
export function useScrollLock(isLocked: boolean): void {
  // Layout effect: styles must apply before paint, or the page visibly
  // jumps when the lock repositions the body.
  useIsomorphicLayoutEffect(() => {
    if (!isLocked) return;

    lockCount += 1;
    if (lockCount === 1) applyLock();

    return () => {
      lockCount -= 1;
      if (lockCount === 0) releaseLock();
    };
  }, [isLocked]);
}
