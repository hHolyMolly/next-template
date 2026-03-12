import { projectConfig } from '@/configs/project';

/** Async operation status */
export type TypeStatus = 'loading' | 'loaded' | 'error';

/** Supported locales — derived from projectConfig */
export type Locale = (typeof projectConfig.i18n.locales)[number];

/** Project configuration */
export type ProjectConfig = {
  name: string;

  i18n: {
    defaultLocale: string;
    locales: readonly string[];
  };

  /** Generate sitemap.xml */
  sitemap: boolean;

  /** Allow indexing (robots.txt) */
  robots: boolean;
};
