import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SourceCodeFilterBar } from '../SourceCodeFilterBar';
import type { LookupItem, SourceCodeFilterValues } from '../../types/source-code.types';

const defaultFilters: SourceCodeFilterValues = {
  search: '',
  subMajorId: '',
  courseId: '',
  onlyGithub: false,
  statusId: '',
  pageNumber: 1,
  pageSize: 12,
  viewMode: 'grid',
};

const mockSubMajors: LookupItem[] = [
  { id: 'CNTT_KTPM', name: 'Kỹ thuật phần mềm' },
  { id: 'CNTT_AI', name: 'Trí tuệ nhân tạo' },
];

const mockCourses: LookupItem[] = [
  { id: 'IT3040', name: 'Thực tập chuyên ngành' },
  { id: 'IT4010', name: 'Học sâu' },
];

describe('SourceCodeFilterBar', () => {
  it('hiển thị đầy đủ ô tìm kiếm và các dropdowns bộ lọc', () => {
    render(
      <SourceCodeFilterBar
        filters={defaultFilters}
        subMajors={mockSubMajors}
        courses={mockCourses}
        onSearchChange={vi.fn()}
        onSubMajorChange={vi.fn()}
        onCourseChange={vi.fn()}
        onOnlyGithubChange={vi.fn()}
        onStatusChange={vi.fn()}
        onViewModeChange={vi.fn()}
        onResetFilters={vi.fn()}
      />,
    );

    expect(screen.getByRole('searchbox', { name: 'Tìm kiếm mã nguồn' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tìm kiếm' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Lọc theo chuyên ngành' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Lọc theo học phần' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Lọc theo trạng thái kiểm duyệt' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Chỉ hiện dự án có GitHub' })).toBeInTheDocument();
  });

  it('gọi onSearchChange khi submit form tìm kiếm', () => {
    const handleSearchChange = vi.fn();
    render(
      <SourceCodeFilterBar
        filters={defaultFilters}
        subMajors={mockSubMajors}
        courses={mockCourses}
        onSearchChange={handleSearchChange}
        onSubMajorChange={vi.fn()}
        onCourseChange={vi.fn()}
        onOnlyGithubChange={vi.fn()}
        onStatusChange={vi.fn()}
        onViewModeChange={vi.fn()}
        onResetFilters={vi.fn()}
      />,
    );

    const input = screen.getByRole('searchbox', { name: 'Tìm kiếm mã nguồn' });
    fireEvent.change(input, { target: { value: 'React Native' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tìm kiếm' }));

    expect(handleSearchChange).toHaveBeenCalledWith('React Native');
  });

  it('gọi onSubMajorChange khi chọn chuyên ngành', () => {
    const handleSubMajorChange = vi.fn();
    render(
      <SourceCodeFilterBar
        filters={defaultFilters}
        subMajors={mockSubMajors}
        courses={mockCourses}
        onSearchChange={vi.fn()}
        onSubMajorChange={handleSubMajorChange}
        onCourseChange={vi.fn()}
        onOnlyGithubChange={vi.fn()}
        onStatusChange={vi.fn()}
        onViewModeChange={vi.fn()}
        onResetFilters={vi.fn()}
      />,
    );

    const select = screen.getByRole('combobox', { name: 'Lọc theo chuyên ngành' });
    fireEvent.change(select, { target: { value: 'CNTT_KTPM' } });

    expect(handleSubMajorChange).toHaveBeenCalledWith('CNTT_KTPM');
  });

  it('gọi onOnlyGithubChange khi bấm nút toggle GitHub', () => {
    const handleOnlyGithubChange = vi.fn();
    render(
      <SourceCodeFilterBar
        filters={defaultFilters}
        subMajors={mockSubMajors}
        courses={mockCourses}
        onSearchChange={vi.fn()}
        onSubMajorChange={vi.fn()}
        onCourseChange={vi.fn()}
        onOnlyGithubChange={handleOnlyGithubChange}
        onStatusChange={vi.fn()}
        onViewModeChange={vi.fn()}
        onResetFilters={vi.fn()}
      />,
    );

    const toggleButton = screen.getByRole('button', { name: 'Chỉ hiện dự án có GitHub' });
    fireEvent.click(toggleButton);

    expect(handleOnlyGithubChange).toHaveBeenCalledWith(true);
  });

  it('gọi onViewModeChange khi chọn chế độ Lưới hoặc Bảng', () => {
    const handleViewModeChange = vi.fn();
    render(
      <SourceCodeFilterBar
        filters={defaultFilters}
        subMajors={mockSubMajors}
        courses={mockCourses}
        onSearchChange={vi.fn()}
        onSubMajorChange={vi.fn()}
        onCourseChange={vi.fn()}
        onOnlyGithubChange={vi.fn()}
        onStatusChange={vi.fn()}
        onViewModeChange={handleViewModeChange}
        onResetFilters={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Chế độ xem dạng bảng' }));
    expect(handleViewModeChange).toHaveBeenCalledWith('table');

    fireEvent.click(screen.getByRole('button', { name: 'Chế độ xem dạng lưới' }));
    expect(handleViewModeChange).toHaveBeenCalledWith('grid');
  });

  it('hiển thị nút Đặt lại khi có bộ lọc được áp dụng và gọi onResetFilters', () => {
    const handleReset = vi.fn();
    render(
      <SourceCodeFilterBar
        filters={{ ...defaultFilters, search: 'NodeJS' }}
        subMajors={mockSubMajors}
        courses={mockCourses}
        onSearchChange={vi.fn()}
        onSubMajorChange={vi.fn()}
        onCourseChange={vi.fn()}
        onOnlyGithubChange={vi.fn()}
        onStatusChange={vi.fn()}
        onViewModeChange={vi.fn()}
        onResetFilters={handleReset}
      />,
    );

    const resetButton = screen.getByRole('button', { name: 'Đặt lại toàn bộ bộ lọc' });
    expect(resetButton).toBeInTheDocument();
    fireEvent.click(resetButton);

    expect(handleReset).toHaveBeenCalledTimes(1);
  });

  it('hiển thị danh sách trạng thái động từ prop fileStatuses của backend', () => {
    const mockStatuses: LookupItem[] = [
      { id: '1', name: 'Chờ kiểm duyệt' },
      { id: '2', name: 'Phê duyệt chính thức' },
    ];
    render(
      <SourceCodeFilterBar
        filters={defaultFilters}
        subMajors={mockSubMajors}
        courses={mockCourses}
        fileStatuses={mockStatuses}
        onSearchChange={vi.fn()}
        onSubMajorChange={vi.fn()}
        onCourseChange={vi.fn()}
        onOnlyGithubChange={vi.fn()}
        onStatusChange={vi.fn()}
        onViewModeChange={vi.fn()}
        onResetFilters={vi.fn()}
      />,
    );

    expect(screen.getByRole('option', { name: 'Chờ kiểm duyệt' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Phê duyệt chính thức' })).toBeInTheDocument();
  });
});
