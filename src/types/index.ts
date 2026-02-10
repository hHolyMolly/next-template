/** Async operation status */
export type TypeStatus = 'loading' | 'loaded' | 'error';

/** Project configuration */
export type ProjectConfig = {
  name: string;

  i18n: {
    defaultLocale: string;
    locales: string[];
  };

  /** Generate sitemap.xml */
  sitemap: boolean;

  /** Allow indexing (robots.txt) */
  robots: boolean;
};
