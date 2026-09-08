import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { withMinDelay } from '@/lib/withMinDelay';

describe('withMinDelay', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('holds a fast resolution until the floor passes', async () => {
    const settled = vi.fn();
    void withMinDelay(Promise.resolve('fast'), 300).then(settled);

    await vi.advanceTimersByTimeAsync(299);
    expect(settled).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(settled).toHaveBeenCalledExactlyOnceWith('fast');
  });

  it('does not add delay on top of a slow promise', async () => {
    const slow = new Promise<string>((resolve) => setTimeout(() => resolve('slow'), 500));
    const settled = vi.fn();
    void withMinDelay(slow, 300).then(settled);

    await vi.advanceTimersByTimeAsync(500);
    expect(settled).toHaveBeenCalledExactlyOnceWith('slow');
  });

  it('re-throws failures only AFTER the floor', async () => {
    const failed = vi.fn();
    const boom = new Error('boom');
    // Attach the catch immediately so the rejection is never unhandled.
    void withMinDelay(Promise.reject(boom), 300).catch(failed);

    await vi.advanceTimersByTimeAsync(299);
    expect(failed).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(failed).toHaveBeenCalledExactlyOnceWith(boom);
  });
});
