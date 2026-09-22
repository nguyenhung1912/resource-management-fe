import { act, renderHook } from '@testing-library/react';
import axios, { type InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { reportService } from '@/services/reportService';
import { clearReportTypesCache, useReportTypes } from '../useReportTypes';
import type { ReportTypeResponse } from '@/features/reports/types/report.types';

vi.mock('@/services/reportService', () => ({
  reportService: {
    getReportTypes: vi.fn(),
  },
}));

describe('useReportTypes hook', () => {
  const mockTypes: ReportTypeResponse[] = [
    {
      reportTypeId: 1,
      reportTypeName: 'Vi phạm bản quyền',
      description: 'Sao chép trái phép không trích dẫn',
    },
    {
      reportTypeId: 2,
      reportTypeName: 'Nội dung phản cảm / Rác',
      description: 'Chứa từ ngữ xúc phạm hoặc quảng cáo',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    clearReportTypesCache();
  });

  it('sử dụng initialData khi được truyền vào và không gọi API', () => {
    const { result } = renderHook(() => useReportTypes({ initialData: mockTypes }));

    expect(result.current.reportTypes).toEqual(mockTypes);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(reportService.getReportTypes).not.toHaveBeenCalled();
  });

  it('không tự động fetch khi enabled = false', () => {
    const { result } = renderHook(() => useReportTypes({ enabled: false }));

    expect(result.current.reportTypes).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(reportService.getReportTypes).not.toHaveBeenCalled();
  });

  it('tự động tải danh mục loại vi phạm khi mount', async () => {
    vi.mocked(reportService.getReportTypes).mockResolvedValueOnce(mockTypes);

    const { result } = renderHook(() => useReportTypes());

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.reportTypes).toEqual(mockTypes);
    expect(result.current.error).toBeNull();
    expect(reportService.getReportTypes).toHaveBeenCalledTimes(1);
  });

  it('sử dụng in-memory cache cho lần gọi hook tiếp theo (client-swr-dedup)', async () => {
    vi.mocked(reportService.getReportTypes).mockResolvedValueOnce(mockTypes);

    // Lần gọi 1: Fetch từ API
    const { result: firstHook } = renderHook(() => useReportTypes());
    await act(async () => {
      await Promise.resolve();
    });
    expect(firstHook.current.reportTypes).toEqual(mockTypes);
    expect(reportService.getReportTypes).toHaveBeenCalledTimes(1);

    // Lần gọi 2: Lấy trực tiếp từ in-memory cache mà không gọi API thêm
    const { result: secondHook } = renderHook(() => useReportTypes());
    expect(secondHook.current.isLoading).toBe(false);
    expect(secondHook.current.reportTypes).toEqual(mockTypes);
    expect(reportService.getReportTypes).toHaveBeenCalledTimes(1);
  });

  it('refetch buộc gọi lại API bỏ qua cache', async () => {
    vi.mocked(reportService.getReportTypes).mockResolvedValueOnce(mockTypes);

    const { result } = renderHook(() => useReportTypes());
    await act(async () => {
      await Promise.resolve();
    });
    expect(reportService.getReportTypes).toHaveBeenCalledTimes(1);

    const updatedTypes: ReportTypeResponse[] = [
      ...mockTypes,
      { reportTypeId: 3, reportTypeName: 'Gian lận', description: 'Gian lận kết quả' },
    ];
    vi.mocked(reportService.getReportTypes).mockResolvedValueOnce(updatedTypes);

    await act(async () => {
      await result.current.refetch();
    });

    expect(reportService.getReportTypes).toHaveBeenCalledTimes(2);
    expect(result.current.reportTypes).toEqual(updatedTypes);
  });

  it('xử lý lỗi khi API thất bại', async () => {
    const axiosError = new axios.AxiosError(
      'Request failed with status code 500',
      'ERR_INTERNAL_SERVER_ERROR',
      undefined,
      undefined,
      {
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        config: {} as unknown as InternalAxiosRequestConfig,
        data: { message: 'Lỗi cơ sở dữ liệu khi nạp loại vi phạm' },
      },
    );

    vi.mocked(reportService.getReportTypes).mockRejectedValueOnce(axiosError);

    const { result } = renderHook(() => useReportTypes());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Lỗi cơ sở dữ liệu khi nạp loại vi phạm');
    expect(result.current.reportTypes).toEqual([]);
  });
});
