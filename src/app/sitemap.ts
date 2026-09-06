import { urls } from '@/configs/constants/urls';
import { projectConfig } from '@/configs/project';

import type { MetadataRoute } from 'next';

/**
 * Generates locale-aware alternate URLs for a given path, including
 * the `x-default` hreflang which Google uses when no other locale matches.
 *
 * For `localePrefix: 'as-needed'`, the default locale lives at the root path
 * (no prefix) — mirror that here by pointing `x-default` at the unprefixed URL.
 */
function makeAlternates(path: string): Record<string, string> {
  const { locales, defaultLocale } = projectConfig.i18n;
  const entries = locales.map((locale) => {
    // Under `as-needed` the default locale is unprefixed — a prefixed URL
    // (e.g. /en) would redirect, and sitemaps must not list redirecting URLs.
    const prefix = locale === defaultLocale ? '' : `/${locale}`;
    return [locale, `${urls.website}${prefix}${path}`] as const;
  });
  return {
    ...Object.fromEntries(entries),
    'x-default': `${urls.website}${path}`,
  };
}

type Page = {
  path: string;
  priority?: number;
  changeFrequency?: MetadataRoute.Sitemap[number]['changeFrequency'];
};

/**
 * Register project pages here. The root `/` is added automatically — list
 * secondary routes (`/about`, `/contact`, …) below so they get localized
 * alternates without extra boilerplate.
 */
const pages: readonly Page[] = [
  // { path: '/about',   priority: 0.8, changeFrequency: 'monthly' },
  // { path: '/contact', priority: 0.6, changeFrequency: 'yearly' },
];

/**
 * Generates `sitemap.xml` based on project configuration.
 *
 * When `projectConfig.sitemap` is `false` (e.g. non-production),
 * an empty sitemap is returned to prevent indexing.
 *
 * To completely disable sitemap generation, remove this file.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!projectConfig.sitemap) return [];

  const now = new Date();

  const root: MetadataRoute.Sitemap[number] = {
    url: urls.website,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 1,
    alternates: { languages: makeAlternates('') },
  };

  const extra: MetadataRoute.Sitemap = pages.map((page) => ({
    url: `${urls.website}${page.path}`,
    lastModified: now,
    ...(page.changeFrequency ? { changeFrequency: page.changeFrequency } : {}),
    ...(page.priority !== undefined ? { priority: page.priority } : {}),
    alternates: { languages: makeAlternates(page.path) },
  }));

  return [root, ...extra];
}
