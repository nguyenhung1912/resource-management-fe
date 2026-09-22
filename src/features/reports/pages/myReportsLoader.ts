import type { LoaderFunctionArgs } from 'react-router-dom';
import { reportService } from '@/services/reportService';
import type {
  MyReportsLoaderResult,
  PagedReportResponse,
  ReportOverviewStats,
  ReportStatus,
  ReportTargetType,
} from '@/features/reports/types/report.types';

export const initialMyReportsPaginatedData: PagedReportResponse = {
  items: [],
  pageIndex: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
};

export const initialMyReportOverviewStats: ReportOverviewStats = {
  total: 0,
  pending: 0,
  inProgress: 0,
  resolved: 0,
  rejected: 0,
};

const VALID_STATUSES: ReportStatus[] = ['Pending', 'InProgress', 'Resolved', 'Rejected'];
const VALID_TARGET_TYPES: ReportTargetType[] = ['File', 'Comment', 'User'];

export async function myReportsLoader({ request }: LoaderFunctionArgs): Promise<MyReportsLoaderResult> {
  const url = new URL(request.url);
  const statusParam = url.searchParams.get('status');
  const targetTypeParam = url.searchParams.get('targetType');
  const reportTypeIdParam = url.searchParams.get('reportTypeId');
  const pageParam = url.searchParams.get('page') || url.searchParams.get('pageNumber');
  const pageSizeParam = url.searchParams.get('pageSize');
  const searchQuery = (url.searchParams.get('search') ?? '').trim();

  // Validate status filter
  const currentStatus: ReportStatus | undefined =
    statusParam && VALID_STATUSES.includes(statusParam as ReportStatus) ? (statusParam as ReportStatus) : undefined;

  // Validate target type filter
  const currentTargetType: ReportTargetType | undefined =
    targetTypeParam && VALID_TARGET_TYPES.includes(targetTypeParam as ReportTargetType)
      ? (targetTypeParam as ReportTargetType)
      : undefined;

  // Validate report type id filter
  const currentReportTypeId = reportTypeIdParam ? parseInt(reportTypeIdParam, 10) : undefined;

  // Validate pagination
  const currentPage = pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : 1;
  const pageSize = pageSizeParam ? Math.max(1, parseInt(pageSizeParam, 10) || 10) : 10;

  try {
    // async-parallel: Fetch dữ liệu trang hiện tại, catalog loại vi phạm và các chỉ số thống kê song song
    const [mainResult, typesResult, pendingResult, inProgressResult, resolvedResult, rejectedResult, allCountResult] =
      await Promise.allSettled([
        reportService.getMyReports({
          status: currentStatus,
          pageNumber: currentPage,
          pageSize,
        }),
        reportService.getReportTypes(),
        reportService.getMyReports({
          status: 'Pending',
          pageNumber: 1,
          pageSize: 1,
        }),
        reportService.getMyReports({
          status: 'InProgress',
          pageNumber: 1,
          pageSize: 1,
        }),
        reportService.getMyReports({
          status: 'Resolved',
          pageNumber: 1,
          pageSize: 1,
        }),
        reportService.getMyReports({
          status: 'Rejected',
          pageNumber: 1,
          pageSize: 1,
        }),
        currentStatus !== undefined
          ? reportService.getMyReports({
              pageNumber: 1,
              pageSize: 1,
            })
          : Promise.resolve(null),
      ]);

    const reportsData: PagedReportResponse =
      mainResult.status === 'fulfilled' && mainResult.value ? mainResult.value : initialMyReportsPaginatedData;

    const reportTypes = typesResult.status === 'fulfilled' && typesResult.value ? typesResult.value : [];

    const pendingCount =
      pendingResult.status === 'fulfilled' && pendingResult.value
        ? (pendingResult.value.totalCount ?? pendingResult.value.totalItems ?? 0)
        : 0;

    const inProgressCount =
      inProgressResult.status === 'fulfilled' && inProgressResult.value
        ? (inProgressResult.value.totalCount ?? inProgressResult.value.totalItems ?? 0)
        : 0;

    const resolvedCount =
      resolvedResult.status === 'fulfilled' && resolvedResult.value
        ? (resolvedResult.value.totalCount ?? resolvedResult.value.totalItems ?? 0)
        : 0;

    const rejectedCount =
      rejectedResult.status === 'fulfilled' && rejectedResult.value
        ? (rejectedResult.value.totalCount ?? rejectedResult.value.totalItems ?? 0)
        : 0;

    let totalAll = reportsData.totalCount ?? reportsData.totalItems ?? 0;
    if (currentStatus !== undefined) {
      if (allCountResult.status === 'fulfilled' && allCountResult.value) {
        totalAll = allCountResult.value.totalCount ?? allCountResult.value.totalItems ?? 0;
      } else {
        totalAll = pendingCount + inProgressCount + resolvedCount + rejectedCount;
      }
    }

    const stats: ReportOverviewStats = {
      total: totalAll,
      pending: pendingCount,
      inProgress: inProgressCount,
      resolved: resolvedCount,
      rejected: rejectedCount,
    };

    // Client-side filtering hỗ trợ khi lọc tức thời theo targetType, reportTypeId, search query
    let filteredItems = reportsData.items;

    if (currentTargetType) {
      filteredItems = filteredItems.filter(
        (item) => item.targetType?.toLowerCase() === currentTargetType.toLowerCase(),
      );
    }

    if (currentReportTypeId !== undefined && !isNaN(currentReportTypeId)) {
      filteredItems = filteredItems.filter((item) => item.reportTypeId === currentReportTypeId);
    }

    if (searchQuery.length > 0) {
      const lowerQuery = searchQuery.toLowerCase();
      filteredItems = filteredItems.filter(
        (item) =>
          item.reportId.toLowerCase().includes(lowerQuery) ||
          (item.targetId && item.targetId.toLowerCase().includes(lowerQuery)) ||
          (item.reportTypeName && item.reportTypeName.toLowerCase().includes(lowerQuery)) ||
          (item.reason && item.reason.toLowerCase().includes(lowerQuery)) ||
          (item.handlingNotes && item.handlingNotes.toLowerCase().includes(lowerQuery)),
      );
    }

    return {
      reports: {
        ...reportsData,
        items: filteredItems,
      },
      stats,
      reportTypes,
      currentStatus,
      currentTargetType,
      currentReportTypeId,
      searchQuery,
      currentPage,
      pageSize,
    };
  } catch {
    // Trả về fallback an toàn khi gặp sự cố kết nối mạng
    return {
      reports: initialMyReportsPaginatedData,
      stats: initialMyReportOverviewStats,
      reportTypes: [],
      currentStatus,
      currentTargetType,
      currentReportTypeId,
      searchQuery,
      currentPage,
      pageSize,
    };
  }
}

export default myReportsLoader;
