/**
 * Next.js 16 Middleware (proxy convention).
 *
 * In Next.js 16, `proxy.ts` replaces the legacy `middleware.ts` and always
 * runs on the Node.js runtime. The exported function name must match the
 * filename (`proxy`), and `config.matcher` controls which routes are
 * intercepted.
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
import {
  checkIdentity,
  createRateLimiter,
  rateLimitResponse,
  type RateLimitConfig,
} from '@/lib/rateLimit';
import { routing } from '@/services/i18n/routing';

const intlMiddleware = createMiddleware(routing);

/**
 * Per-path rate limit overrides. The first match wins; the default budget
 * applies to everything else. Use `null` to opt a path out of rate-limiting
 * entirely (e.g. server-sent events, long-polling).
 *
 * NOTE: `config.matcher` below excludes `/api` — these rules only ever see
 * page traffic (including Server Action POSTs, which target the page URL).
 * API routes rate-limit themselves via `withApiHandler`
 * (src/lib/withApiHandler/), which is where per-endpoint budgets belong.
 * Bypass IPs (`RATE_LIMIT_BYPASS_IPS`) are honoured inside `checkIdentity`.
 */
const RATE_LIMIT_RULES: ReadonlyArray<{ pattern: RegExp; config: RateLimitConfig | null }> = [
  // Example: stricter budget for an expensive page.
  // { pattern: /^\/search(\/|$)/, config: { limit: 30, windowSeconds: 60 } },
];

const DEFAULT_RATE_LIMIT: RateLimitConfig = { limit: 100, windowSeconds: 60 };

// One limiter PER RULE (index-aligned), never per config shape — two rules
// with equal numbers must not share a bucket. Bounded: rules.length + 1.
const ruleLimiters: ReadonlyArray<ReturnType<typeof createRateLimiter> | null> =
  RATE_LIMIT_RULES.map((rule) => (rule.config ? createRateLimiter(rule.config) : null));
const defaultLimiter = createRateLimiter(DEFAULT_RATE_LIMIT);

function pickLimiter(pathname: string) {
  for (const [index, rule] of RATE_LIMIT_RULES.entries()) {
    if (rule.pattern.test(pathname)) return ruleLimiters[index] ?? null;
  }
  return defaultLimiter;
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

// CSP violation reporting endpoint. Parsed here (not just validated) because
// this module is evaluated at module scope, possibly before `validateEnv()`
// — and the NORMALIZED `href` is what goes into the header: a raw value
// containing `;` would inject extra CSP directives.
const CSP_REPORT_URI = parseReportUri(process.env.CSP_REPORT_URI);

function parseReportUri(value: string | undefined): string {
  if (!value) return '';
  try {
    const url = new URL(value);
    return /^https?:$/.test(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

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
function buildCsp(nonce: string, options: { https: boolean }): string {
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
    // Only when the page itself is served over HTTPS. On a plain-http origin
    // (local `pnpm start`, dev) browsers upgrade every same-origin fetch and
    // Link prefetch to https:// → ERR_SSL_PROTOCOL_ERROR, broken navigation.
    ...(options.https ? ['upgrade-insecure-requests'] : []),
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
  // Server Action POSTs hit the page URL and pass through here too — they
  // consume this per-IP page budget AND their own `withActionRateLimit`
  // budget. Don't short-circuit on the `next-action` header: it is
  // client-controlled. Identity unknown → `checkIdentity` skips (one shared
  // bucket would rate-limit the whole site as a single client).
  const limiter = pickLimiter(request.nextUrl.pathname);
  if (limiter) {
    const outcome = checkIdentity(request, limiter, { scope: 'page' });
    if (outcome.kind === 'checked' && !outcome.result.success) {
      return rateLimitResponse(outcome.result);
    }
  }

  // Generate CSP nonce for inline scripts (JSON-LD, etc.).
  // 16 cryptographically random bytes → base64 (~22 chars), full 128-bit entropy.
  const nonceBytes = new Uint8Array(16);
  crypto.getRandomValues(nonceBytes);
  const nonce = btoa(String.fromCharCode(...nonceBytes));

  // Behind a TLS-terminating proxy the request URL is http — trust the
  // forwarded protocol header the proxy sets.
  const https =
    request.nextUrl.protocol === 'https:' || request.headers.get('x-forwarded-proto') === 'https';
  const csp = buildCsp(nonce, { https });

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
