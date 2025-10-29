import { getTranslations } from 'next-intl/server';
import { type Metadata } from 'next';

import { createMetadata } from '@configs/metadata';

export async function generateNotFoundMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.not_found');

  const title = t('title');
  const description = t('description');

  return createMetadata({
    title,
    description,

    openGraph: {
      title,
      description,
    },

    twitter: {
      title,
      description,
    },

    robots: {
      index: false,
      follow: false,
    },
  });
}
