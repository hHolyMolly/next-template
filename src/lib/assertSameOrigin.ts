import { headers } from 'next/headers';

import { urls } from '@/configs/constants/urls';

/**
 * Cheap CSRF defense for Server Actions / Route Handlers.
 *
 * Compares the `Origin` (preferred) or `Referer` header of the incoming
 * request against `NEXT_PUBLIC_CLIENT_URL`. Same-site browsers set one of
 * these for state-changing requests, so a mismatch indicates a cross-site
 * submission.
 *
 * Next.js 16 Server Actions already include an action-id secret, but this
 * helper adds defense-in-depth and is mandatory for plain Route Handlers
 * that perform mutations.
 *
 * @throws If the origin does not match (HTTP 403-style Error).
 *
 * @example
 * // In a Server Action or Route Handler:
 * export async function deleteItem(id: string) {
 *   'use server';
 *   await assertSameOrigin();
 *   // ...mutation
 * }
 */
export async function assertSameOrigin(extraAllowed: string[] = []): Promise<void> {
  const h = await headers();
  const origin = h.get('origin');
  const referer = h.get('referer');
  const source = origin ?? referer;

  if (!source) {
    throw new Error('CSRF: missing Origin/Referer header');
  }

  let host: string;
  try {
    host = new URL(source).origin;
  } catch {
    throw new Error('CSRF: invalid Origin/Referer header');
  }

  const allowed = new Set<string>([
    new URL(urls.website).origin,
    ...extraAllowed.map((v) => new URL(v).origin),
  ]);

  if (!allowed.has(host)) {
    throw new Error(`CSRF: origin "${host}" is not allowed`);
  }
}
