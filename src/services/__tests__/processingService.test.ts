import { beforeEach, describe, expect, it, vi } from 'vitest';
import axiosClient from '../axiosClient';
import { processingService } from '../processingService';

vi.mock('../axiosClient', () => ({ default: { get: vi.fn(), post: vi.fn() } }));

describe('durable processing contracts', () => {
  beforeEach(() => vi.clearAllMocks());
  it('unwraps accepted job while retaining unknown stages', async () => {
    const job = { jobId: 'job', status: 'QUEUED', stage: 'FUTURE_STAGE' };
    vi.mocked(axiosClient.post).mockResolvedValue({ data: { data: job } });
    expect(await processingService.requestCheck('file/id', 'intent')).toEqual(job);
    expect(axiosClient.post).toHaveBeenCalledWith('/api/resources/file%2Fid/plagiarism-checks', null, {
      headers: { 'Idempotency-Key': 'intent' },
    });
  });
  it('does not unwrap a bare history array or invent a report', async () => {
    vi.mocked(axiosClient.get).mockResolvedValue({ data: [] });
    expect(await processingService.history('file')).toEqual([]);
    vi.mocked(axiosClient.get).mockResolvedValue({ data: { data: [] } });
    await expect(processingService.history('file')).rejects.toThrow();
  });
  it('rejects synchronous score payload on a queued job endpoint', async () => {
    vi.mocked(axiosClient.get).mockResolvedValue({ data: { data: { similarityScore: 0 } } });
    await expect(processingService.getJob('job')).rejects.toThrow();
  });
  it('requests previews only through the authenticated scoped API', async () => {
    const blob = new Blob(['pdf'], { type: 'application/pdf' });
    vi.mocked(axiosClient.get).mockResolvedValue({ data: blob });
    expect(await processingService.preview('file', 'check', 'publication')).toBe(blob);
    expect(axiosClient.get).toHaveBeenCalledWith('/api/resources/file/plagiarism-checks/check/previews/publication', {
      responseType: 'blob',
      signal: undefined,
    });
  });
});
