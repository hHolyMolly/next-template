import { afterEach, describe, expect, it, vi } from 'vitest';

import { resolveApiUrl, resolveAppUrl } from '@/services/api/http';

async function loadWithEnv(env: Record<string, string>) {
  for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
  vi.resetModules();
  return import('@/services/api/http');
}

describe('resolveAppUrl (own routes)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('uses the current origin in the browser', () => {
    // jsdom's default location is http://localhost:3000
    expect(resolveAppUrl('/api/health')).toBe('http://localhost:3000/api/health');
  });

  it('passes absolute URLs through untouched', () => {
    expect(resolveAppUrl('https://cdn.example.com/x')).toBe('https://cdn.example.com/x');
  });

  it('uses the public site URL on the server', async () => {
    vi.stubGlobal('window', undefined);
    const mod = await loadWithEnv({ NEXT_PUBLIC_CLIENT_URL: 'https://site.example/' });
    expect(mod.resolveAppUrl('/api/health')).toBe('https://site.example/api/health');
  });

  it('never lands on the external backend even when one is configured', async () => {
    const mod = await loadWithEnv({ NEXT_PUBLIC_SERVER_URL: 'https://backend.example' });
    expect(mod.resolveAppUrl('/api/health')).toBe('http://localhost:3000/api/health');
  });
});

describe('resolveApiUrl (external backend)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('throws a clear error when NEXT_PUBLIC_SERVER_URL is unset', () => {
    expect(() => resolveApiUrl('/todos')).toThrow(/NEXT_PUBLIC_SERVER_URL/);
  });

  it('prefixes relative paths with the backend /api base', async () => {
    const mod = await loadWithEnv({ NEXT_PUBLIC_SERVER_URL: 'https://backend.example/' });
    expect(mod.resolveApiUrl('/todos')).toBe('https://backend.example/api/todos');
  });

  it('passes absolute URLs through untouched', () => {
    expect(resolveApiUrl('https://other.example/v1')).toBe('https://other.example/v1');
  });
});
