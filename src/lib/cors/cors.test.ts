import { describe, expect, it } from 'vitest';

import { cors, handlePreflight, toMutableResponse } from '@/lib/cors';

const ALLOWED = ['https://app.example.com'];

function request(origin?: string, extra?: Record<string, string>): Request {
  const headers = new Headers(extra);
  if (origin) headers.set('origin', origin);
  return new Request('https://api.example.com/echo', { headers });
}

describe('cors', () => {
  it('sets allow headers for an allowed origin', () => {
    const out = cors(new Response('ok'), request('https://app.example.com'), { origins: ALLOWED });
    expect(out.headers.get('Access-Control-Allow-Origin')).toBe('https://app.example.com');
    expect(out.headers.get('Vary')).toBe('Origin');
  });

  it('keeps Vary: Origin on REJECTED origins (cache poisoning guard)', () => {
    const out = cors(new Response('ok'), request('https://evil.example'), { origins: ALLOWED });
    expect(out.headers.get('Access-Control-Allow-Origin')).toBeNull();
    expect(out.headers.get('Vary')).toBe('Origin');
  });

  it('does not duplicate Vary when called twice', () => {
    const req = request('https://app.example.com');
    const out = cors(cors(new Response('ok'), req, { origins: ALLOWED }), req, {
      origins: ALLOWED,
    });
    expect(out.headers.get('Vary')).toBe('Origin');
  });

  it('tolerates trailing slash / casing differences in the allowlist', () => {
    const out = cors(new Response('ok'), request('https://app.example.com'), {
      origins: ['https://APP.example.com/'],
    });
    expect(out.headers.get('Access-Control-Allow-Origin')).toBe('https://app.example.com');
  });

  it("throws on origins:'*' combined with credentials", () => {
    expect(() =>
      cors(new Response('ok'), request('https://app.example.com'), {
        origins: '*',
        credentials: true,
      }),
    ).toThrow(/credentials/);
  });

  it("answers '*' without Vary for public endpoints", () => {
    const out = cors(new Response('ok'), request('https://anything.example'), { origins: '*' });
    expect(out.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(out.headers.get('Vary')).toBeNull();
  });

  it('clones immutable responses instead of throwing', () => {
    const redirect = Response.redirect('https://api.example.com/next', 307);
    const out = cors(redirect, request('https://app.example.com'), { origins: ALLOWED });
    expect(out.status).toBe(307);
    expect(out.headers.get('Access-Control-Allow-Origin')).toBe('https://app.example.com');
  });
});

describe('handlePreflight', () => {
  it('answers an allowed preflight with Max-Age and the full Vary', () => {
    const out = handlePreflight(request('https://app.example.com'), {
      origins: ALLOWED,
      methods: ['POST'],
    });
    expect(out.status).toBe(204);
    expect(out.headers.get('Access-Control-Max-Age')).toBe('86400');
    expect(out.headers.get('Vary')).toBe(
      'Origin, Access-Control-Request-Method, Access-Control-Request-Headers',
    );
  });

  it('omits Max-Age when the origin is rejected but keeps Vary', () => {
    const out = handlePreflight(request('https://evil.example'), { origins: ALLOWED });
    expect(out.headers.get('Access-Control-Max-Age')).toBeNull();
    expect(out.headers.get('Vary')).toContain('Origin');
  });
});

describe('toMutableResponse', () => {
  it('returns the same object when headers are mutable', () => {
    const res = new Response('ok');
    expect(toMutableResponse(res)).toBe(res);
  });

  it('clones when headers are immutable, preserving status/body', async () => {
    const res = Response.redirect('https://example.com/', 308);
    const out = toMutableResponse(res);
    expect(out).not.toBe(res);
    expect(out.status).toBe(308);
    expect(out.headers.get('location')).toBe('https://example.com/');
    out.headers.set('x-test', '1');
    expect(out.headers.get('x-test')).toBe('1');
  });
});
