'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Хук для отслеживания media query.
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/**
 * Хук для debounce значения.
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
 * Хук для отслеживания кликов вне элемента.
 *
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * useClickOutside(ref, () => setIsOpen(false));
 */
export function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: (event: MouseEvent | TouchEvent) => void,
): void {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

/**
 * Хук для блокировки скролла страницы.
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

/**
 * Хук для переключения boolean-значения.
 *
 * @example
 * const [isOpen, toggle, setIsOpen] = useToggle(false);
 */
export function useToggle(
  initialValue = false,
): [boolean, () => void, React.Dispatch<React.SetStateAction<boolean>>] {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => setValue((prev) => !prev), []);
  return [value, toggle, setValue];
}
