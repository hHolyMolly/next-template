import { projectConfig } from '@/configs/project';

export const namespaces = ['translations', 'metadata', 'demo'];

/**
 * Namespaces serialized into the client bundle via NextIntlClientProvider.
 * `metadata` is server-only (generateMetadata) — shipping it to the client
 * would bloat every page's RSC payload for nothing.
 */
export const clientNamespaces = namespaces.filter((ns) => ns !== 'metadata');

export const defaultLocale = projectConfig.i18n.defaultLocale;
export const locales = projectConfig.i18n.locales;
