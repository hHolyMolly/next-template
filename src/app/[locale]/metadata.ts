import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createMetadata } from '@/configs/metadata';

import type { Metadata } from 'next';

type MetadataProps = {
  params: Promise<{ locale: string }>;
};

export async function generateHomeMetadata({ params }: MetadataProps): Promise<Metadata> {
  // next-intl requirement for generateMetadata (see [locale]/layout.tsx).
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('metadata.home');

  return createMetadata({
    description: t('description'),
    // preview: '/assets/img/previews/home.webp',
  });
}
