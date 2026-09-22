import { act, renderHook } from '@testing-library/react';
import type React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { useAllResourcesFilters } from '../useAllResourcesFilters';

function createWrapper(initialUrl = '/dashboard/resources'): React.FC<{ children: React.ReactNode }> {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <MemoryRouter initialEntries={[initialUrl]}>{children}</MemoryRouter>;
  };
}

describe('useAllResourcesFilters', () => {
  it('khởi tạo filters mặc định khi không có query params', () => {
    const { result } = renderHook(() => useAllResourcesFilters(), {
      wrapper: createWrapper(),
    });

    expect(result.current.filters).toEqual({
      search: '',
      fileTypeId: undefined,
      subMajorId: undefined,
      courseId: undefined,
      pageNumber: 1,
      pageSize: 12,
      viewMode: 'grid',
      sortBy: undefined,
      sortDirection: undefined,
    });
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it('đọc đúng query params có sẵn từ URL', () => {
    const initialUrl =
      '/dashboard/resources?search=DeepLearning&fileTypeId=1&subMajorId=CNTT_KTPM&courseId=IT3010&pageNumber=3&pageSize=24&viewMode=table&sortBy=name&sortDirection=asc';
    const { result } = renderHook(() => useAllResourcesFilters(), {
      wrapper: createWrapper(initialUrl),
    });

    expect(result.current.filters).toEqual({
      search: 'DeepLearning',
      fileTypeId: 1,
      subMajorId: 'CNTT_KTPM',
      courseId: 'IT3010',
      pageNumber: 3,
      pageSize: 24,
      viewMode: 'table',
      sortBy: 'name',
      sortDirection: 'asc',
    });
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it('cập nhật từ khóa tìm kiếm và tự động reset pageNumber', () => {
    const { result } = renderHook(() => useAllResourcesFilters(), {
      wrapper: createWrapper('/dashboard/resources?pageNumber=4'),
    });

    act(() => {
      result.current.handleSearchChange('React 19');
    });

    expect(result.current.filters.search).toBe('React 19');
    expect(result.current.filters.pageNumber).toBe(1);
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it('cập nhật thể loại tài liệu (fileTypeId)', () => {
    const { result } = renderHook(() => useAllResourcesFilters(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleFileTypeChange(3);
    });

    expect(result.current.filters.fileTypeId).toBe(3);

    act(() => {
      result.current.handleFileTypeChange(undefined);
    });

    expect(result.current.filters.fileTypeId).toBeUndefined();
  });

  it('khi đổi chuyên ngành thì tự động xóa học phần cũ và reset trang', () => {
    const initialUrl = '/dashboard/resources?subMajorId=CNTT_KTPM&courseId=IT3010&pageNumber=3';
    const { result } = renderHook(() => useAllResourcesFilters(), {
      wrapper: createWrapper(initialUrl),
    });

    act(() => {
      result.current.handleSubMajorChange('CNTT_KHMT');
    });

    expect(result.current.filters.subMajorId).toBe('CNTT_KHMT');
    expect(result.current.filters.courseId).toBeUndefined();
    expect(result.current.filters.pageNumber).toBe(1);
  });

  it('chuyển đổi viewMode giữa grid và table', () => {
    const { result } = renderHook(() => useAllResourcesFilters(), {
      wrapper: createWrapper(),
    });

    expect(result.current.filters.viewMode).toBe('grid');

    act(() => {
      result.current.handleViewModeChange('table');
    });

    expect(result.current.filters.viewMode).toBe('table');
  });

  it('đặt lại tất cả bộ lọc khi gọi handleResetFilters nhưng giữ viewMode', () => {
    const initialUrl =
      '/dashboard/resources?search=NLP&fileTypeId=2&subMajorId=CNTT_KTPM&courseId=IT3010&viewMode=table';
    const { result } = renderHook(() => useAllResourcesFilters(), {
      wrapper: createWrapper(initialUrl),
    });

    act(() => {
      result.current.handleResetFilters();
    });

    expect(result.current.filters.search).toBe('');
    expect(result.current.filters.fileTypeId).toBeUndefined();
    expect(result.current.filters.subMajorId).toBeUndefined();
    expect(result.current.filters.courseId).toBeUndefined();
    expect(result.current.filters.viewMode).toBe('table');
    expect(result.current.hasActiveFilters).toBe(false);
  });
});
