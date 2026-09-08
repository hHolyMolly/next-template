import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createMetadata } from '@/configs/metadata';

import type { Metadata } from 'next';

type MetadataProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Consumed by the `[...rest]` catch-all page — `not-found.tsx` itself
 * cannot export metadata, so the page that TRIGGERS the 404 provides it.
 */
export async function generateNotFoundMetadata({ params }: MetadataProps): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);

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
