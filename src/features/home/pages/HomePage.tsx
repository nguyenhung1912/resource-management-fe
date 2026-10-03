import { useMemo, useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { APP_PATHS } from '@/constants/path';
import { HomeCategoryFilter } from '@/features/home/components/HomeCategoryFilter';
import { HomeHeroSearch } from '@/features/home/components/HomeHeroSearch';
import { HomeQuickActions } from '@/features/home/components/HomeQuickActions';
import { HomeResourceGrid } from '@/features/home/components/HomeResourceGrid';
import type { HomeLoaderData } from '@/features/home/types/home.types';

function useSafeLoaderData<T>(): T | undefined {
  try {
    return useLoaderData() as T;
  } catch {
    return undefined;
  }
}

export function HomePage() {
  const loaderData = useSafeLoaderData<HomeLoaderData>();
  const navigate = useNavigate();

  const [selectedCategoryId, setSelectedCategoryId] = useState('all');

  const fileTypes = useMemo(() => loaderData?.fileTypes ?? [], [loaderData?.fileTypes]);

  const filteredResources = useMemo(() => {
    const resources = loaderData?.featuredResources ?? [];
    if (selectedCategoryId === 'all') {
      return resources;
    }

    const matchedCategory = loaderData?.fileTypes?.find((ft) => ft.id === selectedCategoryId);
    if (!matchedCategory) {
      return resources;
    }

    return resources.filter((item) => item.fileTypeName?.toLowerCase() === matchedCategory.name.toLowerCase());
  }, [selectedCategoryId, loaderData?.featuredResources, loaderData?.fileTypes]);

  const totalCount = loaderData?.totalResources ?? 0;

  const handleSearch = (keyword: string) => {
    navigate(`${APP_PATHS.SEARCH}?q=${encodeURIComponent(keyword)}`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Hero Search Banner */}
      <HomeHeroSearch onSearch={handleSearch} />

      {/* 2. Dynamic Category Filter */}
      {fileTypes.length > 0 ? (
        <HomeCategoryFilter
          categories={fileTypes}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />
      ) : null}

      {/* 3. Real Resources Grid */}
      <HomeResourceGrid
        resources={filteredResources}
        totalCount={selectedCategoryId === 'all' ? totalCount : filteredResources.length}
      />

      {/* 4. Quick Actions & Institutional Standards */}
      <HomeQuickActions />
    </div>
  );
}

export default HomePage;
