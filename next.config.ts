import createNextIntlPlugin from 'next-intl/plugin';

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    // Serve modern formats when the browser advertises support.
    // Next.js picks AVIF → WebP → original in that order.
    formats: ['image/avif', 'image/webp'],
    // Cache optimized images for 1 hour minimum at the edge.
    minimumCacheTTL: 60 * 60,
    // Explicit size buckets keep the srcset compact and predictable.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      // Add allowed image domains here:
      // { protocol: 'https', hostname: 'example.com', pathname: '/images/**' },
    ],
  },

  // React Compiler auto-memoizes components — opt in and drop most useMemo/useCallback.
  // Requires `babel-plugin-react-compiler`. Disable if you hit perf regressions.
  // @see https://react.dev/learn/react-compiler
  reactCompiler: true,

  // Cache Components (Next.js 16+) — static shell is served instantly and
  // dynamic parts stream in. Replaces the former `experimental.ppr: 'incremental'`.
  // Enabling this is an all-or-nothing switch: every dynamic data access must
  // be wrapped in <Suspense> or the build will fail. Opt in once the app is
  // audited for Suspense boundaries.
  // @see https://nextjs.org/docs/app/getting-started/cache-components
  // cacheComponents: true,

  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // Cross-origin isolation — blocks cross-origin popups from sharing a
          // browsing context group. Required for SharedArrayBuffer / high-precision timers.
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
          // COEP credentialless locks out cross-origin resources that don't opt in via CORP.
          // Uncomment only after auditing every third-party image/script/font.
          // { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' },

          // Permissions-Policy — deny all powerful APIs by default. Allow per-feature
          // via `self` or a specific origin, e.g. `camera=(self)` for a video-call page.
          {
            key: 'Permissions-Policy',
            value: [
              'accelerometer=()',
              'ambient-light-sensor=()',
              'autoplay=(self)',
              'battery=()',
              'camera=()',
              'display-capture=()',
              'document-domain=()',
              'encrypted-media=()',
              'fullscreen=(self)',
              'geolocation=()',
              'gyroscope=()',
              'hid=()',
              'idle-detection=()',
              'magnetometer=()',
              'microphone=()',
              'midi=()',
              'payment=()',
              'picture-in-picture=(self)',
              'publickey-credentials-get=()',
              'screen-wake-lock=()',
              'serial=()',
              'sync-xhr=()',
              'usb=()',
              'web-share=(self)',
              'xr-spatial-tracking=()',
              'interest-cohort=()',
            ].join(', '),
          },
          // CSP is set dynamically via proxy.ts with per-request nonce.
        ],
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin('./src/services/i18n/request.ts');

/**
 * Enable bundle analysis with:
 *   ANALYZE=true pnpm build
 * `@next/bundle-analyzer` is loaded on demand to avoid paying for it in CI.
 */
async function withAnalyzer(cfg: NextConfig): Promise<NextConfig> {
  if (process.env.ANALYZE !== 'true') return cfg;
  try {
    const mod = await import('@next/bundle-analyzer');
    return mod.default({ enabled: true })(cfg);
  } catch {
    console.warn('[next.config] @next/bundle-analyzer not installed — skipping');
    return cfg;
  }
}

const config = withNextIntl(nextConfig);

export default async function nextConfigFactory(): Promise<NextConfig> {
  return withAnalyzer(config);
}
