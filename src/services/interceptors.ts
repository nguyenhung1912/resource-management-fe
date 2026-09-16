import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { APP_PATHS } from '@/constants/path';
import { authStorage } from '@/utils/authStorage';

export const AUTH_UNAUTHORIZED_EVENT = 'auth:unauthorized';

type RedirectToErrorPage = (path: string) => void;
type GetCurrentPath = () => string;

const ERROR_PATH_BY_STATUS: Readonly<Partial<Record<number, string>>> = {
  401: APP_PATHS.UNAUTHORIZED,
  403: APP_PATHS.FORBIDDEN,
  500: APP_PATHS.SERVER_ERROR,
};

const redirectToErrorPage: RedirectToErrorPage = (path) => {
  window.location.replace(path);
};

const getCurrentPath: GetCurrentPath = () => window.location.pathname;

export const requestInterceptor = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const session = authStorage.getSession();

  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
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
      authStorage.clearSession();

      window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
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
