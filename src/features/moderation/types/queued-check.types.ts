import type { ProcessingJob } from '@/features/processing/types/processing.types';
export interface QueuedCheckEnvelope {
  message: string;
  data: ProcessingJob;
}
