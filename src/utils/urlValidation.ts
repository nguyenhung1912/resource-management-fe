/**
 * Utility functions for validating and sanitizing URLs across the application.
 */

/**
 * Checks if a URL is safe for embedding in an <iframe> or opening via window.open/href.
 * Only allows HTTP, HTTPS, or blob URLs, or safe relative paths starting with '/'.
 * Rejects javascript:, data:, file:, protocol-relative (//), or backslash bypasses (/\\).
 */
export function isSafeEmbedUrl(url?: string | null): url is string {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  // Allow safe relative paths
  if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.startsWith('/\\')) {
    return true;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' || parsed.protocol === 'blob:';
  } catch {
    return false;
  }
}

/**
 * Validates whether a given string is a valid GitHub repository or project URL.
 * Requires https or http protocol, github.com or www.github.com host, and a non-empty path.
 * Acts as a TypeScript type guard (`url is string`).
 */
export function isValidGithubUrl(url?: string | null): url is string {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    const hasValidProtocol = parsed.protocol === 'https:' || parsed.protocol === 'http:';
    const hasValidHost = parsed.hostname === 'github.com' || parsed.hostname === 'www.github.com';
    const hasValidPath = parsed.pathname.length > 1 && parsed.pathname !== '/';
    return hasValidProtocol && hasValidHost && hasValidPath;
  } catch {
    return false;
  }
}
