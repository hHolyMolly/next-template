import { getLocale, getTranslations } from 'next-intl/server';

import { urls } from '@/configs/constants/urls';
import { projectConfig } from '@/configs/project';

import type { Metadata } from 'next';

/**
 * Build a full preview image URL from a path in `public/`.
 *
 * @example
 * previewImage('/assets/img/previews/global.webp')
 */
export function previewImage(path: string): string {
  return `${urls.website}${path}`;
}

const PREVIEW_IMAGE = previewImage('/assets/img/previews/global.webp');

/** Build `alternates.languages` for every configured locale. */
function buildLanguageAlternates(path: string): Record<string, string> {
  const { locales, defaultLocale } = projectConfig.i18n;
  const entries: Record<string, string> = {};
  for (const locale of locales) {
    const prefix = locale === defaultLocale ? '' : `/${locale}`;
    entries[locale] = `${urls.website}${prefix}${path === '/' ? '' : path}`;
  }
  entries['x-default'] = `${urls.website}${path === '/' ? '' : path}`;
  return entries;
}

/**
 * Base metadata for all pages.
 * All texts (including titleTemplate) come from i18n JSON files.
 *
 * @param path Route-relative path (e.g. `/template`) used to build canonical
 *             + hreflang URLs. Defaults to `/` — override per page.
 */
async function getBaseMetadata(path = '/'): Promise<Metadata> {
  const [t, locale] = await Promise.all([getTranslations('metadata.global'), getLocale()]);

  const title = t('title');
  const description = t('description');
  const localizedPath = locale === projectConfig.i18n.defaultLocale ? path : `/${locale}${path}`;
  const canonical = `${urls.website}${localizedPath === '/' ? '' : localizedPath}`;

  return {
    title,
    description,
    metadataBase: new URL(urls.website || 'http://localhost:3000'),

    alternates: {
      canonical,
      languages: buildLanguageAlternates(path),
    },

    openGraph: {
      type: 'website',
      url: canonical,
      title,
      description,
      locale,
      siteName: projectConfig.name,
      images: [PREVIEW_IMAGE],
    },

    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [PREVIEW_IMAGE],
    },
  };
}

export default getBaseMetadata;
