import { act, fireEvent, render, screen } from '@testing-library/react';
import axios, { type InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { reportService } from '@/services/reportService';
import { clearReportTypesCache } from '@/features/reports/hooks/useReportTypes';
import { ReportViolationModal } from '../ReportViolationModal';
import type {
  CommentTargetContext,
  FileTargetContext,
  ReportMutationResponse,
  ReportTypeResponse,
  UserTargetContext,
} from '@/features/reports/types/report.types';

vi.mock('@/services/reportService', () => ({
  reportService: {
    getReportTypes: vi.fn(),
    createReport: vi.fn(),
  },
}));

describe('ReportViolationModal', () => {
  const mockTypes: ReportTypeResponse[] = [
    {
      reportTypeId: 1,
      reportTypeName: 'Vi phạm bản quyền',
      description: 'Sao chép trái phép luận văn hoặc tài liệu.',
    },
    {
      reportTypeId: 2,
      reportTypeName: 'Nội dung phản cảm / Rác',
      description: 'Quảng cáo thương mại hoặc ngôn từ không chuẩn mực.',
    },
  ];

  const mockFileTarget: FileTargetContext = {
    type: 'File',
    id: 'FIL_TEST_100',
    title: 'Nghiên cứu kiến trúc Vi xử lý hiện đại',
    authorName: 'TS. Nguyễn Văn A',
    departmentName: 'Khoa Điện tử - Viễn thông',
  };

  const mockCommentTarget: CommentTargetContext = {
    type: 'Comment',
    id: 'COM_TEST_200',
    content: 'Bình luận chứa ngôn từ gây chia rẽ.',
    authorName: 'Sinh viên B',
    fileId: 'FIL_TEST_100',
    fileTitle: 'Nghiên cứu kiến trúc Vi xử lý hiện đại',
  };

  const mockUserTarget: UserTargetContext = {
    type: 'User',
    id: 'USR_TEST_300',
    fullName: 'Lê Văn C',
    userCode: '20261234',
    roleName: 'Sinh viên',
    departmentName: 'Khoa Công nghệ Thông tin',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    clearReportTypesCache();
    vi.mocked(reportService.getReportTypes).mockResolvedValue(mockTypes);
  });

  it('không render khi isOpen = false', () => {
    render(<ReportViolationModal isOpen={false} onClose={vi.fn()} target={mockFileTarget} />);

    expect(screen.queryByText('Báo cáo nội dung vi phạm')).not.toBeInTheDocument();
  });

  it('không render khi target = null', () => {
    render(<ReportViolationModal isOpen={true} onClose={vi.fn()} target={null} />);

    expect(screen.queryByText('Báo cáo nội dung vi phạm')).not.toBeInTheDocument();
  });

  it('render đầy đủ tiêu đề, tóm tắt tài liệu và các trường khi mở modal', async () => {
    render(
      <ReportViolationModal isOpen={true} onClose={vi.fn()} target={mockFileTarget} initialReportTypes={mockTypes} />,
    );

    expect(screen.getByText('Báo cáo nội dung vi phạm')).toBeInTheDocument();
    expect(screen.getByText('Nghiên cứu kiến trúc Vi xử lý hiện đại')).toBeInTheDocument();
    expect(screen.getByText('TS. Nguyễn Văn A')).toBeInTheDocument();
    expect(screen.getByText('Vi phạm bản quyền')).toBeInTheDocument();
    expect(screen.getByText('Nội dung phản cảm / Rác')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Gửi báo cáo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Hủy bỏ/i })).toBeInTheDocument();
  });

  it('render tóm tắt bình luận khi target là Comment', () => {
    render(
      <ReportViolationModal
        isOpen={true}
        onClose={vi.fn()}
        target={mockCommentTarget}
        initialReportTypes={mockTypes}
      />,
    );

    expect(screen.getByText('Bình luận')).toBeInTheDocument();
    expect(screen.getByText('Sinh viên B')).toBeInTheDocument();
    expect(screen.getByText(/Bình luận chứa ngôn từ gây chia rẽ/)).toBeInTheDocument();
  });

  it('render tóm tắt người dùng khi target là User', () => {
    render(
      <ReportViolationModal isOpen={true} onClose={vi.fn()} target={mockUserTarget} initialReportTypes={mockTypes} />,
    );

    expect(screen.getByText('Người dùng')).toBeInTheDocument();
    expect(screen.getByText('Lê Văn C')).toBeInTheDocument();
    expect(screen.getByText('20261234')).toBeInTheDocument();
  });

  it('hiển thị lỗi validation khi submit form rỗng', async () => {
    render(
      <ReportViolationModal isOpen={true} onClose={vi.fn()} target={mockFileTarget} initialReportTypes={mockTypes} />,
    );

    const submitBtn = screen.getByRole('button', { name: /Gửi báo cáo/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText('Vui lòng chọn loại vi phạm.')).toBeInTheDocument();
    expect(screen.getByText('Vui lòng nhập nội dung chi tiết vi phạm.')).toBeInTheDocument();
    expect(reportService.createReport).not.toHaveBeenCalled();
  });

  it('hiển thị lỗi khi nội dung báo cáo ngắn hơn 20 ký tự', async () => {
    render(
      <ReportViolationModal isOpen={true} onClose={vi.fn()} target={mockFileTarget} initialReportTypes={mockTypes} />,
    );

    // Chọn loại vi phạm
    const option1 = screen.getByRole('radio', { name: /Vi phạm bản quyền/i });
    fireEvent.click(option1);

    // Nhập nội dung ngắn (7 ký tự)
    const textarea = screen.getByRole('textbox', { name: /Mô tả chi tiết vi phạm/i });
    fireEvent.change(textarea, { target: { value: 'Quá ngắn' } });

    const submitBtn = screen.getByRole('button', { name: /Gửi báo cáo/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Nội dung vi phạm phải có ít nhất 20 ký tự/i)).toBeInTheDocument();
    expect(reportService.createReport).not.toHaveBeenCalled();
  });

  it('gửi báo cáo tài liệu thành công, gọi API đúng payload và đóng modal', async () => {
    const handleSuccess = vi.fn();
    const handleClose = vi.fn();

    const mockResponse: ReportMutationResponse = {
      message: 'Gửi báo cáo thành công.',
      data: {
        reportId: 'RPT_RES_01',
        reporterUid: 'USR_TEST',
        reporterName: 'Tester',
        targetType: 'File',
        targetId: 'FIL_TEST_100',
        reportTypeId: 1,
        reportTypeName: 'Vi phạm bản quyền',
        reason: 'Tài liệu sao chép toàn bộ nội dung từ công trình khác.',
        status: 'Pending',
        createdAt: '2026-09-22T10:00:00Z',
      },
    };

    vi.mocked(reportService.createReport).mockResolvedValueOnce(mockResponse);

    render(
      <ReportViolationModal
        isOpen={true}
        onClose={handleClose}
        target={mockFileTarget}
        onSuccess={handleSuccess}
        initialReportTypes={mockTypes}
      />,
    );

    // Chọn loại vi phạm
    const option1 = screen.getByRole('radio', { name: /Vi phạm bản quyền/i });
    fireEvent.click(option1);

    // Nhập lý do hợp lệ (> 20 ký tự)
    const textarea = screen.getByRole('textbox', { name: /Mô tả chi tiết vi phạm/i });
    fireEvent.change(textarea, {
      target: { value: 'Tài liệu sao chép toàn bộ nội dung từ công trình khác.' },
    });

    const submitBtn = screen.getByRole('button', { name: /Gửi báo cáo/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(reportService.createReport).toHaveBeenCalledWith({
      reportTypeId: 1,
      reportContent: 'Tài liệu sao chép toàn bộ nội dung từ công trình khác.',
      targetType: 'File',
      targetId: 'FIL_TEST_100',
      fileId: 'FIL_TEST_100',
    });

    expect(handleSuccess).toHaveBeenCalledWith(mockResponse);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('gửi báo cáo bình luận thành công kèm fileId và commentId', async () => {
    const handleSuccess = vi.fn();
    const handleClose = vi.fn();

    vi.mocked(reportService.createReport).mockResolvedValueOnce({
      message: 'Gửi báo cáo thành công.',
    });

    render(
      <ReportViolationModal
        isOpen={true}
        onClose={handleClose}
        target={mockCommentTarget}
        onSuccess={handleSuccess}
        initialReportTypes={mockTypes}
      />,
    );

    const option2 = screen.getByRole('radio', { name: /Nội dung phản cảm \/ Rác/i });
    fireEvent.click(option2);

    const textarea = screen.getByRole('textbox', { name: /Mô tả chi tiết vi phạm/i });
    fireEvent.change(textarea, {
      target: { value: 'Bình luận dùng từ ngữ thô tục xúc phạm danh dự người khác.' },
    });

    const submitBtn = screen.getByRole('button', { name: /Gửi báo cáo/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(reportService.createReport).toHaveBeenCalledWith({
      reportTypeId: 2,
      reportContent: 'Bình luận dùng từ ngữ thô tục xúc phạm danh dự người khác.',
      targetType: 'Comment',
      targetId: 'COM_TEST_200',
      commentId: 'COM_TEST_200',
      fileId: 'FIL_TEST_100',
    });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('hiển thị thông báo lỗi từ backend khi trùng lặp báo cáo (409 Conflict)', async () => {
    const axiosError = new axios.AxiosError(
      'Request failed with status code 409',
      'ERR_CONFLICT',
      undefined,
      undefined,
      {
        status: 409,
        statusText: 'Conflict',
        headers: {},
        config: {} as unknown as InternalAxiosRequestConfig,
        data: {
          message: 'Bạn đã gửi báo cáo cho đối tượng này và báo cáo đang chờ xử lý.',
        },
      },
    );

    vi.mocked(reportService.createReport).mockRejectedValueOnce(axiosError);

    render(
      <ReportViolationModal isOpen={true} onClose={vi.fn()} target={mockFileTarget} initialReportTypes={mockTypes} />,
    );

    fireEvent.click(screen.getByRole('radio', { name: /Vi phạm bản quyền/i }));
    fireEvent.change(screen.getByRole('textbox', { name: /Mô tả chi tiết vi phạm/i }), {
      target: { value: 'Tài liệu sao chép toàn bộ nội dung từ công trình khác.' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Gửi báo cáo/i }));
    });

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Bạn đã gửi báo cáo cho đối tượng này và báo cáo đang chờ xử lý.')).toBeInTheDocument();
  });

  it('đóng modal khi người dùng nhấn nút Hủy bỏ', () => {
    const handleClose = vi.fn();

    render(
      <ReportViolationModal
        isOpen={true}
        onClose={handleClose}
        target={mockFileTarget}
        initialReportTypes={mockTypes}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Hủy bỏ/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
