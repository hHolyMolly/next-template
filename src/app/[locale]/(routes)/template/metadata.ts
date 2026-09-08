import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createMetadata } from '@/configs/metadata';

import type { Metadata } from 'next';

type MetadataProps = {
  params: Promise<{ locale: string }>;
};

export async function generateTemplateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('metadata.template');

  return createMetadata({
    title: t('title'),
    description: t('description'),
    path: '/template',
    // preview: '/assets/img/previews/template.webp',
  });
}

/**
 * Per-route viewport override. Uncomment and adjust when a route needs a
 * different theme color, viewport scale, or color scheme than the root
 * `layout.tsx`. Exporting `generateViewport` (async) or `viewport` (const)
 * is the Next.js 15+ way — do NOT put these fields back into `metadata`.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-viewport
 */
// import type { Viewport } from 'next';
// export function generateViewport(): Viewport {
//   return {
//     themeColor: [
//       { media: '(prefers-color-scheme: light)', color: '#ffffff' },
//       { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
//     ],
//     colorScheme: 'light dark',
//   };
// }
