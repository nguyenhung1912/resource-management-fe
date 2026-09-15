import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ReportDetailResponse, ReportItemResponse } from '@/features/reports/types/report.types';
import { ReportDetailModal } from '../ReportDetailModal';

describe('ReportDetailModal', () => {
  const mockItem: ReportItemResponse = {
    reportId: 'RPT_001',
    reporterUid: 'USR_001',
    reporterName: 'Lê Văn C',
    targetType: 'File',
    targetId: 'FIL_001',
    reportTypeId: 1,
    reportTypeName: 'Vi phạm bản quyền',
    reason: 'Sao chép nguyên văn đồ án tốt nghiệp',
    status: 'Pending',
    createdAt: '2026-09-15T08:00:00Z',
  };

  const mockDetail: ReportDetailResponse = {
    ...mockItem,
    targetTitle: 'Nghiên cứu ứng dụng Deep Learning',
    handledByName: 'TS. Nguyễn Văn Giảng',
    handledByUid: 'GV_001',
    resolvedAt: '2026-09-15T10:00:00Z',
    handlingNotes: 'Đã xác minh và gỡ bỏ tài liệu vi phạm.',
  };

  it('không render khi isOpen = false', () => {
    render(<ReportDetailModal isOpen={false} onClose={vi.fn()} detail={null} isLoading={false} error={null} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('hiển thị đầy đủ thông tin báo cáo khi có detail', () => {
    render(<ReportDetailModal isOpen={true} onClose={vi.fn()} detail={mockDetail} isLoading={false} error={null} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Chi tiết báo cáo #RPT_001')).toBeInTheDocument();
    expect(screen.getByText('Lê Văn C')).toBeInTheDocument();
    expect(screen.getByText('Nghiên cứu ứng dụng Deep Learning')).toBeInTheDocument();
    expect(screen.getByText('Sao chép nguyên văn đồ án tốt nghiệp')).toBeInTheDocument();
    expect(screen.getByText('TS. Nguyễn Văn Giảng')).toBeInTheDocument();
    expect(screen.getByText('Đã xác minh và gỡ bỏ tài liệu vi phạm.')).toBeInTheDocument();
  });

  it('gọi callback onOpenResolve khi nhấn nút Xử lý phán quyết', () => {
    const handleClose = vi.fn();
    const handleOpenResolve = vi.fn();

    render(
      <ReportDetailModal
        isOpen={true}
        onClose={handleClose}
        detail={mockDetail}
        isLoading={false}
        error={null}
        onOpenResolve={handleOpenResolve}
      />,
    );

    const resolveBtn = screen.getByRole('button', { name: /^Xử lý$/i });
    fireEvent.click(resolveBtn);

    expect(handleClose).toHaveBeenCalled();
    expect(handleOpenResolve).toHaveBeenCalledWith(mockDetail);
  });
});
