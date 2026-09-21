import { useRef, useState } from 'react';
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
      setApiError(getApiErrorMessage(error, 'Tải tài nguyên thất bại. Vui lòng thử lại.'));
      return false;
    } finally {
      isUploadingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, apiError, uploadResource };
}
