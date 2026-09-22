import { useCallback, useState } from 'react';
import { resourceService } from '@/services/resourceService';
import type { ResourceDetailResponse } from '@/features/resources/types/resource.types';

export function useLibraryResourceDetail() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ResourceDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openDetail = useCallback(async (fileId: string) => {
    setIsOpen(true);
    setSelectedFileId(fileId);
    setIsLoading(true);
    setError(null);

    // Ghi nhận lượt xem trong background
    void resourceService.recordHistoryView(fileId).catch(() => {
      // Ignored: Lịch sử xem không làm gián đoạn luồng xem chi tiết
    });

    try {
      const data = await resourceService.getResourceDetail<ResourceDetailResponse>(fileId);
      setDetail(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải thông tin chi tiết tài liệu thư viện.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const closeDetail = useCallback(() => {
    setIsOpen(false);
    setSelectedFileId(null);
    setDetail(null);
    setError(null);
  }, []);

  const handleDownload = useCallback(async (fileId: string, fileName?: string) => {
    setIsDownloading(true);
    try {
      await resourceService.downloadResourceFile(fileId, fileName);
    } catch {
      // Ignored: Lỗi download
    } finally {
      setIsDownloading(false);
    }
  }, []);

  return {
    isOpen,
    selectedFileId,
    detail,
    isLoading,
    isDownloading,
    error,
    openDetail,
    closeDetail,
    handleDownload,
  };
}

export default useLibraryResourceDetail;
