import { defineRouting } from 'next-intl/routing';

import { locales, defaultLocale } from '@/services/i18n/constants';

/**
 * Locale configuration.
 * localePrefix: 'never' for single locale, 'as-needed' for multiple.
 */
export const routing = defineRouting({
  locales,
  defaultLocale,
  localeDetection: locales.length > 1,
  localePrefix: locales.length > 1 ? 'as-needed' : 'never',
});
