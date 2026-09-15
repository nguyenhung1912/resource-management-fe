import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { DocumentModerationHeader } from '../DocumentModerationHeader';
import type { ModerationResourceDetailResponse } from '../../types/moderation.types';

describe('DocumentModerationHeader', () => {
  const mockDocument: ModerationResourceDetailResponse = {
    fileId: 'FIL_TEST_123',
    fileName: 'Nghiên cứu ứng dụng Deep Learning',
    fileDescription: 'Báo cáo chi tiết...',
    fileUrl: 'https://example.com/files/deep-learning.pdf',
    fileTypeId: 1,
    fileTypeName: 'Báo cáo NCKH',
    subMajorCode: 'CNTT_KTPM',
    subMajorName: 'Kỹ thuật phần mềm',
    departmentName: 'Khoa Công nghệ thông tin',
    uploader: {
      uid: 'USR_01',
      fullName: 'Trần Văn Hoàng',
      email: 'hoang@example.com',
    },
    authors: [
      {
        authorId: 'USR_01',
        fullName: 'Trần Văn Hoàng',
        email: 'hoang@example.com',
      },
    ],
    createdAt: '2026-09-12T10:30:00Z',
    latestPlagiarismCheck: null,
  };

  it('render tiêu đề, mã file, loại tài liệu, khoa và chuyên ngành', () => {
    render(
      <MemoryRouter>
        <DocumentModerationHeader document={mockDocument} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Nghiên cứu ứng dụng Deep Learning' })).toBeInTheDocument();
    expect(screen.getByText('#FIL_TEST_123')).toBeInTheDocument();
    expect(screen.getByText('Báo cáo NCKH')).toBeInTheDocument();
    expect(screen.getByText(/Kỹ thuật phần mềm • Khoa Công nghệ thông tin/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Quay lại hàng đợi kiểm duyệt/i })).toHaveAttribute(
      'href',
      '/dashboard/moderation',
    );
  });

  it('kích hoạt onCheckPlagiarism khi người dùng bấm nút Quét trùng lặp AI', () => {
    const handleCheckPlagiarism = vi.fn();

    render(
      <MemoryRouter>
        <DocumentModerationHeader document={mockDocument} onCheckPlagiarism={handleCheckPlagiarism} />
      </MemoryRouter>,
    );

    const checkBtn = screen.getByRole('button', { name: /Quét trùng lặp AI/i });
    fireEvent.click(checkBtn);

    expect(handleCheckPlagiarism).toHaveBeenCalledTimes(1);
  });

  it('hiển thị trạng thái đang quét khi isCheckingPlagiarism = true và vô hiệu hóa nút', () => {
    render(
      <MemoryRouter>
        <DocumentModerationHeader document={mockDocument} isCheckingPlagiarism={true} onCheckPlagiarism={vi.fn()} />
      </MemoryRouter>,
    );

    const checkBtn = screen.getByRole('button', { name: /Quét trùng lặp AI/i });
    expect(checkBtn).toBeDisabled();
  });

  it('kích hoạt onOpenReject và onOpenApprove khi bấm các nút tương ứng', () => {
    const handleReject = vi.fn();
    const handleApprove = vi.fn();

    render(
      <MemoryRouter>
        <DocumentModerationHeader document={mockDocument} onOpenReject={handleReject} onOpenApprove={handleApprove} />
      </MemoryRouter>,
    );

    const rejectBtn = screen.getByRole('button', { name: /Từ chối/i });
    const approveBtn = screen.getByRole('button', { name: /Phê duyệt/i });

    fireEvent.click(rejectBtn);
    expect(handleReject).toHaveBeenCalledTimes(1);

    fireEvent.click(approveBtn);
    expect(handleApprove).toHaveBeenCalledTimes(1);
  });

  it('render đường dẫn tải tệp gốc khi có fileUrl', () => {
    render(
      <MemoryRouter>
        <DocumentModerationHeader document={mockDocument} />
      </MemoryRouter>,
    );

    const downloadLink = screen.getByRole('link', { name: /Tải tệp gốc/i });
    expect(downloadLink).toHaveAttribute('href', 'https://example.com/files/deep-learning.pdf');
    expect(downloadLink).toHaveAttribute('target', '_blank');
  });
});
