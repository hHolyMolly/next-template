import { getTranslations } from 'next-intl/server';
import { type Metadata } from 'next';

import { urls } from '@/configs/constants/urls';

const PREVIEW_IMAGE = `${urls.website}/assets/img/previews/global.webp`;

/**
 * Базовые метаданные для всех страниц.
 * Все тексты (включая titleTemplate) берутся из i18n JSON-файлов.
 */
async function getBaseMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.global');

  const title = t('title');
  const description = t('description');
  const titleTemplate = t('title_template');

  return {
    title: {
      default: title,
      template: titleTemplate,
    },
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
