import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { LibraryFilterValues, LookupItem } from '../../types/all-resources.types';
import { LibraryFilterBar } from '../LibraryFilterBar';

describe('LibraryFilterBar', () => {
  const mockFilters: LibraryFilterValues = {
    search: '',
    fileTypeId: undefined,
    subMajorId: undefined,
    courseId: undefined,
    pageNumber: 1,
    pageSize: 12,
    viewMode: 'grid',
    sortBy: undefined,
    sortDirection: undefined,
  };

  const mockFileTypes: LookupItem[] = [
    { id: '1', name: 'Bài giảng' },
    { id: '2', name: 'Khóa luận' },
  ];

  const mockSubMajors: LookupItem[] = [
    { id: 'CNTT_KTPM', name: 'Kỹ thuật phần mềm' },
    { id: 'CNTT_KHMT', name: 'Khoa học máy tính' },
  ];

  const mockCourses: LookupItem[] = [
    { id: 'IT3010', name: 'Lập trình Web' },
    { id: 'IT3020', name: 'Trí tuệ nhân tạo' },
  ];

  it('render đầy đủ ô tìm kiếm, các dropdown và nút chuyển chế độ xem', () => {
    render(
      <LibraryFilterBar
        filters={mockFilters}
        fileTypes={mockFileTypes}
        subMajors={mockSubMajors}
        courses={mockCourses}
        hasActiveFilters={false}
        onSearchChange={vi.fn()}
        onSubMajorChange={vi.fn()}
        onCourseChange={vi.fn()}
        onViewModeChange={vi.fn()}
        onSortChange={vi.fn()}
        onResetFilters={vi.fn()}
      />,
    );

    expect(screen.getByPlaceholderText(/Tìm kiếm tựa sách, tài liệu, giáo trình/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /lọc theo chuyên ngành/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /lọc theo học phần/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /sắp xếp danh sách/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /xem dạng kệ sách/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /xem dạng danh mục/i })).toBeInTheDocument();
  });

  it('kích hoạt onSearchChange khi gõ và submit hoặc blur', () => {
    const handleSearchChange = vi.fn();
    render(
      <LibraryFilterBar
        filters={mockFilters}
        fileTypes={mockFileTypes}
        subMajors={mockSubMajors}
        courses={mockCourses}
        hasActiveFilters={false}
        onSearchChange={handleSearchChange}
        onSubMajorChange={vi.fn()}
        onCourseChange={vi.fn()}
        onViewModeChange={vi.fn()}
        onSortChange={vi.fn()}
        onResetFilters={vi.fn()}
      />,
    );

    const input = screen.getByPlaceholderText(/Tìm kiếm tựa sách, tài liệu/i);
    fireEvent.change(input, { target: { value: 'Machine Learning' } });
    fireEvent.blur(input);

    expect(handleSearchChange).toHaveBeenCalledWith('Machine Learning');
  });

  it('kích hoạt onSubMajorChange khi người dùng chọn chuyên ngành', () => {
    const handleSubMajorChange = vi.fn();
    render(
      <LibraryFilterBar
        filters={mockFilters}
        fileTypes={mockFileTypes}
        subMajors={mockSubMajors}
        courses={mockCourses}
        hasActiveFilters={false}
        onSearchChange={vi.fn()}
        onSubMajorChange={handleSubMajorChange}
        onCourseChange={vi.fn()}
        onViewModeChange={vi.fn()}
        onSortChange={vi.fn()}
        onResetFilters={vi.fn()}
      />,
    );

    const select = screen.getByRole('combobox', { name: /lọc theo chuyên ngành/i });
    fireEvent.change(select, { target: { value: 'CNTT_KTPM' } });

    expect(handleSubMajorChange).toHaveBeenCalledWith('CNTT_KTPM');
  });

  it('kích hoạt onViewModeChange khi click chuyển đổi Kệ sách / Mục lục', () => {
    const handleViewModeChange = vi.fn();
    render(
      <LibraryFilterBar
        filters={mockFilters}
        fileTypes={mockFileTypes}
        subMajors={mockSubMajors}
        courses={mockCourses}
        hasActiveFilters={false}
        onSearchChange={vi.fn()}
        onSubMajorChange={vi.fn()}
        onCourseChange={vi.fn()}
        onViewModeChange={handleViewModeChange}
        onSortChange={vi.fn()}
        onResetFilters={vi.fn()}
      />,
    );

    const tableButton = screen.getByRole('button', { name: /xem dạng danh mục/i });
    fireEvent.click(tableButton);

    expect(handleViewModeChange).toHaveBeenCalledWith('table');
  });

  it('hiển thị hàng filter chips và nút Xóa tất cả khi có bộ lọc hoạt động', () => {
    const handleResetFilters = vi.fn();
    const activeFilters: LibraryFilterValues = {
      ...mockFilters,
      search: 'DeepLearning',
      subMajorId: 'CNTT_KTPM',
      fileTypeId: 1,
    };

    render(
      <LibraryFilterBar
        filters={activeFilters}
        fileTypes={mockFileTypes}
        subMajors={mockSubMajors}
        courses={mockCourses}
        hasActiveFilters={true}
        onSearchChange={vi.fn()}
        onSubMajorChange={vi.fn()}
        onCourseChange={vi.fn()}
        onViewModeChange={vi.fn()}
        onSortChange={vi.fn()}
        onResetFilters={handleResetFilters}
      />,
    );

    expect(screen.getByText(/bộ lọc đang chọn:/i)).toBeInTheDocument();
    expect(screen.getByText(/tìm: "DeepLearning"/i)).toBeInTheDocument();
    expect(screen.getByText(/ngành: Kỹ thuật phần mềm/i)).toBeInTheDocument();
    expect(screen.getByText(/loại: Bài giảng/i)).toBeInTheDocument();

    const resetButton = screen.getByRole('button', { name: /đặt lại tất cả bộ lọc/i });
    fireEvent.click(resetButton);

    expect(handleResetFilters).toHaveBeenCalledTimes(1);
  });
});
