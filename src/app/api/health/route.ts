import { NextResponse, withApiHandler } from '@/lib/withApiHandler';

/**
 * Liveness probe + the data source for the TanStack Query SSR example
 * (src/services/api/queries.ts → HealthStatus on the home page).
 *
 * Deliberately un-rate-limited: monitoring probes must never receive 429.
 */

const startedAt = Date.now();

export const GET = withApiHandler({
  handler: () =>
    NextResponse.json({
      status: 'ok' as const,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
    }),
});
