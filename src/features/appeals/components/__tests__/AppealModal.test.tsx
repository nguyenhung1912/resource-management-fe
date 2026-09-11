import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { appealService } from '@/services/appealService';
import type { AppealEnvelopeResponse, RejectedResourceContext } from '@/features/appeals/types/appeal.types';
import { AppealModal } from '../AppealModal';

vi.mock('@/services/appealService', () => ({
  appealService: {
    createAppeal: vi.fn(),
  },
}));

const mockResource: RejectedResourceContext = {
  fileId: 'FIL_987654',
  fileName: 'Báo cáo Nghiên cứu Công nghệ Phần mềm',
  rejectionReason: 'Trùng lặp 35% nội dung với khóa luận năm trước.',
  fileTypeName: 'Khóa luận tốt nghiệp',
  fileStatusName: 'Rejected',
};

describe('AppealModal component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('không hiển thị khi isOpen = false hoặc resource = null', () => {
    const { rerender } = render(<AppealModal isOpen={false} onClose={vi.fn()} resource={mockResource} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    rerender(<AppealModal isOpen={true} onClose={vi.fn()} resource={null} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('hiển thị đầy đủ thông tin tài liệu bị từ chối và lý do từ chối', () => {
    render(<AppealModal isOpen={true} onClose={vi.fn()} resource={mockResource} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Gửi đơn giải trình kiểm duyệt')).toBeInTheDocument();
    expect(screen.getByText('Báo cáo Nghiên cứu Công nghệ Phần mềm')).toBeInTheDocument();
    expect(screen.getByText(/Mã: FIL_987654/i)).toBeInTheDocument();
    expect(screen.getByText('Khóa luận tốt nghiệp')).toBeInTheDocument();
    expect(screen.getByText('Bị từ chối')).toBeInTheDocument();
    expect(screen.getByText(/"Trùng lặp 35% nội dung với khóa luận năm trước."/)).toBeInTheDocument();
  });

  it('gửi khiếu nại thành công, kích hoạt onSuccess và đóng modal', async () => {
    const mockCreatedResponse: AppealEnvelopeResponse = {
      message: 'Gửi khiếu nại thành công.',
      data: {
        appealId: 'APL_CREATED_1',
        fileId: mockResource.fileId,
        fileName: mockResource.fileName,
        appealAttempt: 1,
        studentExplanation: 'Em đã bổ sung đầy đủ trích dẫn các tài liệu tham khảo.',
        status: 'Pending',
        createdAt: '2026-09-11T12:00:00Z',
      },
    };

    vi.mocked(appealService.createAppeal).mockResolvedValueOnce(mockCreatedResponse);

    const handleSuccess = vi.fn();
    const handleClose = vi.fn();

    render(<AppealModal isOpen={true} onClose={handleClose} resource={mockResource} onSuccess={handleSuccess} />);

    const textarea = screen.getByLabelText(/nội dung giải trình \/ khiếu nại/i);
    fireEvent.change(textarea, {
      target: { value: 'Em đã bổ sung đầy đủ trích dẫn các tài liệu tham khảo.' },
    });

    const submitBtn = screen.getByRole('button', { name: /gửi giải trình/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(appealService.createAppeal).toHaveBeenCalledWith({
        fileId: mockResource.fileId,
        studentExplanation: 'Em đã bổ sung đầy đủ trích dẫn các tài liệu tham khảo.',
        attachmentUrl: null,
      });
      expect(handleSuccess).toHaveBeenCalledWith(mockCreatedResponse.data);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  it('gọi onClose khi nhấn nút Đóng trên header', () => {
    const handleClose = vi.fn();
    render(<AppealModal isOpen={true} onClose={handleClose} resource={mockResource} />);

    const closeBtn = screen.getByRole('button', { name: /đóng/i });
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
