import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';

import { namespaces } from '@/services/i18n/constants';
import { routing } from '@/services/i18n/routing';

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
            console.error(`Error loading ${ns} for ${locale}:`, err);
            return { [ns]: {} };
          }
        }),
      )),
    );
  } catch (err) {
    console.error(`Failed to load messages for ${locale}`, err);
  }

  return {
    locale,
    messages,
  };
});
