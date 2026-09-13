import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { moderationService } from '@/services/moderationService';
import { ApproveDocumentDialog } from '../ApproveDocumentDialog';
import type { ModerationTargetDocument } from '../../types/moderation.types';

vi.mock('@/services/moderationService', () => ({
  moderationService: {
    approveDocument: vi.fn(),
  },
}));

describe('ApproveDocumentDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockDocument: ModerationTargetDocument = {
    fileId: 'FIL_TEST_001',
    fileName: 'Nghiên cứu ứng dụng Học máy trong Y tế',
    fileTypeName: 'Báo cáo NCKH',
    subMajorName: 'Kỹ thuật phần mềm',
    departmentName: 'Khoa Công nghệ thông tin',
    uploaderName: 'Trần Văn Hoàng',
    uploaderEmail: 'hoang.tran@university.edu.vn',
    createdAt: '2026-09-12T10:30:00Z',
    fileUrl: 'https://example.com/files/nckh-y-te.pdf',
    latestPlagiarismScore: 14.8,
  };

  it('không render nội dung khi isOpen = false hoặc document = null', () => {
    const { rerender } = render(<ApproveDocumentDialog isOpen={false} onClose={vi.fn()} document={mockDocument} />);
    expect(screen.queryByText(/Phê duyệt tài liệu/i)).not.toBeInTheDocument();

    rerender(<ApproveDocumentDialog isOpen={true} onClose={vi.fn()} document={null} />);
    expect(screen.queryByText(/Phê duyệt tài liệu/i)).not.toBeInTheDocument();
  });

  it('hiển thị đầy đủ thông tin tài liệu và tỷ lệ trùng lặp AI khi mở dialog', () => {
    render(<ApproveDocumentDialog isOpen={true} onClose={vi.fn()} document={mockDocument} />);

    expect(screen.getByText(/Phê duyệt tài liệu/i)).toBeInTheDocument();
    expect(screen.getAllByText(/FIL_TEST_001/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Nghiên cứu ứng dụng Học máy trong Y tế/i)).toBeInTheDocument();
    expect(screen.getByText(/Trần Văn Hoàng/i)).toBeInTheDocument();
    expect(screen.getByText(/\(hoang.tran@university.edu.vn\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Kỹ thuật phần mềm • Khoa Công nghệ thông tin/i)).toBeInTheDocument();
    expect(screen.getByText(/Trùng lặp 14.8% \(Thấp\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Xem file/i)).toBeInTheDocument();
    expect(screen.getByText(/Xác nhận công khai tài liệu/i)).toBeInTheDocument();
  });

  it('hiển thị badge phù hợp khi điểm trùng lặp cao (>30%) hoặc chưa quét', () => {
    const docHighPlagiarism: ModerationTargetDocument = {
      ...mockDocument,
      latestPlagiarismScore: 35.5,
    };

    const { rerender } = render(<ApproveDocumentDialog isOpen={true} onClose={vi.fn()} document={docHighPlagiarism} />);
    expect(screen.getByText(/Trùng lặp 35.5% \(Vượt ngưỡng\)/i)).toBeInTheDocument();

    const docNoPlagiarism: ModerationTargetDocument = {
      ...mockDocument,
      latestPlagiarismScore: null,
    };
    rerender(<ApproveDocumentDialog isOpen={true} onClose={vi.fn()} document={docNoPlagiarism} />);
    expect(screen.getByText(/Chưa quét AI/i)).toBeInTheDocument();
  });

  it('điền nhanh ghi chú khi nhấn vào suggestion chip', () => {
    render(<ApproveDocumentDialog isOpen={true} onClose={vi.fn()} document={mockDocument} />);

    const chip = screen.getByRole('button', {
      name: /Tài liệu đạt yêu cầu chuẩn/i,
    });
    fireEvent.click(chip);

    const textarea = screen.getByPlaceholderText(/Nhập ghi chú hoặc lời nhận xét/i) as HTMLTextAreaElement;
    expect(textarea.value).toBe('Tài liệu đạt yêu cầu chuẩn, tỷ lệ trùng lặp trong ngưỡng cho phép.');
  });

  it('submit phê duyệt tài liệu thành công và gọi callbacks onSuccess, onClose', async () => {
    const handleClose = vi.fn();
    const handleSuccess = vi.fn();

    vi.mocked(moderationService.approveDocument).mockResolvedValueOnce({
      message: 'Phê duyệt tài liệu thành công.',
      data: {
        fileId: 'FIL_TEST_001',
        fileStatusId: 2,
        fileStatusName: 'Approved',
        moderatorUid: 'USR_lecturer01',
        decisionAt: '2026-09-13T07:30:00Z',
        notes: 'Đạt chuẩn',
      },
    });

    render(
      <ApproveDocumentDialog isOpen={true} onClose={handleClose} document={mockDocument} onSuccess={handleSuccess} />,
    );

    const textarea = screen.getByPlaceholderText(/Nhập ghi chú hoặc lời nhận xét/i);
    fireEvent.change(textarea, { target: { value: 'Đạt chuẩn' } });

    const submitBtn = screen.getByRole('button', { name: /Xác nhận Phê duyệt/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(moderationService.approveDocument).toHaveBeenCalledWith('FIL_TEST_001', {
        notes: 'Đạt chuẩn',
      });
      expect(handleSuccess).toHaveBeenCalled();
      expect(handleClose).toHaveBeenCalled();
    });
  });

  it('submit thành công khi không nhập ghi chú (notes = undefined)', async () => {
    const handleClose = vi.fn();
    const handleSuccess = vi.fn();

    vi.mocked(moderationService.approveDocument).mockResolvedValueOnce({
      message: 'Phê duyệt thành công.',
      data: {
        fileId: 'FIL_TEST_001',
        fileStatusId: 2,
        fileStatusName: 'Approved',
        moderatorUid: 'USR_lecturer01',
        decisionAt: '2026-09-13T07:30:00Z',
      },
    });

    render(
      <ApproveDocumentDialog isOpen={true} onClose={handleClose} document={mockDocument} onSuccess={handleSuccess} />,
    );

    const submitBtn = screen.getByRole('button', { name: /Xác nhận Phê duyệt/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(moderationService.approveDocument).toHaveBeenCalledWith('FIL_TEST_001', {
        notes: undefined,
      });
      expect(handleSuccess).toHaveBeenCalled();
      expect(handleClose).toHaveBeenCalled();
    });
  });

  it('hiển thị thông báo lỗi khi backend trả về lỗi', async () => {
    vi.mocked(moderationService.approveDocument).mockRejectedValueOnce(new Error('Network error'));

    render(<ApproveDocumentDialog isOpen={true} onClose={vi.fn()} document={mockDocument} />);

    const submitBtn = screen.getByRole('button', { name: /Xác nhận Phê duyệt/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Đã có lỗi xảy ra khi phê duyệt tài liệu/i)).toBeInTheDocument();
    });
  });

  it('đóng dialog khi nhấn nút Hủy bỏ', () => {
    const handleClose = vi.fn();
    render(<ApproveDocumentDialog isOpen={true} onClose={handleClose} document={mockDocument} />);

    const cancelBtn = screen.getByRole('button', { name: /Hủy bỏ/i });
    fireEvent.click(cancelBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
