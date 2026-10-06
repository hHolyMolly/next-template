import { validateEnv } from '@/configs/env';
import { errorReporting } from '@/lib/errorReporting';

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
 * Server-side error hook — receives unhandled errors from Server Components,
 * Server Actions and Route Handlers that no wrapper caught (`withApiHandler`
 * / `withServerAction` report their own catches). Everything funnels into
 * `errorReporting` — swap the reporter there, not here.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation#onrequesterror-optional
 */
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  const err = error instanceof Error ? error : new Error(String(error));
  errorReporting.captureException(err, {
    routerKind: context.routerKind,
    method: request.method,
    path: request.path,
  });
};
