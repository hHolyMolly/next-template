import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import fs from 'fs/promises';
import path from 'path';

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
            const filePath = path.join(process.cwd(), 'public', 'locales', locale, `${ns}.json`);
            const text = await fs.readFile(filePath, 'utf-8');

            if (!text) {
              console.warn(`Empty JSON for ${ns} in ${locale}`);
              return { [ns]: {} };
            }

            let data;

            try {
              data = JSON.parse(text);
            } catch (err) {
              console.error(`Invalid JSON in ${ns} for ${locale}`, err);
              data = {};
            }

            return { [ns]: data };
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
