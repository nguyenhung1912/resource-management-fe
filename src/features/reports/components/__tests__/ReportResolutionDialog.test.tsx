import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { reportService } from '@/services/reportService';
import type { ReportItemResponse } from '@/features/reports/types/report.types';
import { ReportResolutionDialog } from '../ReportResolutionDialog';

vi.mock('@/services/reportService', () => ({
  reportService: {
    updateReportStatus: vi.fn(),
  },
}));

describe('ReportResolutionDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockReport: ReportItemResponse = {
    reportId: 'RPT_001',
    reporterUid: 'USR_001',
    reporterName: 'Lê Văn C',
    targetType: 'File',
    targetId: 'FIL_001',
    reportTypeId: 1,
    reportTypeName: 'Vi phạm bản quyền',
    reason: 'Sao chép',
    status: 'Pending',
    createdAt: '2026-09-15T08:00:00Z',
  };

  it('không render khi isOpen = false', () => {
    render(<ReportResolutionDialog isOpen={false} onClose={vi.fn()} report={mockReport} onSuccess={vi.fn()} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('hiển thị lỗi validation khi chưa nhập đủ 10 ký tự ghi chú', async () => {
    render(<ReportResolutionDialog isOpen={true} onClose={vi.fn()} report={mockReport} onSuccess={vi.fn()} />);

    const submitBtn = screen.getByRole('button', { name: /^Xác nhận$/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Ghi chú xử lý phải có độ dài tối thiểu 10 ký tự/i)).toBeInTheDocument();
    expect(reportService.updateReportStatus).not.toHaveBeenCalled();
  });

  it('gửi phán quyết thành công khi hợp lệ và gọi onSuccess', async () => {
    const handleSuccess = vi.fn();
    const handleClose = vi.fn();

    vi.mocked(reportService.updateReportStatus).mockResolvedValueOnce({
      message: 'Xử lý thành công.',
      data: {
        ...mockReport,
        status: 'Resolved',
        handlingNotes: 'Đã xác minh và gỡ tài liệu vi phạm.',
      },
    });

    render(
      <ReportResolutionDialog isOpen={true} onClose={handleClose} report={mockReport} onSuccess={handleSuccess} />,
    );

    const textarea = screen.getByPlaceholderText(/Nhập lý do chi tiết/i);
    fireEvent.change(textarea, {
      target: { value: 'Đã xác minh và gỡ tài liệu vi phạm.' },
    });

    const submitBtn = screen.getByRole('button', { name: /^Xác nhận$/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(reportService.updateReportStatus).toHaveBeenCalledWith('RPT_001', {
        status: 'Resolved',
        handlingNotes: 'Đã xác minh và gỡ tài liệu vi phạm.',
      });
    });

    expect(handleSuccess).toHaveBeenCalled();
    expect(handleClose).toHaveBeenCalled();
  });
});
