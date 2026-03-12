import { validateEnv } from '@/configs/env';

/**
 * Next.js instrumentation hook.
 * Runs once when the server starts.
 *
 * This is the place to initialize:
 * - Environment validation
 * - Error reporting (e.g. Sentry: `await import('@sentry/nextjs').then(s => s.init({...}))`)
 * - OpenTelemetry (e.g. `await import('@vercel/otel').then(o => o.registerOTel('app'))`)
 * - Database connections
 * - Any server-side startup logic
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  validateEnv();

  // Initialize error reporting (uncomment when adding Sentry or similar):
  // if (process.env.NEXT_RUNTIME === 'nodejs') {
  //   const Sentry = await import('@sentry/nextjs');
  //   Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.1 });
  // }

  // Initialize OpenTelemetry (uncomment when adding @vercel/otel):
  // const { registerOTel } = await import('@vercel/otel');
  // registerOTel({ serviceName: 'next-template' });
}
