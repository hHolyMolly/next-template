import { NextResponse } from 'next/server';

import { getHealth } from '@/app/api/health/getHealth';
import { withApiHandler } from '@/lib/withApiHandler';

/**
 * Liveness probe + the browser-side data source for the TanStack Query
 * SSR example (src/services/api/queries.ts → HealthStatus on the home page;
 * the server prefetch calls `getHealth()` directly).
 *
 * Deliberately un-rate-limited: monitoring probes must never receive 429.
 */
export const GET = withApiHandler({
  handler: () => NextResponse.json(getHealth()),
});
