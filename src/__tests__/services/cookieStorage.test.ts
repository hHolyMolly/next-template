import { describe, it, expect, beforeEach, vi } from 'vitest';

// Minimal cookie storage mock
const mockDocument = {
  cookie: '',
};

describe('customCookieStorage', () => {
  beforeEach(() => {
    mockDocument.cookie = '';
    Object.defineProperty(document, 'cookie', {
      get: () => mockDocument.cookie,
      set: (value: string) => {
        // Parse and accumulate cookies like a real browser
        const [cookiePair] = value.split(';');
        const [name] = cookiePair!.split('=');
        const existingCookies = mockDocument.cookie
          .split('; ')
          .filter((c) => !c.startsWith(`${name}=`));

        // Check if it's a deletion (max-age=0)
        if (value.includes('max-age=0')) {
          mockDocument.cookie = existingCookies.join('; ');
        } else {
          existingCookies.push(cookiePair!);
          mockDocument.cookie = existingCookies.filter(Boolean).join('; ');
        }
      },
      configurable: true,
    });
  });

  it('returns fallback when cookie does not exist', async () => {
    const { customCookieStorage } = await import('@/services/storage/cookie/functions');
    expect(customCookieStorage.get('missing', 'fallback')).toBe('fallback');
  });

  it('sets and gets a cookie value', async () => {
    const { customCookieStorage } = await import('@/services/storage/cookie/functions');

    customCookieStorage.set('test', { key: 'value' });
    const result = customCookieStorage.get('test', null);

    expect(result).toEqual({ key: 'value' });
  });

  it('sets cookie with string value', async () => {
    const { customCookieStorage } = await import('@/services/storage/cookie/functions');

    customCookieStorage.set('name', 'John');
    expect(customCookieStorage.get('name', '')).toBe('John');
  });

  it('removes a cookie', async () => {
    const { customCookieStorage } = await import('@/services/storage/cookie/functions');

    customCookieStorage.set('toRemove', 'data');
    customCookieStorage.remove('toRemove');

    expect(customCookieStorage.get('toRemove', 'gone')).toBe('gone');
  });

  it('returns fallback for invalid JSON', async () => {
    const { customCookieStorage } = await import('@/services/storage/cookie/functions');

    // Manually set invalid cookie
    mockDocument.cookie = 'broken=%7Binvalid';
    expect(customCookieStorage.get('broken', 'fallback')).toBe('fallback');
  });
});
