import { Search } from 'lucide-react';
import { Link, useLoaderData } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/Button';
import { PageHeader } from '@/components/common/PageHeader';
import { APP_PATHS } from '@/constants/path';
import { SearchAdvancedFilterTab } from '../components/search/SearchAdvancedFilterTab';
import { SearchAiTab } from '../components/search/SearchAiTab';
import { SearchAuthorsTab } from '../components/search/SearchAuthorsTab';
import { SearchOmnibox } from '../components/search/SearchOmnibox';
import { SearchResourceListTab } from '../components/search/SearchResourceListTab';
import type { SearchHubLoaderData } from '../types/search.types';

// Import 2 trạm điều khiển vừa tạo
import { useSearchData } from '../hooks/useSearchHubData';
import { useSearchFilters } from '../hooks/useSearchHubFilters';

export function SearchHubPage() {
  const { apiData, submajors, fileTypes } = useLoaderData() as SearchHubLoaderData;

  // Rút gọn toàn bộ logic phức tạp thông qua custom hooks
  const { mappedResources, extractedAuthors } = useSearchData(apiData);
  const filters = useSearchFilters();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <PageHeader
        title="Trung tâm Tra cứu Tài nguyên Số"
        description="Tra cứu tài liệu học tập, giáo trình, khóa luận, mã nguồn và tìm kiếm ngữ nghĩa thông minh với Trợ lý AI."
        icon={Search}
        actions={
          <Link to={APP_PATHS.RESOURCE_UPLOAD} className={buttonVariants({ variant: 'primary', size: 'md' })}>
            Đăng tải tài liệu
          </Link>
        }
      />

      <SearchOmnibox
        searchQuery={filters.searchQuery}
        onSearchChange={filters.setSearchQuery}
        activeTab={filters.activeTab}
        onTabChange={filters.setActiveTab}
        resourceCount={apiData?.totalCount || 0}
      />

      {filters.activeTab === 'all' ? (
        <SearchResourceListTab
          resources={mappedResources}
          selectedCategory={filters.selectedCategory}
          onCategoryChange={filters.setSelectedCategory}
          pagination={{
            currentPage: apiData?.currentPage || 1,
            totalPages: apiData?.totalPages || 1,
            totalCount: apiData?.totalCount || 0,
            pageSize: 10,
            onPageChange: filters.handlePageChange,
          }}
        />
      ) : null}

      {filters.activeTab === 'ai' ? (
        <SearchAiTab
          onSelectSuggestion={(prompt) => {
            filters.setSearchQuery(prompt);
            filters.setActiveTab('all');
          }}
        />
      ) : null}

      {filters.activeTab === 'advanced' ? (
        <SearchAdvancedFilterTab
          submajors={submajors}
          fileTypes={fileTypes}
          selectedFaculty={filters.selectedFaculty}
          onFacultyChange={filters.setSelectedFaculty}
          selectedYear={filters.selectedYear}
          onYearChange={filters.setSelectedYear}
          selectedFormat={filters.selectedFormat}
          onFormatChange={filters.setSelectedFormat}
          onReset={filters.handleResetFilters}
          onApply={() => filters.setActiveTab('all')}
        />
      ) : null}

      {filters.activeTab === 'authors' ? <SearchAuthorsTab authors={extractedAuthors} /> : null}
    </div>
  );
}

export default SearchHubPage;
