import { APP_PATHS } from '@/constants/path';
import { useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { Pagination } from '@/components/common/Pagination';
import type { sourceCodeLoader } from './sourceCodeLoader';
import { SourceCodeCardGrid } from '../components/SourceCodeCardGrid';
import { SourceCodeDetailModal } from '../components/SourceCodeDetailModal';
import { SourceCodeEmptyState } from '../components/SourceCodeEmptyState';
import { SourceCodeFilterBar } from '../components/SourceCodeFilterBar';
import { SourceCodeHeader } from '../components/SourceCodeHeader';
import { SourceCodeStatsCards } from '../components/SourceCodeStatsCards';
import { SourceCodeTable } from '../components/SourceCodeTable';
import { UploadSourceCodeDialog } from '../components/UploadSourceCodeDialog';
import { useSourceCodeDetail } from '../hooks/useSourceCodeDetail';
import { useSourceCodeFilters } from '../hooks/useSourceCodeFilters';
import { calculateSourceCodeStats } from '../utils/sourceCodeUtils';

export function SourceCodePage() {
  const { resourcesResult, fileTypes, subMajors, courses, fileStatuses, sourceCodeFileTypeId } =
    useLoaderData<typeof sourceCodeLoader>();
  const navigate = useNavigate();
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const {
    filters: activeFilters,
    handleSearchChange,
    handleSubMajorChange,
    handleCourseChange,
    handleOnlyGithubChange,
    handleStatusChange,
    handlePageChange,
    handleViewModeChange,
    handleResetFilters,
  } = useSourceCodeFilters();

  const { isOpen, isLoading, isDownloading, detail, error, openDetail, closeDetail, handleDownload } =
    useSourceCodeDetail();

  const stats = calculateSourceCodeStats(resourcesResult.items, resourcesResult.totalCount);
  const totalPages = Math.ceil(resourcesResult.totalCount / activeFilters.pageSize) || 1;

  const handleRefresh = () => {
    navigate('.', { replace: true });
  };

  const approvedStatus = fileStatuses.find((s) => /approved|duyệt|phê duyệt/i.test(s.name));
  const approvedStatusId = approvedStatus ? String(approvedStatus.id) : undefined;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. Page Header Hero */}
      <SourceCodeHeader onRefresh={handleRefresh} onUploadClick={() => setIsUploadOpen(true)} />

      {/* 2. Statistics KPI Cards */}
      <SourceCodeStatsCards
        stats={stats}
        onFilterGithub={() => handleOnlyGithubChange(true)}
        onFilterApproved={approvedStatusId ? () => handleStatusChange(approvedStatusId) : undefined}
      />

      {/* 3. Filter Toolbar & Search Hub */}
      <SourceCodeFilterBar
        filters={activeFilters}
        subMajors={subMajors}
        courses={courses}
        fileStatuses={fileStatuses}
        onSearchChange={handleSearchChange}
        onSubMajorChange={handleSubMajorChange}
        onCourseChange={handleCourseChange}
        onOnlyGithubChange={handleOnlyGithubChange}
        onStatusChange={handleStatusChange}
        onViewModeChange={handleViewModeChange}
        onResetFilters={handleResetFilters}
      />

      {/* 4. Data Presentation: Empty State / Card Grid / Table (Composition via Ternary) */}
      <section aria-label="Danh sách dự án mã nguồn">
        {resourcesResult.items.length === 0 ? (
          <SourceCodeEmptyState onResetFilters={handleResetFilters} />
        ) : activeFilters.viewMode === 'grid' ? (
          <SourceCodeCardGrid items={resourcesResult.items} onSelect={openDetail} onDownload={handleDownload} />
        ) : (
          <SourceCodeTable items={resourcesResult.items} onSelect={openDetail} onDownload={handleDownload} />
        )}
      </section>

      {/* 5. Pagination */}
      {resourcesResult.totalCount > 0 ? (
        <Pagination
          currentPage={activeFilters.pageNumber}
          totalPages={totalPages}
          totalCount={resourcesResult.totalCount}
          pageSize={activeFilters.pageSize}
          itemLabel="dự án mã nguồn"
          onPageChange={handlePageChange}
        />
      ) : null}

      {/* 6. Modal Chi tiết Toàn diện */}
      <SourceCodeDetailModal
        isOpen={isOpen}
        isLoading={isLoading}
        isDownloading={isDownloading}
        detail={detail}
        error={error}
        onClose={closeDetail}
        onDownload={handleDownload}
      />

      {/* 7. Dialog Đăng tải Mã nguồn */}
      <UploadSourceCodeDialog
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={handleRefresh}
        onAccepted={(job) => void navigate(APP_PATHS.PROCESSING_JOB(job.jobId))}
        fileTypeId={sourceCodeFileTypeId}
        fileTypes={fileTypes}
        subMajors={subMajors}
        courses={courses}
      />
    </div>
  );
}

export default SourceCodePage;
