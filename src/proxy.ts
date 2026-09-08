/**
 * Next.js 16 Middleware (proxy convention).
 *
 * In Next.js 16, `proxy.ts` replaces the legacy `middleware.ts`.
 * The exported function name must match the filename (`proxy`),
 * and `config.matcher` controls which routes are intercepted.
 *
 * Composition: rate limit (pages only) → CSP nonce onto REQUEST headers →
 * next-intl routing → CSP mirrored onto the response.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 */

import { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { urls } from '@/configs/constants/urls';
import { normalizeOrigin } from '@/lib/origin';
import { createRateLimiter, rateLimitResponse, resolveClientIp } from '@/lib/rateLimit';
import { routing } from '@/services/i18n/routing';

const intlMiddleware = createMiddleware(routing);

/**
 * Per-path rate limit overrides. The first match wins; the default budget
 * applies to everything else. Use `null` to opt a path out of rate-limiting
 * entirely (e.g. server-sent events, long-polling).
 *
 * NOTE: `config.matcher` below excludes `/api` — these rules only ever see
 * page traffic. API routes rate-limit themselves via `withApiHandler`
 * (src/lib/withApiHandler.ts), which is where per-endpoint budgets belong.
 */
const RATE_LIMIT_RULES: ReadonlyArray<{
  pattern: RegExp;
  config: { limit: number; windowSeconds: number } | null;
}> = [
  // Example: stricter budget for an expensive page.
  // { pattern: /^\/search(\/|$)/, config: { limit: 30, windowSeconds: 60 } },
];

const DEFAULT_RATE_LIMIT = { limit: 100, windowSeconds: 60 } as const;

// Bounded: keyed by distinct configs from the static rules above, not by
// request data — at most RATE_LIMIT_RULES.length + 1 entries ever exist.
const limiters = new Map<string, ReturnType<typeof createRateLimiter>>();
function getLimiter(cfg: { limit: number; windowSeconds: number }) {
  const key = `${cfg.limit}:${cfg.windowSeconds}`;
  let limiter = limiters.get(key);
  if (!limiter) {
    limiter = createRateLimiter(cfg);
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

// ─────────────────────────────────────────────────────────────────────────────
// CSP
// ─────────────────────────────────────────────────────────────────────────────

// Allowed external origins for CSP directives. Add your API domain, CDN,
// analytics, etc. The Web Vitals beacon endpoint must be reachable too.
const ALLOWED_CONNECT = [urls.server.api, process.env.NEXT_PUBLIC_VITALS_ENDPOINT]
  .filter((value): value is string => Boolean(value))
  .map((value) => normalizeOrigin(value))
  .filter((value): value is string => Boolean(value));
const ALLOWED_IMG: string[] = []; // e.g. 'https://images.unsplash.com'
const ALLOWED_FONT = ['https://fonts.gstatic.com'];

// CSP violation reporting endpoint. Validated here because middleware runs in
// the Edge runtime where `validateEnv()` (instrumentation) never executes —
// a malformed value would corrupt the whole CSP header.
const CSP_REPORT_URI = normalizeOrigin(process.env.CSP_REPORT_URI ?? '')
  ? (process.env.CSP_REPORT_URI as string)
  : '';

// Trusted Types locks down DOM sink injection (innerHTML etc.). Roll out via
// `TRUSTED_TYPES_MODE=report` first. Unknown values fall back to 'off' — a
// typo must never silently ENFORCE and break every DOM sink in production.
const TT_MODES = ['off', 'report', 'enforce'] as const;
type TrustedTypesMode = (typeof TT_MODES)[number];
const TRUSTED_TYPES_MODE: TrustedTypesMode = TT_MODES.includes(
  process.env.TRUSTED_TYPES_MODE as TrustedTypesMode,
)
  ? (process.env.TRUSTED_TYPES_MODE as TrustedTypesMode)
  : 'off';

const TRUSTED_TYPES_DIRECTIVES = [
  // `default` + `next` policies cover React's DOM sinks and Next.js router.
  "trusted-types default next 'allow-duplicates'",
  "require-trusted-types-for 'script'",
];

/**
 * Build the CSP for one request.
 *
 * NOTE: a per-request nonce with `strict-dynamic` makes every matched page
 * effectively dynamic — a statically cached HTML shell would carry a stale
 * nonce. Keep this in mind before enabling `cacheComponents`.
 */
function buildCsp(nonce: string): string {
  const connectSrc = ["'self'", ...ALLOWED_CONNECT].join(' ');
  const imgSrc = ["'self'", 'data:', ...ALLOWED_IMG].join(' ');
  const fontSrc = ["'self'", ...ALLOWED_FONT].join(' ');

  // Set `CSP_STRICT_STYLES=true` to switch `style-src` onto the nonce.
  // Verify with `Content-Security-Policy-Report-Only` first — some Next.js
  // features still emit unnoticed inline styles (loading UI, image placeholders).
  const strictStyles = process.env.CSP_STRICT_STYLES === 'true';
  const styleSrc = strictStyles
    ? // `style-src-attr 'unsafe-inline'` must stay even in strict mode:
      // Radix Popper / floating-ui position popovers via inline `style`
      // ATTRIBUTES (not <style> tags) — without this carve-out every
      // dropdown/tooltip renders at 0,0. `style-src-elem` (the tags) is
      // what the nonce actually locks down. Verified in production use.
      `style-src-elem 'self' 'nonce-${nonce}'; style-src-attr 'unsafe-inline'; style-src 'self' 'nonce-${nonce}'`
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

  // In `enforce` mode Trusted Types join the main policy. In `report` mode
  // they go into a SEPARATE report-only header (see proxy()) — flipping the
  // whole CSP to report-only would silently drop XSS enforcement while
  // piloting Trusted Types.
  if (TRUSTED_TYPES_MODE === 'enforce') {
    directives.push(...TRUSTED_TYPES_DIRECTIVES);
  }

  if (CSP_REPORT_URI) {
    // `report-uri` is deprecated but still the most supported; `report-to`
    // requires the Reporting-Endpoints header set in proxy().
    directives.push(`report-uri ${CSP_REPORT_URI}`, 'report-to csp-endpoint');
  }

  return directives.join('; ');
}

// ─────────────────────────────────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const rateLimitConfig = pickRateLimit(pathname);

  if (rateLimitConfig) {
    // `null` = identity unknown (no trusted proxy config) → skip limiting;
    // one shared bucket would rate-limit the whole site as a single client.
    const ip = resolveClientIp(request);
    if (ip !== null && !BYPASS_IPS.has(ip)) {
      const result = getLimiter(rateLimitConfig)(ip);
      if (!result.success) return rateLimitResponse(result);
    }
  }

  // Generate CSP nonce for inline scripts (JSON-LD, etc.).
  // 16 cryptographically random bytes → base64 (~22 chars). Avoids `Buffer`,
  // which is polyfilled in the Edge runtime, and gives full 128-bit entropy.
  const nonceBytes = new Uint8Array(16);
  crypto.getRandomValues(nonceBytes);
  const nonce = btoa(String.fromCharCode(...nonceBytes));

  const csp = buildCsp(nonce);

  // Report-Only mode lets you collect violations without breaking the page
  // while you tighten the policy.
  const reportOnly = process.env.CSP_REPORT_ONLY === 'true';
  const cspHeader = reportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy';

  // The nonce and CSP MUST travel on the REQUEST headers:
  // - `headers()` in Server Components reads request headers (`x-nonce`
  //   in src/app/layout.tsx would be undefined otherwise);
  // - Next.js extracts the nonce for its own bootstrap/hydration scripts
  //   from the CSP request header — without it, `strict-dynamic` blocks
  //   hydration in production (and floods reports in report-only mode).
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set(cspHeader, csp);

  const response = intlMiddleware(new NextRequest(request, { headers: requestHeaders }));

  // Mirror the CSP on the response so the browser actually enforces it.
  response.headers.set(cspHeader, csp);

  // Trusted Types pilot: report violations without dropping XSS enforcement.
  if (TRUSTED_TYPES_MODE === 'report' && !reportOnly) {
    response.headers.set(
      'Content-Security-Policy-Report-Only',
      [
        ...TRUSTED_TYPES_DIRECTIVES,
        ...(CSP_REPORT_URI ? [`report-uri ${CSP_REPORT_URI}`, 'report-to csp-endpoint'] : []),
      ].join('; '),
    );
  }

  if (CSP_REPORT_URI) {
    response.headers.set('Reporting-Endpoints', `csp-endpoint="${CSP_REPORT_URI}"`);
  }

  return response;
}

export const config = {
  // Path-boundary anchored: `/api/...` is excluded but `/apiary` is matched.
  // Extensionless metadata routes (manifest, OG images, icons) must also be
  // excluded or locale detection 307-redirects them into 404s.
  matcher:
    '/((?!(?:api|trpc|_next|_vercel|assets)(?:/|$)|favicon\\.ico$|manifest\\.webmanifest$|sitemap\\.xml$|robots\\.txt$|opengraph-image|twitter-image|apple-icon|icon\\d?$|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|woff|woff2|ttf|otf|mp4|webm|xml|txt)$).*)',
};
