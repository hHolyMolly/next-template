/**
 * Dynamic message types for next-intl.
 *
 * TypeScript cannot synchronously read JSON files from `public/`, so we
 * derive the message shape from the default locale's JSON files imported
 * via the `@public/*` alias (see `tsconfig.json`).
 *
 * Adding a namespace:
 * 1. Create `public/locales/{locale}/{namespace}.json`.
 * 2. Register it in `src/services/i18n/constants.ts` (`namespaces`).
 * 3. Import and spread it here so next-intl picks up autocomplete.
 *
 * The default locale (`en`) is the source of truth — every other locale
 * must mirror its keys. `pnpm check:i18n` enforces that at CI time.
 */
import type demo from '@public/locales/en/demo.json';
import type metadata from '@public/locales/en/metadata.json';
import type translations from '@public/locales/en/translations.json';

type Messages = {
  translations: typeof translations;
  metadata: typeof metadata;
  demo: typeof demo;
};

declare module 'next-intl' {
  interface AppConfig {
    Messages: Messages;
  }
}
