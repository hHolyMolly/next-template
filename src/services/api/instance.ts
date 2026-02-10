import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosError } from 'axios';

import { urls } from '@/configs/constants/urls';

const API: AxiosInstance = axios.create({
  baseURL: urls.server.api,
  headers: { 'Content-Type': 'application/json' },
});

API.interceptors.request.use(
  (config) => {
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

API.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

/**
 * Typed helper for API requests.
 * Returns `data` from the response, unwrapping AxiosResponse.
 *
 * @example
 * const users = await request<User[]>({ url: '/users', method: 'GET' });
 */
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await API.request<T>(config);
  return response.data;
}

/** Type guard for checking if an error is an AxiosError. */
export function isApiError(error: unknown): error is AxiosError {
  return axios.isAxiosError(error);
}

export default API;
