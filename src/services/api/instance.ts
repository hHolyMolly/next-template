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
 * Типизированный хелпер для API-запросов.
 * Возвращает `data` из ответа, убирая обёртку AxiosResponse.
 *
 * @example
 * const users = await request<User[]>({ url: '/users', method: 'GET' });
 */
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await API.request<T>(config);
  return response.data;
}

/**
 * Type guard для проверки, является ли ошибка AxiosError.
 */
export function isApiError(error: unknown): error is AxiosError {
  return axios.isAxiosError(error);
}

export default API;
