'use client';

import { useLocale } from 'next-intl';

import { cn } from '@/lib/cn';
import { Link, usePathname } from '@/services/i18n/navigation';
import { locales } from '@/services/i18n/constants';

import { localeFlags } from '@/app/[locale]/(routes)/home/components/LanguageSwitch/flags';

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
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
            locale === currentLocale
              ? 'bg-white/15 text-white ring-1 ring-white/20'
              : 'text-slate-400 hover:bg-white/5 hover:text-white',
          )}
          key={locale}
          aria-current={locale === currentLocale ? 'page' : undefined}
        >
          {localeFlags[locale]}
          {locale.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
