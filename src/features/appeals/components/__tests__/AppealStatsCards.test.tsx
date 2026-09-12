import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AppealStatsCards } from '../AppealStatsCards';
import type { AppealOverviewStats } from '@/features/appeals/types/appeal.types';

describe('AppealStatsCards', () => {
  const mockStats: AppealOverviewStats = {
    total: 15,
    pending: 4,
    approved: 8,
    rejected: 3,
  };

  it('hiển thị đúng số liệu của cả 4 thẻ KPI', () => {
    render(<AppealStatsCards stats={mockStats} />);

    expect(screen.getByText('Tổng khiếu nại')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();

    expect(screen.getByText('Đang chờ duyệt')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();

    expect(screen.getByText('Đã chấp thuận')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();

    expect(screen.getByText('Bị từ chối')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('gọi callback onSelectStatus khi người dùng nhấp vào thẻ KPI', () => {
    const handleSelectStatus = vi.fn();
    render(<AppealStatsCards stats={mockStats} onSelectStatus={handleSelectStatus} />);

    const pendingBtn = screen.getByRole('button', { name: /Đang chờ duyệt/i });
    fireEvent.click(pendingBtn);
    expect(handleSelectStatus).toHaveBeenCalledWith('Pending');

    const allBtn = screen.getByRole('button', { name: /Tổng khiếu nại/i });
    fireEvent.click(allBtn);
    expect(handleSelectStatus).toHaveBeenCalledWith(undefined);
  });
});
