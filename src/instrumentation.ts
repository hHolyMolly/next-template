import { validateEnv } from '@/configs/env';

/**
 * Next.js server instrumentation hook.
 * Runs once when the server starts.
 *
 * Companion: `src/instrumentation-client.ts` runs once in the browser.
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
 * Server-side error hook. Forward to your error reporter of choice
 * (Sentry / Datadog / Rollbar / etc.) by replacing the body.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation#onrequesterror-optional
 */
export async function onRequestError(..._args: Parameters<typeof console.error>): Promise<void> {
  // no-op by default
}
