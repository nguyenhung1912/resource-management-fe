import { useDeferredValue, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/Button';
import { PageHeader } from '@/components/common/PageHeader';
import { APP_PATHS } from '@/constants/path';
import { SearchAdvancedFilterTab } from '../components/search/SearchAdvancedFilterTab';
import { SearchAiTab } from '../components/search/SearchAiTab';
import { SearchAuthorsTab } from '../components/search/SearchAuthorsTab';
import { SearchOmnibox } from '../components/search/SearchOmnibox';
import { SearchResourceListTab } from '../components/search/SearchResourceListTab';
import { MOCK_RESOURCES } from '../constants/search.constants';
import type { SearchTab } from '../types/search.types';

export function SearchHubPage() {
  const [activeTab, setActiveTab] = useState<SearchTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const deferredQuery = useDeferredValue(searchQuery.trim().toLowerCase());

  const filteredResources = useMemo(() => {
    return MOCK_RESOURCES.filter((item) => {
      const matchesQuery =
        !deferredQuery ||
        item.title.toLowerCase().includes(deferredQuery) ||
        item.author.toLowerCase().includes(deferredQuery) ||
        item.faculty.toLowerCase().includes(deferredQuery);

      const matchesFaculty = selectedFaculty === 'all' || item.faculty === selectedFaculty;
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

      return matchesQuery && matchesFaculty && matchesCategory;
    });
  }, [deferredQuery, selectedFaculty, selectedCategory]);

  const handleResetFilters = () => {
    setSelectedFaculty('all');
    setSelectedCategory('all');
    setSearchQuery('');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. Page Header */}
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

      {/* 2. Omnibox Search Bar & Sub-tabs */}
      <SearchOmnibox
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        resourceCount={filteredResources.length}
      />

      {/* 3. Tab Content Panels with Ternary Rendering */}
      {activeTab === 'all' ? (
        <SearchResourceListTab
          resources={filteredResources}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
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
          selectedFaculty={selectedFaculty}
          onFacultyChange={setSelectedFaculty}
          onReset={handleResetFilters}
          onApply={() => setActiveTab('all')}
        />
      ) : null}

      {activeTab === 'authors' ? <SearchAuthorsTab /> : null}
    </div>
  );
}

export default SearchHubPage;
