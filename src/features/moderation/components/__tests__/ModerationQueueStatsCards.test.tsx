import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ModerationQueueStatsCards } from '../ModerationQueueStatsCards';
import type { ModerationQueueOverviewStats } from '../../types/moderation.types';

const mockStats: ModerationQueueOverviewStats = {
  totalPending: 42,
  highPlagiarismRisk: 5,
  safePlagiarism: 28,
  uninspectedCount: 9,
};

describe('ModerationQueueStatsCards', () => {
  it('render đầy đủ 4 thẻ thống kê KPI với tiêu đề và giá trị tương ứng', () => {
    render(<ModerationQueueStatsCards stats={mockStats} />);

    expect(screen.getByText('Chờ thẩm định')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();

    expect(screen.getByText('Nguy cơ cao (>30%)')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    expect(screen.getByText('An toàn (≤15%)')).toBeInTheDocument();
    expect(screen.getByText('28')).toBeInTheDocument();

    expect(screen.getByText('Chưa quét AI')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
  });

  it('gọi onSelectRisk khi click vào từng thẻ KPI tương ứng', () => {
    const handleSelectRisk = vi.fn();
    render(<ModerationQueueStatsCards stats={mockStats} onSelectRisk={handleSelectRisk} />);

    // Click thẻ Chờ thẩm định -> 'all'
    fireEvent.click(screen.getByRole('button', { name: /Lọc theo Chờ thẩm định/i }));
    expect(handleSelectRisk).toHaveBeenCalledWith('all');

    // Click thẻ Nguy cơ cao -> 'danger'
    fireEvent.click(screen.getByRole('button', { name: /Lọc theo Nguy cơ cao/i }));
    expect(handleSelectRisk).toHaveBeenCalledWith('danger');

    // Click thẻ An toàn -> 'safe'
    fireEvent.click(screen.getByRole('button', { name: /Lọc theo An toàn/i }));
    expect(handleSelectRisk).toHaveBeenCalledWith('safe');

    // Click thẻ Chưa quét -> 'uninspected'
    fireEvent.click(screen.getByRole('button', { name: /Lọc theo Chưa quét AI/i }));
    expect(handleSelectRisk).toHaveBeenCalledWith('uninspected');
  });

  it('đánh dấu trạng thái isSelected cho thẻ đang được chọn', () => {
    render(<ModerationQueueStatsCards stats={mockStats} activeRisk="danger" onSelectRisk={vi.fn()} />);

    const dangerButton = screen.getByRole('button', { name: /Lọc theo Nguy cơ cao/i });
    expect(dangerButton.className).toContain('border-danger');
  });

  it('render đúng aria-label vùng thống kê', () => {
    render(<ModerationQueueStatsCards stats={mockStats} />);
    expect(screen.getByRole('region', { name: 'Thống kê hàng đợi kiểm duyệt' })).toBeInTheDocument();
  });
});
