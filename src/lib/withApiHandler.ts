import { NextResponse, type NextRequest } from 'next/server';

import { cors, handlePreflight } from '@/lib/cors';
import { AppError, RateLimitError, ValidationError, toErrorResponse } from '@/lib/errors';
import { logger } from '@/utils/logger';

/**
 * Type-safe wrapper for Route Handlers.
 *
 * Wires up three recurring concerns so handlers stay focused on business logic:
 *
 * 1. **CORS** — preflight + response headers when `cors` is provided.
 * 2. **Rate limiting** — runs before the handler; throws `RateLimitError`.
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

type RateLimitCheck = (request: NextRequest) => Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}>;

type Handler = (request: NextRequest) => Promise<Response> | Response;

type Options = {
  handler: Handler;
  cors?: CorsOptions;
  rateLimit?: RateLimitCheck;
};

const log = logger.child('api');

const RATE_LIMIT_HEADERS = ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'];

function attachCors(
  response: Response,
  request: NextRequest,
  opts: CorsOptions | undefined,
  exposeRate: boolean,
): Response {
  if (!opts) return response;
  // When both CORS and rate limiting are enabled, make the `X-RateLimit-*`
  // headers readable by cross-origin clients — otherwise the browser hides
  // them even though the server sets them.
  const merged: CorsOptions = exposeRate
    ? {
        ...opts,
        exposed: Array.from(new Set([...(opts.exposed ?? []), ...RATE_LIMIT_HEADERS])),
      }
    : opts;
  return cors(response, request, merged);
}

function attachRateHeaders(
  response: Response,
  rate: { limit: number; remaining: number; reset: number },
): Response {
  response.headers.set('X-RateLimit-Limit', String(rate.limit));
  response.headers.set('X-RateLimit-Remaining', String(rate.remaining));
  response.headers.set('X-RateLimit-Reset', String(rate.reset));
  return response;
}

export function withApiHandler(options: Options) {
  const { handler, cors: corsOpts, rateLimit } = options;

  return async (request: NextRequest): Promise<Response> => {
    try {
      let rateInfo: { limit: number; remaining: number; reset: number } | undefined;

      if (rateLimit) {
        const result = await rateLimit(request);
        rateInfo = { limit: result.limit, remaining: result.remaining, reset: result.reset };
        if (!result.success) {
          throw new RateLimitError('Rate limit exceeded');
        }
      }

      const response = await handler(request);
      if (rateInfo) attachRateHeaders(response, rateInfo);
      return attachCors(response, request, corsOpts, Boolean(rateLimit));
    } catch (err) {
      if (!(err instanceof AppError)) {
        log.error('Unhandled route handler error', err);
      }
      const response = toErrorResponse(err);
      return attachCors(response, request, corsOpts, Boolean(rateLimit));
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
