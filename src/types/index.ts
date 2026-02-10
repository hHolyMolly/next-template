/**
 * Глобальные типы проекта.
 */

/** Статус асинхронной операции */
export type TypeStatus = 'loading' | 'loaded' | 'error';

/** Конфигурация проекта */
export type ProjectConfig = {
  name: string;

  i18n: {
    defaultLocale: string;
    locales: string[];
  };

  /** Генерировать sitemap.xml */
  sitemap: boolean;

  /** Разрешить индексацию (robots.txt) */
  robots: boolean;
};
