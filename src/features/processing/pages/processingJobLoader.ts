import type { LoaderFunctionArgs } from 'react-router-dom';
import { processingService } from '@/services/processingService';
import { processingTracker } from '../hooks/processingTracker';

export async function processingJobLoader({ params, request }: LoaderFunctionArgs) {
  if (!params.jobId) throw new Response('Not found', { status: 404 });
  return processingTracker.seed(await processingService.getJob(params.jobId, request.signal));
}
