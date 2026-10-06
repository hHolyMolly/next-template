import { type NextRequest, NextResponse } from 'next/server';

import { toErrorPayload, RateLimitError } from '@/lib/errors';
import { logger } from '@/utils/logger';

export type RateLimitConfig = {
  /** Maximum number of requests within the window. */
  limit: number;
  /** Time window in seconds. */
  windowSeconds: number;
};

/** Where a limiter runs — used for per-scope warnings and log prefixes. */
export type RateLimitScope = 'page' | 'api' | 'action';

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  /** Epoch milliseconds when the current window resets. */
  resetAt: number;
};

// Cheap shape test — rejects attacker-supplied junk from becoming store keys
// (arbitrary long strings would amplify memory usage). Not a full validator.
const IP_SHAPE = /^[0-9a-fA-F.:]{2,45}$/;

/**
 * Resolve the client IP from request headers, or `null` when no trustworthy
 * identity exists.
 *
 * ⚠️ `x-forwarded-for` can be spoofed unless the app sits behind a known
 * proxy chain. Set `TRUSTED_PROXY_HOPS` to your reverse-proxy depth
 * (`1` = the rightmost XFF entry was appended by your proxy). When the chain
 * is SHORTER than the configured hops the XFF value is attacker-controlled —
 * we never fall back to it.
 *
 * Returning `null` (no trusted XFF, no `x-real-ip`) means "identity unknown";
 * callers should SKIP rate limiting rather than share one global bucket —
 * collapsing every client into a single key turns the limiter into a
 * site-wide self-DoS.
 *
 * Accepts either a `NextRequest` or a plain `Headers` bag so the helper can
 * be reused from Server Actions where only `await headers()` is available.
 */
export function resolveClientIp(source: NextRequest | Headers): string | null {
  const headers = source instanceof Headers ? source : source.headers;
  const hops = Number(process.env.TRUSTED_PROXY_HOPS);
  const xff = headers.get('x-forwarded-for');

  if (Number.isFinite(hops) && hops > 0 && xff) {
    const chain = xff
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    // Fewer entries than trusted hops → every entry is client-supplied.
    if (chain.length >= hops) {
      const pick = chain[chain.length - hops];
      if (pick && IP_SHAPE.test(pick)) return pick;
    }
  }

  const realIp = headers.get('x-real-ip');
  if (realIp && IP_SHAPE.test(realIp)) return realIp;

  // Dev convenience: direct connections without proxies land here.
  if (process.env.NODE_ENV !== 'production') return '127.0.0.1';

  return null;
}

/**
 * IPs exempt from EVERY limiter (monitoring, internal cron, load tests).
 * Populate via `RATE_LIMIT_BYPASS_IPS` — comma-separated. Only meaningful
 * when `TRUSTED_PROXY_HOPS` is set correctly (otherwise identity is unknown
 * and limiting is skipped anyway).
 */
