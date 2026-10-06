import 'server-only';

import type { HealthResponse } from '@/services/api/queries';

const startedAt = Date.now();

/**
 * The health payload as a plain function — the single data source for
 * `GET /api/health` AND for the server-side prefetch on the home page.
 * Server Components call it directly (no HTTP round-trip into the same
 * server, no dependency on `NEXT_PUBLIC_CLIENT_URL` matching the port);
 * the browser reaches it through the Route Handler.
 */
export function getHealth(): HealthResponse {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
  };
}
