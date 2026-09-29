import { useDeferredValue, useMemo, useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Link, useLoaderData, useSubmit, useSearchParams } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/Button';
import { PageHeader } from '@/components/common/PageHeader';
import { APP_PATHS } from '@/constants/path';
import { SearchAdvancedFilterTab } from '../components/search/SearchAdvancedFilterTab';
import { SearchAiTab } from '../components/search/SearchAiTab';
import { SearchAuthorsTab } from '../components/search/SearchAuthorsTab';
import { SearchOmnibox } from '../components/search/SearchOmnibox';
import { SearchResourceListTab } from '../components/search/SearchResourceListTab';
import type { SearchHubLoaderData, SearchResourceItem, SearchTab } from '../types/search.types';
import type { SearchResultItem } from '@/features/resources/types/search.types';

export function SearchHubPage() {
  const { apiData, submajors, fileTypes } = useLoaderData() as SearchHubLoaderData;

  const submit = useSubmit();
  const [searchParams] = useSearchParams();

  // Hàm chuyển trang
  const handlePageChange = (newPage: number) => {
    // Kế thừa lại toàn bộ các bộ lọc đang có trên URL
    const params = new URLSearchParams(searchParams);
    // Ghi đè lại số trang
    params.set('page', newPage.toString());
    // Bắn lệnh đi (React Router sẽ gọi lại searchLoader và lấy data mới)
    submit(params, { replace: true });
  };

  const mappedResources: SearchResourceItem[] = useMemo(() => {
    if (!apiData?.items) return [];
    return apiData.items.map((item: SearchResultItem) => ({
      id: item.fileId,
      title: item.fileName || 'Chưa cập nhật',
      category: item.fileTypeName || 'Khác',
      author: item.uploadBy || 'Ẩn danh',
      faculty: item.subMajorCode || 'Chưa phân khoa',
      year: item.yearCompleted ? item.yearCompleted.toString() : new Date(item.createdAt).getFullYear().toString(),
      format: 'PDF',
      downloads: 0,
    }));
  }, [apiData]);

  const [activeTab, setActiveTab] = useState<SearchTab>('all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedFaculty, setSelectedFaculty] = useState(searchParams.get('subMajorCode') || 'all');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('fileTypeId') || 'all');

  const [selectedYear, setSelectedYear] = useState(searchParams.get('yearCompleted') || '');
  const [selectedFormat, setSelectedFormat] = useState(searchParams.get('fileTypeId') || 'all');

  const deferredQuery = useDeferredValue(searchQuery.trim());

  useEffect(() => {
    const params = new URLSearchParams();

    if (deferredQuery) params.set('q', deferredQuery);
    if (selectedFaculty !== 'all') params.set('subMajorCode', selectedFaculty);
    if (selectedYear) params.set('yearCompleted', selectedYear);

    const finalFileTypeId =
      selectedFormat !== 'all' ? selectedFormat : selectedCategory !== 'all' ? selectedCategory : null;
    if (finalFileTypeId) params.set('fileTypeId', finalFileTypeId);

    submit(params, { replace: true });
  }, [deferredQuery, selectedFaculty, selectedCategory, selectedFormat, selectedYear, submit]);

  const handleResetFilters = () => {
    setSelectedFaculty('all');
    setSelectedCategory('all');
    setSelectedFormat('all');
    setSelectedYear('');
    setSearchQuery('');
  };

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
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        resourceCount={apiData?.totalCount || 0}
      />

      {activeTab === 'all' ? (
        <SearchResourceListTab
          resources={mappedResources}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}

          pagination={{
            currentPage: apiData?.currentPage || 1,
            totalPages: apiData?.totalPages || 1,
            totalCount: apiData?.totalCount || 0,
            pageSize: 10,
            onPageChange: handlePageChange,
          }}
        />
      ) : null}

      {activeTab === 'ai' ? (
        <SearchAiTab
          onSelectSuggestion={(prompt) => {
            setSearchQuery(prompt);
            setActiveTab('all');
          }}
        />
      ) : null}

      {activeTab === 'advanced' ? (
        <SearchAdvancedFilterTab
          submajors={submajors}
          fileTypes={fileTypes}
          selectedFaculty={selectedFaculty}
          onFacultyChange={setSelectedFaculty}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          selectedFormat={selectedFormat}
          onFormatChange={setSelectedFormat}
          onReset={handleResetFilters}
          onApply={() => setActiveTab('all')}
        />
      ) : null}

      {activeTab === 'authors' ? <SearchAuthorsTab /> : null}
    </div>
  );
}

export default SearchHubPage;
