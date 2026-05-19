import type { projectConfig } from '@/configs/project';

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
    /**
     * IANA timezone used by next-intl for server-side date/number formatting.
     * Keep server and client in sync by pinning it explicitly.
     * @default 'UTC'
     */
    timeZone?: string;
  };

  /** Generate sitemap.xml */
  sitemap: boolean;

  /** Allow indexing (robots.txt) */
  robots: boolean;
};
