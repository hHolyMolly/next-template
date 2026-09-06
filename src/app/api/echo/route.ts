import { z } from 'zod';

import { ValidationError } from '@/lib/errors';
import { createApiRateLimit } from '@/lib/rateLimit';
import { NextResponse, withApiHandler } from '@/lib/withApiHandler';

/**
 * Demo Route Handler (removed by `pnpm clean:demo`).
 *
 * Shows the full `withApiHandler` surface working together:
 * Zod body validation → typed `ValidationError` (400 with details),
 * per-IP rate limiting → 429 + `X-RateLimit-*` headers.
 *
 * Try it:
 *   curl -X POST localhost:3000/api/echo -H 'content-type: application/json' -d '{"message":"hi"}'
 */

const echoSchema = z.object({
  message: z.string().min(1).max(500),
});

export const POST = withApiHandler({
  rateLimit: createApiRateLimit({ limit: 20, windowSeconds: 60 }),
  handler: async (request) => {
    const body: unknown = await request.json().catch(() => {
      throw new ValidationError('Body must be valid JSON');
    });

    const parsed = echoSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0]?.message ?? 'Invalid body', 'message');
    }

    return NextResponse.json({
      echo: parsed.data.message,
      receivedAt: new Date().toISOString(),
    });
  },
});
