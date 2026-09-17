import type { LoaderFunctionArgs } from 'react-router-dom';
import { moderationService } from '@/services/moderationService';
import type { ModerationQueuePaginatedData } from '@/features/moderation/types/moderation.types';
import type {
  PlagiarismHistogramBucket,
  PlagiarismOverviewStats,
  PlagiarismReportLoaderData,
  PlagiarismRiskLevel,
} from '@/features/moderation/types/plagiarism-report.types';

const STATS_PAGE_SIZE = 500;
const DEFAULT_PAGE_SIZE = 15;
const VALID_RISK_LEVELS: PlagiarismRiskLevel[] = ['safe', 'warning', 'danger', 'unchecked'];

const EMPTY_QUEUE: ModerationQueuePaginatedData = {
  items: [],
  pageIndex: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  totalCount: 0,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
};

const EMPTY_STATS: PlagiarismOverviewStats = {
  totalFiles: 0,
  totalScanned: 0,
  totalUnscanned: 0,
  safeCount: 0,
  warningCount: 0,
  dangerCount: 0,
};

const HISTOGRAM_BUCKETS: { range: string; min: number; max: number; riskLevel: PlagiarismRiskLevel }[] = [
  { range: '0–10%', min: 0, max: 10, riskLevel: 'safe' },
  { range: '10–20%', min: 10, max: 20, riskLevel: 'safe' },
  { range: '20–30%', min: 20, max: 30, riskLevel: 'warning' },
  { range: '30–50%', min: 30, max: 50, riskLevel: 'danger' },
  { range: '50–100%', min: 50, max: 100.01, riskLevel: 'danger' },
];

function buildHistogram(items: ModerationQueuePaginatedData['items']): PlagiarismHistogramBucket[] {
  const scanned = items.filter((i) => i.latestPlagiarismScore != null);
  return HISTOGRAM_BUCKETS.map(({ range, min, max, riskLevel }) => ({
    range,
    riskLevel,
    count: scanned.filter((i) => {
      const s = i.latestPlagiarismScore ?? 0;
      return s >= min && s < max;
    }).length,
  }));
}

function buildStats(items: ModerationQueuePaginatedData['items'], totalCount: number): PlagiarismOverviewStats {
  const scanned = items.filter((i) => i.latestPlagiarismScore != null);
  const safeCount = scanned.filter((i) => (i.latestPlagiarismScore ?? 0) < 20).length;
  const warningCount = scanned.filter((i) => {
    const s = i.latestPlagiarismScore ?? 0;
    return s >= 20 && s <= 30;
  }).length;
  const dangerCount = scanned.filter((i) => (i.latestPlagiarismScore ?? 0) > 30).length;
  const totalScanned = scanned.length;
  const totalUnscanned = Math.max(0, totalCount - totalScanned);

  return {
    totalFiles: totalCount,
    totalScanned,
    totalUnscanned,
    safeCount,
    warningCount,
    dangerCount,
  };
}

function applyRiskFilter(
  items: ModerationQueuePaginatedData['items'],
  riskLevel?: PlagiarismRiskLevel,
): ModerationQueuePaginatedData['items'] {
  if (!riskLevel) return items;
  return items.filter((item) => {
    const score = item.latestPlagiarismScore;
    switch (riskLevel) {
      case 'unchecked':
        return score == null;
      case 'safe':
        return score != null && score < 20;
      case 'warning':
        return score != null && score >= 20 && score <= 30;
      case 'danger':
        return score != null && score > 30;
    }
  });
}

export async function plagiarismReportLoader({ request }: LoaderFunctionArgs): Promise<PlagiarismReportLoaderData> {
  const url = new URL(request.url);

  const currentSearch = (url.searchParams.get('search') ?? '').trim();
  const currentSubMajorCode = (url.searchParams.get('subMajorCode') ?? '').trim();
  const riskParam = url.searchParams.get('riskLevel');
  const currentRiskLevel: PlagiarismRiskLevel | undefined =
    riskParam && VALID_RISK_LEVELS.includes(riskParam as PlagiarismRiskLevel)
      ? (riskParam as PlagiarismRiskLevel)
      : undefined;
  const pageParam = url.searchParams.get('page');
  const currentPage = pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : 1;
  const pageSize = DEFAULT_PAGE_SIZE;

  try {
    const [tableResult, statsResult] = await Promise.allSettled([
      moderationService.getModerationQueue({
        search: currentSearch || undefined,
        subMajorCode: currentSubMajorCode || undefined,
        pageNumber: currentPage,
        pageSize,
      }),
      moderationService.getModerationQueue({
        pageSize: STATS_PAGE_SIZE,
        pageNumber: 1,
      }),
    ]);

    const tableData: ModerationQueuePaginatedData =
      tableResult.status === 'fulfilled' && tableResult.value?.data ? tableResult.value.data : EMPTY_QUEUE;

    const statsData: ModerationQueuePaginatedData =
      statsResult.status === 'fulfilled' && statsResult.value?.data ? statsResult.value.data : EMPTY_QUEUE;

    const stats = buildStats(statsData.items, statsData.totalCount);
    const histogram = buildHistogram(statsData.items);

    const filteredItems = applyRiskFilter(tableData.items, currentRiskLevel);

    return {
      queue: { ...tableData, items: filteredItems },
      stats,
      histogram,
      currentSearch,
      currentSubMajorCode,
      currentRiskLevel,
      currentPage,
      pageSize,
    };
  } catch {
    return {
      queue: EMPTY_QUEUE,
      stats: EMPTY_STATS,
      histogram: [],
      currentSearch,
      currentSubMajorCode,
      currentRiskLevel,
      currentPage,
      pageSize,
    };
  }
}

export default plagiarismReportLoader;
