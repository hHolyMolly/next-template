'use client';

import { useLocale, useTranslations } from 'next-intl';

import { localeFlags } from '@/app/[locale]/components/LanguageSwitch/flags';
import { cn } from '@/lib/cn';
import { locales } from '@/services/i18n/constants';
import { Link, usePathname } from '@/services/i18n/navigation';

// Module-level: the locale list is static config, no need to re-check per render.
const hasMultipleLocales = locales.length > 1;

export function LanguageSwitch() {
  const currentLocale = useLocale();
  const t = useTranslations('translations.shared');
  const pathname = usePathname();

  if (!hasMultipleLocales) return null;

  return (
    <nav aria-label={t('language')} className="flex gap-2">
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
          // 'true', not 'page': the link points at the SAME page in another
          // locale, so "current page" would be misleading — this marks the
          // currently selected option within the switcher.
          aria-current={locale === currentLocale ? 'true' : undefined}
        >
          {localeFlags[locale]}
          {locale.toUpperCase()}
        </Link>
      ))}
    </nav>
  );
}
