import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { LoaderFunctionArgs } from 'react-router-dom';
import type { ResourceStat } from '@/features/resources/components/ResourceStats';
import { SAMPLE_RESOURCE_STATS } from '@/features/resources/components/ResourceStats';
import { SAMPLE_RESOURCES } from '@/features/resources/components/ResourcesManager';
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
  isSampleData: boolean;
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
        isSampleData: false,
      };
    }
  } catch {
    // Fall back to sample data below
  }

  // Graceful fallback for offline, unauthenticated or test environments
  let filtered = [...SAMPLE_RESOURCES];
  if (fileStatusId && fileStatusId > 0) {
    filtered = filtered.filter((r) => r.fileStatusId === fileStatusId);
  }
  if (search.trim()) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(
      (item) =>
        item.fileName.toLowerCase().includes(q) ||
        item.fileTypeName.toLowerCase().includes(q) ||
        (item.courseName && item.courseName.toLowerCase().includes(q)) ||
        item.authors.some((a) => (a.fullName ?? a.authorName ?? '').toLowerCase().includes(q)),
    );
  }

  filtered.sort((a, b) => {
    const dateA = Date.parse(a.createdAt ?? a.uploadedAt ?? '');
    const dateB = Date.parse(b.createdAt ?? b.uploadedAt ?? '');
    return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
  });

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startIndex = (pageNumber - 1) * pageSize;
  const pagedItems = filtered.slice(startIndex, startIndex + pageSize);

  return {
    resourcesData: {
      items: pagedItems,
      totalCount,
      pageNumber,
      pageSize,
      totalPages,
    },
    stats: SAMPLE_RESOURCE_STATS,
    statusCounts: {
      all: SAMPLE_RESOURCES.length,
      approved: SAMPLE_RESOURCES.filter((r) => r.fileStatusId === 1).length,
      pending: SAMPLE_RESOURCES.filter((r) => r.fileStatusId === 2).length,
      rejected: SAMPLE_RESOURCES.filter((r) => r.fileStatusId === 3).length,
    },
    isSampleData: true,
  };
}
