import { useState } from 'react';
import { useLoaderData, useRevalidator, useSearchParams } from 'react-router-dom';
import { RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PlagiarismRiskDashboard } from '../components/PlagiarismRiskDashboard';
import { PlagiarismHistogramChart } from '../components/PlagiarismHistogramChart';
import { PlagiarismRiskFilterBar } from '../components/PlagiarismRiskFilterBar';
import { PlagiarismQueueTable } from '../components/PlagiarismQueueTable';
import type { PlagiarismReportLoaderData, PlagiarismRiskLevel } from '../types/plagiarism-report.types';

function PlagiarismPagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  hasPreviousPage,
  hasNextPage,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-1">
      <p className="text-xs text-text-muted">
        Hiển thị{' '}
        <span className="font-semibold text-text-main">
          {from}–{to}
        </span>{' '}
        trong tổng <span className="font-semibold text-text-main">{totalCount.toLocaleString('vi-VN')}</span> tài liệu
      </p>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasPreviousPage}
          onClick={() => onPageChange(currentPage - 1)}
          className="text-xs"
        >
          ← Trước
        </Button>

        <span className="text-xs text-text-muted px-2 tabular-nums">
          Trang {currentPage} / {totalPages}
        </span>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasNextPage}
          onClick={() => onPageChange(currentPage + 1)}
          className="text-xs"
        >
          Sau →
        </Button>
      </div>
    </div>
  );
}

export function PlagiarismReportPage() {
  const loaderData = useLoaderData() as PlagiarismReportLoaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const revalidator = useRevalidator();
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const { queue, stats, histogram, currentSearch, currentRiskLevel, currentPage, pageSize } = loaderData;

  const handleSearchChange = (query: string) => {
    const next = new URLSearchParams(searchParams);
    if (query.length > 0) {
      next.set('search', query);
    } else {
      next.delete('search');
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleRiskLevelChange = (level?: PlagiarismRiskLevel) => {
    const next = new URLSearchParams(searchParams);
    if (level) {
      next.set('riskLevel', level);
    } else {
      next.delete('riskLevel');
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (page: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(page));
    setSearchParams(next);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    revalidator.revalidate();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const isLoading = isRefreshing || revalidator.state === 'loading';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-main">Báo cáo Đạo văn AI</h1>
              <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-primary/10 text-primary border border-primary/20 select-none">
                Giảng viên / Quản trị viên
              </span>
            </div>
            <p className="text-xs sm:text-sm text-text-muted mt-0.5">
              Tổng quan tỷ lệ tương đồng AI và phân tích đạo văn toàn bộ tài liệu trong hệ thống.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={handleRefresh}
          isLoading={isLoading}
          iconLeft={<RotateCcw className="h-4 w-4" />}
          className="text-xs sm:text-sm shrink-0 cursor-pointer"
        >
          Làm mới
        </Button>
      </div>

      <PlagiarismRiskDashboard
        stats={stats}
        activeRiskLevel={currentRiskLevel}
        onSelectRiskLevel={handleRiskLevelChange}
      />

      <PlagiarismHistogramChart histogram={histogram} />

      <PlagiarismRiskFilterBar
        currentSearch={currentSearch}
        currentRiskLevel={currentRiskLevel}
        onSearchChange={handleSearchChange}
        onRiskLevelChange={handleRiskLevelChange}
        onResetFilters={handleResetFilters}
        totalCount={queue.totalCount}
        filteredCount={queue.items.length}
      />

      <PlagiarismQueueTable items={queue.items} />

      <PlagiarismPagination
        currentPage={currentPage}
        totalPages={queue.totalPages}
        totalCount={queue.totalCount}
        pageSize={pageSize}
        hasPreviousPage={queue.hasPreviousPage}
        hasNextPage={queue.hasNextPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

export default PlagiarismReportPage;
