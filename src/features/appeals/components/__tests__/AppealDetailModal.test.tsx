import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AppealDetailModal } from '../AppealDetailModal';
import type { AppealDetailResponse } from '@/features/appeals/types/appeal.types';

describe('AppealDetailModal', () => {
  const mockDetail: AppealDetailResponse = {
    appealId: 'APL_TEST_100',
    fileId: 'FIL_TEST_200',
    fileName: 'Đồ án Hệ điều hành nâng cao',
    appealAttempt: 1,
    studentExplanation: 'Em xin cam đoan đây là kết quả tự làm và đã trích dẫn đầy đủ.',
    attachmentUrl: 'https://example.com/minh-chung.pdf',
    status: 'Approved',
    assignedLecturerName: 'TS. Nguyễn Thầy',
    lecturerResponse: 'Đã xác minh nguồn tham khảo hợp lệ. Đồng ý duyệt tài liệu.',
    createdAt: '2026-09-10T08:30:00Z',
    resolvedAt: '2026-09-11T09:00:00Z',
    latestRejectionReason: 'Độ tương đồng thuật toán 30%',
    latestPlagiarismScore: 30,
  };

  it('không render khi isOpen = false', () => {
    const { container } = render(
      <AppealDetailModal isOpen={false} onClose={vi.fn()} detail={null} isLoading={false} error={null} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('render đầy đủ thông tin chi tiết của đơn khiếu nại', () => {
    render(<AppealDetailModal isOpen={true} onClose={vi.fn()} detail={mockDetail} isLoading={false} error={null} />);

    expect(screen.getByText(/APL_TEST_100/i)).toBeInTheDocument();
    expect(screen.getAllByText('Đồ án Hệ điều hành nâng cao').length).toBeGreaterThan(0);
    expect(screen.getByText('TS. Nguyễn Thầy')).toBeInTheDocument();
    expect(screen.getByText(/Em xin cam đoan đây là kết quả tự làm/i)).toBeInTheDocument();
    expect(screen.getByText(/Đã xác minh nguồn tham khảo hợp lệ/i)).toBeInTheDocument();
    expect(screen.getByText(/Độ tương đồng thuật toán 30%/i)).toBeInTheDocument();
    expect(screen.getByText(/Tỷ lệ trùng lặp phát hiện/i)).toBeInTheDocument();
    expect(screen.getByText(/Xem tài liệu minh chứng/i)).toBeInTheDocument();
  });

  it('hiển thị trạng thái loading khi isLoading = true', () => {
    render(
      <AppealDetailModal
        isOpen={true}
        onClose={vi.fn()}
        detail={null}
        fallbackItem={mockDetail}
        isLoading={true}
        error={null}
      />,
    );

    expect(screen.getByText(/Đang cập nhật thông tin chi tiết/i)).toBeInTheDocument();
  });

  it('hiển thị thông báo lỗi và nút thử lại khi error được cung cấp', () => {
    const handleRetry = vi.fn();
    render(
      <AppealDetailModal
        isOpen={true}
        onClose={vi.fn()}
        detail={null}
        fallbackItem={mockDetail}
        isLoading={false}
        error="Lỗi kết nối máy chủ"
        onRetry={handleRetry}
      />,
    );

    expect(screen.getByText('Lỗi kết nối máy chủ')).toBeInTheDocument();
    const retryBtn = screen.getByRole('button', { name: /Thử lại/i });
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('gọi onClose khi nhấn nút Đóng', () => {
    const handleClose = vi.fn();
    render(
      <AppealDetailModal isOpen={true} onClose={handleClose} detail={mockDetail} isLoading={false} error={null} />,
    );

    const closeButtons = screen.getAllByRole('button', { name: /Đóng/i });
    expect(closeButtons.length).toBeGreaterThan(0);
    fireEvent.click(closeButtons[0]);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
