import { type MetadataRoute } from 'next';

import { projectConfig } from '@/configs/project';
import { urls } from '@/configs/constants/urls';

export default function robots(): MetadataRoute.Robots {
  if (!projectConfig.robots) {
    return {
      rules: { userAgent: '*', disallow: '/' },
    };
  }

  return {
    rules: { userAgent: '*', allow: '/' },
    ...(projectConfig.sitemap && { sitemap: `${urls.website}/sitemap.xml` }),
  };
}
