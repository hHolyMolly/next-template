import { type ProjectConfig } from '@/types';

/**
 * Централизованная конфигурация проекта.
 * Единый источник истины для настроек.
 */
export const projectConfig: ProjectConfig = {
  name: 'next-template',

  i18n: {
    defaultLocale: 'ru',
    locales: ['ru', 'en'],
  },

  /** Флаги для production. В dev всегда отключено. */
  sitemap: true,
  robots: true,
} as const;
