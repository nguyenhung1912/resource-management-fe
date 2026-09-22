import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ReportItemResponse } from '@/features/reports/types/report.types';
import { MyReportTable } from '../MyReportTable';

describe('MyReportTable', () => {
  const mockItems: ReportItemResponse[] = [
    {
      reportId: 'RPT_MY_001',
      reporterUid: 'USR_ME',
      reporterName: 'Tôi',
      targetType: 'File',
      targetId: 'FIL_001',
      reportTypeId: 1,
      reportTypeName: 'Vi phạm bản quyền',
      reason: 'Tài liệu sao chép nguyên văn',
      status: 'Pending',
      createdAt: '2026-09-18T08:00:00Z',
    },
    {
      reportId: 'RPT_MY_002',
      reporterUid: 'USR_ME',
      reporterName: 'Tôi',
      targetType: 'Comment',
      targetId: 'CMT_002',
      reportTypeId: 2,
      reportTypeName: 'Spam',
      reason: 'Bình luận quảng cáo',
      status: 'Resolved',
      handlingNotes: 'Đã gỡ bình luận vi phạm',
      createdAt: '2026-09-18T09:00:00Z',
    },
  ];

  it('hiển thị đầy đủ danh sách các hàng dữ liệu và thông tin tương ứng', () => {
    render(<MyReportTable items={mockItems} onViewDetail={vi.fn()} />);

    expect(screen.getByText('RPT_MY_001')).toBeInTheDocument();
    expect(screen.getByText('FIL_001')).toBeInTheDocument();
    expect(screen.getByText('Vi phạm bản quyền')).toBeInTheDocument();
    expect(screen.getByText('Chờ tiếp nhận & xử lý')).toBeInTheDocument();

    expect(screen.getByText('RPT_MY_002')).toBeInTheDocument();
    expect(screen.getByText('CMT_002')).toBeInTheDocument();
    expect(screen.getByText('Đã gỡ bình luận vi phạm')).toBeInTheDocument();
  });

  it('gọi callback onViewDetail khi nhấn nút Chi tiết', () => {
    const handleViewDetail = vi.fn();

    render(<MyReportTable items={mockItems} onViewDetail={handleViewDetail} />);

    const detailButtons = screen.getAllByRole('button', { name: /xem chi tiết báo cáo/i });
    fireEvent.click(detailButtons[0]);

    expect(handleViewDetail).toHaveBeenCalledWith(mockItems[0]);
  });
});
