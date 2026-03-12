/**
 * Next.js 16 Middleware (proxy convention).
 *
 * In Next.js 16, `proxy.ts` replaces the legacy `middleware.ts`.
 * The exported function name must match the filename (`proxy`),
 * and `config.matcher` controls which routes are intercepted.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 */

import createMiddleware from 'next-intl/middleware';
import { type NextRequest } from 'next/server';

import { routing } from '@/services/i18n/routing';
import { urls } from '@/configs/constants/urls';
import { createRateLimit } from '@/lib/rateLimit';

const intlMiddleware = createMiddleware(routing);

// Rate limiter: 100 requests per 60 seconds per IP.
// Adjust limits or remove if not needed.
const rateLimit = createRateLimit({ limit: 100, windowSeconds: 60 });

// Allowed external origins for CSP directives.
// Add your API domain, CDN, analytics, etc.
const ALLOWED_CONNECT = [urls.server.api ? new URL(urls.server.api).origin : undefined].filter(
  Boolean,
);
const ALLOWED_IMG: string[] = []; // e.g. 'https://images.unsplash.com'
const ALLOWED_FONT = ['https://fonts.gstatic.com'];

// CSP violation reporting endpoint.
// Set to your reporting service URL (e.g. Sentry, Report URI, own endpoint).
// Leave empty to disable CSP reporting.
const CSP_REPORT_URI = ''; // e.g. 'https://o0.ingest.sentry.io/api/0/security/?sentry_key=xxx'

export function proxy(request: NextRequest) {
  // Rate limiting — returns 429 if limit exceeded
  const rateLimited = rateLimit(request);
  if (rateLimited) return rateLimited;

  const response = intlMiddleware(request);

  // Generate CSP nonce for inline scripts (JSON-LD, etc.)
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  const connectSrc = ["'self'", ...ALLOWED_CONNECT].join(' ');
  const imgSrc = ["'self'", 'data:', ...ALLOWED_IMG].join(' ');
  const fontSrc = ["'self'", ...ALLOWED_FONT].join(' ');

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    // 'unsafe-inline' is required because Next.js injects inline styles for:
    // - Loading indicators and Suspense fallbacks
    // - next/image placeholder and optimization styles
    // - Server Component streaming styles
    // A nonce-based approach for styles is not yet supported by Next.js.
    // Track: https://github.com/vercel/next.js/issues/39560
    "style-src 'self' 'unsafe-inline'",
    `img-src ${imgSrc}`,
    `font-src ${fontSrc}`,
    `connect-src ${connectSrc}`,
    "frame-ancestors 'self'",
    ...(CSP_REPORT_URI ? [`report-uri ${CSP_REPORT_URI}`] : []),
  ].join('; ');

  response.headers.set('x-nonce', nonce);
  response.headers.set('Content-Security-Policy', csp);

  return response;
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
