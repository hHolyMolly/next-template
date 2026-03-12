import { getTranslations } from 'next-intl/server';
import { type Metadata } from 'next';

import { urls } from '@/configs/constants/urls';

/**
 * Build a full preview image URL from a filename in `public/assets/img/previews/`.
 *
 * @example
 * previewImage('global')   // → 'https://example.com/assets/img/previews/global.webp'
 * previewImage('home')     // → 'https://example.com/assets/img/previews/home.webp'
 * previewImage('about.png') // → 'https://example.com/assets/img/previews/about.png'
 */
export function previewImage(name: string): string {
  const hasExtension = /\.[a-z]+$/i.test(name);
  const filename = hasExtension ? name : `${name}.webp`;
  return `${urls.website}/assets/img/previews/${filename}`;
}

const PREVIEW_IMAGE = previewImage('global');

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
