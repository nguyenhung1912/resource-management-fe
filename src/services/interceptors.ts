import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { STORAGE_KEYS } from '@/constants/storage-keys';

export function setupInterceptors(
  onRequest: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig,
  onRequestError: (error: AxiosError) => Promise<never>,
  onResponse: (response: AxiosResponse) => AxiosResponse,
  onResponseError: (error: AxiosError) => Promise<never>,
) {
  return {
    onRequest,
    onRequestError,
    onResponse,
    onResponseError,
  };
}

export const requestInterceptor = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

export const requestErrorInterceptor = (error: AxiosError): Promise<never> => {
  return Promise.reject(error);
};

export const responseInterceptor = (response: AxiosResponse): AxiosResponse => {
  return response;
};

export const responseErrorInterceptor = (error: AxiosError): Promise<never> => {
  if (error.response?.status === 401) {
    // Xử lý khi hết hạn token hoặc chưa đăng nhập
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  }
  return Promise.reject(error);
};
