/**
 * Создаёт debounce-обёртку для функции.
 * Вызов будет отложен на `delay` мс после последнего вызова.
 */
export function debounce<T extends (...args: Parameters<T>) => void>(fn: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout>;

  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }) as T;
}
