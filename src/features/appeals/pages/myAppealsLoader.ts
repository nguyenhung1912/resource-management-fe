import type { LoaderFunctionArgs } from 'react-router-dom';
import { appealService } from '@/services/appealService';
import type {
  AppealOverviewStats,
  AppealsPaginatedData,
  AppealStatus,
  MyAppealsLoaderResult,
} from '@/features/appeals/types/appeal.types';

export const initialAppealsPaginatedData: AppealsPaginatedData = {
  items: [],
  pageIndex: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
};

export const initialAppealOverviewStats: AppealOverviewStats = {
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
};

const VALID_STATUSES: AppealStatus[] = ['Pending', 'Approved', 'Rejected'];

export async function myAppealsLoader({ request }: LoaderFunctionArgs): Promise<MyAppealsLoaderResult> {
  const url = new URL(request.url);
  const statusParam = url.searchParams.get('status');
  const pageParam = url.searchParams.get('page') || url.searchParams.get('pageNumber');
  const pageSizeParam = url.searchParams.get('pageSize');
  const searchQuery = (url.searchParams.get('search') ?? '').trim();

  // Validate status filter
  const currentStatus: AppealStatus | undefined =
    statusParam && VALID_STATUSES.includes(statusParam as AppealStatus) ? (statusParam as AppealStatus) : undefined;

  // Validate pagination
  const currentPage = pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : 1;
  const pageSize = pageSizeParam ? Math.max(1, parseInt(pageSizeParam, 10) || 10) : 10;

  try {
    // async-parallel: Fetch dữ liệu trang hiện tại và các đếm trạng thái song song
    const [mainResult, pendingResult, approvedResult, rejectedResult, allCountResult] = await Promise.allSettled([
      appealService.getMyAppeals({
        status: currentStatus,
        pageNumber: currentPage,
        pageSize,
      }),
      appealService.getMyAppeals({
        status: 'Pending',
        pageNumber: 1,
        pageSize: 1,
      }),
      appealService.getMyAppeals({
        status: 'Approved',
        pageNumber: 1,
        pageSize: 1,
      }),
      appealService.getMyAppeals({
        status: 'Rejected',
        pageNumber: 1,
        pageSize: 1,
      }),
      currentStatus !== undefined
        ? appealService.getMyAppeals({
            pageNumber: 1,
            pageSize: 1,
          })
        : Promise.resolve(null),
    ]);

    const appealsData: AppealsPaginatedData =
      mainResult.status === 'fulfilled' && mainResult.value?.data ? mainResult.value.data : initialAppealsPaginatedData;

    const pendingCount =
      pendingResult.status === 'fulfilled' && pendingResult.value?.data ? pendingResult.value.data.totalCount : 0;

    const approvedCount =
      approvedResult.status === 'fulfilled' && approvedResult.value?.data ? approvedResult.value.data.totalCount : 0;

    const rejectedCount =
      rejectedResult.status === 'fulfilled' && rejectedResult.value?.data ? rejectedResult.value.data.totalCount : 0;

    let totalAll = appealsData.totalCount;
    if (currentStatus !== undefined) {
      if (allCountResult.status === 'fulfilled' && allCountResult.value?.data) {
        totalAll = allCountResult.value.data.totalCount;
      } else {
        totalAll = pendingCount + approvedCount + rejectedCount;
      }
    }

    const stats: AppealOverviewStats = {
      total: totalAll,
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount,
    };

    // Client-side search filtering nếu có từ khóa tìm kiếm
    let filteredItems = appealsData.items;
    if (searchQuery.length > 0) {
      const lowerQuery = searchQuery.toLowerCase();
      filteredItems = appealsData.items.filter(
        (item) =>
          item.fileName.toLowerCase().includes(lowerQuery) ||
          item.appealId.toLowerCase().includes(lowerQuery) ||
          (item.assignedLecturerName && item.assignedLecturerName.toLowerCase().includes(lowerQuery)),
      );
    }

    return {
      appeals: {
        ...appealsData,
        items: filteredItems,
      },
      stats,
      currentStatus,
      searchQuery,
      currentPage,
      pageSize,
    };
  } catch {
    // Trả về fallback an toàn nếu gặp lỗi kết nối hoặc phiên đăng nhập chưa có
    return {
      appeals: initialAppealsPaginatedData,
      stats: initialAppealOverviewStats,
      currentStatus,
      searchQuery,
      currentPage,
      pageSize,
    };
  }
}

export default myAppealsLoader;
