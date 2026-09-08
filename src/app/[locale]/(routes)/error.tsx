'use client';

import { useEffect } from 'react';

import { ErrorState } from '@/components/layouts/ErrorState';
import { errorReporting } from '@/lib/errorReporting';

/**
 * Segment error boundary for the `(routes)` group.
 *
 * Catches runtime errors thrown inside the shared Header/Footer layout so a
 * failed page still lets the user navigate back. Errors that escape the root
 * layout fall through to `app/global-error.tsx`.
 */
type RouteErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

function RouteError({ error, reset }: RouteErrorProps) {
  useEffect(() => {
    errorReporting.captureException(error, { scope: 'routes-segment', digest: error.digest });
  }, [error]);

  return <ErrorState error={error} reset={reset} />;
}

export default RouteError;
