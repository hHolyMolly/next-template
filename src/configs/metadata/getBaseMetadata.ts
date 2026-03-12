import { getTranslations } from 'next-intl/server';
import { type Metadata } from 'next';

import { urls } from '@/configs/constants/urls';

/**
 * Build a full preview image URL from a path in `public/`.
 *
 * @example
 * previewImage('/assets/img/previews/global.webp')
 * previewImage('/assets/img/previews/home.png')
 */
export function previewImage(path: string): string {
  return `${urls.website}${path}`;
}

const PREVIEW_IMAGE = previewImage('/assets/img/previews/global.webp');

/**
 * Base metadata for all pages.
 * All texts (including titleTemplate) come from i18n JSON files.
 */
async function getBaseMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.global');

  const title = t('title');
  const description = t('description');

  return {
    title,
    description,
    metadataBase: new URL(urls.website || 'http://localhost:3000'),

    openGraph: {
      type: 'website',
      url: urls.website,
      title,
      description,
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
