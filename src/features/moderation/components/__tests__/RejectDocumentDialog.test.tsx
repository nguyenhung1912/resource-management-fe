import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { moderationService } from '@/services/moderationService';
import { RejectDocumentDialog } from '../RejectDocumentDialog';
import type { ModerationTargetDocument } from '../../types/moderation.types';

vi.mock('@/services/moderationService', () => ({
  moderationService: {
    rejectDocument: vi.fn(),
  },
}));

describe('RejectDocumentDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockDocument: ModerationTargetDocument = {
    fileId: 'FIL_REJECT_001',
    fileName: 'Nghiên cứu Thị giác Máy tính trong Giao thông',
    fileTypeName: 'Khóa luận tốt nghiệp',
    subMajorName: 'Khoa học máy tính',
    departmentName: 'Khoa Công nghệ thông tin',
    uploaderName: 'Lê Văn Cường',
    uploaderEmail: 'cuong.le@university.edu.vn',
    createdAt: '2026-09-12T11:00:00Z',
    fileUrl: 'https://example.com/files/cv-traffic.pdf',
    latestPlagiarismScore: 38.5,
  };

  it('không render nội dung khi isOpen = false hoặc document = null', () => {
    const { rerender } = render(<RejectDocumentDialog isOpen={false} onClose={vi.fn()} document={mockDocument} />);
    expect(screen.queryByText(/Từ chối tài liệu nghiên cứu/i)).not.toBeInTheDocument();

    rerender(<RejectDocumentDialog isOpen={true} onClose={vi.fn()} document={null} />);
    expect(screen.queryByText(/Từ chối tài liệu nghiên cứu/i)).not.toBeInTheDocument();
  });

  it('hiển thị đầy đủ thông tin tài liệu, cảnh báo và giá trị điểm trùng lặp khởi tạo', () => {
    render(<RejectDocumentDialog isOpen={true} onClose={vi.fn()} document={mockDocument} />);

    expect(screen.getByText(/Từ chối tài liệu nghiên cứu/i)).toBeInTheDocument();
    expect(screen.getAllByText(/FIL_REJECT_001/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Nghiên cứu Thị giác Máy tính trong Giao thông/i)).toBeInTheDocument();
    expect(screen.getByText(/Lê Văn Cường/i)).toBeInTheDocument();
    expect(screen.getByText(/\(cuong.le@university.edu.vn\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Lưu ý khi từ chối tài liệu/i)).toBeInTheDocument();
    expect(screen.getByText(/Khiếu nại kiểm duyệt/i)).toBeInTheDocument();

    // Input tỷ lệ trùng lặp được khởi tạo với giá trị 38.5
    const scoreInput = screen.getByPlaceholderText(/Ví dụ: 38.5/i) as HTMLInputElement;
    expect(scoreInput.value).toBe('38.5');
  });

  it('áp dụng mẫu lý do từ chối nhanh khi nhấn vào suggestion chip', () => {
    render(<RejectDocumentDialog isOpen={true} onClose={vi.fn()} document={mockDocument} />);

    const chip = screen.getByRole('button', {
      name: /Độ trùng lặp văn bản vượt quá ngưỡng 30%/i,
    });
    fireEvent.click(chip);

    const textarea = screen.getByPlaceholderText(
      /Nhập lý do từ chối chi tiết để gửi thông báo/i,
    ) as HTMLTextAreaElement;
    expect(textarea.value).toBe('Độ trùng lặp văn bản vượt quá ngưỡng 30%.');
  });

  it('báo lỗi validation khi submit lý do để trống hoặc dưới 10 ký tự', async () => {
    render(<RejectDocumentDialog isOpen={true} onClose={vi.fn()} document={mockDocument} />);

    const textarea = screen.getByPlaceholderText(/Nhập lý do từ chối chi tiết để gửi thông báo/i);
    fireEvent.change(textarea, { target: { value: 'Lỗi' } });

    const submitBtn = screen.getByRole('button', { name: /Xác nhận Từ chối/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Vui lòng nhập lý do từ chối cụ thể với ít nhất 10 ký tự/i)).toBeInTheDocument();
      expect(moderationService.rejectDocument).not.toHaveBeenCalled();
    });
  });

  it('submit từ chối tài liệu thành công với đầy đủ reason, notes, và plagiarismScore', async () => {
    const handleClose = vi.fn();
    const handleSuccess = vi.fn();

    vi.mocked(moderationService.rejectDocument).mockResolvedValueOnce({
      message: 'Từ chối tài liệu thành công.',
      data: {
        fileId: 'FIL_REJECT_001',
        fileStatusId: 3,
        fileStatusName: 'Rejected',
        moderatorUid: 'USR_lecturer01',
        decisionAt: '2026-09-13T07:35:00Z',
        notes: 'Xem lại chương 2 và 3',
      },
    });

    render(
      <RejectDocumentDialog isOpen={true} onClose={handleClose} document={mockDocument} onSuccess={handleSuccess} />,
    );

    const reasonTextarea = screen.getByPlaceholderText(/Nhập lý do từ chối chi tiết để gửi thông báo/i);
    fireEvent.change(reasonTextarea, {
      target: { value: 'Tỷ lệ trùng lặp văn bản quá cao so với quy định.' },
    });

    const notesTextarea = screen.getByPlaceholderText(/Nhập hướng dẫn khắc phục cụ thể/i);
    fireEvent.change(notesTextarea, {
      target: { value: 'Xem lại chương 2 và 3' },
    });

    const submitBtn = screen.getByRole('button', { name: /Xác nhận Từ chối/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(moderationService.rejectDocument).toHaveBeenCalledWith('FIL_REJECT_001', {
        reason: 'Tỷ lệ trùng lặp văn bản quá cao so với quy định.',
        notes: 'Xem lại chương 2 và 3',
        plagiarismScore: 38.5,
      });
      expect(handleSuccess).toHaveBeenCalled();
      expect(handleClose).toHaveBeenCalled();
    });
  });

  it('submit thành công khi bỏ trống ghi chú bổ sung (notes = undefined)', async () => {
    const handleClose = vi.fn();
    const handleSuccess = vi.fn();

    const docNoScore: ModerationTargetDocument = {
      ...mockDocument,
      latestPlagiarismScore: null,
    };

    vi.mocked(moderationService.rejectDocument).mockResolvedValueOnce({
      message: 'Từ chối tài liệu thành công.',
      data: {
        fileId: 'FIL_REJECT_001',
        fileStatusId: 3,
        fileStatusName: 'Rejected',
        moderatorUid: 'USR_lecturer01',
        decisionAt: '2026-09-13T07:35:00Z',
      },
    });

    render(
      <RejectDocumentDialog isOpen={true} onClose={handleClose} document={docNoScore} onSuccess={handleSuccess} />,
    );

    const reasonTextarea = screen.getByPlaceholderText(/Nhập lý do từ chối chi tiết để gửi thông báo/i);
    fireEvent.change(reasonTextarea, {
      target: { value: 'Tài liệu thiếu danh mục tài liệu tham khảo theo chuẩn IEEE.' },
    });

    const submitBtn = screen.getByRole('button', { name: /Xác nhận Từ chối/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(moderationService.rejectDocument).toHaveBeenCalledWith('FIL_REJECT_001', {
        reason: 'Tài liệu thiếu danh mục tài liệu tham khảo theo chuẩn IEEE.',
        notes: undefined,
        plagiarismScore: undefined,
      });
      expect(handleSuccess).toHaveBeenCalled();
      expect(handleClose).toHaveBeenCalled();
    });
  });

  it('hiển thị thông báo lỗi từ server khi backend trả về lỗi', async () => {
    vi.mocked(moderationService.rejectDocument).mockRejectedValueOnce(new Error('Server internal error'));

    render(<RejectDocumentDialog isOpen={true} onClose={vi.fn()} document={mockDocument} />);

    const chip = screen.getByRole('button', {
      name: /Độ trùng lặp văn bản vượt quá ngưỡng 30%/i,
    });
    fireEvent.click(chip);

    const submitBtn = screen.getByRole('button', { name: /Xác nhận Từ chối/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Đã có lỗi xảy ra khi từ chối tài liệu/i)).toBeInTheDocument();
    });
  });

  it('đóng dialog khi nhấn nút Hủy bỏ', () => {
    const handleClose = vi.fn();
    render(<RejectDocumentDialog isOpen={true} onClose={handleClose} document={mockDocument} />);

    const cancelBtn = screen.getByRole('button', { name: /Hủy bỏ/i });
    fireEvent.click(cancelBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
