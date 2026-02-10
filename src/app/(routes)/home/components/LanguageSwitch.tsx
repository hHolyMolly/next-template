'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';

import { locales } from '@/services/i18n/constants';

const LanguageSwitch: React.FC = () => {
  const t = useTranslations('translations');
  const currentLocale = useLocale();
  const router = useRouter();

  const handleChangeLanguage = React.useCallback(
    (locale: string) => {
      if (locale === currentLocale) return;
      document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
      router.refresh();
    },
    [currentLocale, router],
  );

  return (
    locales &&
    locales.length > 1 && (
      <div>
        <div>{t('language_switch')}</div>

        <div className="flex gap-2">
          {locales.map((locale) => (
            <button
              className={clsx(
                'px-[8px] py-[4px] rounded-[4px]',

                locale === currentLocale
                  ? 'bg-black text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600',
              )}
              onClick={() => handleChangeLanguage(locale)}
              type="button"
              key={locale}
            >
              {locale.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    )
  );
};

export default LanguageSwitch;
