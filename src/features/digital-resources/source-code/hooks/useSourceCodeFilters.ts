import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type {
  SourceCodeFilterValues,
  SourceCodeViewMode,
} from '@/features/digital-resources/source-code/types/source-code.types';

export function useSourceCodeFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: SourceCodeFilterValues = useMemo(() => {
    const rawPage = Number(searchParams.get('pageNumber'));
    const rawPageSize = Number(searchParams.get('pageSize'));
    const rawViewMode = searchParams.get('viewMode');

    return {
      search: searchParams.get('search') ?? '',
      subMajorId: searchParams.get('subMajorId') ?? '',
      courseId: searchParams.get('courseId') ?? '',
      onlyGithub: searchParams.get('onlyGithub') === 'true',
      statusId: searchParams.get('statusId') ?? '',
      pageNumber: Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1,
      pageSize: Number.isFinite(rawPageSize) && rawPageSize > 0 ? rawPageSize : 12,
      viewMode: rawViewMode === 'table' ? 'table' : 'grid',
    };
  }, [searchParams]);

  const updateParam = useCallback(
    (key: string, value: string | number | boolean | null | undefined, resetPage = true) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value === null || value === undefined || value === '' || value === false) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }

        if (resetPage && key !== 'pageNumber') {
          next.delete('pageNumber');
        }

        return next;
      });
    },
    [setSearchParams],
  );

  const handleSearchChange = useCallback(
    (query: string) => {
      updateParam('search', query.trim());
    },
    [updateParam],
  );

  const handleSubMajorChange = useCallback(
    (subMajorId: string) => {
      updateParam('subMajorId', subMajorId);
      // Khi đổi chuyên ngành, reset học phần đã chọn vì học phần phụ thuộc chuyên ngành
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (subMajorId) {
          next.set('subMajorId', subMajorId);
        } else {
          next.delete('subMajorId');
        }
        next.delete('courseId');
        next.delete('pageNumber');
        return next;
      });
    },
    [setSearchParams, updateParam],
  );

  const handleCourseChange = useCallback(
    (courseId: string) => {
      updateParam('courseId', courseId);
    },
    [updateParam],
  );

  const handleOnlyGithubChange = useCallback(
    (onlyGithub: boolean) => {
      updateParam('onlyGithub', onlyGithub ? 'true' : null);
    },
    [updateParam],
  );

  const handleStatusChange = useCallback(
    (statusId: string) => {
      updateParam('statusId', statusId);
    },
    [updateParam],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      updateParam('pageNumber', page > 1 ? page : null, false);
    },
    [updateParam],
  );

  const handleViewModeChange = useCallback(
    (viewMode: SourceCodeViewMode) => {
      updateParam('viewMode', viewMode === 'table' ? 'table' : null, false);
    },
    [updateParam],
  );

  const handleResetFilters = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams();
      const currentViewMode = prev.get('viewMode');
      if (currentViewMode === 'table') {
        next.set('viewMode', 'table');
      }
      return next;
    });
  }, [setSearchParams]);

  return {
    filters,
    handleSearchChange,
    handleSubMajorChange,
    handleCourseChange,
    handleOnlyGithubChange,
    handleStatusChange,
    handlePageChange,
    handleViewModeChange,
    handleResetFilters,
  };
}

export default useSourceCodeFilters;
