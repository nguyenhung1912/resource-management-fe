export const APP_CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '' : 'http://localhost:5023'),
  TIMEOUT: 15000,
} as const;
