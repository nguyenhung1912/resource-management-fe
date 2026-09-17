import { useState } from 'react';
import { useLoaderData, useRevalidator, useSearchParams } from 'react-router-dom';
import { RotateCcw, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/common/PageHeader';
import { Pagination } from '@/components/common/Pagination';
import { PlagiarismRiskDashboard } from '../components/PlagiarismRiskDashboard';
import { PlagiarismHistogramChart } from '../components/PlagiarismHistogramChart';
import { PlagiarismRiskFilterBar } from '../components/PlagiarismRiskFilterBar';
import { PlagiarismQueueTable } from '../components/PlagiarismQueueTable';
import type { PlagiarismReportLoaderData, PlagiarismRiskLevel } from '../types/plagiarism-report.types';

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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <PageHeader
        title="Báo cáo Đạo văn AI"
        description="Tổng quan tỷ lệ tương đồng AI và phân tích đạo văn toàn bộ tài liệu trong hệ thống."
        icon={Sparkles}
        badge={
          <Badge variant="primary" showDot>
            Giảng viên / Quản trị viên
          </Badge>
        }
        actions={
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
        }
      />

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

      <Pagination
        currentPage={currentPage}
        totalPages={queue.totalPages}
        totalCount={queue.totalCount}
        pageSize={pageSize}
        hasPreviousPage={queue.hasPreviousPage}
        hasNextPage={queue.hasNextPage}
        onPageChange={handlePageChange}
        itemLabel="tài liệu"
      />
    </div>
  );
}

export default PlagiarismReportPage;
