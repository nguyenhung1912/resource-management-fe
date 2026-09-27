import type { LoaderFunctionArgs } from 'react-router-dom';
import academicCatalogService from '@/services/academicCatalogService';
import moderationService from '@/services/moderationService';
import type {
  DepartmentResponse,
  FileTypeResponse,
  SubMajorResponse,
} from '@/features/resources/types/academicCatalog.types';
import type {
  ModerationAiRiskFilter,
  ModerationQueueLoaderData,
  ModerationQueueOverviewStats,
  ModerationQueuePaginatedData,
  ModerationResourceItemResponse,
} from '../types/moderation.types';

const DEFAULT_PAGE_SIZE = 10;
const STATS_PAGE_SIZE = 500;
const VALID_AI_RISKS: ModerationAiRiskFilter[] = ['all', 'uninspected', 'safe', 'warning', 'danger'];

export const EMPTY_QUEUE: ModerationQueuePaginatedData = {
  items: [],
  pageIndex: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  totalCount: 0,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
};

export const EMPTY_STATS: ModerationQueueOverviewStats = {
  totalPending: 0,
  highPlagiarismRisk: 0,
  safePlagiarism: 0,
  uninspectedCount: 0,
};

export function buildQueueStats(
  items: ModerationResourceItemResponse[],
  totalCount: number,
): ModerationQueueOverviewStats {
  const uninspectedCount = items.filter((item) => item.latestPlagiarismScore == null).length;
  const safePlagiarism = items.filter(
    (item) => typeof item.latestPlagiarismScore === 'number' && item.latestPlagiarismScore <= 15,
  ).length;
  const highPlagiarismRisk = items.filter(
    (item) => typeof item.latestPlagiarismScore === 'number' && item.latestPlagiarismScore > 30,
  ).length;

  return {
    totalPending: totalCount,
    highPlagiarismRisk,
    safePlagiarism,
    uninspectedCount,
  };
}

export function applyAiRiskFilter(
  items: ModerationResourceItemResponse[],
  risk?: ModerationAiRiskFilter,
): ModerationResourceItemResponse[] {
  if (!risk || risk === 'all') return items;

  return items.filter((item) => {
    const score = item.latestPlagiarismScore;
    switch (risk) {
      case 'uninspected':
        return score == null;
      case 'safe':
        return typeof score === 'number' && score <= 15;
      case 'warning':
        return typeof score === 'number' && score > 15 && score <= 30;
      case 'danger':
        return typeof score === 'number' && score > 30;
      default:
        return true;
    }
  });
}

export async function moderationQueueLoader({ request }: LoaderFunctionArgs): Promise<ModerationQueueLoaderData> {
  const url = new URL(request.url);

  const searchParam = (url.searchParams.get('search') ?? '').trim();
  const departmentIdParam = (url.searchParams.get('departmentId') ?? '').trim() || undefined;
  const subMajorCodeParam = (url.searchParams.get('subMajorCode') ?? '').trim() || undefined;
  const fileTypeIdRaw = url.searchParams.get('fileTypeId');
  const fileTypeIdParam =
    fileTypeIdRaw && !Number.isNaN(parseInt(fileTypeIdRaw, 10)) ? parseInt(fileTypeIdRaw, 10) : undefined;

  const aiRiskRaw = url.searchParams.get('aiRisk');
  const currentAiRisk: ModerationAiRiskFilter =
    aiRiskRaw && VALID_AI_RISKS.includes(aiRiskRaw as ModerationAiRiskFilter)
      ? (aiRiskRaw as ModerationAiRiskFilter)
      : 'all';

  const pageParam = url.searchParams.get('page') || url.searchParams.get('pageNumber');
  const currentPage = pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : 1;
  const pageSizeParam = url.searchParams.get('pageSize');
  const pageSize = pageSizeParam ? Math.max(1, parseInt(pageSizeParam, 10) || 10) : DEFAULT_PAGE_SIZE;

  try {
    // async-parallel: Tải đồng thời danh sách hàng đợi, thống kê tổng quan và các danh mục lookup
    const [queueResult, statsResult, departmentsResult, subMajorsResult, fileTypesResult] = await Promise.allSettled([
      moderationService.getModerationQueue({
        search: searchParam || undefined,
        departmentId: departmentIdParam,
        subMajorCode: subMajorCodeParam,
        fileTypeId: fileTypeIdParam,
        pageNumber: currentPage,
        pageSize,
      }),
      moderationService.getModerationQueue({
        pageSize: STATS_PAGE_SIZE,
        pageNumber: 1,
      }),
      academicCatalogService.getDepartments(),
      academicCatalogService.getSubMajors(),
      academicCatalogService.getFileTypes(),
    ]);

    const tableData: ModerationQueuePaginatedData =
      queueResult.status === 'fulfilled' && queueResult.value?.data ? queueResult.value.data : EMPTY_QUEUE;

    const statsData: ModerationQueuePaginatedData =
      statsResult.status === 'fulfilled' && statsResult.value?.data ? statsResult.value.data : tableData;

    const departments: DepartmentResponse[] =
      departmentsResult.status === 'fulfilled' && departmentsResult.value ? departmentsResult.value : [];

    const subMajors: SubMajorResponse[] =
      subMajorsResult.status === 'fulfilled' && subMajorsResult.value ? subMajorsResult.value : [];

    const fileTypes: FileTypeResponse[] =
      fileTypesResult.status === 'fulfilled' && fileTypesResult.value ? fileTypesResult.value : [];

    const stats = buildQueueStats(statsData.items, statsData.totalCount);
    const filteredItems = applyAiRiskFilter(tableData.items, currentAiRisk);

    return {
      queue: {
        ...tableData,
        items: filteredItems,
      },
      stats,
      departments,
      subMajors,
      fileTypes,
      currentFilters: {
        search: searchParam || undefined,
        departmentId: departmentIdParam,
        subMajorCode: subMajorCodeParam,
        fileTypeId: fileTypeIdParam,
        aiRisk: currentAiRisk,
        page: currentPage,
        pageSize,
      },
    };
  } catch {
    return {
      queue: EMPTY_QUEUE,
      stats: EMPTY_STATS,
      departments: [],
      subMajors: [],
      fileTypes: [],
      currentFilters: {
        search: searchParam || undefined,
        departmentId: departmentIdParam,
        subMajorCode: subMajorCodeParam,
        fileTypeId: fileTypeIdParam,
        aiRisk: currentAiRisk,
        page: currentPage,
        pageSize,
      },
    };
  }
}

export default moderationQueueLoader;
