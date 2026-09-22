import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resourceService } from '@/services/resourceService';
import type { ResourceDetailResponse } from '@/features/resources/types/resource.types';
import { useLibraryResourceDetail } from '../useLibraryResourceDetail';

vi.mock('@/services/resourceService', () => ({
  resourceService: {
    recordHistoryView: vi.fn(),
    getResourceDetail: vi.fn(),
    downloadResourceFile: vi.fn(),
  },
}));

describe('useLibraryResourceDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(resourceService.recordHistoryView).mockResolvedValue(undefined);
  });

  it('khởi tạo state ban đầu đóng và không có dữ liệu', () => {
    const { result } = renderHook(() => useLibraryResourceDetail());

    expect(result.current.isOpen).toBe(false);
    expect(result.current.selectedFileId).toBeNull();
    expect(result.current.detail).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isDownloading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('mở modal, gọi api nạp chi tiết và ghi nhận lịch sử xem', async () => {
    const mockDetail: ResourceDetailResponse = {
      fileId: 'FIL_TEST_01',
      fileName: 'Tài liệu Nghiên cứu AI',
      fileDescription: 'Mô tả chuyên sâu',
      fileTypeId: 1,
      fileTypeName: 'Khóa luận',
      fileStatusId: 2,
      fileStatusName: 'Approved',
      fileSize: 2048576,
      createdAt: '2026-09-20T00:00:00Z',
      keywords: ['AI', 'ML'],
      authorNames: ['Nguyễn Văn A'],
      authors: [{ id: '1', fullName: 'Nguyễn Văn A' }],
    };

    vi.mocked(resourceService.getResourceDetail).mockResolvedValueOnce(mockDetail);

    const { result } = renderHook(() => useLibraryResourceDetail());

    await act(async () => {
      await result.current.openDetail('FIL_TEST_01');
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.selectedFileId).toBe('FIL_TEST_01');
    expect(result.current.detail).toEqual(mockDetail);
    expect(result.current.isLoading).toBe(false);
    expect(resourceService.recordHistoryView).toHaveBeenCalledWith('FIL_TEST_01');
    expect(resourceService.getResourceDetail).toHaveBeenCalledWith('FIL_TEST_01');
  });

  it('xử lý lỗi khi nạp chi tiết thất bại', async () => {
    vi.mocked(resourceService.getResourceDetail).mockRejectedValueOnce(new Error('Lỗi máy chủ'));

    const { result } = renderHook(() => useLibraryResourceDetail());

    await act(async () => {
      await result.current.openDetail('FIL_ERROR_01');
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.detail).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Lỗi máy chủ');
  });

  it('đóng modal và dọn dẹp state', async () => {
    const mockDetail: ResourceDetailResponse = {
      fileId: 'FIL_01',
      fileName: 'Test',
      fileTypeId: 1,
      fileStatusId: 2,
      fileSize: 100,
      createdAt: '2026-09-20',
      keywords: [],
      authorNames: [],
      authors: [],
    };

    vi.mocked(resourceService.getResourceDetail).mockResolvedValueOnce(mockDetail);

    const { result } = renderHook(() => useLibraryResourceDetail());

    await act(async () => {
      await result.current.openDetail('FIL_01');
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.closeDetail();
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.selectedFileId).toBeNull();
    expect(result.current.detail).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('gọi downloadResourceFile khi tải file', async () => {
    vi.mocked(resourceService.downloadResourceFile).mockResolvedValueOnce(new Blob());

    const { result } = renderHook(() => useLibraryResourceDetail());

    await act(async () => {
      await result.current.handleDownload('FIL_01', 'tailieu.pdf');
    });

    expect(resourceService.downloadResourceFile).toHaveBeenCalledWith('FIL_01', 'tailieu.pdf');
    expect(result.current.isDownloading).toBe(false);
  });
});
