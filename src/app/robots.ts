import { urls } from '@/configs/constants/urls';
import { projectConfig } from '@/configs/project';

import type { MetadataRoute } from 'next';

/**
 * Generates `robots.txt` based on project configuration.
 *
 * When `projectConfig.robots` is `false` (e.g. non-production),
 * all crawlers are blocked to prevent indexing of staging/dev.
 *
 * To completely disable robots.txt generation, remove this file
 * and add `'/robots.txt'` to the `matcher` exclusion in `proxy.ts`.
 */
export default function robots(): MetadataRoute.Robots {
  if (!projectConfig.robots) {
    return {
      rules: { userAgent: '*', disallow: '/' },
    };
  }

  return {
    // One rule group per user agent. `/_next/` must stay crawlable —
    // Googlebot needs the JS/CSS under it to render pages. `host` is a
    // Yandex-only directive that has been deprecated; omitted on purpose.
    rules: { userAgent: '*', allow: '/', disallow: ['/api/'] },
    ...(projectConfig.sitemap && { sitemap: `${urls.website}/sitemap.xml` }),
  };
}
