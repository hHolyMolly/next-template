import { validateEnv } from '@/configs/env';
import { logger } from '@/utils/logger';

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
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  // Replace with your reporter, e.g. Sentry.captureRequestError(error, request, context).
  // Until then, at least leave a trace in the server logs — a silent no-op
  // here means production errors vanish without a line anywhere.
  logger.error(`[${context.routerKind}] ${request.method} ${request.path}`, error);
};
