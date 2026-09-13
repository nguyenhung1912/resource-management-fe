import { act, renderHook } from '@testing-library/react';
import axios, { type InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { moderationService } from '@/services/moderationService';
import { useApproveModeration } from '../useApproveModeration';
import type {
  ApproveModerationRequest,
  ModerationDecisionEnvelopeResponse,
} from '@/features/moderation/types/moderation.types';

vi.mock('@/services/moderationService', () => ({
  moderationService: {
    approveDocument: vi.fn(),
  },
}));

describe('useApproveModeration hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('khởi tạo với trạng thái ban đầu isApproving = false và apiError = null', () => {
    const { result } = renderHook(() => useApproveModeration());

    expect(result.current.isApproving).toBe(false);
    expect(result.current.apiError).toBeNull();
  });

  it('thực hiện phê duyệt tài liệu thành công và kích hoạt callback onSuccess', async () => {
    const fileId = 'FIL_1001';
    const payload: ApproveModerationRequest = {
      notes: 'Tài liệu đạt chuẩn chất lượng.',
    };

    const mockResponse: ModerationDecisionEnvelopeResponse = {
      message: 'Phê duyệt tài liệu thành công.',
      data: {
        fileId: 'FIL_1001',
        fileStatusId: 2,
        fileStatusName: 'Approved',
        moderatorUid: 'USR_lecturer01',
        decisionAt: '2026-09-13T07:20:00Z',
        notes: payload.notes,
      },
    };

    vi.mocked(moderationService.approveDocument).mockResolvedValueOnce(mockResponse);

    const handleSuccess = vi.fn();
    const handleError = vi.fn();

    const { result } = renderHook(() => useApproveModeration());

    let approveResult: ModerationDecisionEnvelopeResponse | null = null;
    await act(async () => {
      approveResult = await result.current.approve(fileId, payload, {
        onSuccess: handleSuccess,
        onError: handleError,
      });
    });

    expect(moderationService.approveDocument).toHaveBeenCalledWith(fileId, payload);
    expect(handleSuccess).toHaveBeenCalledWith(mockResponse.data, mockResponse.message);
    expect(handleError).not.toHaveBeenCalled();
    expect(approveResult).toEqual(mockResponse);
    expect(result.current.isApproving).toBe(false);
    expect(result.current.apiError).toBeNull();
  });

  it('xử lý khi backend trả về lỗi HTTP 403 (không có quyền phê duyệt)', async () => {
    const fileId = 'FIL_1001';
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

    vi.mocked(moderationService.approveDocument).mockRejectedValueOnce(axiosError);

    const handleSuccess = vi.fn();
    const handleError = vi.fn();

    const { result } = renderHook(() => useApproveModeration());

    let approveResult: ModerationDecisionEnvelopeResponse | null = null;
    await act(async () => {
      approveResult = await result.current.approve(
        fileId,
        {},
        {
          onSuccess: handleSuccess,
          onError: handleError,
        },
      );
    });

    expect(approveResult).toBeNull();
    expect(handleSuccess).not.toHaveBeenCalled();
    expect(handleError).toHaveBeenCalledWith(
      'Bạn không có quyền phê duyệt tài liệu này (yêu cầu vai trò Giảng viên/Quản trị viên).',
    );
    expect(result.current.apiError).toBe(
      'Bạn không có quyền phê duyệt tài liệu này (yêu cầu vai trò Giảng viên/Quản trị viên).',
    );
    expect(result.current.isApproving).toBe(false);
  });

  it('xử lý khi backend trả về message lỗi cụ thể từ response.data.message', async () => {
    const fileId = 'FIL_1001';
    const backendMessage = 'Tài liệu đang trong trạng thái xử lý khiếu nại, không thể duyệt lúc này.';
    const axiosError = new axios.AxiosError('Bad request', 'ERR_BAD_REQUEST', undefined, undefined, {
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: {} as unknown as InternalAxiosRequestConfig,
      data: { message: backendMessage },
    });

    vi.mocked(moderationService.approveDocument).mockRejectedValueOnce(axiosError);

    const { result } = renderHook(() => useApproveModeration());

    await act(async () => {
      await result.current.approve(fileId);
    });

    expect(result.current.apiError).toBe(backendMessage);

    // Kiểm tra hàm clearApiError
    act(() => {
      result.current.clearApiError();
    });
    expect(result.current.apiError).toBeNull();
  });
});
