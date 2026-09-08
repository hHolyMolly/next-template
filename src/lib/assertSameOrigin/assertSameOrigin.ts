import { headers } from 'next/headers';

import { urls } from '@/configs/constants/urls';
import { ForbiddenError } from '@/lib/errors';
import { isAllowedOrigin, normalizeOrigin } from '@/lib/origin';
import { logger } from '@/utils/logger';

const log = logger.child('csrf');

// Module constants — urls.website never changes at runtime.
const SITE_ORIGIN = normalizeOrigin(urls.website) ?? 'http://localhost:3000';

/**
 * Cheap CSRF defense for Server Actions / Route Handlers.
 *
 * Order of checks:
 * 1. `Sec-Fetch-Site: same-origin` — set by all modern browsers and cannot
 *    be forged by page content; accepted immediately.
 * 2. `Origin` (preferred) or `Referer` compared against
 *    `NEXT_PUBLIC_CLIENT_URL` — same-site browsers set one of these for
 *    state-changing requests.
 *
 * Next.js 16 Server Actions already include an action-id secret, but this
 * helper adds defense-in-depth and is mandatory for plain Route Handlers
 * that perform mutations.
 *
 * @throws {ForbiddenError} (HTTP 403) with a constant message — the
 * offending origin is logged server-side, never reflected to the client.
 *
 * @example
 * export const deleteItem = withServerAction(async (id: string) => {
 *   await assertSameOrigin();
 *   // ...mutation
 * });
 */
export async function assertSameOrigin(extraAllowed: string[] = []): Promise<void> {
  const h = await headers();

  // Unforgeable browser signal — trust it before header parsing.
  if (h.get('sec-fetch-site') === 'same-origin') return;

  const source = h.get('origin') ?? h.get('referer');

  if (!source) {
    log.warn('rejected: missing Origin/Referer header');
    throw new ForbiddenError('Cross-site request blocked');
  }

  const allowlist = [SITE_ORIGIN];
  for (const extra of extraAllowed) {
    const origin = normalizeOrigin(extra);
    if (!origin) {
      // A broken allowlist entry is a developer error, not a rejection.
      throw new Error(`assertSameOrigin: invalid extraAllowed entry "${extra}"`);
    }
    allowlist.push(origin);
  }

  if (!isAllowedOrigin(source, allowlist)) {
    log.warn(`rejected: origin "${normalizeOrigin(source) ?? 'invalid'}" not allowed`);
    throw new ForbiddenError('Cross-site request blocked');
  }
}
