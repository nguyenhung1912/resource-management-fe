import { useCallback, useState } from 'react';
import { resourceService } from '@/services/resourceService';
import type { SourceCodeDetail } from '@/features/digital-resources/source-code/types/source-code.types';

export function useSourceCodeDetail() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [detail, setDetail] = useState<SourceCodeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openDetail = useCallback(async (fileId: string) => {
    setIsOpen(true);
    setSelectedFileId(fileId);
    setIsLoading(true);
    setError(null);

    // Kích hoạt ghi nhận lượt xem trong background (không chặn UI)
    void resourceService.recordHistoryView(fileId).catch(() => {
      // Ignored: Lịch sử xem là tác vụ phụ, không gây lỗi giao diện
    });

    try {
      const data = await resourceService.getResourceDetail<SourceCodeDetail>(fileId);
      setDetail(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Không thể tải thông tin chi tiết tài nguyên. Vui lòng thử lại sau.';
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
      // Ignored
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

export default useSourceCodeDetail;
