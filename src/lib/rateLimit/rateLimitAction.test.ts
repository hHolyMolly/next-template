// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// `withActionRateLimit` reads request headers via next/headers — emulate the
// Server Action context with a mutable Headers bag.
const headersBag = new Headers();

vi.mock('next/headers', () => ({
  headers: () => Promise.resolve(headersBag),
}));

// Fresh module graph per test: limiter buckets and the per-scope warning
// flag live at module scope.
async function load() {
  vi.resetModules();
  const [{ withActionRateLimit }, { logger }] = await Promise.all([
    import('@/lib/rateLimit/rateLimitAction'),
    import('@/utils/logger'),
  ]);
  return { withActionRateLimit, logger };
}

describe('withActionRateLimit', () => {
  beforeEach(() => {
    for (const key of ['x-real-ip', 'x-forwarded-for']) headersBag.delete(key);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('passes arguments through and returns the action result under the limit', async () => {
    const { withActionRateLimit } = await load();
    headersBag.set('x-real-ip', '1.1.1.1');
    const action = vi.fn(async (a: number, b: number) => a + b);
    const limited = withActionRateLimit({ limit: 3, windowSeconds: 60 }, action);

    await expect(limited(2, 3)).resolves.toBe(5);
    expect(action).toHaveBeenCalledWith(2, 3);
  });

  it('throws RATE_LIMITED on the call after the budget and skips the action', async () => {
    const { withActionRateLimit, logger } = await load();
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => {});
    headersBag.set('x-real-ip', '1.1.1.1');
    const action = vi.fn(async () => 'ok');
    const limited = withActionRateLimit({ limit: 2, windowSeconds: 60 }, action);

    await limited();
    await limited();
    await expect(limited()).rejects.toMatchObject({ code: 'RATE_LIMITED', status: 429 });
    expect(action).toHaveBeenCalledTimes(2);
    // Truncated IP in the log line — correlation, not PII.
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/rate-limited ip=1\.1\.1\.1/));
  });

  it('keeps separate budgets per client IP', async () => {
    const { withActionRateLimit } = await load();
    const limited = withActionRateLimit({ limit: 1, windowSeconds: 60 }, async () => 'ok');

    headersBag.set('x-real-ip', '1.1.1.1');
    await expect(limited()).resolves.toBe('ok');
    headersBag.set('x-real-ip', '2.2.2.2');
    await expect(limited()).resolves.toBe('ok');
    headersBag.set('x-real-ip', '1.1.1.1');
    await expect(limited()).rejects.toMatchObject({ code: 'RATE_LIMITED' });
  });

  it('resets the budget when the window rolls over', async () => {
    const { withActionRateLimit } = await load();
    headersBag.set('x-real-ip', '1.1.1.1');
    const limited = withActionRateLimit({ limit: 1, windowSeconds: 60 }, async () => 'ok');

    await limited();
    await expect(limited()).rejects.toMatchObject({ code: 'RATE_LIMITED' });
    vi.advanceTimersByTime(61_000);
    await expect(limited()).resolves.toBe('ok');
  });

  it('skips limiting (with ONE warning) when no identity is available in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const { withActionRateLimit, logger } = await load();
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => {});
    const limited = withActionRateLimit({ limit: 1, windowSeconds: 60 }, async () => 'ok');

    await expect(limited()).resolves.toBe('ok');
    await expect(limited()).resolves.toBe('ok');
    await expect(limited()).resolves.toBe('ok');
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('[action]'));
  });

  it('never limits IPs on the bypass list', async () => {
    vi.stubEnv('RATE_LIMIT_BYPASS_IPS', '9.9.9.9, 8.8.8.8');
    const { withActionRateLimit } = await load();
    headersBag.set('x-real-ip', '9.9.9.9');
    const limited = withActionRateLimit({ limit: 1, windowSeconds: 60 }, async () => 'ok');

    await expect(limited()).resolves.toBe('ok');
    await expect(limited()).resolves.toBe('ok');
  });
});
