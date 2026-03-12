import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next-intl/middleware
const mockIntlMiddleware = vi.fn().mockImplementation(() => {
  const headers = new Map<string, string>();
  return {
    headers: {
      set: (key: string, value: string) => headers.set(key, value),
      get: (key: string) => headers.get(key),
      entries: () => headers.entries(),
    },
  };
});
vi.mock('next-intl/middleware', () => ({
  default: () => mockIntlMiddleware,
}));

// Mock routing
vi.mock('@/services/i18n/routing', () => ({
  routing: {
    locales: ['en', 'ru'],
    defaultLocale: 'en',
  },
}));

// Mock urls
vi.mock('@/configs/constants/urls', () => ({
  urls: {
    website: 'https://example.com',
    server: { api: 'https://api.example.com/api' },
  },
}));

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
  randomUUID: () => '550e8400-e29b-41d4-a716-446655440000',
});

// Mock Buffer
vi.stubGlobal('Buffer', {
  from: (str: string) => ({
    toString: () => btoa(str),
  }),
});

describe('proxy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sets CSP header with nonce', async () => {
    const { proxy } = await import('@/proxy');
    const mockRequest = {} as never;

    const response = proxy(mockRequest);

    const csp = response.headers.get('Content-Security-Policy');
    expect(csp).toBeDefined();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain('nonce-');
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    expect(csp).toContain("frame-ancestors 'self'");
  });

  it('sets x-nonce header', async () => {
    const { proxy } = await import('@/proxy');
    const mockRequest = {} as never;

    const response = proxy(mockRequest);

    const nonce = response.headers.get('x-nonce');
    expect(nonce).toBeDefined();
    expect(nonce!.length).toBeGreaterThan(0);
  });

  it('includes restricted connect-src with API origin', async () => {
    const { proxy } = await import('@/proxy');
    const mockRequest = {} as never;

    const response = proxy(mockRequest);

    const csp = response.headers.get('Content-Security-Policy');
    expect(csp).toContain("connect-src 'self'");
    // Should include the API origin, not wildcard https:
    expect(csp).not.toContain('connect-src https:');
  });

  it('restricts img-src to specific origins', async () => {
    const { proxy } = await import('@/proxy');
    const mockRequest = {} as never;

    const response = proxy(mockRequest);

    const csp = response.headers.get('Content-Security-Policy');
    expect(csp).toContain("img-src 'self'");
    // Should not contain wildcard https:
    expect(csp).not.toContain('img-src https:');
  });
});
