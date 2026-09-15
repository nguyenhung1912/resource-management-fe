import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ReportOverviewStats } from '@/features/reports/types/report.types';
import { ReportStatsCards } from '../ReportStatsCards';

describe('ReportStatsCards', () => {
  const mockStats: ReportOverviewStats = {
    total: 25,
    pending: 10,
    inProgress: 5,
    resolved: 7,
    rejected: 3,
  };

  it('hiển thị đầy đủ 5 thẻ KPI và số lượng tương ứng', () => {
    render(<ReportStatsCards stats={mockStats} />);

    expect(screen.getByText('Tất cả báo cáo')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();

    expect(screen.getByText('Chờ xử lý')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();

    expect(screen.getByText('Đang kiểm tra')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    expect(screen.getByText('Đã giải quyết')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();

    expect(screen.getByText('Đã bác bỏ')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('gọi callback onSelectStatus khi người dùng nhấn vào thẻ KPI', () => {
    const handleSelectStatus = vi.fn();
    render(<ReportStatsCards stats={mockStats} onSelectStatus={handleSelectStatus} />);

    const pendingCard = screen.getByRole('button', { name: /Lọc theo Chờ xử lý: 10/i });
    fireEvent.click(pendingCard);

    expect(handleSelectStatus).toHaveBeenCalledWith('Pending');

    const allCard = screen.getByRole('button', { name: /Lọc theo Tất cả báo cáo: 25/i });
    fireEvent.click(allCard);

    expect(handleSelectStatus).toHaveBeenCalledWith(undefined);
  });
});
