import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Утилита для объединения CSS-классов.
 * Обёртка над `clsx` + `tailwind-merge` для корректного мёржа Tailwind-классов.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
