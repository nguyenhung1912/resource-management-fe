import { act, renderHook } from '@testing-library/react';
import axios, { type InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { appealService } from '@/services/appealService';
import { useAppealDetail } from '../useAppealDetail';
import type { AppealDetailEnvelopeResponse } from '@/features/appeals/types/appeal.types';

vi.mock('@/services/appealService', () => ({
  appealService: {
    getAppealDetail: vi.fn(),
  },
}));

describe('useAppealDetail hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('khởi tạo với trạng thái ban đầu rỗng', () => {
    const { result } = renderHook(() => useAppealDetail());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.detail).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('gọi API thành công và cập nhật detail', async () => {
    const mockDetailResponse: AppealDetailEnvelopeResponse = {
      message: 'Lấy chi tiết thành công',
      data: {
        appealId: 'APL_001',
        fileId: 'FIL_001',
        fileName: 'Tài liệu khoa học',
        appealAttempt: 1,
        studentExplanation: 'Giải trình chi tiết',
        status: 'Approved',
        assignedLecturerName: 'TS. Nguyễn Văn A',
        lecturerResponse: 'Đã xem xét và đồng ý phục hồi.',
        createdAt: '2026-09-10T10:00:00Z',
        resolvedAt: '2026-09-11T12:00:00Z',
        latestRejectionReason: 'Độ trùng lặp cao',
        latestPlagiarismScore: 25,
      },
    };

    vi.mocked(appealService.getAppealDetail).mockResolvedValueOnce(mockDetailResponse);

    const { result } = renderHook(() => useAppealDetail());

    let detailResult = null;
    await act(async () => {
      detailResult = await result.current.loadDetail('APL_001');
    });

    expect(appealService.getAppealDetail).toHaveBeenCalledWith('APL_001');
    expect(detailResult).toEqual(mockDetailResponse.data);
    expect(result.current.detail).toEqual(mockDetailResponse.data);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('xử lý khi backend trả về lỗi 404 không tìm thấy khiếu nại', async () => {
    const axiosError = new axios.AxiosError('Not Found', 'ERR_NOT_FOUND', undefined, undefined, {
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: {} as unknown as InternalAxiosRequestConfig,
      data: {},
    });

    vi.mocked(appealService.getAppealDetail).mockRejectedValueOnce(axiosError);

    const { result } = renderHook(() => useAppealDetail());

    await act(async () => {
      await result.current.loadDetail('APL_NON_EXIST');
    });

    expect(result.current.detail).toBeNull();
    expect(result.current.error).toBe('Không tìm thấy thông tin đơn khiếu nại này.');
    expect(result.current.isLoading).toBe(false);
  });

  it('reset trạng thái khi gọi resetDetail', async () => {
    const mockDetailResponse: AppealDetailEnvelopeResponse = {
      message: 'OK',
      data: {
        appealId: 'APL_001',
        fileId: 'FIL_001',
        fileName: 'Tài liệu',
        appealAttempt: 1,
        studentExplanation: 'Giải trình',
        status: 'Pending',
        createdAt: '2026-09-10T10:00:00Z',
      },
    };

    vi.mocked(appealService.getAppealDetail).mockResolvedValueOnce(mockDetailResponse);

    const { result } = renderHook(() => useAppealDetail());

    await act(async () => {
      await result.current.loadDetail('APL_001');
    });

    expect(result.current.detail).not.toBeNull();

    act(() => {
      result.current.resetDetail();
    });

    expect(result.current.detail).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });
});
