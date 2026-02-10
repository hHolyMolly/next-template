'use client';

import { useLocale } from 'next-intl';
import clsx from 'clsx';

import { Link, usePathname } from '@/services/i18n/navigation';
import { locales } from '@/services/i18n/constants';

function LanguageSwitch() {
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
            'px-2 py-1 rounded text-sm font-medium transition-colors',
            locale === currentLocale ? 'bg-white text-black' : 'text-slate-400 hover:text-white',
          )}
          key={locale}
        >
          {locale.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}

export default LanguageSwitch;
