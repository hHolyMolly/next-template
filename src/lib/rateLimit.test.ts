import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createRateLimiter, resolveClientIp } from '@/lib/rateLimit';

describe('createRateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it('allows requests up to the limit and blocks the next one', async () => {
    const check = createRateLimiter({ limit: 3, windowSeconds: 60 });

    for (let i = 0; i < 3; i++) {
      const result = await check('1.1.1.1');
      expect(result.success).toBe(true);
    }

    const blocked = await check('1.1.1.1');
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it('tracks budgets per IP independently', async () => {
    const check = createRateLimiter({ limit: 1, windowSeconds: 60 });

    expect((await check('1.1.1.1')).success).toBe(true);
    expect((await check('2.2.2.2')).success).toBe(true);
    expect((await check('1.1.1.1')).success).toBe(false);
  });

  it('resets the budget after the window passes', async () => {
    const check = createRateLimiter({ limit: 1, windowSeconds: 60 });

    expect((await check('1.1.1.1')).success).toBe(true);
    expect((await check('1.1.1.1')).success).toBe(false);

    vi.advanceTimersByTime(61_000);

    expect((await check('1.1.1.1')).success).toBe(true);
  });

  it('reports remaining correctly', async () => {
    const check = createRateLimiter({ limit: 5, windowSeconds: 60 });

    expect((await check('1.1.1.1')).remaining).toBe(4);
    expect((await check('1.1.1.1')).remaining).toBe(3);
  });
});

describe('resolveClientIp', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('falls back to x-real-ip when TRUSTED_PROXY_HOPS is unset', () => {
    const headers = new Headers({ 'x-real-ip': '9.9.9.9', 'x-forwarded-for': '6.6.6.6' });
    expect(resolveClientIp(headers)).toBe('9.9.9.9');
  });

  it('takes the rightmost XFF hop when TRUSTED_PROXY_HOPS=1', () => {
    vi.stubEnv('TRUSTED_PROXY_HOPS', '1');
    const headers = new Headers({ 'x-forwarded-for': 'spoofed, 8.8.8.8' });
    expect(resolveClientIp(headers)).toBe('8.8.8.8');
  });

  it('defaults to localhost with no headers', () => {
    expect(resolveClientIp(new Headers())).toBe('127.0.0.1');
  });
});
