import axios from 'axios';

import { authStorage } from '@/utils/authStorage';

export const AUTH_UNAUTHORIZED_EVENT = 'auth:unauthorized';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,

  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const session = authStorage.getSession();

  if (session) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      authStorage.clearSession();

      window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
    }

    return Promise.reject(error);
  },
);
