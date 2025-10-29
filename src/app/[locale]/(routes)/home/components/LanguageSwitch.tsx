'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import classNames from 'classnames';
import { useParams } from 'next/navigation';

import { useRouter, usePathname } from '@services/i18n/navigation';
import { locales } from '@services/i18n/constants';

import { customCookieStorage } from '@services/storage';

const LanguageSwitch: React.FC = () => {
  const t = useTranslations('translations');
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const currentLocale = params.locale as string;

  const handleChangeLanguage = React.useCallback(
    (locale: string) => {
      if (locale === currentLocale) return console.warn('You are already using this language');
      customCookieStorage.set('NEXT_LOCALE', locale, { path: '/', maxAge: 31536000 });
      router.replace(pathname, {
        locale,
      });
    },
    [currentLocale, pathname, router],
  );

  return (
    locales &&
    locales.length > 1 && (
      <div>
        <div>{t('language_switch')}</div>

        <div>
          {locales.map((locale, idx: number) => (
            <button
              className={classNames(
                'px-[8px] py-[4px] rounded-[4px]',

                locale === currentLocale
                  ? 'bg-black text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600',
              )}
              onClick={() => handleChangeLanguage(locale)}
              type="button"
              key={`locale_${locale}${idx}`}
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
