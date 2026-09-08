import { describe, expect, it, vi } from 'vitest';

import { patchCache } from '@/lib/patchCache';

describe('patchCache', () => {
  it('runs the patch function', () => {
    const fn = vi.fn();
    patchCache('test', fn);
    expect(fn).toHaveBeenCalledOnce();
  });

  it('swallows updater errors so a successful mutation stays successful', () => {
    expect(() =>
      patchCache('test', () => {
        throw new Error('bug in updater');
      }),
    ).not.toThrow();
  });
});
