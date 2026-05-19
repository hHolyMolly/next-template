import { headers } from 'next/headers';

import { RateLimitError } from '@/lib/errors';
import { createRateLimiter, resolveClientIp } from '@/lib/rateLimit';
import { logger } from '@/utils/logger';

/**
 * Rate-limit a Server Action by client IP.
 *
 * Server Actions run in the Node runtime and bypass `proxy.ts`, so they
 * need their own limiter. This wraps an action and throws a typed error
 * when the per-IP budget is exceeded, so callers can surface a friendly
 * message to the user.
 *
 * @example
 * 'use server';
 * export const sendMessage = withActionRateLimit(
 *   { limit: 10, windowSeconds: 60 },
 *   async (formData: FormData) => {
 *     // ...
 *   },
 * );
 */
export function withActionRateLimit<Args extends unknown[], Return>(
  options: { limit: number; windowSeconds: number },
  action: (...args: Args) => Promise<Return>,
): (...args: Args) => Promise<Return> {
  const check = createRateLimiter(options);

  return async (...args: Args) => {
    const requestHeaders = await headers();
    const ip = resolveClientIp(requestHeaders);
    const result = await check(ip);

    if (!result.success) {
      logger.warn(`[action] rate-limited ip=${ip} resetAt=${result.resetAt}`);
      throw new RateLimitError('Too many requests, please try again later.');
    }

    return action(...args);
  };
}
