'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import clsx from 'clsx';

import { Link, usePathname } from '@/services/i18n/navigation';
import { locales } from '@/services/i18n/constants';

import { localeFlags } from './flags';

export default function LanguageSwitch() {
  const currentLocale = useLocale();
  const pathname = usePathname();

  if (locales.length <= 1) return null;

  return (
    <div className="flex gap-2">
      {locales.map((locale) => (
        <Link
          href={pathname}
          locale={locale}
          className={clsx(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
            locale === currentLocale
              ? 'bg-white/15 text-white ring-1 ring-white/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5',
          )}
          key={locale}
        >
          {localeFlags[locale]}
          {locale.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
