import { getTranslations } from 'next-intl/server';

/**
 * Root-level 404 page — outside [locale] layout.
 * Only triggers if a request bypasses middleware (edge case).
 * Renders within app/layout.tsx so Tailwind is available.
 * Uses server-side getTranslations (works without NextIntlClientProvider).
 */
async function RootNotFoundPage() {
  const t = await getTranslations('translations.errors');

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh gap-2">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">{t('page_not_found')}</p>
    </div>
  );
}

export default RootNotFoundPage;
