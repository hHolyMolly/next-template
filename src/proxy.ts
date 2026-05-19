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

import { urls } from '@/configs/constants/urls';
import { createRateLimit, resolveClientIp } from '@/lib/rateLimit';
import { routing } from '@/services/i18n/routing';

import type { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

/**
 * Per-path rate limit overrides. The first match wins; the default budget
 * applies to everything else. Use `null` to opt a path out of rate-limiting
 * entirely (e.g. server-sent events, long-polling).
 */
const RATE_LIMIT_RULES: ReadonlyArray<{
  pattern: RegExp;
  config: { limit: number; windowSeconds: number } | null;
}> = [
  // Mutating auth endpoints — strict budget to blunt credential stuffing.
  { pattern: /^\/api\/auth\//, config: { limit: 10, windowSeconds: 60 } },
  // Health/readiness probes must never rate-limit.
  { pattern: /^\/api\/health(\/|$)/, config: null },
];

const DEFAULT_RATE_LIMIT = { limit: 100, windowSeconds: 60 } as const;

const limiters = new Map<string, ReturnType<typeof createRateLimit>>();
function getLimiter(cfg: { limit: number; windowSeconds: number }) {
  const key = `${cfg.limit}:${cfg.windowSeconds}`;
  let limiter = limiters.get(key);
  if (!limiter) {
    limiter = createRateLimit(cfg);
    limiters.set(key, limiter);
  }
  return limiter;
}

/**
 * IPs that should bypass the rate limiter (monitoring, internal cron, dev).
 * Populate via `RATE_LIMIT_BYPASS_IPS` env — comma-separated list.
 * Bypass only works when `TRUSTED_PROXY_HOPS` is set correctly.
 */
const BYPASS_IPS: ReadonlySet<string> = new Set(
  (process.env.RATE_LIMIT_BYPASS_IPS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
);

function pickRateLimit(pathname: string) {
  for (const rule of RATE_LIMIT_RULES) {
    if (rule.pattern.test(pathname)) return rule.config;
  }
  return DEFAULT_RATE_LIMIT;
}

// Allowed external origins for CSP directives.
// Add your API domain, CDN, analytics, etc.

const ALLOWED_CONNECT = [urls.server.api ? new URL(urls.server.api).origin : undefined].filter(
  Boolean,
) as string[];
const ALLOWED_IMG: string[] = []; // e.g. 'https://images.unsplash.com'
const ALLOWED_FONT = ['https://fonts.gstatic.com'];

// CSP violation reporting endpoint.
// Set to any reporting service URL (Report URI, own endpoint, etc.).
// Leave empty to disable CSP reporting.
const CSP_REPORT_URI = process.env.CSP_REPORT_URI ?? '';

// Trusted Types locks down DOM sink injection (innerHTML etc.) — can only
// be enforced safely once all third-party libs are audited. Enable in
// Report-Only first by setting `TRUSTED_TYPES_MODE=report` and watching reports.
const TRUSTED_TYPES_MODE = (process.env.TRUSTED_TYPES_MODE ?? 'off') as
  | 'off'
  | 'report'
  | 'enforce';

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const rateLimitConfig = pickRateLimit(pathname);

  if (rateLimitConfig) {
    const ip = resolveClientIp(request);
    if (!BYPASS_IPS.has(ip)) {
      const limiter = getLimiter(rateLimitConfig);
      const blocked = await limiter(request);
      if (blocked) return blocked;
    }
  }

  const response = intlMiddleware(request);

  // Generate CSP nonce for inline scripts (JSON-LD, etc.).
  // 16 cryptographically random bytes → base64 (~22 chars). Avoids `Buffer`,
  // which is polyfilled in the Edge runtime, and gives full 128-bit entropy
  // (base64-encoded UUID strings leak structure).
  const nonceBytes = new Uint8Array(16);
  crypto.getRandomValues(nonceBytes);
  const nonce = btoa(String.fromCharCode(...nonceBytes));

  const connectSrc = ["'self'", ...ALLOWED_CONNECT].join(' ');
  const imgSrc = ["'self'", 'data:', ...ALLOWED_IMG].join(' ');
  const fontSrc = ["'self'", ...ALLOWED_FONT].join(' ');

  // Set `CSP_STRICT_STYLES=true` to switch `style-src` onto the nonce.
  // Verify with `Content-Security-Policy-Report-Only` first — some Next.js
  // features still emit unnoticed inline styles (loading UI, image placeholders).
  const strictStyles = process.env.CSP_STRICT_STYLES === 'true';
  const styleSrc = strictStyles
    ? `style-src 'self' 'nonce-${nonce}'`
    : // 'unsafe-inline' is required because Next.js injects inline styles for:
      // - Loading indicators and Suspense fallbacks
      // - next/image placeholder and optimization styles
      // - Server Component streaming styles
      // Track: https://github.com/vercel/next.js/issues/39560
      "style-src 'self' 'unsafe-inline'";

  const directives: string[] = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    styleSrc,
    `img-src ${imgSrc}`,
    `font-src ${fontSrc}`,
    `connect-src ${connectSrc}`,
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    'upgrade-insecure-requests',
  ];

  if (TRUSTED_TYPES_MODE !== 'off') {
    // `default` + `next` policies cover React's DOM sinks and Next.js router.
    // Add your own policy names here as needed.
    directives.push("trusted-types default next 'allow-duplicates'");
    directives.push("require-trusted-types-for 'script'");
  }

  if (CSP_REPORT_URI) directives.push(`report-uri ${CSP_REPORT_URI}`);

  const csp = directives.join('; ');

  response.headers.set('x-nonce', nonce);

  // Enforce CSP in production; Report-Only mode lets you collect violations
  // without breaking the page while you tighten the policy.
  const cspHeader =
    TRUSTED_TYPES_MODE === 'report' || process.env.CSP_REPORT_ONLY === 'true'
      ? 'Content-Security-Policy-Report-Only'
      : 'Content-Security-Policy';
  response.headers.set(cspHeader, csp);

  return response;
}

export const config = {
  matcher:
    '/((?!api|trpc|_next|_vercel|assets|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|woff|woff2|ttf|otf|mp4|webm|xml|txt)$).*)',
};
