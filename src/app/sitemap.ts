import { type MetadataRoute } from 'next';

import { projectConfig } from '@/configs/project';
import { urls } from '@/configs/constants/urls';

/**
 * Generates locale-aware alternate URLs for a given path.
 * Used by search engines to discover localized versions of each page.
 */
function makeAlternates(path: string): Record<string, string> {
  return Object.fromEntries(
    projectConfig.i18n.locales.map((locale) => [
      locale,
      `${urls.website}/${locale}${path}`,
    ]),
  );
}

/**
 * Generates `sitemap.xml` based on project configuration.
 *
 * When `projectConfig.sitemap` is `false` (e.g. non-production),
 * an empty sitemap is returned to prevent indexing.
 *
 * To completely disable sitemap generation, remove this file.
 *
 * @example Adding a new page:
 * ```ts
 * { url: `${urls.website}/about`, lastModified: new Date(), priority: 0.8, alternates: { languages: makeAlternates('/about') } },
 * ```
 */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!projectConfig.sitemap) {
    return [];
  }

  return [
    {
      url: urls.website,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
      alternates: { languages: makeAlternates('') },
    },
    // Add more pages here
  ];
}
