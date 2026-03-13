'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/UI';

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
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-semibold">{t('something_went_wrong')}</h2>

      {process.env.NODE_ENV === 'development' && error.message && (
        <pre className="max-w-[600px] overflow-auto whitespace-pre-wrap break-words rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          {error.message}
        </pre>
      )}

      <Button onClick={reset}>{t('try_again')}</Button>
    </div>
  );
}

export default ErrorPage;
