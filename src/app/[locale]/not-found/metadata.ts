import { getTranslations } from 'next-intl/server';
import { type Metadata } from 'next';

import { createMetadata } from '@/configs/metadata';

export async function generateNotFoundMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.not_found');

  return createMetadata({
    title: t('title'),
    description: t('description'),
  });
}
