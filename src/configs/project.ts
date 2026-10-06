import type { ProjectConfig } from '@/types';

/**
 * Centralized project configuration.
 * Single source of truth for all settings.
 *
 * `as const satisfies ProjectConfig` gives compile-time validation while the
 * literal type survives — `Locale` in src/types is derived from
 * `projectConfig.i18n.locales` and must stay a union of literals
 * ('ru' | 'en'), not `string`. Invalid configs fail `pnpm typecheck`,
 * so no runtime validation is needed.
 */
export const projectConfig = {
  name: 'next-template',

  i18n: {
    defaultLocale: 'en',
    locales: ['ru', 'en'],
    timeZone: 'UTC',
  },

  /**
   * Brand colors used OUTSIDE the CSS cascade — viewport `themeColor`, the
   * web manifest and the generated icons/OG image (`next/og` ships no CSS).
   * In-app colors stay in `src/styles/vars.css`.
   */
  theme: {
    /** Page/browser-chrome background — single light theme by design. */
    background: '#ffffff',
    /** Dark brand surface for the app icon and share image. */
    brand: '#0b0b0d',
    /** Text on top of `brand`. */
    onBrand: '#ffffff',
  },

  /** Production flags. Disabled in dev to prevent crawling. */
  sitemap: process.env.NODE_ENV === 'production',
  robots: process.env.NODE_ENV === 'production',
} as const satisfies ProjectConfig;
