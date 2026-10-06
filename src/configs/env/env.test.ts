// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { validateEnv } from '@/configs/env';

const OPTIONAL = [
  'NEXT_PUBLIC_SERVER_URL',
  'NEXT_PUBLIC_VITALS_ENDPOINT',
  'TRUSTED_PROXY_HOPS',
  'RATE_LIMIT_BYPASS_IPS',
  'REVALIDATE_SECRET',
  'CSP_REPORT_ONLY',
  'CSP_STRICT_STYLES',
  'CSP_REPORT_URI',
  'TRUSTED_TYPES_MODE',
] as const;

describe('validateEnv', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_CLIENT_URL', 'https://site.example');
    for (const key of OPTIONAL) vi.stubEnv(key, undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('accepts the minimal valid configuration', () => {
    expect(() => validateEnv()).not.toThrow();
  });

  it('requires an absolute http(s) NEXT_PUBLIC_CLIENT_URL', () => {
    vi.stubEnv('NEXT_PUBLIC_CLIENT_URL', undefined);
    expect(() => validateEnv()).toThrow(/NEXT_PUBLIC_CLIENT_URL/);

    vi.stubEnv('NEXT_PUBLIC_CLIENT_URL', 'ftp://site.example');
    expect(() => validateEnv()).toThrow(/http\(s\)/);
  });

  it('rejects a relative web-vitals endpoint (beacons need an absolute URL)', () => {
    vi.stubEnv('NEXT_PUBLIC_VITALS_ENDPOINT', '/api/vitals');
    expect(() => validateEnv()).toThrow(/NEXT_PUBLIC_VITALS_ENDPOINT/);
  });

  it('bounds TRUSTED_PROXY_HOPS and the revalidate secret length', () => {
    vi.stubEnv('TRUSTED_PROXY_HOPS', '9');
    expect(() => validateEnv()).toThrow(/TRUSTED_PROXY_HOPS/);
    vi.stubEnv('TRUSTED_PROXY_HOPS', '1');

    vi.stubEnv('REVALIDATE_SECRET', 'short');
    expect(() => validateEnv()).toThrow(/REVALIDATE_SECRET/);
  });

  it('only allows the known Trusted Types modes', () => {
    vi.stubEnv('TRUSTED_TYPES_MODE', 'bogus');
    expect(() => validateEnv()).toThrow(/TRUSTED_TYPES_MODE/);
    vi.stubEnv('TRUSTED_TYPES_MODE', 'report');
    expect(() => validateEnv()).not.toThrow();
  });

  it('lists every problem at once and points at .env.local', () => {
    vi.stubEnv('NEXT_PUBLIC_CLIENT_URL', 'nope');
    vi.stubEnv('CSP_REPORT_ONLY', 'yes');
    expect(() => validateEnv()).toThrow(
      /NEXT_PUBLIC_CLIENT_URL[\s\S]*CSP_REPORT_ONLY[\s\S]*\.env\.local/,
    );
  });
});
