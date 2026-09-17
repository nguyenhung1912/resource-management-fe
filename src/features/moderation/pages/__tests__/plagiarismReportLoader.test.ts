import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { ModerationResourceItemResponse } from '../../types/moderation.types';
import type { PlagiarismReportLoaderData } from '../../types/plagiarism-report.types';

// ─── Mock service ──────────────────────────────────────────────────────────

vi.mock('@/services/moderationService', () => ({
  moderationService: {
    getModerationQueue: vi.fn(),
  },
}));

// ─── Fixtures ──────────────────────────────────────────────────────────────

const makeQueueItem = (score: number | null, status: string): ModerationResourceItemResponse => ({
  fileId: `FIL_${Math.random()}`,
  fileName: 'Test document',
  fileDescription: '',
  fileUrl: '',
  fileTypeId: 1,
  fileTypeName: 'Báo cáo',
  subMajorCode: 'CNTT',
  subMajorName: 'Công nghệ thông tin',
  uploaderName: 'User A',
  uploaderEmail: 'usera@example.com',
  fileStatusId: 1,
  fileStatusName: status,
  createdAt: '2026-01-01T00:00:00Z',
  latestPlagiarismScore: score,
});

const makeQueueResponse = (items: ModerationResourceItemResponse[], totalCount = items.length) => ({
  data: {
    items,
    pageIndex: 1,
    pageSize: 15,
    totalCount,
    totalPages: Math.ceil(totalCount / 15),
    hasPreviousPage: false,
    hasNextPage: totalCount > 15,
  },
});

// ─── Tests ─────────────────────────────────────────────────────────────────

import type { LoaderFunctionArgs } from 'react-router-dom';

describe('plagiarismReportLoader', () => {
  // Import lazily để mock có hiệu lực trước
  let plagiarismReportLoader: (args: LoaderFunctionArgs) => Promise<PlagiarismReportLoaderData>;
  let getModerationQueue: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    const serviceMod = await import('@/services/moderationService');
    getModerationQueue = vi.mocked(serviceMod.moderationService.getModerationQueue);
    const loaderMod = await import('../../pages/plagiarismReportLoader');
    plagiarismReportLoader = loaderMod.plagiarismReportLoader;
    getModerationQueue.mockReset();
  });

  const makeRequest = (search = '', riskLevel = '', page = '1') => {
    const url = new URL(`http://localhost/dashboard/moderation/plagiarism-reports`);
    if (search) url.searchParams.set('search', search);
    if (riskLevel) url.searchParams.set('riskLevel', riskLevel);
    url.searchParams.set('page', page);
    return { request: new Request(url.toString()) } as LoaderFunctionArgs;
  };

  it('đọc đúng currentSearch từ URL params', async () => {
    getModerationQueue.mockResolvedValue(makeQueueResponse([]));
    const result = await plagiarismReportLoader(makeRequest('test query'));
    expect(result.currentSearch).toBe('test query');
  });

  it('đọc đúng currentPage từ URL params', async () => {
    getModerationQueue.mockResolvedValue(makeQueueResponse([]));
    const result = await plagiarismReportLoader(makeRequest('', '', '3'));
    expect(result.currentPage).toBe(3);
  });

  it('đọc đúng currentRiskLevel từ URL params', async () => {
    getModerationQueue.mockResolvedValue(makeQueueResponse([]));
    const result = await plagiarismReportLoader(makeRequest('', 'danger'));
    expect(result.currentRiskLevel).toBe('danger');
  });

  it('currentRiskLevel = undefined khi param không hợp lệ', async () => {
    getModerationQueue.mockResolvedValue(makeQueueResponse([]));
    const result = await plagiarismReportLoader(makeRequest('', 'invalid'));
    expect(result.currentRiskLevel).toBeUndefined();
  });

  it('tính đúng stats.safeCount, warningCount, dangerCount từ items', async () => {
    const items = [
      makeQueueItem(10, 'Pending'), // safe
      makeQueueItem(15, 'Approved'), // safe
      makeQueueItem(25, 'Pending'), // warning
      makeQueueItem(30, 'Pending'), // warning (boundary)
      makeQueueItem(35, 'Rejected'), // danger
      makeQueueItem(null, 'Pending'), // unchecked
    ];
    getModerationQueue.mockResolvedValue(makeQueueResponse(items, 6));
    const result = await plagiarismReportLoader(makeRequest());
    expect(result.stats.safeCount).toBe(2);
    expect(result.stats.warningCount).toBe(2);
    expect(result.stats.dangerCount).toBe(1);
    expect(result.stats.totalScanned).toBe(5);
    expect(result.stats.totalUnscanned).toBe(1);
  });

  it('tính đúng histogram buckets', async () => {
    const items = [
      makeQueueItem(5, 'Pending'), // 0–10%
      makeQueueItem(15, 'Pending'), // 10–20%
      makeQueueItem(15, 'Pending'), // 10–20%
      makeQueueItem(25, 'Pending'), // 20–30%
      makeQueueItem(40, 'Pending'), // 30–50%
      makeQueueItem(80, 'Pending'), // 50–100%
    ];
    getModerationQueue.mockResolvedValue(makeQueueResponse(items, 6));
    const result = await plagiarismReportLoader(makeRequest());
    const bucket = (range: string) => result.histogram.find((b) => b.range === range);
    expect(bucket('0–10%')?.count).toBe(1);
    expect(bucket('10–20%')?.count).toBe(2);
    expect(bucket('20–30%')?.count).toBe(1);
    expect(bucket('30–50%')?.count).toBe(1);
    expect(bucket('50–100%')?.count).toBe(1);
  });

  it('lọc client-side theo riskLevel=danger chỉ giữ items score > 30', async () => {
    const items = [
      makeQueueItem(10, 'Pending'), // safe — bị lọc bỏ
      makeQueueItem(35, 'Pending'), // danger — giữ lại
      makeQueueItem(50, 'Pending'), // danger — giữ lại
      makeQueueItem(null, 'Pending'), // unchecked — bị lọc bỏ
    ];
    getModerationQueue.mockResolvedValue(makeQueueResponse(items, 4));
    const result = await plagiarismReportLoader(makeRequest('', 'danger'));
    expect(result.queue.items.every((i) => (i.latestPlagiarismScore ?? 0) > 30)).toBe(true);
    expect(result.queue.items).toHaveLength(2);
  });

  it('trả về fallback an toàn khi getModerationQueue throw', async () => {
    getModerationQueue.mockRejectedValue(new Error('Network error'));
    const result = await plagiarismReportLoader(makeRequest());
    expect(result.queue.items).toEqual([]);
    expect(result.stats.totalFiles).toBe(0);
    // Loader trả về 5 buckets với count=0 (không crash), không phải []
    expect(result.histogram).toHaveLength(5);
    expect(result.histogram.every((b) => b.count === 0)).toBe(true);
  });

  it('dùng totalCount từ API cho stats.totalFiles (không phải items.length)', async () => {
    const items = [makeQueueItem(10, 'Pending'), makeQueueItem(25, 'Pending')];
    getModerationQueue.mockResolvedValue(makeQueueResponse(items, 500)); // totalCount = 500
    const result = await plagiarismReportLoader(makeRequest());
    expect(result.stats.totalFiles).toBe(500);
  });
});
