import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ReportOverviewStats } from '@/features/reports/types/report.types';
import { MyReportStatsCards } from '../MyReportStatsCards';

describe('MyReportStatsCards', () => {
  const mockStats: ReportOverviewStats = {
    total: 15,
    pending: 5,
    inProgress: 3,
    resolved: 6,
    rejected: 1,
  };

  it('hiển thị đầy đủ 5 thẻ KPI và số lượng tương ứng', () => {
    render(<MyReportStatsCards stats={mockStats} />);

    expect(screen.getByText('Tất cả báo cáo')).toBeInTheDocument();
    expect(screen.getByText('Chờ xử lý')).toBeInTheDocument();
    expect(screen.getByText('Đang kiểm tra')).toBeInTheDocument();
    expect(screen.getByText('Đã giải quyết')).toBeInTheDocument();
    expect(screen.getByText('Bác bỏ')).toBeInTheDocument();

    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('gọi callback onSelectStatus khi người dùng nhấn vào thẻ KPI', () => {
    const handleSelectStatus = vi.fn();

    render(<MyReportStatsCards stats={mockStats} onSelectStatus={handleSelectStatus} />);

    const pendingCard = screen.getByRole('button', { name: /lọc theo chờ xử lý/i });
    fireEvent.click(pendingCard);

    expect(handleSelectStatus).toHaveBeenCalledWith('Pending');

    const resolvedCard = screen.getByRole('button', { name: /lọc theo đã giải quyết/i });
    fireEvent.click(resolvedCard);

    expect(handleSelectStatus).toHaveBeenCalledWith('Resolved');
  });
});
