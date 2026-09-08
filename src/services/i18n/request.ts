import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';

import { projectConfig } from '@/configs/project';
import { namespaces } from '@/services/i18n/constants';
import { routing } from '@/services/i18n/routing';
import { logger } from '@/utils/logger';

import type { Messages } from 'next-intl';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  // Per-namespace try/catch is the only error handling needed — a missing
  // file degrades to an empty namespace instead of crashing the request.
  const messages = Object.assign(
    {},
    ...(await Promise.all(
      namespaces.map(async (ns) => {
        try {
          const mod = (await import(`../../messages/${locale}/${ns}.json`)) as {
            default?: Record<string, unknown>;
          };
          return { [ns]: mod.default ?? mod };
        } catch (err) {
          logger.error(`Error loading ${ns} for ${locale}:`, err);
          return { [ns]: {} };
        }
      }),
    )),
  ) as Messages;

  return {
    locale,
    messages,
    // Pinning the timezone keeps server-rendered dates/numbers identical to
    // the client output, eliminating hydration mismatches for `format.dateTime`
    // and locale-aware date formatters. Override via `projectConfig.i18n.timeZone`.
    timeZone: projectConfig.i18n.timeZone ?? 'UTC',

    // Handle missing translation keys gracefully.
    onError(error) {
      // Suppress known missing-key warnings in development.
      if (error.code === 'MISSING_MESSAGE') {
        logger.warn(`Missing i18n key: ${error.message}`);
        return;
      }
      logger.error('i18n error:', error.message);
    },

    getMessageFallback({ namespace, key }) {
      return `${namespace}.${key}`;
    },
  };
});
