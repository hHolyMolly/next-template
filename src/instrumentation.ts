import { validateEnv } from '@/configs/env';

/**
 * Next.js instrumentation hook.
 * Runs once when the server starts.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export function register() {
  validateEnv();
}
