import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { debounce } from '@/utils/debounce';

describe('debounce', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('fires once on the trailing edge with the latest args', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced(1);
    debounced(2);
    debounced(3);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledExactlyOnceWith(3);
  });

  it('restarts the timer on each call', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    vi.advanceTimersByTime(60);
    debounced();
    vi.advanceTimersByTime(60);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(40);
    expect(fn).toHaveBeenCalledOnce();
  });

  it('cancel() drops the pending call', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    debounced.cancel();
    vi.advanceTimersByTime(200);
    expect(fn).not.toHaveBeenCalled();
  });

  it('flush() runs the pending call immediately, once', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced('now');
    debounced.flush();
    expect(fn).toHaveBeenCalledExactlyOnceWith('now');

    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledOnce();

    debounced.flush(); // nothing pending — no extra call
    expect(fn).toHaveBeenCalledOnce();
  });
});
