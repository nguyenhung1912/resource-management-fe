import { type LoaderFunctionArgs } from 'react-router-dom';
import { getRecommendedResources, getResourceDetail } from '@/services/searchService';
import type { ResourceDetailLoaderData } from '../types/resource.types';

export default async function resourceDetailLoader({ params }: LoaderFunctionArgs): Promise<ResourceDetailLoaderData> {
  const resourceId = params.resourceId;
  if (!resourceId) throw new Response('Not Found', { status: 404 });

  // Bắn 2 luồng request cùng lúc để tiết kiệm thời gian chờ
  const [detail, recommendations] = await Promise.all([
    getResourceDetail(resourceId),
    getRecommendedResources(5).catch(() => []), // Nếu API gợi ý lỗi thì trả về mảng rỗng
  ]);

  return { detail, recommendations };
}
