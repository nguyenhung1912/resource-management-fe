import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { appealService } from '@/services/appealService';
import { AppealResolutionDialog } from '../AppealResolutionDialog';
import type { AppealDetailResponse, AppealItemResponse } from '@/features/appeals/types/appeal.types';

vi.mock('@/services/appealService', () => ({
  appealService: {
    resolveAppeal: vi.fn(),
  },
}));

describe('AppealResolutionDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockAppeal: AppealItemResponse = {
    appealId: 'APL_TEST_101',
    fileId: 'FIL_888',
    fileName: 'Nghiên cứu Thị giác Máy tính',
    fileUrl: 'https://example.com/computer-vision.pdf',
    studentUid: 'USR_SV1',
    studentName: 'Phạm Hồng Nhung',
    studentEmail: 'nhung@example.com',
    appealAttempt: 1,
    studentExplanation: 'Tài liệu đã trích dẫn nguồn đầy đủ theo chuẩn IEEE, xin xem lại.',
    attachmentUrl: 'https://example.com/chung-tu-xac-nhan.pdf',
    status: 'Pending',
    createdAt: '2026-09-12T08:00:00Z',
  };

  const mockDetail: AppealDetailResponse = {
    ...mockAppeal,
    fileStatusId: 3,
    fileStatusName: 'Rejected',
    latestRejectionReason: 'Trùng lặp 35% so với bài nghiên cứu năm 2024',
    latestPlagiarismScore: 35,
  };

  it('không render nội dung khi isOpen = false hoặc appeal = null', () => {
    const { rerender } = render(<AppealResolutionDialog isOpen={false} onClose={vi.fn()} appeal={mockAppeal} />);
    expect(screen.queryByText(/Phân xử khiếu nại/i)).not.toBeInTheDocument();

    rerender(<AppealResolutionDialog isOpen={true} onClose={vi.fn()} appeal={null} />);
    expect(screen.queryByText(/Phân xử khiếu nại/i)).not.toBeInTheDocument();
  });

  it('hiển thị đầy đủ thông tin khiếu nại và kết quả kiểm duyệt ban đầu khi mở dialog', () => {
    render(<AppealResolutionDialog isOpen={true} onClose={vi.fn()} appeal={mockAppeal} detail={mockDetail} />);

    expect(screen.getByText(/Phân xử khiếu nại #APL_TEST_101/i)).toBeInTheDocument();
    expect(screen.getByText(/Phạm Hồng Nhung/i)).toBeInTheDocument();
    expect(screen.getByText(/\(nhung@example.com\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Lần giải trình: 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Tài liệu đã trích dẫn nguồn đầy đủ theo chuẩn IEEE/i)).toBeInTheDocument();
    expect(screen.getByText(/Trùng lặp 35% so với bài nghiên cứu năm 2024/i)).toBeInTheDocument();
    expect(screen.getByText(/Độ trùng lặp AI ghi nhận/i)).toBeInTheDocument();
    expect(screen.getByText(/Mở tài liệu minh chứng sinh viên đính kèm/i)).toBeInTheDocument();
  });

  it('chuyển đổi qua lại giữa Chấp thuận (Duyệt lại) và Bác bỏ (Giữ nguyên từ chối)', () => {
    render(<AppealResolutionDialog isOpen={true} onClose={vi.fn()} appeal={mockAppeal} />);

    const approveRadio = screen.getByRole('radio', { name: /Chấp thuận giải trình/i });
    const rejectRadio = screen.getByRole('radio', { name: /Bác bỏ giải trình/i });

    // Mặc định là duyệt lại
    expect(approveRadio).toHaveAttribute('aria-checked', 'true');
    expect(rejectRadio).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('button', { name: /Xác nhận Duyệt lại/i })).toBeInTheDocument();

    // Chọn bác bỏ
    fireEvent.click(rejectRadio);
    expect(approveRadio).toHaveAttribute('aria-checked', 'false');
    expect(rejectRadio).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('button', { name: /Xác nhận Giữ nguyên từ chối/i })).toBeInTheDocument();

    // Chọn lại chấp thuận
    fireEvent.click(approveRadio);
    expect(approveRadio).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('button', { name: /Xác nhận Duyệt lại/i })).toBeInTheDocument();
  });

  it('áp dụng mẫu nhận xét nhanh khi nhấn vào suggestion chip', () => {
    render(<AppealResolutionDialog isOpen={true} onClose={vi.fn()} appeal={mockAppeal} />);

    const templateButton = screen.getByRole('button', {
      name: /Giải trình hợp lý, minh chứng đối chiếu hợp lệ/i,
    });

    fireEvent.click(templateButton);

    const textarea = screen.getByPlaceholderText(/Nhập lý do chấp thuận giải trình/i) as HTMLTextAreaElement;
    expect(textarea.value).toContain('Giải trình hợp lý, minh chứng đối chiếu hợp lệ');
  });

  it('báo lỗi validation khi để trống nhận xét hoặc nhận xét dưới 10 ký tự', async () => {
    render(<AppealResolutionDialog isOpen={true} onClose={vi.fn()} appeal={mockAppeal} />);

    const submitBtn = screen.getByRole('button', { name: /Xác nhận Duyệt lại/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/Vui lòng nhập nhận xét phân xử với ít nhất 10 ký tự/i)).toBeInTheDocument();
    expect(appealService.resolveAppeal).not.toHaveBeenCalled();
  });

  it('gửi phân xử thành công và kích hoạt callbacks onSuccess, onClose', async () => {
    const handleSuccess = vi.fn();
    const handleClose = vi.fn();

    const mockResponse = {
      message: 'Giải quyết khiếu nại thành công.',
      data: {
        ...mockAppeal,
        status: 'Approved' as const,
        lecturerResponse: 'Giải trình hợp lý. Đồng ý duyệt lại tài liệu.',
      },
    };

    vi.mocked(appealService.resolveAppeal).mockResolvedValueOnce(mockResponse);

    render(
      <AppealResolutionDialog isOpen={true} onClose={handleClose} appeal={mockAppeal} onSuccess={handleSuccess} />,
    );

    const textarea = screen.getByPlaceholderText(/Nhập lý do chấp thuận giải trình/i);
    fireEvent.change(textarea, { target: { value: 'Giải trình hợp lý. Đồng ý duyệt lại tài liệu.' } });

    const submitBtn = screen.getByRole('button', { name: /Xác nhận Duyệt lại/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(appealService.resolveAppeal).toHaveBeenCalledWith('APL_TEST_101', {
        isApproved: true,
        lecturerResponse: 'Giải trình hợp lý. Đồng ý duyệt lại tài liệu.',
      });
      expect(handleSuccess).toHaveBeenCalledWith(mockResponse.data, mockResponse.message);
      expect(handleClose).toHaveBeenCalled();
    });
  });

  it('hiển thị thông báo lỗi khi API giải quyết khiếu nại trả về lỗi', async () => {
    vi.mocked(appealService.resolveAppeal).mockRejectedValueOnce(new Error('Network error'));

    render(<AppealResolutionDialog isOpen={true} onClose={vi.fn()} appeal={mockAppeal} />);

    const textarea = screen.getByPlaceholderText(/Nhập lý do chấp thuận giải trình/i);
    fireEvent.change(textarea, { target: { value: 'Giải trình hợp lý. Đồng ý duyệt lại tài liệu.' } });

    const submitBtn = screen.getByRole('button', { name: /Xác nhận Duyệt lại/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Đã có lỗi xảy ra khi giải quyết khiếu nại/i)).toBeInTheDocument();
  });
});
