import { getTranslations } from 'next-intl/server';

import { createMetadata } from '@/configs/metadata';

import type { Metadata } from 'next';

export async function generateHomeMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.home');

  const description = t('description');

  return createMetadata({
    description,
    // preview: '/assets/img/previews/home.webp',
  });
}
