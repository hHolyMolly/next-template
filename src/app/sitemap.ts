import { type MetadataRoute } from 'next';

import { projectConfig } from '@/configs/project';
import { urls } from '@/configs/constants/urls';

export const dynamic = 'force-static';

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
    },
    // Добавляйте сюда другие страницы
  ];
}
