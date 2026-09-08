import { NextRequest, NextResponse } from 'next/server';
import { describe, expect, it } from 'vitest';

import { NotFoundError } from '@/lib/errors';
import type { RateLimitResult } from '@/lib/rateLimit';
import { withApiHandler } from '@/lib/withApiHandler';

function makeRequest(origin?: string): NextRequest {
  const headers = new Headers();
  if (origin) headers.set('origin', origin);
  return new NextRequest('https://api.example.com/echo', { headers });
}

const okRate: RateLimitResult = {
  success: true,
  limit: 5,
  remaining: 4,
  resetAt: Date.now() + 60_000,
};
const blockedRate: RateLimitResult = { ...okRate, success: false, remaining: 0 };

describe('withApiHandler', () => {
  it('passes through the handler response', async () => {
    const handle = withApiHandler({ handler: () => NextResponse.json({ ok: true }) });
    const res = await handle(makeRequest());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it('attaches X-RateLimit-* headers to successful responses', async () => {
    const handle = withApiHandler({
      rateLimit: () => okRate,
      handler: () => NextResponse.json({ ok: true }),
    });
    const res = await handle(makeRequest());
    expect(res.headers.get('X-RateLimit-Limit')).toBe('5');
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('4');
    expect(res.headers.get('X-RateLimit-Reset')).toBe(String(Math.ceil(okRate.resetAt / 1000)));
  });

  it('returns 429 WITH Retry-After and X-RateLimit-* when blocked', async () => {
    const handle = withApiHandler({
      rateLimit: () => blockedRate,
      handler: () => NextResponse.json({ ok: true }),
    });
    const res = await handle(makeRequest());
    expect(res.status).toBe(429);
    expect(Number(res.headers.get('Retry-After'))).toBeGreaterThan(0);
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('0');
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe('RATE_LIMITED');
  });

  it('maps AppError subclasses to their status', async () => {
    const handle = withApiHandler({
      handler: () => {
        throw new NotFoundError('nope');
      },
    });
    const res = await handle(makeRequest());
    expect(res.status).toBe(404);
  });

  it('sanitizes unknown errors to 500', async () => {
    const handle = withApiHandler({
      handler: () => {
        throw new Error('secret detail');
      },
    });
    const res = await handle(makeRequest());
    expect(res.status).toBe(500);
    const body = (await res.json()) as { error: { message: string } };
    expect(body.error.message).not.toContain('secret');
  });

  it('applies CORS to error responses and exposes rate-limit headers', async () => {
    const handle = withApiHandler({
      cors: { origins: ['https://app.example.com'] },
      rateLimit: () => blockedRate,
      handler: () => NextResponse.json({ ok: true }),
    });
    const res = await handle(makeRequest('https://app.example.com'));
    expect(res.status).toBe(429);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://app.example.com');
    expect(res.headers.get('Access-Control-Expose-Headers')).toContain('X-RateLimit-Limit');
    expect(res.headers.get('Access-Control-Expose-Headers')).toContain('Retry-After');
  });

  it('survives handlers that return immutable responses', async () => {
    const handle = withApiHandler({
      rateLimit: () => okRate,
      handler: () => Response.redirect('https://api.example.com/next', 307),
    });
    const res = await handle(makeRequest());
    expect(res.status).toBe(307);
    expect(res.headers.get('X-RateLimit-Limit')).toBe('5');
  });
});

describe('withApiHandler.preflight', () => {
  it('builds an OPTIONS handler', () => {
    const handle = withApiHandler.preflight({ origins: ['https://app.example.com'] });
    const res = handle(makeRequest('https://app.example.com'));
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://app.example.com');
  });
});
