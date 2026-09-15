import { act, renderHook } from '@testing-library/react';
import axios, { type InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { moderationService } from '@/services/moderationService';
import { usePlagiarismCheck } from '../usePlagiarismCheck';
import type { PlagiarismCheckEnvelopeResponse } from '@/features/moderation/types/moderation.types';

vi.mock('@/services/moderationService', () => ({
  moderationService: {
    checkPlagiarism: vi.fn(),
  },
}));

describe('usePlagiarismCheck hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockPlagiarismResponse: PlagiarismCheckEnvelopeResponse = {
    message: 'Kiểm tra trùng lặp thành công.',
    data: {
      fileId: 'FIL_SCAN_001',
      similarityScore: 16.4,
      matchedChunks: [
        {
          chunkIndex: 1,
          sourceFileId: 'FIL_OLD_002',
          sourceFileName: 'Khóa luận tốt nghiệp K18',
          similarity: 78.5,
          contentSnippet: 'Đoạn văn bản trích dẫn...',
        },
      ],
      checkedAt: '2026-09-13T10:00:00Z',
    },
  };

  it('khởi tạo với trạng thái ban đầu isChecking = false và apiError = null', () => {
    const { result } = renderHook(() => usePlagiarismCheck());

    expect(result.current.isChecking).toBe(false);
    expect(result.current.apiError).toBeNull();
  });

  it('thực hiện quét trùng lặp thành công và kích hoạt callback onSuccess', async () => {
    vi.mocked(moderationService.checkPlagiarism).mockResolvedValueOnce(mockPlagiarismResponse);

    const handleSuccess = vi.fn();
    const handleError = vi.fn();

    const { result } = renderHook(() => usePlagiarismCheck());

    let scanResult: PlagiarismCheckEnvelopeResponse | null = null;
    await act(async () => {
      scanResult = await result.current.check('FIL_SCAN_001', {
        onSuccess: handleSuccess,
        onError: handleError,
      });
    });

    expect(moderationService.checkPlagiarism).toHaveBeenCalledWith('FIL_SCAN_001');
    expect(handleSuccess).toHaveBeenCalledWith(mockPlagiarismResponse.data, mockPlagiarismResponse.message);
    expect(handleError).not.toHaveBeenCalled();
    expect(scanResult).toEqual(mockPlagiarismResponse);
    expect(result.current.isChecking).toBe(false);
    expect(result.current.apiError).toBeNull();
  });

  it('xử lý lỗi khi API trả về thông báo lỗi cụ thể', async () => {
    const axiosError = new axios.AxiosError('Request failed');
    axiosError.response = {
      data: { message: 'Tài liệu đang trong tiến trình phân tích bởi worker khác.' },
      status: 409,
      statusText: 'Conflict',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };

    vi.mocked(moderationService.checkPlagiarism).mockRejectedValueOnce(axiosError);

    const handleSuccess = vi.fn();
    const handleError = vi.fn();

    const { result } = renderHook(() => usePlagiarismCheck());

    let scanResult: PlagiarismCheckEnvelopeResponse | null = null;
    await act(async () => {
      scanResult = await result.current.check('FIL_SCAN_001', {
        onSuccess: handleSuccess,
        onError: handleError,
      });
    });

    expect(handleSuccess).not.toHaveBeenCalled();
    expect(handleError).toHaveBeenCalledWith('Tài liệu đang trong tiến trình phân tích bởi worker khác.');
    expect(scanResult).toBeNull();
    expect(result.current.apiError).toBe('Tài liệu đang trong tiến trình phân tích bởi worker khác.');
    expect(result.current.isChecking).toBe(false);
  });

  it('xử lý lỗi mã 404 khi không tìm thấy tài liệu', async () => {
    const axiosError = new axios.AxiosError('Not Found');
    axiosError.response = {
      data: {},
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };

    vi.mocked(moderationService.checkPlagiarism).mockRejectedValueOnce(axiosError);

    const { result } = renderHook(() => usePlagiarismCheck());

    await act(async () => {
      await result.current.check('FIL_NOT_FOUND');
    });

    expect(result.current.apiError).toBe('Không tìm thấy tài liệu cần kiểm tra trên hệ thống.');
  });

  it('xóa lỗi API khi gọi clearApiError', async () => {
    const axiosError = new axios.AxiosError('Error');
    axiosError.response = {
      data: { message: 'Lỗi tạm thời' },
      status: 500,
      statusText: 'Server Error',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };

    vi.mocked(moderationService.checkPlagiarism).mockRejectedValueOnce(axiosError);

    const { result } = renderHook(() => usePlagiarismCheck());

    await act(async () => {
      await result.current.check('FIL_ERR');
    });

    expect(result.current.apiError).toBe('Lỗi tạm thời');

    act(() => {
      result.current.clearApiError();
    });

    expect(result.current.apiError).toBeNull();
  });
});
