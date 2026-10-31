import { APP_CONFIG } from '@/constants/config';
import type { ProcessingJob } from '../types/processing.types';

export class UncertainUploadError extends Error {}

/** Never follow a server-supplied status reference to another origin or job. */
export function validateAcceptedJob(job: ProcessingJob): ProcessingJob {
  if (
    !job ||
    typeof job.jobId !== 'string' ||
    typeof job.fileId !== 'string' ||
    typeof job.status !== 'string' ||
    typeof job.statusUrl !== 'string'
  ) {
    throw new UncertainUploadError('Missing accepted job');
  }
  const api = new URL(APP_CONFIG.API_BASE_URL || '/', window.location.origin);
  let status: URL;
  try {
    status = new URL(job.statusUrl, api);
  } catch {
    throw new UncertainUploadError('Invalid accepted job URL');
  }
  if (
    !job.jobId ||
    !job.fileId ||
    !job.status ||
    status.origin !== api.origin ||
    status.pathname !== `/api/processing-jobs/${encodeURIComponent(job.jobId)}` ||
    status.search ||
    status.hash ||
    status.username ||
    status.password
  ) {
    throw new UncertainUploadError('Invalid accepted job reference');
  }
  return job;
}
