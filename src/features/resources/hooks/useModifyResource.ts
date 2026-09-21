import { useRef, useState } from 'react';
import type { ModifyResourceFormValues, UpdateResourceRequest } from '@/features/resources/types/resource.types';
import { resourceService } from '@/services/resourceService';
import { getApiErrorMessage } from '@/utils/getApiErrorMessage';

export async function fileToBase64(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Chuyển đổi tệp ảnh thất bại.'));
      }
    };
    reader.onerror = () => reject(new Error('Đọc tệp ảnh thất bại.'));
    reader.readAsDataURL(file);
  });
}

export function useModifyResource() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const isUpdatingRef = useRef(false);

  const modifyResource = async (fileId: string, values: ModifyResourceFormValues): Promise<boolean> => {
    if (isUpdatingRef.current) return false;

    isUpdatingRef.current = true;
    setIsSubmitting(true);
    setApiError(null);

    try {
      let fileBannerImage: string | undefined;
      if (values.bannerImage) {
        fileBannerImage = await fileToBase64(values.bannerImage);
      }

      const updatePayload: UpdateResourceRequest = {
        fileName: values.fileName.trim(),
        fileDescription: values.fileDescription?.trim() || null,
        fileTypeId: values.fileTypeId,
        subMajorCode: values.subMajorCode.trim(),
        courseCode: values.courseCode?.trim() || null,
        yearCompleted: values.yearCompleted,
        fileBannerImage,
      };

      // 1. Cập nhật thông tin chính của tài nguyên
      await resourceService.updateResource(fileId, updatePayload);

      // 2. Cập nhật danh sách tác giả
      if (values.authorNames && values.authorNames.length > 0) {
        await resourceService.updateAuthors(fileId, values.authorNames);
      }

      // 3. Đồng bộ hóa từ khóa (thêm mới hoặc xóa bớt)
      try {
        const existingKeywords = await resourceService.getResourceKeywords(fileId);
        const existingKeywordMap = new Map(
          existingKeywords.map((k) => [k.keyword.trim().toLowerCase(), k.fileKeywordId]),
        );
        const newKeywordSet = new Set(values.keywords.map((k) => k.trim().toLowerCase()));

        // Xóa từ khóa không còn trong danh sách mới
        const keywordsToDelete = existingKeywords.filter((k) => !newKeywordSet.has(k.keyword.trim().toLowerCase()));
        if (keywordsToDelete.length > 0) {
          await Promise.allSettled(keywordsToDelete.map((k) => resourceService.deleteKeyword(fileId, k.fileKeywordId)));
        }

        // Thêm từ khóa mới chưa có trong hệ thống
        const keywordsToAdd = values.keywords.filter((k) => !existingKeywordMap.has(k.trim().toLowerCase()));
        if (keywordsToAdd.length > 0) {
          await resourceService.addKeywords(fileId, keywordsToAdd);
        }
      } catch {
        // Fallback: nếu lấy danh sách từ khóa thất bại, thử thêm trực tiếp
        if (values.keywords && values.keywords.length > 0) {
          await resourceService.addKeywords(fileId, values.keywords).catch(() => undefined);
        }
      }

      return true;
    } catch (error: unknown) {
      const fallbackMessage =
        error instanceof Error && error.message ? error.message : 'Cập nhật tài nguyên thất bại. Vui lòng thử lại.';
      setApiError(getApiErrorMessage(error, fallbackMessage));
      return false;
    } finally {
      isUpdatingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, apiError, modifyResource };
}

export default useModifyResource;
