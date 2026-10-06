import { timingSafeEqual } from 'node:crypto';

import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

import { projectConfig } from '@/configs/project';
import { ForbiddenError, NotImplementedError, ValidationError } from '@/lib/errors';
import { createApiRateLimit } from '@/lib/rateLimit';
import { withApiHandler } from '@/lib/withApiHandler';

/**
 * On-demand ISR webhook — point your CMS/backend at it after a publish:
 *
 *   POST /api/revalidate?tag=posts            -H 'x-revalidate-secret: …'
 *   POST /api/revalidate  body: { "tags": ["post:hello"], "paths": ["/blog"] }
 *
 * Security model: the shared secret IS the authentication.
 * - Sent ONLY via the `x-revalidate-secret` header — never in the query
 *   string (query strings land in access logs, proxies and browser history).
 * - `REVALIDATE_SECRET` unset → 501, so a fresh clone can't be abused.
 * - Wrong secret → 403 with a constant message; constant-time comparison.
 * - Rate-limited like any other endpoint (a publish hook never bursts).
 * Tags come from `CACHE_TAGS` (src/services/api/cache.ts) — keep the two
 * in sync when adding resources.
 *
 * Paths are app-relative (`/blog`) and revalidated for EVERY locale: pages
 * live under `/[locale]/…`, so a bare `revalidatePath('/blog')` would miss
 * both the unprefixed default locale and the prefixed ones.
 */

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

function secretMatches(provided: string | null, expected: string): boolean {
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  // Length leaks nothing useful here (the secret is ≥16 random chars), but
  // `timingSafeEqual` requires equal lengths, so guard it.
  return a.length === b.length && timingSafeEqual(a, b);
}

/** `/blog` → `/[locale]/blog` (one dynamic route covers every locale). */
function localizedPagePath(path: string): string {
  const suffix = path === '/' ? '' : path;
  return `/[locale]${suffix}`;
}

export const POST = withApiHandler({
  rateLimit: createApiRateLimit({ limit: 30, windowSeconds: 60 }),
  handler: async (request) => {
    const secret = process.env.REVALIDATE_SECRET;
    if (!secret) {
      throw new NotImplementedError('Revalidation is not configured');
    }

    if (!secretMatches(request.headers.get('x-revalidate-secret'), secret)) {
      // Same 403 body for missing and wrong — don't leak which it was.
      throw new ForbiddenError('Invalid revalidation secret');
    }

    const { tags = [], paths = [] } = await readTargets(request);
    if (!tags.length && !paths.length) {
      throw new ValidationError('Provide at least one tag or path');
    }
    if (paths.some((p) => !p.startsWith('/'))) {
      throw new ValidationError('Paths must be app-relative and start with "/"', 'paths');
    }

    // Next 16 requires a cacheLife profile; 'max' = expire the tag now and
    // serve stale while the next request revalidates.
    for (const tag of tags) revalidateTag(tag, 'max');
    for (const path of paths) revalidatePath(localizedPagePath(path), 'page');

    return NextResponse.json({
      revalidated: { tags, paths, locales: projectConfig.i18n.locales },
      at: new Date().toISOString(),
    });
  },
});
