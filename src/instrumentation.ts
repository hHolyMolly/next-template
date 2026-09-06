import { validateEnv } from '@/configs/env';

import type { Instrumentation } from 'next';

/**
 * Next.js server instrumentation hook.
 * Runs once when the server starts.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  validateEnv();

  // Wire up APM/tracing here, e.g. `@vercel/otel`:
  // const { registerOTel } = await import('@vercel/otel');
  // registerOTel({ serviceName: 'next-template' });
}

/**
 * Server-side error hook — receives every unhandled error from Server
 * Components, Server Actions and Route Handlers. Forward to your error
 * reporter of choice (Sentry / Datadog / Rollbar / etc.).
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation#onrequesterror-optional
 */
export const onRequestError: Instrumentation.onRequestError = async (
  _error,
  _request,
  _context,
) => {
  // no-op by default — e.g. Sentry.captureRequestError(error, request, context)
};
