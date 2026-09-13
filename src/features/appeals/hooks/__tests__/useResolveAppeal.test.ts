import { act, renderHook } from '@testing-library/react';
import axios, { type InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { appealService } from '@/services/appealService';
import { useResolveAppeal } from '../useResolveAppeal';
import type { AppealEnvelopeResponse, ResolveAppealRequest } from '@/features/appeals/types/appeal.types';

vi.mock('@/services/appealService', () => ({
  appealService: {
    resolveAppeal: vi.fn(),
  },
}));

describe('useResolveAppeal hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('khởi tạo với trạng thái ban đầu isResolving = false và apiError = null', () => {
    const { result } = renderHook(() => useResolveAppeal());

    expect(result.current.isResolving).toBe(false);
    expect(result.current.apiError).toBeNull();
  });

  it('gửi phán quyết giải quyết khiếu nại thành công và gọi callback onSuccess', async () => {
    const mockPayload: ResolveAppealRequest = {
      isApproved: true,
      lecturerResponse: 'Giải trình hợp lý. Đồng ý phê duyệt lại tài liệu.',
    };

    const mockResponse: AppealEnvelopeResponse = {
      message: 'Giải quyết khiếu nại thành công.',
      data: {
        appealId: 'APL_001',
        fileId: 'FIL_001',
        fileName: 'Bài nghiên cứu AI',
        appealAttempt: 1,
        studentExplanation: 'Minh chứng rõ ràng',
        status: 'Approved',
        lecturerResponse: mockPayload.lecturerResponse,
        createdAt: '2026-09-11T12:00:00Z',
        resolvedAt: '2026-09-13T01:00:00Z',
      },
    };

    vi.mocked(appealService.resolveAppeal).mockResolvedValueOnce(mockResponse);

    const handleSuccess = vi.fn();
    const handleError = vi.fn();

    const { result } = renderHook(() => useResolveAppeal());

    let resolveResult: AppealEnvelopeResponse | null = null;
    await act(async () => {
      resolveResult = await result.current.resolve('APL_001', mockPayload, {
        onSuccess: handleSuccess,
        onError: handleError,
      });
    });

    expect(appealService.resolveAppeal).toHaveBeenCalledWith('APL_001', mockPayload);
    expect(handleSuccess).toHaveBeenCalledWith(mockResponse.data, mockResponse.message);
    expect(handleError).not.toHaveBeenCalled();
    expect(resolveResult).toEqual(mockResponse);
    expect(result.current.isResolving).toBe(false);
    expect(result.current.apiError).toBeNull();
  });

  it('xử lý khi backend trả về lỗi HTTP 403 (không có quyền phân xử)', async () => {
    const mockPayload: ResolveAppealRequest = {
      isApproved: false,
      lecturerResponse: 'Minh chứng chưa đạt yêu cầu.',
    };

    const axiosError = new axios.AxiosError(
      'Request failed with status code 403',
      'ERR_FORBIDDEN',
      undefined,
      undefined,
      {
        status: 403,
        statusText: 'Forbidden',
        headers: {},
        config: {} as unknown as InternalAxiosRequestConfig,
        data: {},
      },
    );

    vi.mocked(appealService.resolveAppeal).mockRejectedValueOnce(axiosError);

    const handleSuccess = vi.fn();
    const handleError = vi.fn();

    const { result } = renderHook(() => useResolveAppeal());

    let resolveResult: AppealEnvelopeResponse | null = null;
    await act(async () => {
      resolveResult = await result.current.resolve('APL_001', mockPayload, {
        onSuccess: handleSuccess,
        onError: handleError,
      });
    });

    expect(resolveResult).toBeNull();
    expect(handleSuccess).not.toHaveBeenCalled();
    expect(handleError).toHaveBeenCalledWith('Bạn không có quyền phân xử đơn khiếu nại này.');
    expect(result.current.isResolving).toBe(false);
    expect(result.current.apiError).toBe('Bạn không có quyền phân xử đơn khiếu nại này.');
  });

  it('xóa lỗi API khi gọi clearApiError', async () => {
    const axiosError = new axios.AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: {} as unknown as InternalAxiosRequestConfig,
      data: { message: 'Lỗi kiểm thử phân xử' },
    });

    vi.mocked(appealService.resolveAppeal).mockRejectedValueOnce(axiosError);

    const { result } = renderHook(() => useResolveAppeal());

    await act(async () => {
      await result.current.resolve('APL_001', {
        isApproved: true,
        lecturerResponse: 'Phản hồi',
      });
    });

    expect(result.current.apiError).toBe('Lỗi kiểm thử phân xử');

    act(() => {
      result.current.clearApiError();
    });

    expect(result.current.apiError).toBeNull();
  });
});
