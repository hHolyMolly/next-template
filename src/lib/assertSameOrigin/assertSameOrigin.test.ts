import { beforeEach, describe, expect, it, vi } from 'vitest';

import { assertSameOrigin } from '@/lib/assertSameOrigin';

// `assertSameOrigin` reads request headers via next/headers — emulate the
// Server Action context with a mutable Headers bag.
const headersBag = new Headers();

vi.mock('next/headers', () => ({
  headers: () => Promise.resolve(headersBag),
}));

// urls.website falls back to http://localhost:3000 in tests (no env set).
const SITE = 'http://localhost:3000';

function setHeaders(entries: Record<string, string>) {
  for (const key of ['origin', 'referer', 'sec-fetch-site']) headersBag.delete(key);
  for (const [key, value] of Object.entries(entries)) headersBag.set(key, value);
}

describe('assertSameOrigin', () => {
  beforeEach(() => {
    setHeaders({});
  });

  it('passes for a same-origin request', async () => {
    setHeaders({ origin: SITE });
    await expect(assertSameOrigin()).resolves.toBeUndefined();
  });

  it('falls back to the referer header', async () => {
    setHeaders({ referer: `${SITE}/some/page` });
    await expect(assertSameOrigin()).resolves.toBeUndefined();
  });

  it('passes on Sec-Fetch-Site: same-origin without Origin/Referer', async () => {
    setHeaders({ 'sec-fetch-site': 'same-origin' });
    await expect(assertSameOrigin()).resolves.toBeUndefined();
  });

  it('rejects a cross-site origin with a constant message', async () => {
    setHeaders({ origin: 'https://evil.example' });
    // Constant message on purpose — the attacker origin must not be reflected.
    await expect(assertSameOrigin()).rejects.toThrow('Cross-site request blocked');
  });

  it('rejects when both Origin and Referer are missing', async () => {
    await expect(assertSameOrigin()).rejects.toThrow('Cross-site request blocked');
  });

  it('accepts explicitly allowed extra origins', async () => {
    setHeaders({ origin: 'https://admin.example.com' });
    await expect(assertSameOrigin(['https://admin.example.com'])).resolves.toBeUndefined();
  });

  it('prefers Origin over Referer when both are present', async () => {
    // A same-site referer must not rescue a cross-site Origin.
    setHeaders({ origin: 'https://evil.example', referer: `${SITE}/page` });
    await expect(assertSameOrigin()).rejects.toThrow('Cross-site request blocked');
  });

  it('rejects the opaque "null" origin (sandboxed iframes, data: URLs)', async () => {
    setHeaders({ origin: 'null' });
    await expect(assertSameOrigin()).rejects.toThrow('Cross-site request blocked');
  });

  it('rejects scheme/port/subdomain confusion', async () => {
    for (const origin of [
      'https://localhost:3000', // scheme differs from http://localhost:3000
      'http://localhost:4000', // port differs
      'http://evil.localhost:3000', // subdomain trick
    ]) {
      setHeaders({ origin });
      await expect(assertSameOrigin()).rejects.toThrow('Cross-site request blocked');
    }
  });

  it('throws a developer error (not Forbidden) on an invalid extraAllowed entry', async () => {
    setHeaders({ origin: 'https://admin.example.com' });
    await expect(assertSameOrigin(['not a url'])).rejects.toThrow(/invalid extraAllowed/);
  });
});
