import { getTranslations } from 'next-intl/server';
import { type Metadata } from 'next';

import { createMetadata } from '@/configs/metadata';

export async function generateHomeMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.home');

  const description = t('description');

  return createMetadata({
    description,
    // preview: 'home', — use a custom preview from public/assets/img/previews/home.webp
  });
}
