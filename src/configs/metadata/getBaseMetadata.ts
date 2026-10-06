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
 * All texts (title, the `%s | Site` title template, description) come from
 * the `metadata.global` namespace.
 *
 * `title` is a `{ default, template }` object: a page that passes a plain
 * string `title` to `createMetadata` gets the template applied by Next
 * ("Template Page | Next Template"); a page without one shows `default`.
 *
 * @param path Route-relative path (e.g. `/template`) used to build canonical
 *             + hreflang URLs. Defaults to `/` — override per page.
 */
export async function getBaseMetadata(path = '/'): Promise<Metadata> {
  const [t, locale] = await Promise.all([getTranslations('metadata.global'), getLocale()]);

  const title = t('title');
  const description = t('description');
  // The ONE hreflang rule also yields the canonical — no second copy of the
  // "default locale is unprefixed" logic to drift.
  const languages = buildLocaleAlternates(path);
  const canonical = languages[locale] ?? languages['x-default'];

  return {
    title: { default: title, template: t('title_template') },
    description,
    metadataBase: METADATA_BASE,

    alternates: {
      ...(canonical ? { canonical } : {}),
      languages,
    },

    // No static og/twitter images here — the generated `opengraph-image.tsx`
    // file convention provides them. Per-page overrides go through the
    // `preview` option of `createMetadata`.
    openGraph: {
      type: 'website',
      ...(canonical ? { url: canonical } : {}),
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
