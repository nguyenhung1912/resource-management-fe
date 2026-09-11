import { act, renderHook } from '@testing-library/react';
import axios, { type InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { appealService } from '@/services/appealService';
import { useCreateAppeal } from '../useCreateAppeal';
import type { AppealEnvelopeResponse, CreateAppealRequest } from '@/features/appeals/types/appeal.types';

vi.mock('@/services/appealService', () => ({
  appealService: {
    createAppeal: vi.fn(),
  },
}));

describe('useCreateAppeal hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('khởi tạo với trạng thái ban đầu isSubmitting = false và apiError = null', () => {
    const { result } = renderHook(() => useCreateAppeal());

    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.apiError).toBeNull();
  });

  it('gửi khiếu nại thành công và gọi callback onSuccess', async () => {
    const mockPayload: CreateAppealRequest = {
      fileId: 'FIL_TEST_123',
      studentExplanation: 'Nội dung giải trình hợp lệ có trên 20 ký tự.',
      attachmentUrl: 'https://example.com/proof.pdf',
    };

    const mockResponse: AppealEnvelopeResponse = {
      message: 'Gửi khiếu nại/giải trình thành công.',
      data: {
        appealId: 'APL_TEST_1',
        fileId: 'FIL_TEST_123',
        fileName: 'Bài nghiên cứu khoa học',
        appealAttempt: 1,
        studentExplanation: mockPayload.studentExplanation,
        status: 'Pending',
        createdAt: '2026-09-11T12:00:00Z',
      },
    };

    vi.mocked(appealService.createAppeal).mockResolvedValueOnce(mockResponse);

    const handleSuccess = vi.fn();
    const handleError = vi.fn();

    const { result } = renderHook(() => useCreateAppeal());

    let submitResult: AppealEnvelopeResponse | null = null;
    await act(async () => {
      submitResult = await result.current.submitAppeal(mockPayload, {
        onSuccess: handleSuccess,
        onError: handleError,
      });
    });

    expect(appealService.createAppeal).toHaveBeenCalledWith(mockPayload);
    expect(handleSuccess).toHaveBeenCalledWith(mockResponse.data);
    expect(handleError).not.toHaveBeenCalled();
    expect(submitResult).toEqual(mockResponse);
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.apiError).toBeNull();
  });

  it('xử lý khi backend trả về lỗi HTTP 400 (hết lượt khiếu nại)', async () => {
    const mockPayload: CreateAppealRequest = {
      fileId: 'FIL_TEST_123',
      studentExplanation: 'Nội dung giải trình hợp lệ có trên 20 ký tự.',
    };

    const axiosError = new axios.AxiosError(
      'Request failed with status code 400',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: {} as unknown as InternalAxiosRequestConfig,
        data: {
          message: 'Tài liệu không bị từ chối hoặc đã hết số lượt khiếu nại',
        },
      },
    );

    vi.mocked(appealService.createAppeal).mockRejectedValueOnce(axiosError);

    const handleSuccess = vi.fn();
    const handleError = vi.fn();

    const { result } = renderHook(() => useCreateAppeal());

    let submitResult: AppealEnvelopeResponse | null = null;
    await act(async () => {
      submitResult = await result.current.submitAppeal(mockPayload, {
        onSuccess: handleSuccess,
        onError: handleError,
      });
    });

    expect(submitResult).toBeNull();
    expect(handleSuccess).not.toHaveBeenCalled();
    expect(handleError).toHaveBeenCalledWith('Tài liệu không bị từ chối hoặc đã hết số lượt khiếu nại');
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.apiError).toBe('Tài liệu không bị từ chối hoặc đã hết số lượt khiếu nại');
  });

  it('xóa lỗi API khi gọi clearApiError', async () => {
    const axiosError = new axios.AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: {} as unknown as InternalAxiosRequestConfig,
      data: { message: 'Lỗi kiểm thử' },
    });

    vi.mocked(appealService.createAppeal).mockRejectedValueOnce(axiosError);

    const { result } = renderHook(() => useCreateAppeal());

    await act(async () => {
      await result.current.submitAppeal({
        fileId: 'FIL_1',
        studentExplanation: 'Nội dung giải trình hợp lệ có trên 20 ký tự.',
      });
    });

    expect(result.current.apiError).toBe('Lỗi kiểm thử');

    act(() => {
      result.current.clearApiError();
    });

    expect(result.current.apiError).toBeNull();
  });
});
