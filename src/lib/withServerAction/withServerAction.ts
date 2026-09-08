import { AppError, toErrorPayload } from '@/lib/errors';
import { logger } from '@/utils/logger';

/**
 * Discriminated result returned by every wrapped Server Action.
 *
 * @example
 * const result = await deleteItem(id);
 * if (!result.success) {
 *   toast.error(result.error.message);
 *   return;
 * }
 * // result.data is fully typed here
 */
export type ServerActionResult<T> =
  | { success: true; data: T }
  | {
      success: false;
      error: {
        code: string;
        message: string;
        details?: Readonly<Record<string, unknown>>;
      };
    };

/**
 * Wrap a Server Action so it always returns a typed `ServerActionResult`
 * instead of throwing. `AppError` subclasses keep their `code`/`details`;
 * everything else collapses to `INTERNAL` without leaking stack traces.
 *
 * @example
 * 'use server';
 * import { withServerAction } from '@/lib/withServerAction';
 * import { NotFoundError } from '@/lib/errors';
 *
 * export const deleteItem = withServerAction(async (id: string) => {
 *   const item = await db.items.findUnique({ where: { id } });
 *   if (!item) throw new NotFoundError('Item not found');
 *   await db.items.delete({ where: { id } });
 *   return { id };
 * });
 *
 * // Client:
 * const result = await deleteItem('42');
 * if (!result.success) showError(result.error.code);
 */
export function withServerAction<Args extends unknown[], T>(
  action: (...args: Args) => Promise<T>,
): (...args: Args) => Promise<ServerActionResult<T>> {
  return async (...args: Args) => {
    try {
      const data = await action(...args);
      return { success: true, data };
    } catch (err) {
      // Next.js signals redirect()/notFound()/forbidden() by THROWING —
      // swallowing those errors would break control flow and surface a
      // spurious error toast instead of navigating.
      if (
        err &&
        typeof err === 'object' &&
        'digest' in err &&
        String((err as { digest: unknown }).digest).startsWith('NEXT_')
      ) {
        throw err;
      }

      if (!(err instanceof AppError)) {
        logger.error('Unhandled Server Action error', err);
      }
      return { success: false, error: toErrorPayload(err) };
    }
  };
}
