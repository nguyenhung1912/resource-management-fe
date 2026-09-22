import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ReportItemResponse } from '@/features/reports/types/report.types';
import { MyReportCardItem } from '../MyReportCardItem';

describe('MyReportCardItem', () => {
  const mockItem: ReportItemResponse = {
    reportId: 'RPT_CARD_001',
    reporterUid: 'USR_ME',
    reporterName: 'Tôi',
    targetType: 'File',
    targetId: 'FIL_CARD_001',
    reportTypeId: 1,
    reportTypeName: 'Vi phạm bản quyền',
    reason: 'Tài liệu sao chép nội dung đồ án',
    status: 'Resolved',
    handlingNotes: 'Đã kiểm tra và xử lý thành công',
    createdAt: '2026-09-19T10:00:00Z',
  };

  it('hiển thị thông tin thẻ đầy đủ bao gồm mã, loại và ghi chú xử lý', () => {
    render(<MyReportCardItem item={mockItem} onViewDetail={vi.fn()} />);

    expect(screen.getByText('RPT_CARD_001')).toBeInTheDocument();
    expect(screen.getByText('FIL_CARD_001')).toBeInTheDocument();
    expect(screen.getByText('Vi phạm bản quyền')).toBeInTheDocument();
    expect(screen.getByText('Tài liệu sao chép nội dung đồ án')).toBeInTheDocument();
    expect(screen.getByText('Đã kiểm tra và xử lý thành công')).toBeInTheDocument();
  });

  it('gọi callback onViewDetail khi nhấn nút Chi tiết', () => {
    const handleViewDetail = vi.fn();

    render(<MyReportCardItem item={mockItem} onViewDetail={handleViewDetail} />);

    const detailBtn = screen.getByRole('button', { name: /xem chi tiết báo cáo rpt_card_001/i });
    fireEvent.click(detailBtn);

    expect(handleViewDetail).toHaveBeenCalledWith(mockItem);
  });
});
