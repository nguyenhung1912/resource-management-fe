import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ReportItemResponse } from '@/features/reports/types/report.types';
import { ReportTable } from '../ReportTable';

describe('ReportTable', () => {
  const mockItems: ReportItemResponse[] = [
    {
      reportId: 'RPT_001',
      reporterUid: 'USR_001',
      reporterName: 'Nguyễn Văn A',
      targetType: 'File',
      targetId: 'FIL_001',
      reportTypeId: 1,
      reportTypeName: 'Vi phạm bản quyền',
      reason: 'Tài liệu sao chép toàn bộ',
      status: 'Pending',
      createdAt: '2026-09-15T10:00:00Z',
    },
  ];

  it('hiển thị đầy đủ thông tin báo cáo trong các cột bảng', () => {
    render(<ReportTable items={mockItems} onViewDetail={vi.fn()} onResolve={vi.fn()} />);

    expect(screen.getByText('RPT_001')).toBeInTheDocument();
    expect(screen.getByText('FIL_001')).toBeInTheDocument();
    expect(screen.getByText('Tài liệu')).toBeInTheDocument();
    expect(screen.getByText('Vi phạm bản quyền')).toBeInTheDocument();
    expect(screen.getByText('Tài liệu sao chép toàn bộ')).toBeInTheDocument();
    expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
    expect(screen.getByText('Chờ xử lý')).toBeInTheDocument();
  });

  it('gọi callback onViewDetail và onResolve khi nhấn các nút thao tác', () => {
    const handleViewDetail = vi.fn();
    const handleResolve = vi.fn();

    render(<ReportTable items={mockItems} onViewDetail={handleViewDetail} onResolve={handleResolve} />);

    const detailButton = screen.getByRole('button', { name: /Xem chi tiết báo cáo RPT_001/i });
    fireEvent.click(detailButton);
    expect(handleViewDetail).toHaveBeenCalledWith(mockItems[0]);

    const resolveButton = screen.getByRole('button', { name: /Xử lý báo cáo RPT_001/i });
    fireEvent.click(resolveButton);
    expect(handleResolve).toHaveBeenCalledWith(mockItems[0]);
  });
});
