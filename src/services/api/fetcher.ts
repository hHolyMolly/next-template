import { urls } from '@/configs/constants/urls';
import { logger } from '@/utils/logger';

type FetcherOptions = RequestInit & {
  /**
   * Next.js extended fetch options.
   * Controls caching and revalidation on the server.
   */
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
};

type FetcherError = {
  status: number;
  statusText: string;
  url: string;
  body: unknown;
};

/**
 * Server-side fetch wrapper that integrates with Next.js caching.
 *
 * Unlike the Axios-based `request()`, this function uses the native `fetch` API
 * extended by Next.js with caching (`next.revalidate`) and tag-based
 * revalidation (`next.tags`). Ideal for Server Components and Server Actions.
 *
 * For client-side requests with interceptors, use `request()` from `./instance.ts`.
 *
 * @example
 * // In a Server Component:
 * const users = await fetcher<User[]>('/users');
 *
 * // With revalidation (ISR):
 * const posts = await fetcher<Post[]>('/posts', {
 *   next: { revalidate: 60, tags: ['posts'] },
 * });
 *
 * // POST request:
 * const result = await fetcher<Result>('/submit', {
 *   method: 'POST',
 *   body: JSON.stringify({ data }),
 * });
 */
export async function fetcher<T>(path: string, options: FetcherOptions = {}): Promise<T> {
  const baseURL = urls.server.api;

  if (!baseURL) {
    throw new Error('fetcher: NEXT_PUBLIC_SERVER_URL is not configured. Set it in your .env file.');
  }

  const url = `${baseURL}${path}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);

    const error: FetcherError = {
      status: response.status,
      statusText: response.statusText,
      url,
      body,
    };

    logger.error(`fetcher ${response.status}: ${options.method ?? 'GET'} ${path}`, error);
    throw error;
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json() as Promise<T>;
}

/**
 * Type-safe version of `fetcher` for endpoints that may return 204 No Content.
 * The return type explicitly includes `undefined`.
 *
 * @example
 * const result = await fetcherWithEmpty<User>('/users/1', { method: 'DELETE' });
 * if (result === undefined) { // 204 — success, no body }
 */
export async function fetcherWithEmpty<T>(
  path: string,
  options: FetcherOptions = {},
): Promise<T | undefined> {
  return fetcher<T | undefined>(path, options);
}

/** Type guard for checking if an error is a FetcherError. */
export function isFetcherError(error: unknown): error is FetcherError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'statusText' in error &&
    'url' in error
  );
}
