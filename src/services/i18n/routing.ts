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
  // Persist the user's chosen locale for a year. next-intl reads this cookie
  // on every request so subsequent visits skip the Accept-Language negotiation.
  // Name is the Next.js-standard `NEXT_LOCALE`.
  localeCookie: {
    name: 'NEXT_LOCALE',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  },
});
