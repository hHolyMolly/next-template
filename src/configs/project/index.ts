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

  /** Production flags. Always disabled in dev. */
  sitemap: true,
  robots: true,
} as const;
