import axios from 'axios';

export function getApiErrorMessage(error: unknown, fallback = 'Đã xảy ra lỗi. Vui lòng thử lại.'): string {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const data = error.response?.data;

  if (typeof data === 'string') {
    return data;
  }

  if (data && typeof data.message === 'string') {
    return data.message;
  }

  if (data && typeof data.title === 'string') {
    return data.title;
  }

  return fallback;
}
