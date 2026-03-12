import { type ProjectConfig } from '@/types';
import { logger } from '@/utils/logger';

/**
 * Validate and apply fallbacks for project configuration.
 * Logs warnings for invalid fields instead of crashing.
 */
function validateConfig(cfg: ProjectConfig): ProjectConfig {
  const validated = { ...cfg };

  if (!validated.name) {
    logger.warn('Missing config: name — defaulting to "app"');
    validated.name = 'app';
  }

  if (!validated.i18n?.locales?.length) {
    logger.warn('Missing config: i18n.locales — defaulting to ["en"]');
    validated.i18n = { ...validated.i18n, defaultLocale: 'en', locales: ['en'] };
  }

  if (!validated.i18n.locales.includes(validated.i18n.defaultLocale)) {
    logger.warn(
      `Config: defaultLocale "${validated.i18n.defaultLocale}" not in locales — using "${validated.i18n.locales[0]}"`,
    );
    validated.i18n = { ...validated.i18n, defaultLocale: validated.i18n.locales[0]! };
  }

  return validated;
}

/**
 * Centralized project configuration.
 * Single source of truth for all settings.
 */
export const projectConfig: ProjectConfig = validateConfig({
  name: 'next-template',

  i18n: {
    defaultLocale: 'en',
    locales: ['ru', 'en'],
  },

  /** Production flags. Disabled in dev to prevent crawling. */
  sitemap: process.env.NODE_ENV === 'production',
  robots: process.env.NODE_ENV === 'production',
});
