import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosError } from 'axios';

import { urls } from '@/configs/constants/urls';
import { DEFAULT_TIMEOUT_MS } from '@/services/api/paths';
import { logger } from '@/utils/logger';

const API: AxiosInstance = axios.create({
  ...(urls.server.api ? { baseURL: urls.server.api } : {}),
  timeout: DEFAULT_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor slot — add one only when it does something, e.g. auth:
// API.interceptors.request.use((config) => {
//   const token = getToken();
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// Never log raw response bodies — they may contain tokens, PII, or
// internal stack traces. Log only status, method, URL, and a bounded
// message length.
const truncate = (value: unknown, max = 200): string => {
  const s = typeof value === 'string' ? value : JSON.stringify(value ?? '');
  return s.length > max ? `${s.slice(0, max)}…` : s;
};

API.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      logger.error(
        `API ${error.response.status}: ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        { message: truncate(error.message) },
      );
    } else if (error.code === 'ECONNABORTED') {
      logger.error(`API timeout: ${error.config?.url}`);
    } else if (!isAbortError(error)) {
      logger.error(`API network error: ${truncate(error.message)}`);
    }

    return Promise.reject(error);
  },
);

/**
 * Typed helper for API requests.
 * Returns `data` from the response, unwrapping AxiosResponse.
 * Supports AbortController for request cancellation.
 *
 * @example
 * const users = await request<User[]>({ url: '/users', method: 'GET' });
 *
 * // With cancellation:
 * const controller = new AbortController();
 * const users = await request<User[]>({ url: '/users' }, controller.signal);
 * controller.abort(); // cancel the request
 */
export async function request<T>(config: AxiosRequestConfig, signal?: AbortSignal): Promise<T> {
  const response = await API.request<T>({
    ...config,
    ...(signal ? { signal } : {}),
  });
  return response.data;
}

/** Type guard for checking if an error is an AxiosError. */
export function isApiError(error: unknown): error is AxiosError {
  return axios.isAxiosError(error);
}

/** Check if a caught error is from AbortController cancellation. */
export function isAbortError(error: unknown): boolean {
  return axios.isCancel(error);
}

export default API;
