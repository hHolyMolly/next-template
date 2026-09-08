type QueryLike = {
  isPending: boolean;
  fetchStatus: 'fetching' | 'paused' | 'idle';
};

/**
 * "Should this UI show a loading placeholder?" — use this instead of
 * `isPending`.
 *
 * A query disabled via `skipToken` (or `enabled: false`) stays
 * `isPending: true` FOREVER, so any placeholder gated on `isPending`
 * never disappears for a user who isn't allowed to make the request.
 * This checks that a fetch is actually in flight (or paused).
 *
 * @example
 * const query = useQuery({ queryKey, queryFn: canView ? fetchIt : skipToken });
 * if (isWaitingFor(query)) return <Skeleton />;
 */
export function isWaitingFor(query: QueryLike): boolean {
  return query.isPending && query.fetchStatus !== 'idle';
}
