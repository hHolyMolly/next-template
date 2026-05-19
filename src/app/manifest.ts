import { projectConfig } from '@/configs/project';

import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

/**
 * Web App Manifest.
 * Replace icons once the brand assets are available — keep at least 192px
 * and 512px PNGs in `public/assets/icons/`.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: projectConfig.name,
    short_name: projectConfig.name,
    description: 'Production-ready Next.js starter',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0b0b0d',
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
