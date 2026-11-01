import { APP_PATHS } from '@/constants/path';

/**
 * Validates that a redirect target is a safe internal relative path.
 * Prevents Open Redirect attacks via protocol-relative URLs (e.g. `//evil.com`),
 * backslash evasion (e.g. `/\evil.com`), or external schemes (`https://...`, `javascript:`).
 */
export function getSafeRedirectPath(target: string | null | undefined, fallback: string = APP_PATHS.DASHBOARD): string {
  if (!target || typeof target !== 'string') {
    return fallback;
  }

  const trimmed = target.trim();

  // Must start with exactly one '/' and never with '//' or '/\'
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return fallback;
  }

  // Prevent backslash evasion anywhere in the path part before query/hash
  const pathPart = trimmed.split('?')[0].split('#')[0];
  if (pathPart.includes('\\')) {
    return fallback;
  }

  try {
    const resolved = new URL(trimmed, 'http://dummy.local');
    if (resolved.origin !== 'http://dummy.local') {
      return fallback;
    }

    return trimmed;
  } catch {
    return fallback;
  }
}
