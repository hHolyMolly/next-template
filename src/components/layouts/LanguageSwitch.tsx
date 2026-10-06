'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { useLocale, useTranslations } from 'next-intl';

import { localeFlags } from '@/components/layouts/localeFlags';
import { cn } from '@/lib/cn';
import { locales } from '@/services/i18n/constants';
import { Link, usePathname } from '@/services/i18n/navigation';

// Module-level: the locale list is static config, no need to re-check per render.
const hasMultipleLocales = locales.length > 1;

const itemVariants = cva(
  'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        /** Semantic tokens — for the light app chrome (Header). */
        default: '',
        /** White-on-dark — for surfaces with their own dark background (demo hero). */
        inverse: '',
      },
      active: { true: '', false: '' },
    },
    compoundVariants: [
      { variant: 'default', active: true, class: 'bg-accent text-foreground ring-1 ring-border' },
      {
        variant: 'default',
        active: false,
        class: 'text-muted-foreground hover:bg-accent hover:text-foreground',
      },
      { variant: 'inverse', active: true, class: 'bg-white/15 text-white ring-1 ring-white/20' },
      {
        variant: 'inverse',
        active: false,
        class: 'text-slate-400 hover:bg-white/5 hover:text-white',
      },
    ],
    defaultVariants: { variant: 'default', active: false },
  },
);

type LanguageSwitchProps = Pick<VariantProps<typeof itemVariants>, 'variant'> & {
  className?: string;
};

/**
 * Locale switcher — links to the SAME pathname in every other locale.
 * Mounted in the Header; the demo hero mounts a second, `inverse` one.
 * Renders nothing for single-locale projects.
 */
export function LanguageSwitch({ variant, className }: LanguageSwitchProps) {
  const currentLocale = useLocale();
  const t = useTranslations('translations.shared');
  const pathname = usePathname();

  if (!hasMultipleLocales) return null;

  return (
    <nav aria-label={t('language')} className={cn('flex gap-2', className)}>
      {locales.map((locale) => {
        const active = locale === currentLocale;
        return (
          <Link
            href={pathname}
            locale={locale}
            className={itemVariants({ variant, active })}
            key={locale}
            // 'true', not 'page': the link points at the SAME page in another
            // locale, so "current page" would be misleading — this marks the
            // currently selected option within the switcher.
            aria-current={active ? 'true' : undefined}
          >
            {localeFlags[locale]}
            {locale.toUpperCase()}
          </Link>
        );
      })}
    </nav>
  );
}
