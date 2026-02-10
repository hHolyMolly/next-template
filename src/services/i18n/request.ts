import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import fs from 'fs/promises';
import path from 'path';

import { namespaces, defaultLocale, locales } from '@/services/i18n/constants';

type TypeMessages = {
  [key: string]: string | TypeMessages;
};

/**
 * Определение локали без middleware:
 * 1. Cookie NEXT_LOCALE
 * 2. Accept-Language заголовок
 * 3. Локаль по умолчанию
 */
async function resolveLocale(): Promise<string> {
  try {
    const cookieStore = await cookies();
    const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;

    if (localeCookie && locales.includes(localeCookie)) {
      return localeCookie;
    }

    const headerStore = await headers();
    const acceptLanguage = headerStore.get('accept-language');

    if (acceptLanguage) {
      const preferred = acceptLanguage.split(',')[0]?.split('-')[0]?.trim();
      if (preferred && locales.includes(preferred)) {
        return preferred;
      }
    }
  } catch {
    // cookies/headers могут быть недоступны в некоторых контекстах
  }

  return defaultLocale;
}

export default getRequestConfig(async () => {
  const locale = await resolveLocale();

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
