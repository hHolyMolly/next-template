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

/**
 * Simple in-memory rate limiter for Next.js middleware.
 *
 * Limits requests per IP address using a sliding window.
 *
 * **⚠️ Serverless limitation:**
 * Uses in-memory `Map` — each serverless instance has its own store.
 * In serverless environments (Vercel, AWS Lambda), rate limiting is
 * per-instance and resets on cold starts, making it less effective
 * under high concurrency. For distributed rate limiting, consider:
 * - Upstash Redis (`@upstash/ratelimit`)
 * - Vercel KV
 * - Cloudflare Workers KV
 *
 * Works well for long-running Node.js servers (VPS, Docker, `next start`).
 *
 * @example
 * // In proxy.ts:
 * import { createRateLimit } from '@/lib/rateLimit';
 *
 * const rateLimit = createRateLimit({ limit: 60, windowSeconds: 60 });
 *
 * export function proxy(request: NextRequest) {
 *   const blocked = rateLimit(request);
 *   if (blocked) return blocked;
 *   // ...rest of middleware
 * }
 */
export function createRateLimit(config: RateLimitConfig) {
  const { limit, windowSeconds } = config;
  const store = new Map<string, RateLimitEntry>();

  // Periodically clean up expired entries to prevent memory leaks
  const CLEANUP_INTERVAL = 60_000; // 1 minute
  let lastCleanup = Date.now();

  function cleanup() {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;

    lastCleanup = now;
    for (const [key, entry] of store) {
      if (now > entry.resetAt) {
        store.delete(key);
      }
    }
  }

  return function rateLimit(request: NextRequest): NextResponse | null {
    cleanup();

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      '127.0.0.1';

    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    const entry = store.get(ip);

    if (!entry || now > entry.resetAt) {
      store.set(ip, { count: 1, resetAt: now + windowMs });
      return null;
    }

    entry.count++;

    if (entry.count > limit) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);

      return new NextResponse(JSON.stringify({ error: 'Too Many Requests' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(entry.resetAt),
        },
      });
    }

    return null;
  };
}
