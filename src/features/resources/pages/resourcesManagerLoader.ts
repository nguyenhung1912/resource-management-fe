import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { LoaderFunctionArgs } from 'react-router-dom';
import type { ResourceStat } from '@/features/resources/components/ResourceStats';
import { DEFAULT_RESOURCE_STATS } from '../constants/resourceConstants';
import type { MyUploadItemResponse, PaginatedResponse } from '@/features/resources/types/resource.types';
import { resourceService } from '@/services/resourceService';

export interface ResourcesManagerLoaderData {
  resourcesData: PaginatedResponse<MyUploadItemResponse>;
  stats: ResourceStat[];
  statusCounts: {
    all: number;
    approved: number;
    pending: number;
    rejected: number;
  };
}

export async function resourcesManagerLoader({ request }: LoaderFunctionArgs): Promise<ResourcesManagerLoaderData> {
  const url = new URL(request.url);
  const search = url.searchParams.get('search') ?? '';
  const statusParam = url.searchParams.get('status');
  const fileStatusId = statusParam ? Number.parseInt(statusParam, 10) : undefined;
  const pageParam = url.searchParams.get('page');
  const pageNumber = pageParam ? Math.max(1, Number.parseInt(pageParam, 10)) : 1;
  const pageSizeParam = url.searchParams.get('pageSize');
  const pageSize = pageSizeParam ? Math.max(1, Number.parseInt(pageSizeParam, 10)) : 10;
  const sort = url.searchParams.get('sort') ?? 'newest';
  const sortDirection = sort === 'oldest' ? 'asc' : 'desc';

  try {
    const [uploadsResult, approvedResult, pendingResult, rejectedResult] = await Promise.allSettled([
      resourceService.getMyUploads({
        search: search.trim() || undefined,
        fileStatusId: fileStatusId && fileStatusId > 0 ? fileStatusId : undefined,
        pageNumber,
        pageSize,
        sortDirection,
      }),
      resourceService.getMyUploads({ fileStatusId: 1, pageSize: 1 }),
      resourceService.getMyUploads({ fileStatusId: 2, pageSize: 1 }),
      resourceService.getMyUploads({ fileStatusId: 3, pageSize: 1 }),
    ]);

    if (uploadsResult.status === 'fulfilled') {
      const approvedCount = approvedResult.status === 'fulfilled' ? approvedResult.value.totalCount : 0;
      const pendingCount = pendingResult.status === 'fulfilled' ? pendingResult.value.totalCount : 0;
      const rejectedCount = rejectedResult.status === 'fulfilled' ? rejectedResult.value.totalCount : 0;
      const allCount = approvedCount + pendingCount + rejectedCount;

      const dynamicStats: ResourceStat[] = [
        {
          label: 'Đã duyệt',
          value: approvedCount,
          icon: CheckCircle2,
          colorVariant: 'success',
          iconClassName: 'text-success',
          badgeBg: 'bg-emerald-50 text-success',
        },
        {
          label: 'Chờ duyệt',
          value: pendingCount,
          icon: Clock,
          colorVariant: 'warning',
          iconClassName: 'text-warning',
          badgeBg: 'bg-orange-50 text-warning',
        },
        {
          label: 'Bị từ chối',
          value: rejectedCount,
          icon: XCircle,
          colorVariant: 'danger',
          iconClassName: 'text-danger',
          badgeBg: 'bg-rose-50 text-danger',
        },
      ];

      return {
        resourcesData: uploadsResult.value,
        stats: dynamicStats,
        statusCounts: {
          all: allCount,
          approved: approvedCount,
          pending: pendingCount,
          rejected: rejectedCount,
        },
      };
    }
  } catch {
    // Không có sample data fallback, trả về dữ liệu rỗng
  }

  return {
    resourcesData: {
      items: [],
      totalCount: 0,
      pageNumber,
      pageSize,
      totalPages: 0,
    },
    stats: DEFAULT_RESOURCE_STATS,
    statusCounts: {
      all: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
    },
  };
}
