import { NextResponse, type NextRequest } from 'next/server';

import { cors, handlePreflight, toMutableResponse } from '@/lib/cors';
import { AppError, RateLimitError, ValidationError, toErrorResponse } from '@/lib/errors';
import { rateLimitHeaders, type RateLimitResult } from '@/lib/rateLimit';
import { logger } from '@/utils/logger';

/**
 * Type-safe wrapper for Route Handlers.
 *
 * Wires up three recurring concerns so handlers stay focused on business logic:
 *
 * 1. **CORS** — preflight + response headers when `cors` is provided.
 * 2. **Rate limiting** — runs before the handler; a blocked request gets a
 *    429 with `Retry-After` + `X-RateLimit-*` headers (successful responses
 *    carry the `X-RateLimit-*` headers too).
 * 3. **Error mapping** — any `AppError` becomes a structured JSON response,
 *    anything else is logged and turned into a sanitized 500.
 *
 * ```ts
 * // src/app/api/echo/route.ts
 * export const POST = withApiHandler({
 *   cors: { origins: ['https://app.example.com'], methods: ['POST'] },
 *   rateLimit: createApiRateLimit({ limit: 20, windowSeconds: 60 }),
 *   handler: async (req) => {
 *     const body = await req.json();
 *     if (!body.email) throw new ValidationError('email required', 'email');
 *     return NextResponse.json({ ok: true });
 *   },
 * });
 *
 * // Pair with OPTIONS when you set `cors`:
 * export const OPTIONS = withApiHandler.preflight({
 *   origins: ['https://app.example.com'],
 *   methods: ['POST'],
 * });
 * ```
 */

type CorsOptions = Parameters<typeof cors>[2];

type RateLimitCheck = (request: NextRequest) => RateLimitResult | Promise<RateLimitResult>;

type Handler = (request: NextRequest) => Promise<Response> | Response;

type Options = {
  handler: Handler;
  cors?: CorsOptions;
  rateLimit?: RateLimitCheck;
};

const log = logger.child('api');

const RATE_LIMIT_HEADER_NAMES = ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'];

function attachRateHeaders(response: Response, rate: RateLimitResult): Response {
  const out = toMutableResponse(response);
  for (const [key, value] of Object.entries(rateLimitHeaders(rate))) {
    out.headers.set(key, value);
  }
  return out;
}

export function withApiHandler(options: Options) {
  const { handler, rateLimit } = options;

  // CORS options are static for the handler's lifetime — merge once, not
  // per request. With rate limiting on, expose the X-RateLimit-* headers so
  // cross-origin clients can actually read them.
  const corsOpts: CorsOptions | undefined = options.cors
    ? rateLimit
      ? {
          ...options.cors,
          exposed: Array.from(
            new Set([...(options.cors.exposed ?? []), ...RATE_LIMIT_HEADER_NAMES, 'Retry-After']),
          ),
        }
      : options.cors
    : undefined;

  const applyCors = (response: Response, request: NextRequest): Response =>
    corsOpts ? cors(response, request, corsOpts) : response;

  return async (request: NextRequest): Promise<Response> => {
    let rateInfo: RateLimitResult | undefined;

    try {
      if (rateLimit) {
        rateInfo = await rateLimit(request);
        if (!rateInfo.success) {
          throw new RateLimitError('Rate limit exceeded');
        }
      }

      let response = await handler(request);
      if (rateInfo) response = attachRateHeaders(response, rateInfo);
      return applyCors(response, request);
    } catch (err) {
      if (!(err instanceof AppError)) {
        log.error('Unhandled route handler error', err);
      }

      let response = toErrorResponse(err);
      // The 429 (and any error after a successful check) still reports the
      // budget — clients need Retry-After exactly when they are blocked.
      if (rateInfo) response = attachRateHeaders(response, rateInfo);
      return applyCors(response, request);
    }
  };
}

withApiHandler.preflight = (corsOpts: CorsOptions) => {
  return (request: NextRequest): Response => handlePreflight(request, corsOpts);
};

/**
 * Lightweight runtime validator — use it inside a handler to produce a
 * `ValidationError` with a typed payload without pulling in zod.
 *
 * Note: rejects `undefined`, `null` and `''` only — `0`, `false` and `NaN`
 * are considered present. Use zod for anything richer.
 *
 * @example
 * const email = required(body.email, 'email');
 */
export function required<T>(value: T | undefined | null, field: string): T {
  if (value === undefined || value === null || value === '') {
    throw new ValidationError(`${field} is required`, field);
  }
  return value;
}

/** Re-export for convenience — most handlers want `NextResponse.json`. */
export { NextResponse };
