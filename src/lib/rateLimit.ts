import { type NextRequest, NextResponse } from 'next/server';

type RateLimitConfig = {
  /** Maximum number of requests within the window. */
  limit: number;
  /** Time window in seconds. */
  windowSeconds: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
};

type Backend = (ip: string) => Promise<RateLimitResult> | RateLimitResult;

/**
 * Resolve the client IP from request headers.
 *
 * ⚠️ `x-forwarded-for` can be spoofed if the app is not behind a trusted proxy.
 * Override `trustProxy` only if you know which hop is your reverse proxy
 * (e.g. `TRUSTED_PROXY_HOPS=1` means take the rightmost IP from XFF).
 *
 * When `TRUSTED_PROXY_HOPS` is unset, we fall back to:
 * 1. `x-real-ip` (typically set by nginx / Vercel / Cloudflare)
 * 2. `127.0.0.1` (dev)
 *
 * Accepts either a `NextRequest` or a plain `Headers` bag so the helper can
 * be reused from Server Actions where only `await headers()` is available.
 */
export function resolveClientIp(source: NextRequest | Headers): string {
  const headers = source instanceof Headers ? source : source.headers;
  const hops = Number(process.env.TRUSTED_PROXY_HOPS);
  const xff = headers.get('x-forwarded-for');

  if (Number.isFinite(hops) && hops > 0 && xff) {
    const chain = xff
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const pick = chain[Math.max(0, chain.length - hops)];
    if (pick) return pick;
  }

  return headers.get('x-real-ip') ?? '127.0.0.1';
}

/**
 * Rate limiter for Next.js middleware with an in-memory backend.
 *
 * The `Map`-backed backend works well for long-running Node.js servers
 * (VPS, Docker, `next start`) but does NOT share state across serverless
 * instances or cold starts — swap in a Redis-backed implementation
 * when deploying to Vercel/Lambda/Workers.
 *
 * @example
 * // In proxy.ts:
 * const rateLimit = createRateLimit({ limit: 100, windowSeconds: 60 });
 *
 * export async function proxy(request: NextRequest) {
 *   const blocked = await rateLimit(request);
 *   if (blocked) return blocked;
 *   // ...rest of middleware
 * }
 */
/**
 * Low-level limiter: check a single IP against the configured backend and
 * return the raw `RateLimitResult`. Used by both middleware and Server
 * Action wrappers (see `rateLimitAction.ts`) so they share one budget.
 */
export function createRateLimiter(config: RateLimitConfig) {
  const { limit, windowSeconds } = config;
  const backend: Backend = createMemoryBackend(limit, windowSeconds);

  return async function check(ip: string): Promise<RateLimitResult> {
    return backend(ip);
  };
}

/**
 * Adapter for `withApiHandler`'s `rateLimit` option: resolves the client IP
 * and returns the check result in the shape the handler wrapper expects.
 *
 * @example
 * export const GET = withApiHandler({
 *   rateLimit: createApiRateLimit({ limit: 60, windowSeconds: 60 }),
 *   handler: async () => NextResponse.json({ ok: true }),
 * });
 */
export function createApiRateLimit(config: RateLimitConfig) {
  const check = createRateLimiter(config);

  return async (request: NextRequest) => {
    const result = await check(resolveClientIp(request));
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.resetAt,
    };
  };
}

export function createRateLimit(config: RateLimitConfig) {
  const check = createRateLimiter(config);

  return async function rateLimit(request: NextRequest): Promise<NextResponse | null> {
    const ip = resolveClientIp(request);
    const result = await check(ip);

    if (result.success) return null;

    const retryAfter = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000));

    return new NextResponse(JSON.stringify({ error: 'Too Many Requests' }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': String(Math.max(0, result.remaining)),
        'X-RateLimit-Reset': String(result.resetAt),
      },
    });
  };
}

function createMemoryBackend(limit: number, windowSeconds: number): Backend {
  const store = new Map<string, RateLimitEntry>();
  const windowMs = windowSeconds * 1000;
  const CLEANUP_INTERVAL = 60_000;
  let lastCleanup = Date.now();

  function cleanup(now: number) {
    if (now - lastCleanup < CLEANUP_INTERVAL) return;
    lastCleanup = now;
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key);
    }
  }

  return (ip) => {
    const now = Date.now();
    cleanup(now);

    const entry = store.get(ip);
    if (!entry || now > entry.resetAt) {
      const resetAt = now + windowMs;
      store.set(ip, { count: 1, resetAt });
      return { success: true, limit, remaining: limit - 1, resetAt };
    }

    entry.count += 1;
    const remaining = limit - entry.count;

    return {
      success: entry.count <= limit,
      limit,
      remaining: Math.max(0, remaining),
      resetAt: entry.resetAt,
    };
  };
}
