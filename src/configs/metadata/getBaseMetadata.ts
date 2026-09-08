import { getLocale, getTranslations } from 'next-intl/server';

import { urls } from '@/configs/constants/urls';
import { buildLocaleAlternates } from '@/configs/metadata/alternates';
import { projectConfig } from '@/configs/project';

import type { Metadata } from 'next';

// urls.website already falls back to localhost — no extra guard needed here.
const METADATA_BASE = new URL(urls.website);

/**
 * Build a full preview image URL from a path in `public/`.
 *
 * @example
 * previewImage('/assets/img/previews/global.webp')
 */
export function previewImage(path: string): string {
  return `${urls.website}${path}`;
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
  const suffix = path === '/' ? '' : path;
  const localePrefix = locale === projectConfig.i18n.defaultLocale ? '' : `/${locale}`;
  const canonical = `${urls.website}${localePrefix}${suffix}`;

  return {
    title,
    description,
    metadataBase: METADATA_BASE,

    alternates: {
      canonical,
      languages: buildLocaleAlternates(path),
    },

    // No static og/twitter images here — the generated `opengraph-image.tsx`
    // file convention provides them. Per-page overrides go through the
    // `preview` option of `createMetadata`.
    openGraph: {
      type: 'website',
      url: canonical,
      title,
      description,
      locale,
      siteName: projectConfig.name,
    },

    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default getBaseMetadata;
