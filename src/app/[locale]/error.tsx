'use client';

import { useEffect } from 'react';

import { ErrorState } from '@/components/layouts/ErrorState';
import { errorReporting } from '@/lib/errorReporting';

/**
 * Locale-level error boundary — catches runtime errors inside [locale] layout.
 *
 * `error` — the Error object thrown by a child component.
 * `reset()` — re-renders the error boundary's children to attempt recovery.
 *              Does NOT navigate — simply retries rendering the failed segment.
 */

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    errorReporting.captureException(error, { scope: 'locale-segment', digest: error.digest });
  }, [error]);

  return <ErrorState error={error} reset={reset} />;
}

export default ErrorPage;
