import type { LoaderFunctionArgs } from 'react-router-dom';
import { processingService } from '@/services/processingService';

export async function processingResourceLoader({ params, request }: LoaderFunctionArgs) {
  if (!params.fileId) throw new Response('Not found', { status: 404 });
  return processingService.resourceState(params.fileId, request.signal);
}
