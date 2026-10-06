import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createApiRateLimit,
  createRateLimiter,
  rateLimitHeaders,
  rateLimitResponse,
  resolveClientIp,
} from '@/lib/rateLimit';

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

  it('keeps stores isolated between limiter instances', () => {
    const a = createRateLimiter({ limit: 1, windowSeconds: 60 });
    const b = createRateLimiter({ limit: 1, windowSeconds: 60 });

    expect(a('1.1.1.1').success).toBe(true);
    expect(b('1.1.1.1').success).toBe(true);
    expect(a('1.1.1.1').success).toBe(false);
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

  it('defaults to localhost with no headers outside production', () => {
    expect(resolveClientIp(new Headers())).toBe('127.0.0.1');
  });

  it('returns null in production when no trustworthy identity exists', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(resolveClientIp(new Headers())).toBeNull();
  });

  it('never trusts XFF when the chain is shorter than the configured hops', () => {
    vi.stubEnv('TRUSTED_PROXY_HOPS', '3');
    // Only 1 entry for 3 hops — the value is attacker-controlled, so it
    // must fall through to x-real-ip.
    const headers = new Headers({ 'x-forwarded-for': 'spoofed', 'x-real-ip': '9.9.9.9' });
    expect(resolveClientIp(headers)).toBe('9.9.9.9');
  });

  it('ignores malformed TRUSTED_PROXY_HOPS values', () => {
    vi.stubEnv('TRUSTED_PROXY_HOPS', 'abc');
    const headers = new Headers({ 'x-forwarded-for': '6.6.6.6', 'x-real-ip': '9.9.9.9' });
    expect(resolveClientIp(headers)).toBe('9.9.9.9');
  });

  it('rejects junk that does not look like an IP', () => {
    vi.stubEnv('TRUSTED_PROXY_HOPS', '1');
    vi.stubEnv('NODE_ENV', 'production');
    const headers = new Headers({ 'x-forwarded-for': '<script>alert(1)</script>' });
    expect(resolveClientIp(headers)).toBeNull();
  });

  it('accepts a NextRequest as the source', () => {
    vi.stubEnv('TRUSTED_PROXY_HOPS', '1');
    const request = new NextRequest('https://example.com/api', {
      headers: { 'x-forwarded-for': '8.8.8.8' },
    });
    expect(resolveClientIp(request)).toBe('8.8.8.8');
  });
});

describe('createApiRateLimit', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('skips limiting (success) when identity is unknown in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const check = createApiRateLimit({ limit: 1, windowSeconds: 60 });
    const request = new NextRequest('https://example.com/api');

    // Without identity every request passes — no shared-bucket self-DoS.
    expect(check(request).success).toBe(true);
    expect(check(request).success).toBe(true);
  });
});

describe('rateLimitHeaders / rateLimitResponse', () => {
  it('emits X-RateLimit-Reset in epoch SECONDS plus Retry-After', () => {
    const resetAt = Date.now() + 30_000;
    const headers = rateLimitHeaders({ success: false, limit: 5, remaining: 0, resetAt });

    expect(headers['X-RateLimit-Reset']).toBe(String(Math.ceil(resetAt / 1000)));
    expect(Number(headers['Retry-After'])).toBeGreaterThanOrEqual(29);
    expect(Number(headers['Retry-After'])).toBeLessThanOrEqual(31);
    expect(headers['X-RateLimit-Limit']).toBe('5');
  });

  it('builds a 429 with the shared error envelope', async () => {
    const response = rateLimitResponse({
      success: false,
      limit: 5,
      remaining: 0,
      resetAt: Date.now() + 1000,
    });

    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBeTruthy();
    const body = (await response.json()) as { error: { code: string; message: string } };
    expect(body.error.code).toBe('RATE_LIMITED');
  });
});

describe('checkIdentity', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  async function load() {
    vi.resetModules();
    const [{ checkIdentity, createRateLimiter }, { logger }] = await Promise.all([
      import('@/lib/rateLimit'),
      import('@/utils/logger'),
    ]);
    return { checkIdentity, createRateLimiter, logger };
  }

  it('runs the limiter for a resolved identity', async () => {
    const { checkIdentity, createRateLimiter } = await load();
    const check = createRateLimiter({ limit: 5, windowSeconds: 60 });
    const req = new NextRequest('http://localhost/x', { headers: { 'x-real-ip': '1.1.1.1' } });

    const outcome = checkIdentity(req, check, { scope: 'page' });
    expect(outcome).toMatchObject({ kind: 'checked', ip: '1.1.1.1' });
    if (outcome.kind === 'checked') expect(outcome.result.remaining).toBe(4);
  });

  it('skips with reason "bypass" for an explicit bypass set', async () => {
    const { checkIdentity, createRateLimiter } = await load();
    const check = createRateLimiter({ limit: 1, windowSeconds: 60 });
    const req = new NextRequest('http://localhost/x', { headers: { 'x-real-ip': '7.7.7.7' } });

    const outcome = checkIdentity(req, check, { scope: 'api', bypass: new Set(['7.7.7.7']) });
    expect(outcome).toEqual({ kind: 'skipped', reason: 'bypass' });
  });

  it('warns once PER SCOPE when identity is unknown in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const { checkIdentity, createRateLimiter, logger } = await load();
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => {});
    const check = createRateLimiter({ limit: 1, windowSeconds: 60 });
    const req = new NextRequest('http://localhost/x');

    expect(checkIdentity(req, check, { scope: 'page' })).toEqual({
      kind: 'skipped',
      reason: 'no-identity',
    });
    checkIdentity(req, check, { scope: 'page' });
    checkIdentity(req, check, { scope: 'api' });
    checkIdentity(req, check, { scope: 'api' });

    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn).toHaveBeenNthCalledWith(1, expect.stringContaining('[page]'));
    expect(warn).toHaveBeenNthCalledWith(2, expect.stringContaining('[api]'));
  });
});
