/**
 * Error taxonomy for the app.
 *
 * All expected errors extend `AppError` with a concrete `status` and `code`.
 * Unknown errors stay as `Error` — `toErrorResponse()` maps them to 500.
 *
 * Use in Server Actions and Route Handlers:
 *
 * @example
 * import { ValidationError, toErrorResponse } from '@/lib/errors';
 *
 * export async function POST(req: Request) {
 *   try {
 *     const body = await req.json();
 *     if (!body.email) throw new ValidationError('email is required', 'email');
 *     return Response.json({ ok: true });
 *   } catch (err) {
 *     return toErrorResponse(err);
 *   }
 * }
 */

export type AppErrorCode =
  | 'VALIDATION'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL';

export abstract class AppError extends Error {
  abstract readonly status: number;
  abstract readonly code: AppErrorCode;

  /** Machine-readable details safe to send to the client. */
  readonly details?: Readonly<Record<string, unknown>>;

  constructor(message: string, details?: Readonly<Record<string, unknown>>) {
    super(message);
    this.name = this.constructor.name;
    if (details) this.details = details;
  }
}

export class ValidationError extends AppError {
  readonly status = 400;
  readonly code = 'VALIDATION';

  constructor(message: string, field?: string) {
    super(message, field ? { field } : undefined);
  }
}

export class UnauthorizedError extends AppError {
  readonly status = 401;
  readonly code = 'UNAUTHORIZED';
}

export class ForbiddenError extends AppError {
  readonly status = 403;
  readonly code = 'FORBIDDEN';
}

export class NotFoundError extends AppError {
  readonly status = 404;
  readonly code = 'NOT_FOUND';
}

export class ConflictError extends AppError {
  readonly status = 409;
  readonly code = 'CONFLICT';
}

export class RateLimitError extends AppError {
  readonly status = 429;
  readonly code = 'RATE_LIMITED';
}

/**
 * Convert any caught value into a typed `Response` suitable for a Route
 * Handler. `AppError` subclasses keep their status/code/details; unknown
 * errors collapse to `500 INTERNAL` without leaking stack traces.
 */
export function toErrorResponse(error: unknown): Response {
  if (error instanceof AppError) {
    return Response.json(
      {
        error: { code: error.code, message: error.message, ...(error.details ?? {}) },
      },
      { status: error.status },
    );
  }

  return Response.json(
    { error: { code: 'INTERNAL' as AppErrorCode, message: 'Internal Server Error' } },
    { status: 500 },
  );
}

/** Type guard for narrowing `catch (err)` to AppError. */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
