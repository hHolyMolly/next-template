import { type ProjectConfig } from '@/types';

/**
 * Centralized project configuration.
 * Single source of truth for all settings.
 */
export const projectConfig: ProjectConfig = {
  name: 'next-template',

  i18n: {
    defaultLocale: 'ru',
    locales: ['ru', 'en'],
  },

  /** Production flags. Disabled in dev to prevent crawling. */
  sitemap: process.env.NODE_ENV === 'production',
  robots: process.env.NODE_ENV === 'production',
} as const;
