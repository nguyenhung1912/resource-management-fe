import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { LoaderFunctionArgs } from 'react-router-dom';
import type { ModerationResourceItemResponse } from '../../types/moderation.types';
import type { ModerationQueueLoaderData } from '../../types/moderation.types';

// Mock services
vi.mock('@/services/moderationService', () => ({
  default: {
    getModerationQueue: vi.fn(),
  },
  moderationService: {
    getModerationQueue: vi.fn(),
  },
}));

vi.mock('@/services/academicCatalogService', () => ({
  default: {
    getDepartments: vi.fn(),
    getSubMajors: vi.fn(),
    getFileTypes: vi.fn(),
  },
  academicCatalogService: {
    getDepartments: vi.fn(),
    getSubMajors: vi.fn(),
    getFileTypes: vi.fn(),
  },
}));

const makeQueueItem = (score: number | null, fileId = `FIL_${Math.random()}`): ModerationResourceItemResponse => ({
  fileId,
  fileName: `Tài liệu ${fileId}`,
  fileDescription: 'Mô tả tài liệu mẫu',
  fileUrl: 'https://example.com/file.pdf',
  fileTypeId: 1,
  fileTypeName: 'Khóa luận',
  subMajorCode: 'CNTT_KTPM',
  subMajorName: 'Kỹ thuật phần mềm',
  uploaderName: 'Nguyễn Văn A',
  uploaderEmail: 'nguyenvana@gmail.com',
  fileStatusId: 1,
  fileStatusName: 'Pending',
  createdAt: '2026-09-15T08:30:00Z',
  latestPlagiarismScore: score,
});

const makeQueueResponse = (items: ModerationResourceItemResponse[], totalCount = items.length) => ({
  message: 'Lấy danh sách hàng đợi thành công.',
  data: {
    items,
    pageIndex: 1,
    pageSize: 10,
    totalCount,
    totalPages: Math.ceil(totalCount / 10),
    hasPreviousPage: false,
    hasNextPage: totalCount > 10,
  },
});

