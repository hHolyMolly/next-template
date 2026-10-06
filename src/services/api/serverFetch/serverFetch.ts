import 'server-only';

import { AppError, type AppErrorCode } from '@/lib/errors';
import { DEFAULT_TIMEOUT_MS, resolveApiUrl } from '@/services/api/http';
import { logger } from '@/utils/logger';

/**
 * Options for `serverFetch` — a thin wrapper over the native Fetch API
 * that speaks Next.js ISR (`next.revalidate`, `next.tags`).
 *
 * Use this in Server Components and Route Handlers when you want caching,
 * tag-based revalidation, or `cache: 'force-cache' | 'no-store'`.
 *
 * Use the axios `request()` helper in `instance.ts` for client-side calls
 * (TanStack queries) or when you specifically need interceptors.
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

/** Map an upstream HTTP status onto the app's error taxonomy. */
function codeForStatus(status: number): AppErrorCode {
  switch (status) {
    case 400:
      return 'VALIDATION';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 429:
      return 'RATE_LIMITED';
    default:
      return 'INTERNAL';
  }
}

/**
 * Extends `AppError` so an upstream failure surfaced through a Route Handler
 * keeps its real status and a matching `code` instead of collapsing into a
 * generic 500.
 */
export class ServerFetchError extends AppError {
  readonly status: number;
  readonly code: AppErrorCode;
  readonly url: string;

  constructor(message: string, init: { status: number; url: string }) {
    super(message);
    this.status = init.status;
    this.code = codeForStatus(init.status);
    this.url = init.url;
  }
}

const JSON_CONTENT_TYPE = /^application\/(?:[\w.+-]+\+)?json\b/i;

/**
 * Typed server-side fetch with JSON parsing, timeout, and Next.js cache tags.
 * JSON-only: non-JSON responses throw (see below); 204 resolves to undefined.
 *
 * Paths resolve against the external backend (`resolveApiUrl`). For one of
 * this app's own routes pass an absolute URL (`resolveAppUrl('/api/…')`) —
 * absolute URLs pass through untouched.
 *
 * @example
 * const users = await serverFetch<User[]>('/users', {
 *   next: { revalidate: REVALIDATE.standard, tags: [CACHE_TAGS.users] },
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

    // Empty success (DELETE and friends) — nothing to parse.
    if (response.status === 204) {
      return undefined as T;
    }

    // JSON only, on purpose: a non-JSON 200 is almost always an HTML error
    // page from a misconfigured proxy/CDN — handing it to a caller typed
    // as T would crash somewhere far away (often at hydration). Fail HERE
    // with a clear error. Reported as 502 (bad upstream), NOT the upstream's
    // 200 — otherwise `toErrorResponse` would send an error body with a
    // success status. `application/problem+json` and friends are accepted.
    const contentType = response.headers.get('content-type') ?? '';
    if (!JSON_CONTENT_TYPE.test(contentType)) {
      throw new ServerFetchError(
        `serverFetch expected JSON but got "${contentType || 'no content-type'}"`,
        { status: 502, url },
      );
    }
    return (await response.json()) as T;
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
