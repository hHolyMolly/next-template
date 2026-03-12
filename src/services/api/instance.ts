import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosError } from 'axios';

import { urls } from '@/configs/constants/urls';
import { logger } from '@/utils/logger';

const API: AxiosInstance = axios.create({
  ...(urls.server.api ? { baseURL: urls.server.api } : {}),
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

API.interceptors.request.use(
  (config) => {
    // Add auth token here:
    // const token = getToken();
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

API.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      logger.error(
        `API ${error.response.status}: ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
      );
    } else if (error.code === 'ECONNABORTED') {
      logger.error(`API timeout: ${error.config?.url}`);
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
export async function request<T>(
  config: AxiosRequestConfig,
  signal?: AbortSignal,
): Promise<T> {
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
