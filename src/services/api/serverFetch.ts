import { urls } from '@/configs/constants/urls';
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

export class ServerFetchError extends Error {
  readonly status: number;
  readonly url: string;

  constructor(message: string, init: { status: number; url: string }) {
    super(message);
    this.name = 'ServerFetchError';
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
    timeoutMs = 15_000,
    headers: headersInit,
    signal,
    body: rawBody,
    ...init
  } = options;

  const base = urls.server.api ?? '';
  const url = /^https?:\/\//.test(path) ? path : `${base}${path}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort('timeout'), timeoutMs);

  if (signal) {
    if (signal.aborted) controller.abort(signal.reason);
    else signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true });
  }

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
      signal: controller.signal,
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
    if (!(err instanceof ServerFetchError)) {
      logger.error(`serverFetch network error: ${url}`, err);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
