import { getTranslations } from 'next-intl/server';

import { projectConfig } from '@/configs/project';

import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

/**
 * Web App Manifest. Texts come from the default locale's `metadata.global`
 * namespace (the manifest route has no locale segment); colors from
 * `projectConfig.theme`.
 *
 * Replace icons once the brand assets are available — keep at least 192px
 * and 512px PNGs in `public/assets/icons/`.
 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const t = await getTranslations({
    locale: projectConfig.i18n.defaultLocale,
    namespace: 'metadata.global',
  });

  return {
    name: t('title'),
    short_name: t('title'),
    description: t('description'),
    start_url: '/',
    display: 'standalone',
    background_color: projectConfig.theme.background,
    theme_color: projectConfig.theme.background,
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      // Once you add PNG icons to public/assets/icons/, uncomment:
      // { src: '/assets/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      // { src: '/assets/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      // { src: '/assets/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
