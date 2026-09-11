import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { APP_PATHS } from '@/constants/path';
import { STORAGE_KEYS } from '@/constants/storage-keys';

type RedirectToErrorPage = (path: string) => void;
type GetCurrentPath = () => string;

const ERROR_PATH_BY_STATUS: Readonly<Partial<Record<number, string>>> = {
  401: APP_PATHS.UNAUTHORIZED,
  403: APP_PATHS.FORBIDDEN,
  404: APP_PATHS.NOT_FOUND,
  500: APP_PATHS.SERVER_ERROR,
};

const redirectToErrorPage: RedirectToErrorPage = (path) => {
  window.location.replace(path);
};

const getCurrentPath: GetCurrentPath = () => window.location.pathname;

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

export function createResponseErrorInterceptor(
  redirect: RedirectToErrorPage,
  currentPath: GetCurrentPath = getCurrentPath,
) {
  let isRedirecting = false;

  return (error: AxiosError): Promise<never> => {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    }

    const errorPath = status === undefined ? undefined : ERROR_PATH_BY_STATUS[status];
    if (errorPath && !isRedirecting && currentPath() !== errorPath) {
      isRedirecting = true;
      redirect(errorPath);
    }

    return Promise.reject(error);
  };
}

export const responseErrorInterceptor = createResponseErrorInterceptor(redirectToErrorPage);
