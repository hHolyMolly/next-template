import { logger } from '@/utils/logger';

/**
 * Run a cache-patching side effect so it can NEVER fail the mutation that
 * triggered it.
 *
 * TanStack Query runs `onSuccess` inside the mutation's own try block and
 * re-throws — so a bug in a `setQueryData` updater rejects `mutateAsync`
 * and the UI tells the user their action FAILED after the server already
 * applied it. Wrap every cache write in a mutation callback with this.
 *
 * @example
 * onSuccess: (updated) => {
 *   patchCache('todos:update', () => {
 *     queryClient.setQueryData(['todos', updated.id], updated);
 *   });
 * },
 */
export function patchCache(label: string, fn: () => void): void {
  try {
    fn();
  } catch (err) {
    // The mutation itself succeeded — log loudly, but let the UI report
    // success. The stale cache heals on the next refetch/invalidation.
    logger.error(`patchCache(${label}) failed — cache may be stale until refetch`, err);
  }
}
