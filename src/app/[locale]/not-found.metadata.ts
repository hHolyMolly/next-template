import { getTranslations } from 'next-intl/server';

import { createMetadata } from '@/configs/metadata';

import type { Metadata } from 'next';

export async function generateNotFoundMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.not_found');

  return createMetadata({
    title: t('title'),
    description: t('description'),
    robots: {
      index: false,
      follow: false,
    },
  });
}
