import axios from 'axios';

export function getApiErrorMessage(error: unknown, fallback = 'Đã xảy ra lỗi. Vui lòng thử lại.'): string {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const data = error.response?.data;

  if (typeof data === 'string') {
    const trimmed = data.trim();
    return trimmed.length > 0 ? trimmed : fallback;
  }

  if (data && typeof data === 'object') {
    if ('errors' in data && data.errors && typeof data.errors === 'object') {
      const errorList = Object.values(data.errors as Record<string, unknown>)
        .flatMap((messages) => (Array.isArray(messages) ? messages : [messages]))
        .filter((msg): msg is string => typeof msg === 'string' && msg.trim().length > 0)
        .map((msg) => msg.trim());

      if (errorList.length > 0) {
        return errorList.join(' ');
      }
    }

    if ('message' in data && typeof data.message === 'string' && data.message.trim().length > 0) {
      return data.message.trim();
    }

    if ('title' in data && typeof data.title === 'string' && data.title.trim().length > 0) {
      return data.title.trim();
    }
  }

  return fallback;
}
