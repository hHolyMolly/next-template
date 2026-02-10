import { defineRouting } from 'next-intl/routing';

import { locales, defaultLocale } from '@/services/i18n/constants';

/**
 * Конфигурация локализации.
 * localePrefix: 'never' при одной локали, 'as-needed' при нескольких.
 */
export const routing = defineRouting({
  locales,
  defaultLocale,
  localeDetection: locales.length > 1,
  localePrefix: locales.length > 1 ? 'as-needed' : 'never',
});
