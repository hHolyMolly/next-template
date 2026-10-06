/**
 * ISR cache policy — the single place where revalidation windows and cache
 * tags are named. Rule: NEVER inline a raw `revalidate` number or a bare
 * tag string at a call site; name it here so "how long is this cached?"
 * has one answer per data category and invalidation is grep-able.
 *
 * @example
 * const posts = await serverFetch<Post[]>('/posts', {
 *   next: { revalidate: REVALIDATE.standard, tags: [CACHE_TAGS.posts] },
 * });
 *
 * // After a mutation (or from the /api/revalidate webhook):
 * revalidateTag(CACHE_TAGS.post(slug));
 */

/** Revalidation windows in seconds, by data volatility. */
export const REVALIDATE = {
  /** Rarely changing content (marketing pages, settings). */
  static: 60 * 60 * 24,
  /** Standard content (lists, articles). */
  standard: 60 * 5,
  /** Frequently changing data (stock, counters). */
  dynamic: 60,
} as const;

/**
 * Cache tags: collections as constants, per-entity tags as builders — so
 * a webhook can invalidate exactly one record instead of the whole list.
 * Example resource below (`posts`) — replace with your own.
 */
export const CACHE_TAGS = {
  posts: 'posts',
  post: (slug: string) => `post:${slug}`,
} as const;
