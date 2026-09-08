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

  /** Production flags. Disabled in dev to prevent crawling. */
  sitemap: process.env.NODE_ENV === 'production',
  robots: process.env.NODE_ENV === 'production',
} as const satisfies ProjectConfig;
