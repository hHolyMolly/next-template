import { urls } from '@/configs/constants/urls';
import { buildLocaleAlternates } from '@/configs/metadata/alternates';
import { projectConfig } from '@/configs/project';

import type { MetadataRoute } from 'next';

type Page = {
  path: string;
  priority?: number;
  changeFrequency?: MetadataRoute.Sitemap[number]['changeFrequency'];
};

/**
 * Register project pages here. The root `/` is added automatically — list
 * secondary routes (`/about`, `/contact`, …) below so they get localized
 * alternates without extra boilerplate.
 */
const pages: readonly Page[] = [
  // { path: '/about',   priority: 0.8, changeFrequency: 'monthly' },
  // { path: '/contact', priority: 0.6, changeFrequency: 'yearly' },
];

/**
 * Generates `sitemap.xml` based on project configuration.
 *
 * hreflang alternates come from `buildLocaleAlternates` — the same rule the
 * page metadata uses, so the two can't drift.
 *
 * When `projectConfig.sitemap` is `false` (e.g. non-production),
 * an empty sitemap is returned to prevent indexing.
 *
 * To completely disable sitemap generation, remove this file.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!projectConfig.sitemap) return [];

  const now = new Date();

  const root: MetadataRoute.Sitemap[number] = {
    url: urls.website,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 1,
    alternates: { languages: buildLocaleAlternates('/') },
  };

  const extra: MetadataRoute.Sitemap = pages.map((page) => ({
    url: `${urls.website}${page.path}`,
    lastModified: now,
    ...(page.changeFrequency ? { changeFrequency: page.changeFrequency } : {}),
    ...(page.priority !== undefined ? { priority: page.priority } : {}),
    alternates: { languages: buildLocaleAlternates(page.path) },
  }));

  return [root, ...extra];
}
