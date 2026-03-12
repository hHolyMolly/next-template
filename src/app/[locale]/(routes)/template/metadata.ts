import { getTranslations } from 'next-intl/server';
import { type Metadata } from 'next';

import { createMetadata } from '@/configs/metadata';

export async function generateTemplateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.template');

  const title = t('title');
  const description = t('description');

  return createMetadata({
    title,
    description,
    // preview: 'template', — use a custom preview from public/assets/img/previews/template.webp
  });
}
