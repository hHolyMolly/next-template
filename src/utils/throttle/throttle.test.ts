import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { throttle } from '@/utils/throttle';

describe('throttle', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('fires immediately on the leading edge', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled('a');
    expect(fn).toHaveBeenCalledExactlyOnceWith('a');
  });

  it('coalesces calls inside the window into one trailing call with latest args', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled('lead');
    throttled('mid');
    throttled('last');
    expect(fn).toHaveBeenCalledOnce();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith('last');
  });

  it('allows a new leading call after the window passes', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled(1);
    vi.advanceTimersByTime(150);
    throttled(2);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('cancel() drops the pending trailing call', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled('lead');
    throttled('trail');
    throttled.cancel();
    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledExactlyOnceWith('lead');
  });
});
