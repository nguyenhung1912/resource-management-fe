import type { ModerationQueuePaginatedData } from './moderation.types';

export type PlagiarismRiskLevel = 'safe' | 'warning' | 'danger' | 'unchecked';

export interface PlagiarismOverviewStats {
  totalFiles: number;
  totalScanned: number;
  totalUnscanned: number;
  safeCount: number;
  warningCount: number;
  dangerCount: number;
}

export interface PlagiarismHistogramBucket {
  range: string;
  count: number;
  riskLevel: PlagiarismRiskLevel;
}

export interface PlagiarismReportLoaderData {
  queue: ModerationQueuePaginatedData;
  stats: PlagiarismOverviewStats;
  histogram: PlagiarismHistogramBucket[];
  currentSearch: string;
  currentSubMajorCode: string;
  currentRiskLevel?: PlagiarismRiskLevel;
  currentPage: number;
  pageSize: number;
}
