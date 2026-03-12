import { type MetadataRoute } from 'next';

import { projectConfig } from '@/configs/project';
import { urls } from '@/configs/constants/urls';

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
    rules: [
      { userAgent: '*', allow: '/' },
      // Block crawling of API routes and internal paths
      { userAgent: '*', disallow: ['/api/', '/_next/'] },
    ],
    ...(projectConfig.sitemap && { sitemap: `${urls.website}/sitemap.xml` }),
    host: urls.website,
  };
}
