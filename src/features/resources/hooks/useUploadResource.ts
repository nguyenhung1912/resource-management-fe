import { useRef, useState } from 'react';
import type { UploadResourceFormValues } from '@/features/resources/types/resource.types';
import { resourceService } from '@/services/resourceService';
import { uploadErrorMessage } from '../utils/uploadErrorMessage';
import type { ProcessingJob } from '@/features/processing/types/processing.types';

export function useUploadResource() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const isUploadingRef = useRef(false);

  const uploadResource = async (
    values: UploadResourceFormValues,
    onAccepted?: (job: ProcessingJob) => void,
  ): Promise<boolean> => {
    if (isUploadingRef.current) return false;

    isUploadingRef.current = true;
    setIsSubmitting(true);
    setApiError(null);

    try {
      const { sourceCodeUrl, ...resource } = values;
      const response = await resourceService.uploadResource({ ...resource, githubLink: sourceCodeUrl });
      if (response.data?.processingJob) onAccepted?.(response.data.processingJob);
      return true;
    } catch (error: unknown) {
      setApiError(uploadErrorMessage(error));
      return false;
    } finally {
      isUploadingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, apiError, uploadResource };
}
