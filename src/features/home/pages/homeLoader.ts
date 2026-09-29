import { resourceService } from '@/services/resourceService';
import type { HomeLoaderData } from '@/features/home/types/home.types';

export async function homeLoader(): Promise<HomeLoaderData> {
  try {
    const [fileTypesResult, searchResult] = await Promise.all([
      resourceService.getFileTypes().catch(() => []),
      resourceService
        .globalSearch({
          page: 1,
          pageSize: 6,
          sortBy: 'date',
          sortDirection: 'desc',
        })
        .catch(() => ({
          items: [],
          totalCount: 0,
          page: 1,
          pageSize: 6,
        })),
    ]);

    return {
      fileTypes: Array.isArray(fileTypesResult) ? fileTypesResult : [],
      featuredResources: Array.isArray(searchResult?.items) ? searchResult.items : [],
      totalResources: searchResult?.totalCount ?? 0,
    };
  } catch {
    return {
      fileTypes: [],
      featuredResources: [],
      totalResources: 0,
    };
  }
}

export default homeLoader;
