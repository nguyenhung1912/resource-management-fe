import type { LoaderFunctionArgs } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { moderationService } from '@/services/moderationService';
import { moderationDetailLoader } from '../moderationDetailLoader';
import type {
  ModerationDetailEnvelopeResponse,
  ModerationHistoryEnvelopeResponse,
} from '@/features/moderation/types/moderation.types';

vi.mock('@/services/moderationService', () => ({
  moderationService: {
    getModerationDetails: vi.fn(),
    getModerationHistory: vi.fn(),
  },
}));

describe('moderationDetailLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockDetailResponse: ModerationDetailEnvelopeResponse = {
    message: 'Thành công',
    data: {
      fileId: 'FIL_123',
      fileName: 'Nghiên cứu Thị giác Máy tính',
      fileDescription: 'Mô tả đề tài nghiên cứu',
      fileUrl: 'https://example.com/test.pdf',
      fileTypeId: 1,
      fileTypeName: 'Báo cáo NCKH',
      subMajorCode: 'CNTT_KTPM',
      subMajorName: 'Kỹ thuật phần mềm',
      departmentName: 'Khoa CNTT',
      uploader: {
        uid: 'USR_01',
        fullName: 'Nguyễn Văn A',
        email: 'vana@example.com',
      },
      authors: [
        {
          authorId: 'USR_01',
          fullName: 'Nguyễn Văn A',
          email: 'vana@example.com',
        },
      ],
      createdAt: '2026-09-12T10:00:00Z',
      latestPlagiarismCheck: {
        fileId: 'FIL_123',
        similarityScore: 14.5,
        matchedChunks: [],
        checkedAt: '2026-09-12T10:30:00Z',
      },
    },
  };

  const mockHistoryResponse: ModerationHistoryEnvelopeResponse = {
    message: 'Thành công',
    data: [
      {
        historyId: 'MDH_01',
        action: 'Reject',
        moderatorName: 'TS. Trần Văn Thầy',
        reason: 'Trùng lặp vượt mức',
        notes: 'Chỉnh sửa lại chương 2',
        plagiarismScore: 35.2,
        createdAt: '2026-09-11T09:00:00Z',
      },
    ],
  };

  it('tải đồng thời chi tiết tài liệu và lịch sử kiểm duyệt khi fileId hợp lệ', async () => {
    vi.mocked(moderationService.getModerationDetails).mockResolvedValueOnce(mockDetailResponse);
    vi.mocked(moderationService.getModerationHistory).mockResolvedValueOnce(mockHistoryResponse);

    const args = {
      params: { fileId: 'FIL_123' },
      request: new Request('http://localhost:5173/dashboard/moderation/FIL_123'),
    } as unknown as LoaderFunctionArgs;

    const result = await moderationDetailLoader(args);

    expect(moderationService.getModerationDetails).toHaveBeenCalledWith('FIL_123');
    expect(moderationService.getModerationHistory).toHaveBeenCalledWith('FIL_123');
    expect(result.detail).toEqual(mockDetailResponse.data);
    expect(result.history).toEqual(mockHistoryResponse.data);
  });

  it('gán mảng rỗng cho history nếu historyResponse.data không tồn tại', async () => {
    vi.mocked(moderationService.getModerationDetails).mockResolvedValueOnce(mockDetailResponse);
    vi.mocked(moderationService.getModerationHistory).mockResolvedValueOnce({
      message: 'OK',
      data: undefined as unknown as [],
    });

    const args = {
      params: { fileId: 'FIL_123' },
      request: new Request('http://localhost:5173/dashboard/moderation/FIL_123'),
    } as unknown as LoaderFunctionArgs;

    const result = await moderationDetailLoader(args);

    expect(result.history).toEqual([]);
  });

  it('ném lỗi Response 400 nếu thiếu fileId hoặc fileId chỉ chứa khoảng trắng', async () => {
    const argsMissing = {
      params: {},
      request: new Request('http://localhost:5173/dashboard/moderation/'),
    } as unknown as LoaderFunctionArgs;

    await expect(moderationDetailLoader(argsMissing)).rejects.toSatisfy((err: unknown) => {
      return err instanceof Response && err.status === 400;
    });

    const argsBlank = {
      params: { fileId: '   ' },
      request: new Request('http://localhost:5173/dashboard/moderation/   '),
    } as unknown as LoaderFunctionArgs;

    await expect(moderationDetailLoader(argsBlank)).rejects.toSatisfy((err: unknown) => {
      return err instanceof Response && err.status === 400;
    });
  });

  it('ném lỗi Response 404 nếu không tìm thấy dữ liệu tài liệu', async () => {
    vi.mocked(moderationService.getModerationDetails).mockResolvedValueOnce({
      message: 'Không tìm thấy',
      data: undefined as unknown as ModerationDetailEnvelopeResponse['data'],
    });
    vi.mocked(moderationService.getModerationHistory).mockResolvedValueOnce(mockHistoryResponse);

    const args = {
      params: { fileId: 'FIL_not_found' },
      request: new Request('http://localhost:5173/dashboard/moderation/FIL_not_found'),
    } as unknown as LoaderFunctionArgs;

    await expect(moderationDetailLoader(args)).rejects.toSatisfy((err: unknown) => {
      return err instanceof Response && err.status === 404;
    });
  });

  it('ném lỗi Response 500 khi API gặp sự cố kỹ thuật', async () => {
    vi.mocked(moderationService.getModerationDetails).mockRejectedValueOnce(new Error('Network failure'));
    vi.mocked(moderationService.getModerationHistory).mockResolvedValueOnce(mockHistoryResponse);

    const args = {
      params: { fileId: 'FIL_123' },
      request: new Request('http://localhost:5173/dashboard/moderation/FIL_123'),
    } as unknown as LoaderFunctionArgs;

    await expect(moderationDetailLoader(args)).rejects.toSatisfy((err: unknown) => {
      return err instanceof Response && err.status === 500;
    });
  });
});
