import axios, { type AxiosInstance, type AxiosError } from 'axios';

import urls from '@configs/constants/urls';

const API: AxiosInstance = axios.create({
  baseURL: urls.server.api,
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

export default API;
