'use client';

import { useTranslations } from 'next-intl';

/**
 * Locale-level error boundary — catches runtime errors inside [locale] layout.
 *
 * `error` — the Error object thrown by a child component.
 * `reset()` — re-renders the error boundary's children to attempt recovery.
 *              Does NOT navigate — simply retries rendering the failed segment.
 */

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

function ErrorPage({ error, reset }: ErrorPageProps) {
  const t = useTranslations('translations.errors');

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h2 className="text-2xl font-semibold">{t('something_went_wrong')}</h2>

      {process.env.NODE_ENV === 'development' && error.message && (
        <pre className="max-w-[600px] px-4 py-3 rounded-lg bg-red-50 text-red-800 text-sm overflow-auto whitespace-pre-wrap break-words">
          {error.message}
        </pre>
      )}

      <button
        onClick={reset}
        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        {t('try_again')}
      </button>
    </div>
  );
}

export default ErrorPage;
