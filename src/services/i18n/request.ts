import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';

import { projectConfig } from '@/configs/project';
import { namespaces } from '@/services/i18n/constants';
import { routing } from '@/services/i18n/routing';
import { logger } from '@/utils/logger';

type TypeMessages = {
  [key: string]: string | TypeMessages;
};

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  let messages: TypeMessages = {};

  try {
    messages = Object.assign(
      {},
      ...(await Promise.all(
        namespaces.map(async (ns) => {
          try {
            const mod = await import(`../../../public/locales/${locale}/${ns}.json`);
            return { [ns]: mod.default ?? mod };
          } catch (err) {
            logger.error(`Error loading ${ns} for ${locale}:`, err);
            return { [ns]: {} };
          }
        }),
      )),
    );
  } catch (err) {
    logger.error(`Failed to load messages for ${locale}`, err);
  }

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
