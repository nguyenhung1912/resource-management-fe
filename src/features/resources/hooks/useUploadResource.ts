import { useRef, useState } from 'react';
import axios from 'axios';
import type { UploadResourceFormValues } from '@/features/resources/types/resource.types';
import { resourceService } from '@/services/resourceService';
import { getApiErrorMessage } from '@/utils/getApiErrorMessage';

export function useUploadResource() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const isUploadingRef = useRef(false);

  const uploadResource = async (values: UploadResourceFormValues): Promise<boolean> => {
    if (isUploadingRef.current) return false;

    isUploadingRef.current = true;
    setIsSubmitting(true);
    setApiError(null);

    try {
      const { sourceCodeUrl, ...resource } = values;
      await resourceService.uploadResource({ ...resource, githubLink: sourceCodeUrl });
      return true;
    } catch (error: unknown) {
      let message = getApiErrorMessage(error, 'Tải tài nguyên thất bại.');

      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          message =
            'Hết thời gian chờ phản hồi. Máy chủ có thể vẫn đang xử lý tài liệu; hãy kiểm tra danh sách upload trước khi gửi lại.';
        }
      }

      setApiError(message);
      return false;
    } finally {
      isUploadingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, apiError, uploadResource };
}
