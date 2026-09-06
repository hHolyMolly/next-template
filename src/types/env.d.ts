// `@total-typescript/ts-reset` — hardens stdlib types so common patterns are
// safer without casts:
//   - `.json()` and `JSON.parse()` return `unknown` (instead of `any`)
//   - `.filter(Boolean)` narrows the falsy values out
//   - `Array.isArray` accepts `readonly unknown[]`
// See: https://github.com/total-typescript/ts-reset
import '@total-typescript/ts-reset';

// The ts-reset import makes this file a module, so the ProcessEnv augmentation
// must be wrapped in `declare global` to reach the global scope.
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly NODE_ENV: 'development' | 'production' | 'test';

      /** Client application URL (metadataBase, canonical, sitemap, CSRF allowlist) */
      readonly NEXT_PUBLIC_CLIENT_URL: string;

      /** Server API URL (for SSR requests) */
      readonly NEXT_PUBLIC_SERVER_URL?: string;

      /** Web Vitals beacon endpoint (src/lib/webVitals.tsx) */
      readonly NEXT_PUBLIC_VITALS_ENDPOINT?: string;

      /** 'true' → send Content-Security-Policy-Report-Only instead of enforcing */
      readonly CSP_REPORT_ONLY?: string;

      /** CSP violation reporting endpoint */
      readonly CSP_REPORT_URI?: string;

      /** 'true' → nonce-based style-src (no 'unsafe-inline') */
      readonly CSP_STRICT_STYLES?: string;

      /** Trusted Types rollout: 'off' | 'report' | 'enforce' */
      readonly TRUSTED_TYPES_MODE?: string;

      /** Reverse-proxy layers in front of the app (x-forwarded-for parsing) */
      readonly TRUSTED_PROXY_HOPS?: string;

      /** Comma-separated IPs that bypass rate limiting */
      readonly RATE_LIMIT_BYPASS_IPS?: string;

      /** 'true' → enable @next/bundle-analyzer during build */
      readonly ANALYZE?: string;

      /** Port used by `next dev` / `next start` */
      readonly PORT?: string;
    }
  }
}
