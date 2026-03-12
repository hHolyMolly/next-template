import { type NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import createBundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
  poweredByHeader: false,

  images: {
    remotePatterns: [
      // Add allowed image domains here:
      // { protocol: 'https', hostname: 'example.com', pathname: '/images/**' },
    ],
  },

  experimental: {
    // Partial Prerendering — serves a static shell instantly, then streams dynamic parts.
    // Requires React Suspense boundaries to mark dynamic sections.
    // Set to 'incremental' to opt-in per route via `export const experimental_ppr = true`.
    // @see https://nextjs.org/docs/app/api-reference/config/next-config-js/ppr
    // ppr: 'incremental',
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
          // CSP is set dynamically via proxy.ts with per-request nonce.
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin('./src/services/i18n/request.ts');
export default withBundleAnalyzer(withNextIntl(nextConfig));
