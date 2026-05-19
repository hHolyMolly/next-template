'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import { Button } from '@/components/UI';
import { errorReporting } from '@/lib/errorReporting';

/**
 * Segment error boundary for the `(routes)` group.
 *
 * Catches runtime errors thrown inside the shared Header/Footer layout so a
 * failed page still lets the user navigate back. Errors that escape the root
 * layout fall through to `app/global-error.tsx`.
 */
interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

function RouteError({ error, reset }: RouteErrorProps) {
  const t = useTranslations('translations.errors');

  useEffect(() => {
    errorReporting.captureException(error, { scope: 'routes-segment', digest: error.digest });
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-2xl font-semibold">{t('something_went_wrong')}</h2>

      {process.env.NODE_ENV === 'development' && error.message ? (
        <pre className="max-w-[600px] overflow-auto whitespace-pre-wrap break-words rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          {error.message}
          {error.digest ? `\n\ndigest: ${error.digest}` : ''}
        </pre>
      ) : null}

      <Button onClick={reset}>{t('try_again')}</Button>
    </div>
  );
}

export default RouteError;
