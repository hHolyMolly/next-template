import { describe, expect, it } from 'vitest';

import { isAbsoluteUrl, isAllowedOrigin, normalizeOrigin } from '@/lib/origin';

describe('isAbsoluteUrl', () => {
  it('accepts http(s) URLs regardless of casing', () => {
    expect(isAbsoluteUrl('https://example.com')).toBe(true);
    expect(isAbsoluteUrl('HTTP://example.com')).toBe(true);
  });

  it('rejects paths and other protocols', () => {
    expect(isAbsoluteUrl('/assets/img/x.webp')).toBe(false);
    expect(isAbsoluteUrl('ftp://example.com')).toBe(false);
    expect(isAbsoluteUrl('javascript:alert(1)')).toBe(false);
  });
});

describe('normalizeOrigin', () => {
  it('strips path, trailing slash and normalizes casing', () => {
    expect(normalizeOrigin('https://Example.com/some/path/')).toBe('https://example.com');
    expect(normalizeOrigin('https://example.com:8443/')).toBe('https://example.com:8443');
  });

  it('returns null for unparseable values', () => {
    expect(normalizeOrigin('not a url')).toBeNull();
    expect(normalizeOrigin('')).toBeNull();
  });
});

describe('isAllowedOrigin', () => {
  const allowlist = ['https://app.example.com/', 'https://Admin.example.com'];

  it('matches with slash/case tolerance', () => {
    expect(isAllowedOrigin('https://app.example.com', allowlist)).toBe(true);
    expect(isAllowedOrigin('https://admin.example.com/', allowlist)).toBe(true);
  });

  it('does not match scheme, port or subdomain confusion', () => {
    expect(isAllowedOrigin('http://app.example.com', allowlist)).toBe(false);
    expect(isAllowedOrigin('https://app.example.com:8443', allowlist)).toBe(false);
    expect(isAllowedOrigin('https://evil-app.example.com', allowlist)).toBe(false);
    expect(isAllowedOrigin('https://app.example.com.evil.com', allowlist)).toBe(false);
  });

  it('rejects unparseable origins', () => {
    expect(isAllowedOrigin('null', allowlist)).toBe(false);
    expect(isAllowedOrigin('', allowlist)).toBe(false);
  });
});
