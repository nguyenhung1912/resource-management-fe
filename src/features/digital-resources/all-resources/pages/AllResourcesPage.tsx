import { useLoaderData, useRevalidator } from 'react-router-dom';
import { Pagination } from '@/components/common/Pagination';
import { LibraryCardGrid } from '../components/LibraryCardGrid';
import { LibraryCatalogTable } from '../components/LibraryCatalogTable';
import { LibraryEmptyState } from '../components/LibraryEmptyState';
import { LibraryFeaturedShelf } from '../components/LibraryFeaturedShelf';
import { LibraryFileTypeTabs } from '../components/LibraryFileTypeTabs';
import { LibraryFilterBar } from '../components/LibraryFilterBar';
import { LibraryHeader } from '../components/LibraryHeader';
import { LibraryResourceDetailModal } from '../components/LibraryResourceDetailModal';
import { useAllResourcesFilters } from '../hooks/useAllResourcesFilters';
import { useLibraryResourceDetail } from '../hooks/useLibraryResourceDetail';
import type { allResourcesLoader } from './allResourcesLoader';

export function AllResourcesPage() {
  const { resourcesResult, fileTypes, subMajors, courses, recommendedResources } =
    useLoaderData<typeof allResourcesLoader>();

  const revalidator = useRevalidator();

  const {
    filters,
    hasActiveFilters,
    handleSearchChange,
    handleFileTypeChange,
    handleSubMajorChange,
    handleCourseChange,
    handlePageChange,
    handleViewModeChange,
    handleSortChange,
    handleResetFilters,
  } = useAllResourcesFilters();

  const { isOpen, selectedFileId, detail, isLoading, isDownloading, error, openDetail, closeDetail, handleDownload } =
    useLibraryResourceDetail();

  const totalPages = Math.ceil(resourcesResult.totalCount / filters.pageSize) || 1;
  const activeCategory = fileTypes.find((ft) => Number(ft.id) === filters.fileTypeId);
  const activeCategoryName = activeCategory?.name;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Tiêu đề trang Thư viện & Thao tác */}
      <LibraryHeader
        totalCount={resourcesResult.totalCount}
        activeCategoryName={activeCategoryName}
        onRefresh={() => revalidator.revalidate()}
        isRefreshing={revalidator.state === 'loading'}
      />

      {/* Kệ tài liệu nổi bật & đề xuất thông minh */}
      <LibraryFeaturedShelf items={recommendedResources} onSelect={openDetail} />

      {/* Phân loại theo thể loại tài liệu (Dạng tabs bo tròn) */}
      <LibraryFileTypeTabs
        fileTypes={fileTypes}
        activeFileTypeId={filters.fileTypeId}
        onSelectFileType={handleFileTypeChange}
      />

      {/* Thanh công cụ tìm kiếm và bộ lọc nâng cao */}
      <LibraryFilterBar
        filters={filters}
        fileTypes={fileTypes}
        subMajors={subMajors}
        courses={courses}
        hasActiveFilters={hasActiveFilters}
        onSearchChange={handleSearchChange}
        onSubMajorChange={handleSubMajorChange}
        onCourseChange={handleCourseChange}
        onFileTypeChange={handleFileTypeChange}
        onViewModeChange={handleViewModeChange}
        onSortChange={handleSortChange}
        onResetFilters={handleResetFilters}
      />

      {/* Area resources: Kệ sách (Grid) / Mục lục (Table) / Trống (Empty State) */}
      <section aria-label="Danh mục tài nguyên thư viện">
        {resourcesResult.items.length === 0 ? (
          <LibraryEmptyState hasActiveFilters={hasActiveFilters} onResetFilters={handleResetFilters} />
        ) : filters.viewMode === 'grid' ? (
          <LibraryCardGrid
            items={resourcesResult.items}
            onSelect={openDetail}
            onDownload={handleDownload}
            downloadingFileId={isDownloading ? selectedFileId : null}
          />
        ) : (
          <LibraryCatalogTable
            items={resourcesResult.items}
            onSelect={openDetail}
            onDownload={handleDownload}
            downloadingFileId={isDownloading ? selectedFileId : null}
          />
        )}
      </section>

      {/* Pagination */}
      {resourcesResult.totalCount > 0 && (
        <Pagination
          currentPage={filters.pageNumber}
          totalPages={totalPages}
          totalCount={resourcesResult.totalCount}
          pageSize={filters.pageSize}
          itemLabel="tài liệu"
          onPageChange={handlePageChange}
        />
      )}

      {/* Modal xem chi tiết tài liệu học thuật */}
      <LibraryResourceDetailModal
        isOpen={isOpen}
        isLoading={isLoading}
        isDownloading={isDownloading}
        detail={detail}
        error={error}
        onClose={closeDetail}
        onDownload={handleDownload}
      />
    </div>
  );
}

export default AllResourcesPage;
