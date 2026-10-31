import { afterEach, describe, expect, it, vi } from 'vitest';
import { jobFixture } from '../../components/__tests__/fixtures';
import { validateAcceptedJob } from '../acceptedJob';
import { processingDeployment } from '../processingDeployment';

afterEach(() => vi.unstubAllEnvs());

describe('accepted processing references', () => {
  it('accepts the canonical authenticated status reference', () => {
    expect(validateAcceptedJob(jobFixture)).toBe(jobFixture);
  });

  it.each([
    'https://untrusted.example/api/processing-jobs/job-accepted',
    '/api/processing-jobs/another-job',
    '/api/processing-jobs/job-accepted?token=private',
  ])('rejects an untrusted or mismatched status reference: %s', (statusUrl) => {
    expect(() => validateAcceptedJob({ ...jobFixture, statusUrl })).toThrow();
  });

  it('defaults to paused and requires explicit true for legacy compatibility', () => {
    vi.stubEnv('VITE_AUTOMATIC_PROCESSING_ENABLED', '');
    vi.stubEnv('VITE_LEGACY_MANUAL_MODERATION_ENABLED', 'yes');
    expect(processingDeployment()).toEqual({ enabled: false, legacyManualDecisions: false });
  });
});
