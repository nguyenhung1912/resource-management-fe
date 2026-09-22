import { act, renderHook } from '@testing-library/react';
import axios, { type InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { reportService } from '@/services/reportService';
import { useCreateReport } from '../useCreateReport';
import type { CreateReportPayload, ReportMutationResponse } from '@/features/reports/types/report.types';

vi.mock('@/services/reportService', () => ({
  reportService: {
    createReport: vi.fn(),
  },
}));

describe('useCreateReport hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('khởi tạo với trạng thái ban đầu isSubmitting = false và apiError = null', () => {
    const { result } = renderHook(() => useCreateReport());

    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.apiError).toBeNull();
  });

  it('gửi báo cáo vi phạm thành công và kích hoạt callback onSuccess', async () => {
    const mockPayload: CreateReportPayload = {
      reportTypeId: 1,
      reportContent: 'Nội dung báo cáo chi tiết vi phạm bản quyền tài liệu.',
      fileId: 'FIL_TEST_01',
    };

    const mockResponse: ReportMutationResponse = {
      message: 'Gửi báo cáo thành công.',
      data: {
        reportId: 'RPT_TEST_101',
        reporterUid: 'USR_TEST_01',
        reporterName: 'Nguyễn Văn Test',
        targetType: 'File',
        targetId: 'FIL_TEST_01',
        reportTypeId: 1,
        reportTypeName: 'Vi phạm bản quyền',
        reason: mockPayload.reportContent,
        status: 'Pending',
        createdAt: '2026-09-22T12:00:00Z',
      },
    };

    vi.mocked(reportService.createReport).mockResolvedValueOnce(mockResponse);

    const handleSuccess = vi.fn();
    const handleError = vi.fn();

    const { result } = renderHook(() => useCreateReport());

    let submitResult: ReportMutationResponse | null = null;
    await act(async () => {
      submitResult = await result.current.submitReport(mockPayload, {
        onSuccess: handleSuccess,
        onError: handleError,
      });
    });

    expect(reportService.createReport).toHaveBeenCalledWith(mockPayload);
    expect(handleSuccess).toHaveBeenCalledWith(mockResponse);
    expect(handleError).not.toHaveBeenCalled();
    expect(submitResult).toEqual(mockResponse);
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.apiError).toBeNull();
  });

  it('xử lý khi backend trả về lỗi HTTP 409 Conflict (báo cáo trùng lặp đang chờ xử lý)', async () => {
    const mockPayload: CreateReportPayload = {
      reportTypeId: 1,
      reportContent: 'Nội dung báo cáo trùng lặp.',
      fileId: 'FIL_TEST_01',
    };

    const axiosError = new axios.AxiosError(
      'Request failed with status code 409',
      'ERR_CONFLICT',
      undefined,
      undefined,
      {
        status: 409,
        statusText: 'Conflict',
        headers: {},
        config: {} as unknown as InternalAxiosRequestConfig,
        data: {
          message: 'Bạn đã gửi báo cáo cho đối tượng này và báo cáo đang chờ xử lý.',
        },
      },
    );

    vi.mocked(reportService.createReport).mockRejectedValueOnce(axiosError);

    const handleSuccess = vi.fn();
    const handleError = vi.fn();

    const { result } = renderHook(() => useCreateReport());

    let submitResult: ReportMutationResponse | null = null;
    await act(async () => {
      submitResult = await result.current.submitReport(mockPayload, {
        onSuccess: handleSuccess,
        onError: handleError,
      });
    });

    expect(submitResult).toBeNull();
    expect(handleSuccess).not.toHaveBeenCalled();
    expect(handleError).toHaveBeenCalledWith('Bạn đã gửi báo cáo cho đối tượng này và báo cáo đang chờ xử lý.');
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.apiError).toBe('Bạn đã gửi báo cáo cho đối tượng này và báo cáo đang chờ xử lý.');

    // Kiểm tra clearApiError
    act(() => {
      result.current.clearApiError();
    });
    expect(result.current.apiError).toBeNull();
  });

  it('xử lý khi backend trả về lỗi HTTP 400 Bad Request (tự báo cáo hoặc dữ liệu sai)', async () => {
    const mockPayload: CreateReportPayload = {
      reportTypeId: 1,
      reportContent: 'Báo cáo lỗi',
      uidtarget: 'USR_SELF',
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
          message: 'Đối tượng bị báo cáo không hợp lệ.',
        },
      },
    );

    vi.mocked(reportService.createReport).mockRejectedValueOnce(axiosError);

    const { result } = renderHook(() => useCreateReport());

    await act(async () => {
      await result.current.submitReport(mockPayload);
    });

    expect(result.current.apiError).toBe('Đối tượng bị báo cáo không hợp lệ.');
  });

  it('xử lý khi backend trả về lỗi HTTP 401 Unauthorized (chưa đăng nhập)', async () => {
    const mockPayload: CreateReportPayload = {
      reportTypeId: 1,
      reportContent: 'Nội dung báo cáo.',
      fileId: 'FIL_TEST_01',
    };

    const axiosError = new axios.AxiosError(
      'Request failed with status code 401',
      'ERR_UNAUTHORIZED',
      undefined,
      undefined,
      {
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config: {} as unknown as InternalAxiosRequestConfig,
        data: {},
      },
    );

    vi.mocked(reportService.createReport).mockRejectedValueOnce(axiosError);

    const { result } = renderHook(() => useCreateReport());

    await act(async () => {
      await result.current.submitReport(mockPayload);
    });

    expect(result.current.apiError).toBe('Vui lòng đăng nhập để gửi báo cáo vi phạm.');
  });
});
