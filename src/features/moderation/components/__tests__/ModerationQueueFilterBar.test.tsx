import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ModerationQueueFilterBar } from '../ModerationQueueFilterBar';
import type { ModerationQueueFilterState } from '../../types/moderation.types';

const defaultFilters: ModerationQueueFilterState = {
  search: '',
  departmentId: undefined,
  subMajorCode: undefined,
  fileTypeId: undefined,
  aiRisk: 'all',
  page: 1,
  pageSize: 10,
};

const mockDepartments = [
  { id: 'DPT_IT', name: 'Công nghệ thông tin' },
  { id: 'DPT_BA', name: 'Quản trị kinh doanh' },
];

const mockSubMajors = [
  { subMajorCode: 'CNTT_KTPM', subMajorName: 'Kỹ thuật phần mềm' },
  { subMajorCode: 'CNTT_KHMT', subMajorName: 'Khoa học máy tính' },
];

const mockFileTypes = [
  { id: 1, name: 'Khóa luận tốt nghiệp' },
  { id: 2, name: 'Báo cáo môn học' },
];

describe('ModerationQueueFilterBar', () => {
  it('render đầy đủ ô tìm kiếm, các nút bấm và 4 dropdown bộ lọc', () => {
    render(
      <ModerationQueueFilterBar
        currentFilters={defaultFilters}
        departments={mockDepartments}
        subMajors={mockSubMajors}
        fileTypes={mockFileTypes}
        onSearchChange={vi.fn()}
        onDepartmentChange={vi.fn()}
        onSubMajorChange={vi.fn()}
        onFileTypeChange={vi.fn()}
        onAiRiskChange={vi.fn()}
        onResetFilters={vi.fn()}
      />,
    );

    expect(screen.getByPlaceholderText('Tìm theo tên tài liệu, người tải, mã số...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tìm kiếm' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Đặt lại' })).toBeInTheDocument();

    expect(screen.getByRole('combobox', { name: 'Lọc theo khoa' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Lọc theo chuyên ngành' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Lọc theo loại tài liệu' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Lọc theo cấp độ AI' })).toBeInTheDocument();
  });

  it('gọi onSearchChange khi submit form tìm kiếm', () => {
    const handleSearchChange = vi.fn();
    render(
      <ModerationQueueFilterBar
        currentFilters={defaultFilters}
        departments={mockDepartments}
        subMajors={mockSubMajors}
        fileTypes={mockFileTypes}
        onSearchChange={handleSearchChange}
        onDepartmentChange={vi.fn()}
        onSubMajorChange={vi.fn()}
        onFileTypeChange={vi.fn()}
        onAiRiskChange={vi.fn()}
        onResetFilters={vi.fn()}
      />,
    );

    const input = screen.getByPlaceholderText('Tìm theo tên tài liệu, người tải, mã số...');
    fireEvent.change(input, { target: { value: '  Học máy y tế  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tìm kiếm' }));

    expect(handleSearchChange).toHaveBeenCalledWith('Học máy y tế');
  });

  it('xóa từ khóa tìm kiếm khi click nút X', () => {
    const handleSearchChange = vi.fn();
    render(
      <ModerationQueueFilterBar
        currentFilters={{ ...defaultFilters, search: 'Khóa luận' }}
        departments={mockDepartments}
        subMajors={mockSubMajors}
        fileTypes={mockFileTypes}
        onSearchChange={handleSearchChange}
        onDepartmentChange={vi.fn()}
        onSubMajorChange={vi.fn()}
        onFileTypeChange={vi.fn()}
        onAiRiskChange={vi.fn()}
        onResetFilters={vi.fn()}
      />,
    );

    const clearButton = screen.getByRole('button', { name: 'Xóa từ khóa tìm kiếm' });
    fireEvent.click(clearButton);

    expect(handleSearchChange).toHaveBeenCalledWith('');
    expect(screen.getByPlaceholderText('Tìm theo tên tài liệu, người tải, mã số...')).toHaveValue('');
  });

  it('gọi các callback tương ứng khi thay đổi select dropdown', () => {
    const handleDepartmentChange = vi.fn();
    const handleSubMajorChange = vi.fn();
    const handleFileTypeChange = vi.fn();
    const handleAiRiskChange = vi.fn();

    render(
      <ModerationQueueFilterBar
        currentFilters={defaultFilters}
        departments={mockDepartments}
        subMajors={mockSubMajors}
        fileTypes={mockFileTypes}
        onSearchChange={vi.fn()}
        onDepartmentChange={handleDepartmentChange}
        onSubMajorChange={handleSubMajorChange}
        onFileTypeChange={handleFileTypeChange}
        onAiRiskChange={handleAiRiskChange}
        onResetFilters={vi.fn()}
      />,
    );

    // Khoa
    fireEvent.change(screen.getByRole('combobox', { name: 'Lọc theo khoa' }), {
      target: { value: 'DPT_IT' },
    });
    expect(handleDepartmentChange).toHaveBeenCalledWith('DPT_IT');

    // Chuyên ngành
    fireEvent.change(screen.getByRole('combobox', { name: 'Lọc theo chuyên ngành' }), {
      target: { value: 'CNTT_KTPM' },
    });
    expect(handleSubMajorChange).toHaveBeenCalledWith('CNTT_KTPM');

    // Loại tài liệu
    fireEvent.change(screen.getByRole('combobox', { name: 'Lọc theo loại tài liệu' }), {
      target: { value: '2' },
    });
    expect(handleFileTypeChange).toHaveBeenCalledWith(2);

    // Cấp độ AI
    fireEvent.change(screen.getByRole('combobox', { name: 'Lọc theo cấp độ AI' }), {
      target: { value: 'danger' },
    });
    expect(handleAiRiskChange).toHaveBeenCalledWith('danger');
  });

  it('gọi onResetFilters khi nhấn nút Đặt lại và nút bị vô hiệu hóa khi không có filter', () => {
    const handleResetFilters = vi.fn();

    const { rerender } = render(
      <ModerationQueueFilterBar
        currentFilters={defaultFilters}
        departments={mockDepartments}
        subMajors={mockSubMajors}
        fileTypes={mockFileTypes}
        onSearchChange={vi.fn()}
        onDepartmentChange={vi.fn()}
        onSubMajorChange={vi.fn()}
        onFileTypeChange={vi.fn()}
        onAiRiskChange={vi.fn()}
        onResetFilters={handleResetFilters}
      />,
    );

    const resetButton = screen.getByRole('button', { name: 'Đặt lại' });
    expect(resetButton).toBeDisabled();

    // Rerender có active filter
    rerender(
      <ModerationQueueFilterBar
        currentFilters={{ ...defaultFilters, aiRisk: 'danger' }}
        departments={mockDepartments}
        subMajors={mockSubMajors}
        fileTypes={mockFileTypes}
        onSearchChange={vi.fn()}
        onDepartmentChange={vi.fn()}
        onSubMajorChange={vi.fn()}
        onFileTypeChange={vi.fn()}
        onAiRiskChange={vi.fn()}
        onResetFilters={handleResetFilters}
      />,
    );

    expect(resetButton).not.toBeDisabled();
    fireEvent.click(resetButton);
    expect(handleResetFilters).toHaveBeenCalled();
  });
});
