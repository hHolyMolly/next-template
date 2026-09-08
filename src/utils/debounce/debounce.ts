export type Debounced<Args extends unknown[]> = ((...args: Args) => void) & {
  /** Drop the pending trailing call, if any. */
  cancel: () => void;
  /** Run the pending trailing call immediately, if any. */
  flush: () => void;
};

/**
 * Creates a debounced wrapper for a function.
 * The call is delayed by `delay` ms after the last invocation.
 *
 * The returned function carries `cancel()`/`flush()` — call `cancel()` on
 * cleanup (unmount) so a pending timer never fires into dead code.
 */
export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay: number,
): Debounced<Args> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let lastArgs: Args | undefined;

  const debounced = (...args: Args) => {
    lastArgs = args;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      timeoutId = undefined;
      fn(...(lastArgs as Args));
    }, delay);
  };

  debounced.cancel = () => {
    clearTimeout(timeoutId);
    timeoutId = undefined;
  };

  debounced.flush = () => {
    if (timeoutId === undefined) return;
    debounced.cancel();
    fn(...(lastArgs as Args));
  };

  return debounced;
}
