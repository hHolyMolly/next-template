export type Throttled<Args extends unknown[]> = ((...args: Args) => void) & {
  /** Drop the pending trailing call, if any. */
  cancel: () => void;
};

/**
 * Creates a throttled wrapper for a function: at most one call per `delay`
 * ms, firing on the leading edge and once more on the trailing edge with
 * the latest arguments.
 *
 * Call `cancel()` on cleanup (unmount) so a pending trailing timer never
 * fires into dead code.
 */
export function throttle<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay: number,
): Throttled<Args> {
  let lastCall = 0;
  let trailing: ReturnType<typeof setTimeout> | undefined;

  const throttled = (...args: Args) => {
    const now = Date.now();
    const remaining = delay - (now - lastCall);

    if (remaining <= 0) {
      lastCall = now;
      fn(...args);
      return;
    }

    clearTimeout(trailing);
    trailing = setTimeout(() => {
      trailing = undefined;
      lastCall = Date.now();
      fn(...args);
    }, remaining);
  };

  throttled.cancel = () => {
    clearTimeout(trailing);
    trailing = undefined;
  };

  return throttled;
}
