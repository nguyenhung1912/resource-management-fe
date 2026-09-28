import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ReportOverviewStats, ReportTypeResponse } from '@/features/reports/types/report.types';
import { MyReportFilterTabs } from '../MyReportFilterTabs';

describe('MyReportFilterTabs', () => {
  const mockStats: ReportOverviewStats = {
    total: 10,
    pending: 4,
    inProgress: 2,
    resolved: 3,
    rejected: 1,
  };

  const mockTypes: ReportTypeResponse[] = [
    { reportTypeId: 1, reportTypeName: 'Vi phạm bản quyền', description: 'Sao chép' },
    { reportTypeId: 2, reportTypeName: 'Spam', description: 'Nội dung rác' },
  ];

  it('hiển thị tabs trạng thái và gọi onStatusChange khi nhấp chọn', () => {
    const handleStatusChange = vi.fn();

    render(
      <MyReportFilterTabs
        activeStatus="Pending"
        onStatusChange={handleStatusChange}
        searchQuery=""
        onSearchChange={vi.fn()}
        reportTypes={mockTypes}
        stats={mockStats}
        onResetFilters={vi.fn()}
        onTargetTypeChange={vi.fn()}
        onReportTypeIdChange={vi.fn()}
      />,
    );

    expect(screen.getByText('Chờ xử lý')).toBeInTheDocument();
    expect(screen.getByText('Đã giải quyết')).toBeInTheDocument();

    const resolvedTab = screen.getByRole('button', { name: /đã giải quyết/i });
    fireEvent.click(resolvedTab);

    expect(handleStatusChange).toHaveBeenCalledWith('Resolved');
  });

  it('gọi onSearchChange khi nhập vào ô tìm kiếm và xóa từ khóa', () => {
    const handleSearchChange = vi.fn();

    render(
      <MyReportFilterTabs
        onStatusChange={vi.fn()}
        searchQuery="bản quyền"
        onSearchChange={handleSearchChange}
        reportTypes={mockTypes}
        stats={mockStats}
        onResetFilters={vi.fn()}
        onTargetTypeChange={vi.fn()}
        onReportTypeIdChange={vi.fn()}
      />,
    );

    const input = screen.getByRole('textbox', { name: /tìm kiếm báo cáo vi phạm/i });
    expect(input).toHaveValue('bản quyền');

    fireEvent.change(input, { target: { value: 'nghiên cứu' } });
    expect(handleSearchChange).toHaveBeenCalledWith('nghiên cứu');

    const clearButton = screen.getByRole('button', { name: /xóa từ khóa tìm kiếm/i });
    fireEvent.click(clearButton);

    expect(handleSearchChange).toHaveBeenCalledWith('');
  });

  it('gọi onTargetTypeChange và onReportTypeIdChange khi thay đổi dropdown', () => {
    const handleTargetTypeChange = vi.fn();
    const handleReportTypeIdChange = vi.fn();

    render(
      <MyReportFilterTabs
        onStatusChange={vi.fn()}
        searchQuery=""
        onSearchChange={vi.fn()}
        reportTypes={mockTypes}
        stats={mockStats}
        onResetFilters={vi.fn()}
        onTargetTypeChange={handleTargetTypeChange}
        onReportTypeIdChange={handleReportTypeIdChange}
      />,
    );

    const targetSelect = screen.getByRole('combobox', { name: /lọc theo đối tượng vi phạm/i });
    fireEvent.change(targetSelect, { target: { value: 'File' } });
    expect(handleTargetTypeChange).toHaveBeenCalledWith('File');

    const typeSelect = screen.getByRole('combobox', { name: /lọc theo loại vi phạm/i });
    fireEvent.change(typeSelect, { target: { value: '1' } });
    expect(handleReportTypeIdChange).toHaveBeenCalledWith(1);
  });
});
