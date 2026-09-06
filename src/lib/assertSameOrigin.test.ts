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
  for (const key of ['origin', 'referer']) headersBag.delete(key);
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

  it('rejects a cross-site origin', async () => {
    setHeaders({ origin: 'https://evil.example' });
    await expect(assertSameOrigin()).rejects.toThrow(/CSRF/);
  });

  it('rejects when both Origin and Referer are missing', async () => {
    await expect(assertSameOrigin()).rejects.toThrow(/missing/i);
  });

  it('accepts explicitly allowed extra origins', async () => {
    setHeaders({ origin: 'https://admin.example.com' });
    await expect(assertSameOrigin(['https://admin.example.com'])).resolves.toBeUndefined();
  });
});
