import { act, renderHook } from '@testing-library/react';
import axios, { type InternalAxiosRequestConfig } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { moderationService } from '@/services/moderationService';
import { usePlagiarismCheck } from '../usePlagiarismCheck';
import type { QueuedCheckEnvelope as PlagiarismCheckEnvelopeResponse } from '../../types/queued-check.types';
import { jobFixture } from '@/features/processing/components/__tests__/fixtures';

vi.mock('@/services/moderationService', () => ({
  moderationService: {
    checkPlagiarism: vi.fn(),
  },
}));

afterEach(() => vi.unstubAllEnvs());

describe('usePlagiarismCheck hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('VITE_AUTOMATIC_PROCESSING_ENABLED', 'true');
  });

  const mockPlagiarismResponse: PlagiarismCheckEnvelopeResponse = {
    message: 'Đã tiếp nhận yêu cầu.',
    data: { ...jobFixture, fileId: 'FIL_SCAN_001' },
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

    expect(moderationService.checkPlagiarism).toHaveBeenCalledWith('FIL_SCAN_001', expect.any(String));
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
  it('does not submit while automatic processing is paused', async () => {
    vi.stubEnv('VITE_AUTOMATIC_PROCESSING_ENABLED', 'false');
    const { result } = renderHook(() => usePlagiarismCheck());
    await act(async () => {
      await result.current.check('FIL_SCAN_001');
    });
    expect(moderationService.checkPlagiarism).not.toHaveBeenCalled();
    expect(result.current.apiError).toContain('tạm dừng');
  });

  it('deduplicates simultaneous clicks and reuses the intent key after an uncertain response', async () => {
    let finish!: (value: PlagiarismCheckEnvelopeResponse) => void;
    vi.mocked(moderationService.checkPlagiarism).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const { result } = renderHook(() => usePlagiarismCheck());
    await act(async () => {
      const first = result.current.check('FIL_SCAN_001');
      expect(await result.current.check('FIL_SCAN_001')).toBeNull();
      finish(mockPlagiarismResponse);
      await first;
    });
    expect(moderationService.checkPlagiarism).toHaveBeenCalledTimes(1);
    vi.mocked(moderationService.checkPlagiarism).mockRejectedValueOnce(new Error('connection lost'));
    await act(async () => {
      await result.current.check('FIL_SCAN_001');
    });
    const uncertainKey = vi.mocked(moderationService.checkPlagiarism).mock.calls[1][1];
    vi.mocked(moderationService.checkPlagiarism).mockResolvedValueOnce(mockPlagiarismResponse);
    await act(async () => {
      await result.current.check('FIL_SCAN_001');
    });
    expect(vi.mocked(moderationService.checkPlagiarism).mock.calls[2][1]).toBe(uncertainKey);
  });

  it('lets independent clients converge on the server-provided active job', async () => {
    vi.mocked(moderationService.checkPlagiarism).mockResolvedValue(mockPlagiarismResponse);
    const first = renderHook(() => usePlagiarismCheck());
    const second = renderHook(() => usePlagiarismCheck());
    await act(async () => {
      const results = await Promise.all([
        first.result.current.check('FIL_SCAN_001'),
        second.result.current.check('FIL_SCAN_001'),
      ]);
      expect(results.map((value) => value?.data.jobId)).toEqual([jobFixture.jobId, jobFixture.jobId]);
    });
  });
});
