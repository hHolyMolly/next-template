import { urls } from '@/configs/constants/urls';
import { projectConfig } from '@/configs/project';

/**
 * The ONE hreflang rule, shared by page metadata (`getBaseMetadata`) and
 * `app/sitemap.ts` so the two can't drift:
 *
 * - Under `localePrefix: 'as-needed'` the default locale lives UNPREFIXED —
 *   a prefixed URL (e.g. `/en`) would redirect, and neither hreflang nor
 *   sitemaps may list redirecting URLs.
 * - `x-default` points at the unprefixed URL (what Google serves when no
 *   listed locale matches).
 *
 * @param path Route-relative path (`'/'`, `'/about'`).
 */
export function buildLocaleAlternates(path: string): Record<string, string> {
  const { locales, defaultLocale } = projectConfig.i18n;
  const suffix = path === '/' ? '' : path;

  const entries: Record<string, string> = {};
  for (const locale of locales) {
    const prefix = locale === defaultLocale ? '' : `/${locale}`;
    entries[locale] = `${urls.website}${prefix}${suffix}`;
  }
  entries['x-default'] = `${urls.website}${suffix}`;
  return entries;
}
