import { getTranslations } from 'next-intl/server';
import { type Metadata } from 'next';

import { createMetadata } from '@configs/metadata';

export async function generateHomeMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.home');

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
  });
}
