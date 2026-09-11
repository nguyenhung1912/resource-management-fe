import axios from 'axios';
import { APP_CONFIG } from '@/constants/config';
import {
  requestErrorInterceptor,
  requestInterceptor,
  responseErrorInterceptor,
  responseInterceptor,
} from './interceptors';

export const axiosClient = axios.create({
  baseURL: APP_CONFIG.API_BASE_URL,
  timeout: APP_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(requestInterceptor, requestErrorInterceptor);
axiosClient.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

export default axiosClient;
