import { headers } from 'next/headers';

import { RateLimitError } from '@/lib/errors';
import { checkIdentity, createRateLimiter, type RateLimitConfig } from '@/lib/rateLimit/rateLimit';
import { logger } from '@/utils/logger';

/**
 * Rate-limit a Server Action by client IP.
 *
 * Server Action calls are POSTs to the page URL, so `proxy.ts` DOES see
 * them and counts them against the per-IP PAGE budget as well. That is
 * intentional defense in depth: the page budget is a coarse floor, this
 * wrapper is the fine-grained per-action budget (e.g. 5 submits/minute).
 * Identity resolution and the bypass list are shared via `checkIdentity`.
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
  options: RateLimitConfig,
  action: (...args: Args) => Promise<Return>,
): (...args: Args) => Promise<Return> {
  const check = createRateLimiter(options);

  return async (...args: Args) => {
    const outcome = checkIdentity(await headers(), check, { scope: 'action' });

    if (outcome.kind === 'checked' && !outcome.result.success) {
      // Truncated IP — enough to correlate abuse, not enough to be PII-hot.
      logger.warn(
        `[action] rate-limited ip=${outcome.ip.slice(0, 12)}… resetAt=${outcome.result.resetAt}`,
      );
      throw new RateLimitError('Too many requests, please try again later.');
    }

    return action(...args);
  };
}
