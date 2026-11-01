import { describe, expect, it } from 'vitest';
import { isSafeEmbedUrl, isValidGithubUrl } from '../urlValidation';

describe('urlValidation', () => {
  describe('isSafeEmbedUrl', () => {
    it('accepts valid https and http URLs', () => {
      expect(isSafeEmbedUrl('https://example.com/file.pdf')).toBe(true);
      expect(isSafeEmbedUrl('http://example.com/file.pdf')).toBe(true);
    });

    it('accepts blob URLs', () => {
      expect(isSafeEmbedUrl('blob:http://localhost:5173/1234-5678')).toBe(true);
    });

    it('accepts safe internal relative paths', () => {
      expect(isSafeEmbedUrl('/api/Resources/123/download')).toBe(true);
      expect(isSafeEmbedUrl('/files/doc.pdf')).toBe(true);
    });

    it('rejects dangerous protocols (javascript:, data:)', () => {
      expect(isSafeEmbedUrl('javascript:alert(1)')).toBe(false);
      expect(isSafeEmbedUrl('javascript:/*--></title></style></textarea></script>')).toBe(false);
      expect(isSafeEmbedUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
      expect(isSafeEmbedUrl('vbscript:msgbox(1)')).toBe(false);
    });

    it('rejects protocol-relative and backslash bypass attempts', () => {
      expect(isSafeEmbedUrl('//evil.com/hack.html')).toBe(false);
      expect(isSafeEmbedUrl('/\\evil.com/hack.html')).toBe(false);
    });

    it('rejects null, undefined, and empty string', () => {
      expect(isSafeEmbedUrl(null)).toBe(false);
      expect(isSafeEmbedUrl(undefined)).toBe(false);
      expect(isSafeEmbedUrl('')).toBe(false);
      expect(isSafeEmbedUrl('   ')).toBe(false);
    });
  });

  describe('isValidGithubUrl', () => {
    it('accepts valid github repository URLs', () => {
      expect(isValidGithubUrl('https://github.com/facebook/react')).toBe(true);
      expect(isValidGithubUrl('https://www.github.com/vitejs/vite')).toBe(true);
      expect(isValidGithubUrl('http://github.com/org/repo')).toBe(true);
    });

    it('rejects non-github domains', () => {
      expect(isValidGithubUrl('https://gitlab.com/facebook/react')).toBe(false);
      expect(isValidGithubUrl('https://evil-github.com/repo')).toBe(false);
    });

    it('rejects URLs without repository path', () => {
      expect(isValidGithubUrl('https://github.com')).toBe(false);
      expect(isValidGithubUrl('https://github.com/')).toBe(false);
    });

    it('rejects unsafe schemes', () => {
      expect(isValidGithubUrl('javascript:alert(1)')).toBe(false);
      expect(isValidGithubUrl('data:text/html,https://github.com/a/b')).toBe(false);
    });

    it('rejects invalid or empty inputs', () => {
      expect(isValidGithubUrl(null)).toBe(false);
      expect(isValidGithubUrl(undefined)).toBe(false);
      expect(isValidGithubUrl('')).toBe(false);
      expect(isValidGithubUrl('not-a-url')).toBe(false);
    });
  });
});