describe('moderationQueueLoader', () => {
  let moderationQueueLoader: (args: LoaderFunctionArgs) => Promise<ModerationQueueLoaderData>;
  let getModerationQueueMock: ReturnType<typeof vi.fn>;
  let getDepartmentsMock: ReturnType<typeof vi.fn>;
  let getSubMajorsMock: ReturnType<typeof vi.fn>;
  let getFileTypesMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();

    const modService = await import('@/services/moderationService');
    getModerationQueueMock = vi.mocked(modService.default.getModerationQueue);

    const catalogService = await import('@/services/academicCatalogService');
    getDepartmentsMock = vi.mocked(catalogService.default.getDepartments);
    getSubMajorsMock = vi.mocked(catalogService.default.getSubMajors);
    getFileTypesMock = vi.mocked(catalogService.default.getFileTypes);

    getDepartmentsMock.mockResolvedValue([{ id: 'DPT_IT', name: 'Công nghệ thông tin' }]);
    getSubMajorsMock.mockResolvedValue([{ subMajorCode: 'CNTT_KTPM', subMajorName: 'Kỹ thuật phần mềm' }]);
    getFileTypesMock.mockResolvedValue([{ id: 1, name: 'Khóa luận tốt nghiệp' }]);

    const loaderMod = await import('../moderationQueueLoader');
    moderationQueueLoader = loaderMod.moderationQueueLoader;
  });

  const createRequest = (params: Record<string, string> = {}) => {
    const url = new URL('http://localhost/dashboard/moderation');
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
    return { request: new Request(url.toString()) } as LoaderFunctionArgs;
  };

  it('đọc đúng các tham số tìm kiếm và bộ lọc từ URL', async () => {
    getModerationQueueMock.mockResolvedValue(makeQueueResponse([]));

    const result = await moderationQueueLoader(
      createRequest({
        search: 'Học sâu',
        departmentId: 'DPT_IT',
        subMajorCode: 'CNTT_KTPM',
        fileTypeId: '2',
        page: '2',
        pageSize: '15',
      }),
    );

    expect(getModerationQueueMock).toHaveBeenCalledWith(
      expect.objectContaining({
        search: 'Học sâu',
        departmentId: 'DPT_IT',
        subMajorCode: 'CNTT_KTPM',
        fileTypeId: 2,
        pageNumber: 2,
        pageSize: 15,
      }),
    );

    expect(result.currentFilters).toEqual({
      search: 'Học sâu',
      departmentId: 'DPT_IT',
      subMajorCode: 'CNTT_KTPM',
      fileTypeId: 2,
      aiRisk: 'all',
      page: 2,
      pageSize: 15,
    });
  });

  it('mặc định page=1 và pageSize=10 khi URL không truyền', async () => {
    getModerationQueueMock.mockResolvedValue(makeQueueResponse([]));

    const result = await moderationQueueLoader(createRequest());

    expect(result.currentFilters.page).toBe(1);
    expect(result.currentFilters.pageSize).toBe(10);
    expect(result.currentFilters.aiRisk).toBe('all');
  });

  it('chuẩn hóa aiRisk hợp lệ hoặc fallback về all khi giá trị không hợp lệ', async () => {
    getModerationQueueMock.mockResolvedValue(makeQueueResponse([]));

    const validResult = await moderationQueueLoader(createRequest({ aiRisk: 'danger' }));
    expect(validResult.currentFilters.aiRisk).toBe('danger');

    const invalidResult = await moderationQueueLoader(createRequest({ aiRisk: 'invalid_risk' }));
    expect(invalidResult.currentFilters.aiRisk).toBe('all');
  });

  it('tính toán chính xác chỉ số KPI stats từ danh sách tài liệu', async () => {
    const items: ModerationResourceItemResponse[] = [
      makeQueueItem(10, 'FIL_1'), // safe (<= 15)
      makeQueueItem(14.5, 'FIL_2'), // safe (<= 15)
      makeQueueItem(25, 'FIL_3'), // warning (15 - 30)
      makeQueueItem(35, 'FIL_4'), // danger (> 30)
      makeQueueItem(null, 'FIL_5'), // uninspected
      makeQueueItem(null, 'FIL_6'), // uninspected
    ];

    getModerationQueueMock.mockResolvedValue(makeQueueResponse(items, 6));

    const result = await moderationQueueLoader(createRequest());

    expect(result.stats).toEqual({
      totalPending: 6,
      highPlagiarismRisk: 1,
      safePlagiarism: 2,
      uninspectedCount: 2,
    });
  });

  it('lọc client-side items theo aiRisk = "danger" (> 30%)', async () => {
    const items: ModerationResourceItemResponse[] = [
      makeQueueItem(10, 'FIL_1'),
      makeQueueItem(35, 'FIL_2'),
      makeQueueItem(42, 'FIL_3'),
    ];

    getModerationQueueMock.mockResolvedValue(makeQueueResponse(items));

    const result = await moderationQueueLoader(createRequest({ aiRisk: 'danger' }));

    expect(result.queue.items).toHaveLength(2);
    expect(result.queue.items.map((i) => i.fileId)).toEqual(['FIL_2', 'FIL_3']);
  });

  it('lọc client-side items theo aiRisk = "uninspected" (chưa quét AI)', async () => {
    const items: ModerationResourceItemResponse[] = [makeQueueItem(12, 'FIL_1'), makeQueueItem(null, 'FIL_2')];

    getModerationQueueMock.mockResolvedValue(makeQueueResponse(items));

    const result = await moderationQueueLoader(createRequest({ aiRisk: 'uninspected' }));

    expect(result.queue.items).toHaveLength(1);
    expect(result.queue.items[0]?.fileId).toBe('FIL_2');
  });

  it('lọc client-side items theo aiRisk = "safe" (<= 15%)', async () => {
    const items: ModerationResourceItemResponse[] = [
      makeQueueItem(10, 'FIL_1'),
      makeQueueItem(15, 'FIL_2'),
      makeQueueItem(25, 'FIL_3'),
    ];

    getModerationQueueMock.mockResolvedValue(makeQueueResponse(items));

    const result = await moderationQueueLoader(createRequest({ aiRisk: 'safe' }));

    expect(result.queue.items).toHaveLength(2);
    expect(result.queue.items.map((i) => i.fileId)).toEqual(['FIL_1', 'FIL_2']);
  });

  it('trả về danh mục departments, subMajors, fileTypes thành công', async () => {
    getModerationQueueMock.mockResolvedValue(makeQueueResponse([]));

    const result = await moderationQueueLoader(createRequest());

    expect(result.departments).toHaveLength(1);
    expect(result.subMajors).toHaveLength(1);
    expect(result.fileTypes).toHaveLength(1);
  });

  it('xử lý an toàn khi các API lookups bị reject', async () => {
    getModerationQueueMock.mockResolvedValue(makeQueueResponse([]));
    getDepartmentsMock.mockRejectedValue(new Error('Network error'));
    getSubMajorsMock.mockRejectedValue(new Error('Network error'));
    getFileTypesMock.mockRejectedValue(new Error('Network error'));

    const result = await moderationQueueLoader(createRequest());

    expect(result.departments).toEqual([]);
    expect(result.subMajors).toEqual([]);
    expect(result.fileTypes).toEqual([]);
  });

  it('fallback an toàn về empty data khi moderationService gặp lỗi nghiêm trọng', async () => {
    getModerationQueueMock.mockRejectedValue(new Error('Server 500 error'));

    const result = await moderationQueueLoader(createRequest({ search: 'Error Test' }));

    expect(result.queue.items).toEqual([]);
    expect(result.stats.totalPending).toBe(0);
    expect(result.currentFilters.search).toBe('Error Test');
  });
});
