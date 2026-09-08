import { AppError, type AppErrorCode } from '@/lib/errors';
import { DEFAULT_TIMEOUT_MS, resolveApiUrl } from '@/services/api/paths';
import { logger } from '@/utils/logger';

/**
 * Options for `serverFetch` — a thin wrapper over the native Fetch API
 * that speaks Next.js ISR (`next.revalidate`, `next.tags`).
 *
 * Use this in Server Components and Route Handlers when you want caching,
 * tag-based revalidation, or `cache: 'force-cache' | 'no-store'`.
 *
 * Use the axios `request()` helper in `instance.ts` only for client-side
 * calls or when you specifically need interceptors.
 */
type ServerFetchOptions = Omit<RequestInit, 'body' | 'signal'> & {
  /** Raw body — forwarded unchanged. Use `json` instead for typed payloads. */
  body?: BodyInit | null;
  /** Parsed JSON body. Will be stringified and sent as `application/json`. */
  json?: unknown;
  /** Caller-provided abort signal — merged with the internal timeout. */
  signal?: AbortSignal;
  /** Next.js cache directives. */
  next?: {
    /** Seconds to cache; `false` disables caching. */
    revalidate?: number | false;
    /** Tags used by `revalidateTag(tag)`. */
    tags?: string[];
  };
  /** Timeout in ms (default 15_000). Cancels via AbortSignal. */
  timeoutMs?: number;
};

/**
 * Extends `AppError` so an upstream failure surfaced through a Route Handler
 * keeps its real status instead of collapsing into a generic 500.
 */
export class ServerFetchError extends AppError {
  readonly status: number;
  readonly code: AppErrorCode = 'INTERNAL';
  readonly url: string;

  constructor(message: string, init: { status: number; url: string }) {
    super(message);
    this.status = init.status;
    this.url = init.url;
  }
}

/**
 * Typed server-side fetch with JSON parsing, timeout, and Next.js cache tags.
 *
 * @example
 * const users = await serverFetch<User[]>('/api/users', {
 *   next: { revalidate: 60, tags: ['users'] },
 * });
 */
export async function serverFetch<T>(path: string, options: ServerFetchOptions = {}): Promise<T> {
  const {
    json,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    headers: headersInit,
    signal: callerSignal,
    body: rawBody,
    ...init
  } = options;

  if (json !== undefined && rawBody !== undefined) {
    throw new Error('serverFetch: pass either `json` or `body`, not both');
  }

  const url = resolveApiUrl(path);

  // AbortSignal.any merges the caller's signal with the timeout — no manual
  // listeners (which would leak on long-lived caller signals) and a proper
  // `TimeoutError` DOMException instead of a string reason.
  const signal = AbortSignal.any([
    ...(callerSignal ? [callerSignal] : []),
    AbortSignal.timeout(timeoutMs),
  ]);

  const requestHeaders = new Headers(headersInit);
  const body: BodyInit | null | undefined = json !== undefined ? JSON.stringify(json) : rawBody;
  if (json !== undefined && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(url, {
      ...init,
      ...(body !== undefined ? { body } : {}),
      headers: requestHeaders,
      signal,
    });

    if (!response.ok) {
      throw new ServerFetchError(`serverFetch failed: ${response.status} ${response.statusText}`, {
        status: response.status,
        url,
      });
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      return (await response.json()) as T;
    }
    return (await response.text()) as unknown as T;
  } catch (err) {
    // A caller-initiated abort (navigation, unmount) is intentional — don't
    // log it as a network failure.
    const isCallerAbort = callerSignal?.aborted ?? false;
    if (!(err instanceof ServerFetchError) && !isCallerAbort) {
      logger.error(`serverFetch network error: ${url}`, err);
    }
    throw err;
  }
}
