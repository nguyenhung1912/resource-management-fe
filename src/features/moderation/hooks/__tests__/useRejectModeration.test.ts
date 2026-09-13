import { act, renderHook } from '@testing-library/react';
import axios, { type InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { moderationService } from '@/services/moderationService';
import { useRejectModeration } from '../useRejectModeration';
import type {
  ModerationDecisionEnvelopeResponse,
  RejectModerationRequest,
} from '@/features/moderation/types/moderation.types';

vi.mock('@/services/moderationService', () => ({
  moderationService: {
    rejectDocument: vi.fn(),
  },
}));

describe('useRejectModeration hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('khởi tạo với trạng thái ban đầu isRejecting = false và apiError = null', () => {
    const { result } = renderHook(() => useRejectModeration());

    expect(result.current.isRejecting).toBe(false);
    expect(result.current.apiError).toBeNull();
  });

  it('thực hiện từ chối tài liệu thành công và kích hoạt callback onSuccess', async () => {
    const fileId = 'FIL_2002';
    const payload: RejectModerationRequest = {
      reason: 'Độ trùng lặp vượt quá 30% quy định của nhà trường.',
      notes: 'Xem lại chương 2 và chương 3 để trích dẫn lại.',
      plagiarismScore: 38.5,
    };

    const mockResponse: ModerationDecisionEnvelopeResponse = {
      message: 'Từ chối tài liệu thành công.',
      data: {
        fileId: 'FIL_2002',
        fileStatusId: 3,
        fileStatusName: 'Rejected',
        moderatorUid: 'USR_lecturer01',
        decisionAt: '2026-09-13T07:25:00Z',
        notes: payload.notes,
      },
    };

    vi.mocked(moderationService.rejectDocument).mockResolvedValueOnce(mockResponse);

    const handleSuccess = vi.fn();
    const handleError = vi.fn();

    const { result } = renderHook(() => useRejectModeration());

    let rejectResult: ModerationDecisionEnvelopeResponse | null = null;
    await act(async () => {
      rejectResult = await result.current.reject(fileId, payload, {
        onSuccess: handleSuccess,
        onError: handleError,
      });
    });

    expect(moderationService.rejectDocument).toHaveBeenCalledWith(fileId, payload);
    expect(handleSuccess).toHaveBeenCalledWith(mockResponse.data, mockResponse.message);
    expect(handleError).not.toHaveBeenCalled();
    expect(rejectResult).toEqual(mockResponse);
    expect(result.current.isRejecting).toBe(false);
    expect(result.current.apiError).toBeNull();
  });

  it('xử lý khi backend trả về lỗi HTTP 404 (không tìm thấy tài liệu)', async () => {
    const fileId = 'FIL_non_exist';
    const payload: RejectModerationRequest = {
      reason: 'Tài liệu không đạt chuẩn.',
    };

    const axiosError = new axios.AxiosError('Not Found', 'ERR_NOT_FOUND', undefined, undefined, {
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: {} as unknown as InternalAxiosRequestConfig,
      data: {},
    });

    vi.mocked(moderationService.rejectDocument).mockRejectedValueOnce(axiosError);

    const handleSuccess = vi.fn();
    const handleError = vi.fn();

    const { result } = renderHook(() => useRejectModeration());

    let rejectResult: ModerationDecisionEnvelopeResponse | null = null;
    await act(async () => {
      rejectResult = await result.current.reject(fileId, payload, {
        onSuccess: handleSuccess,
        onError: handleError,
      });
    });

    expect(rejectResult).toBeNull();
    expect(handleSuccess).not.toHaveBeenCalled();
    expect(handleError).toHaveBeenCalledWith('Không tìm thấy thông tin tài liệu cần từ chối.');
    expect(result.current.apiError).toBe('Không tìm thấy thông tin tài liệu cần từ chối.');
    expect(result.current.isRejecting).toBe(false);
  });

  it('xử lý khi backend trả về HTTP 400 (thiếu thông tin lý do hoặc dữ liệu không hợp lệ)', async () => {
    const fileId = 'FIL_bad_request';
    const payload: RejectModerationRequest = {
      reason: '',
    };

    const axiosError = new axios.AxiosError('Bad Request', 'ERR_BAD_REQUEST', undefined, undefined, {
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: {} as unknown as InternalAxiosRequestConfig,
      data: {},
    });

    vi.mocked(moderationService.rejectDocument).mockRejectedValueOnce(axiosError);

    const { result } = renderHook(() => useRejectModeration());

    await act(async () => {
      await result.current.reject(fileId, payload);
    });

    expect(result.current.apiError).toBe('Dữ liệu từ chối không hợp lệ hoặc thiếu lý do từ chối.');

    // Kiểm tra clearApiError
    act(() => {
      result.current.clearApiError();
    });
    expect(result.current.apiError).toBeNull();
  });
});
