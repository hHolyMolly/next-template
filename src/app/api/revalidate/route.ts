import { revalidatePath, revalidateTag } from 'next/cache';

import { AppError, ForbiddenError, ValidationError } from '@/lib/errors';
import { NextResponse, withApiHandler } from '@/lib/withApiHandler';

/**
 * On-demand ISR webhook — point your CMS/backend at it after a publish:
 *
 *   POST /api/revalidate?secret=…&tag=posts
 *   POST /api/revalidate?secret=…  body: { "tags": ["post:hello"], "paths": ["/blog"] }
 *
 * Security model: the shared secret IS the authentication.
 * - `REVALIDATE_SECRET` unset → 501, so a fresh clone can't be abused.
 * - Wrong secret → 403 with a constant message.
 * Tags come from `CACHE_TAGS` (src/services/api/cache.ts) — keep the two
 * in sync when adding resources.
 */

class NotConfiguredError extends AppError {
  readonly status = 501;
  readonly code = 'INTERNAL';
}

type RevalidateBody = {
  tags?: string[];
  paths?: string[];
};

async function readTargets(request: Request): Promise<RevalidateBody> {
  const url = new URL(request.url);
  const tags = url.searchParams.getAll('tag');
  const paths = url.searchParams.getAll('path');

  // Query params win when present; otherwise try a JSON body.
  if (tags.length || paths.length) return { tags, paths };

  const body = (await request.json().catch(() => null)) as RevalidateBody | null;
  return {
    tags: Array.isArray(body?.tags) ? body.tags.filter((t) => typeof t === 'string') : [],
    paths: Array.isArray(body?.paths) ? body.paths.filter((p) => typeof p === 'string') : [],
  };
}

export const POST = withApiHandler({
  handler: async (request) => {
    const secret = process.env.REVALIDATE_SECRET;
    if (!secret) {
      throw new NotConfiguredError('Revalidation is not configured');
    }

    const provided =
      new URL(request.url).searchParams.get('secret') ?? request.headers.get('x-revalidate-secret');
    if (provided !== secret) {
      // Same 403 body for missing and wrong — don't leak which it was.
      throw new ForbiddenError('Invalid revalidation secret');
    }

    const { tags = [], paths = [] } = await readTargets(request);
    if (!tags.length && !paths.length) {
      throw new ValidationError('Provide at least one tag or path');
    }

    // Next 16 requires a cacheLife profile; 'max' = expire the tag now and
    // serve stale while the next request revalidates.
    for (const tag of tags) revalidateTag(tag, 'max');
    for (const path of paths) revalidatePath(path);

    return NextResponse.json({ revalidated: { tags, paths }, at: new Date().toISOString() });
  },
});
