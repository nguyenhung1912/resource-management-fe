import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { LibraryFilterValues, LibraryViewMode } from '../types/all-resources.types';

export function useAllResourcesFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: LibraryFilterValues = useMemo(() => {
    const rawPage = Number(searchParams.get('pageNumber'));
    const rawPageSize = Number(searchParams.get('pageSize'));
    const rawViewMode = searchParams.get('viewMode');
    const rawFileTypeId = searchParams.get('fileTypeId');
    const rawSortDirection = searchParams.get('sortDirection');

    const fileTypeId = rawFileTypeId ? Number(rawFileTypeId) : undefined;
    const sortDirection = rawSortDirection === 'asc' || rawSortDirection === 'desc' ? rawSortDirection : undefined;

    return {
      search: searchParams.get('search') ?? '',
      fileTypeId: Number.isFinite(fileTypeId) && (fileTypeId ?? 0) > 0 ? fileTypeId : undefined,
      subMajorId: searchParams.get('subMajorId') ?? undefined,
      courseId: searchParams.get('courseId') ?? undefined,
      pageNumber: Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1,
      pageSize: Number.isFinite(rawPageSize) && rawPageSize > 0 ? rawPageSize : 12,
      viewMode: rawViewMode === 'table' ? 'table' : 'grid',
      sortBy: searchParams.get('sortBy') ?? undefined,
      sortDirection,
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

  const handleFileTypeChange = useCallback(
    (fileTypeId?: number) => {
      updateParam('fileTypeId', fileTypeId && fileTypeId > 0 ? fileTypeId : null);
    },
    [updateParam],
  );

  const handleSubMajorChange = useCallback(
    (subMajorId?: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (subMajorId?.trim()) {
          next.set('subMajorId', subMajorId.trim());
        } else {
          next.delete('subMajorId');
        }
        // Khi đổi chuyên ngành, reset học phần đã chọn vì học phần phụ thuộc chuyên ngành
        next.delete('courseId');
        next.delete('pageNumber');
        return next;
      });
    },
    [setSearchParams],
  );

  const handleCourseChange = useCallback(
    (courseId?: string) => {
      updateParam('courseId', courseId?.trim() || null);
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
    (mode: LibraryViewMode) => {
      updateParam('viewMode', mode === 'table' ? 'table' : null, false);
    },
    [updateParam],
  );

  const handleSortChange = useCallback(
    (sortBy?: string, sortDirection?: 'asc' | 'desc') => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (sortBy) {
          next.set('sortBy', sortBy);
        } else {
          next.delete('sortBy');
        }
        if (sortDirection) {
          next.set('sortDirection', sortDirection);
        } else {
          next.delete('sortDirection');
        }
        next.delete('pageNumber');
        return next;
      });
    },
    [setSearchParams],
  );

  const handleResetFilters = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams();
      const currentView = prev.get('viewMode');
      if (currentView === 'table') {
        next.set('viewMode', 'table');
      }
      return next;
    });
  }, [setSearchParams]);

  const hasActiveFilters = useMemo(() => {
    return Boolean(filters.search || filters.fileTypeId || filters.subMajorId || filters.courseId || filters.sortBy);
  }, [filters]);

  return {
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
  };
}