const BYPASS_IPS: ReadonlySet<string> = new Set(
  (process.env.RATE_LIMIT_BYPASS_IPS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
);

const warnedScopes = new Set<RateLimitScope>();

/** One loud warning PER SCOPE when rate limiting is skipped for lack of identity. */
function warnNoIdentity(scope: RateLimitScope): void {
  if (warnedScopes.has(scope)) return;
  warnedScopes.add(scope);
  logger.warn(
    `[${scope}] client IP could not be resolved — rate limiting is SKIPPED. ` +
      'Set TRUSTED_PROXY_HOPS (see .env.example) to enable it in production.',
  );
}

export type IdentityCheck =
  | { kind: 'skipped'; reason: 'no-identity' | 'bypass' }
  | { kind: 'checked'; ip: string; result: RateLimitResult };

/**
 * The ONE identity rule shared by the middleware (`proxy.ts`), Route
 * Handlers (`createApiRateLimit`) and Server Actions (`withActionRateLimit`):
 * resolve the client IP → skip (identity unknown / bypass list) or run the
 * limiter. Keeping it here means the three entry points can't drift.
 */
export function checkIdentity(
  source: NextRequest | Headers,
  check: (ip: string) => RateLimitResult,
  options: { scope: RateLimitScope; bypass?: ReadonlySet<string> },
): IdentityCheck {
  const ip = resolveClientIp(source);
  if (ip === null) {
    warnNoIdentity(options.scope);
    return { kind: 'skipped', reason: 'no-identity' };
  }
  if ((options.bypass ?? BYPASS_IPS).has(ip)) return { kind: 'skipped', reason: 'bypass' };
  return { kind: 'checked', ip, result: check(ip) };
}

/**
 * Low-level limiter: check a single IP against the in-memory backend and
 * return the raw `RateLimitResult`. Used by middleware (`proxy.ts`), Route
 * Handlers (`createApiRateLimit`) and Server Actions (`rateLimitAction.ts`
 * in this folder) — always through `checkIdentity`.
 *
 * The `Map`-backed backend works for long-running Node.js servers
 * (VPS, Docker, `next start`) but does NOT share state across serverless
 * instances or cold starts — swap in a Redis-backed implementation
 * when deploying to Vercel/Lambda/Workers.
 */
export function createRateLimiter(config: RateLimitConfig) {
  const backend = createMemoryBackend(config.limit, config.windowSeconds);

  return function check(ip: string): RateLimitResult {
    return backend(ip);
  };
}

/**
 * Adapter for `withApiHandler`'s `rateLimit` option. Skips limiting (with a
 * one-time warning) when no trustworthy client identity can be resolved.
 *
 * @example
 * export const GET = withApiHandler({
 *   rateLimit: createApiRateLimit({ limit: 60, windowSeconds: 60 }),
 *   handler: async () => NextResponse.json({ ok: true }),
 * });
 */
export function createApiRateLimit(config: RateLimitConfig) {
  const check = createRateLimiter(config);

  return (request: NextRequest): RateLimitResult => {
    const outcome = checkIdentity(request, check, { scope: 'api' });
    // `resetAt: 0` marks "not checked" — `withApiHandler` omits the
    // X-RateLimit-* headers for such results instead of advertising a
    // budget that was never enforced.
    return outcome.kind === 'checked'
      ? outcome.result
      : { success: true, limit: config.limit, remaining: config.limit, resetAt: 0 };
  };
}

/**
 * `X-RateLimit-*` budget headers (every checked response) plus
 * `Retry-After` — only when the request was actually blocked; a 2xx
 * carrying `Retry-After` confuses clients and proxies.
 * `X-RateLimit-Reset` is epoch SECONDS (the de-facto convention).
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
  };

  if (!result.success) {
    headers['Retry-After'] = String(Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000)));
  }

  return headers;
}

/** Build the middleware 429 response (same error envelope as the API layer). */
export function rateLimitResponse(result: RateLimitResult): NextResponse {
  return new NextResponse(
    JSON.stringify({ error: toErrorPayload(new RateLimitError('Too Many Requests')) }),
    {
      status: 429,
      headers: { 'Content-Type': 'application/json', ...rateLimitHeaders(result) },
    },
  );
}

/**
 * Fixed-window store: one shared window per limiter; on rollover the whole
 * map is dropped and rebuilt. O(1) per request (no full-scan cleanup on the
 * hot path) and memory is hard-bounded by MAX_ENTRIES regardless of traffic
 * shape or attacker-supplied keys.
 */
function createMemoryBackend(limit: number, windowSeconds: number) {
  const windowMs = windowSeconds * 1000;
  const MAX_ENTRIES = 50_000;

  let counts = new Map<string, number>();
  let windowStart = 0;

  return (ip: string): RateLimitResult => {
    const now = Date.now();

    if (now - windowStart >= windowMs) {
      counts = new Map();
      windowStart = now;
    }

    const resetAt = windowStart + windowMs;
    const count = (counts.get(ip) ?? 0) + 1;

    if (counts.size < MAX_ENTRIES || counts.has(ip)) {
      counts.set(ip, count);
    }

    const remaining = Math.max(0, limit - count);
    return { success: count <= limit, limit, remaining, resetAt };
  };
}
