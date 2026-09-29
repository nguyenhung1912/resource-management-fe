import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ModerationQueueTable } from '../ModerationQueueTable';
import type { ModerationResourceItemResponse } from '../../types/moderation.types';

const mockItems: ModerationResourceItemResponse[] = [
  {
    fileId: 'FIL_ROW_1',
    fileName: 'Khóa luận Tốt nghiệp CNTT',
    fileDescription: 'Mô tả chi tiết khóa luận',
    fileUrl: 'https://example.com/doc1.pdf',
    fileTypeId: 1,
    fileTypeName: 'Khóa luận',
    subMajorCode: 'CNTT_KTPM',
    subMajorName: 'Kỹ thuật phần mềm',
    uploaderName: 'Nguyễn Văn A',
    uploaderEmail: 'nguyenvana@gmail.com',
    fileStatusId: 1,
    fileStatusName: 'Pending',
    createdAt: '2026-09-18T08:00:00Z',
    latestPlagiarismScore: 14.2,
  },
  {
    fileId: 'FIL_ROW_2',
    fileName: 'Báo cáo Học máy Nâng cao',
    fileDescription: 'Báo cáo nghiên cứu mô hình Transformer',
    fileUrl: '',
    fileTypeId: 2,
    fileTypeName: 'Báo cáo',
    subMajorCode: 'CNTT_KHMT',
    subMajorName: 'Khoa học máy tính',
    uploaderName: 'Lê Thị B',
    uploaderEmail: 'lethib@gmail.com',
    fileStatusId: 1,
    fileStatusName: 'Pending',
    createdAt: '2026-09-19T09:30:00Z',
    latestPlagiarismScore: null,
  },
];

describe('ModerationQueueTable', () => {
  it('hiển thị ModerationQueueEmptyState khi danh sách rỗng', () => {
    render(
      <ModerationQueueTable
        items={[]}
        onCheckPlagiarism={vi.fn()}
        onApprove={vi.fn()}
        onReject={vi.fn()}
        onViewDetail={vi.fn()}
      />,
    );

    expect(screen.getByText('Hàng đợi kiểm duyệt đang trống')).toBeInTheDocument();
  });

  it('hiển thị thông báo không tìm thấy kết quả và nút Đặt lại khi danh sách rỗng và có active filters', () => {
    const handleReset = vi.fn();
    render(
      <ModerationQueueTable
        items={[]}
        hasActiveFilters={true}
        onResetFilters={handleReset}
        onCheckPlagiarism={vi.fn()}
        onApprove={vi.fn()}
        onReject={vi.fn()}
        onViewDetail={vi.fn()}
      />,
    );

    expect(screen.getByText('Không tìm thấy tài liệu phù hợp')).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: 'Đặt lại bộ lọc' });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(handleReset).toHaveBeenCalled();
  });

  it('render đầy đủ danh sách tài liệu trong bảng', () => {
    render(
      <ModerationQueueTable
        items={mockItems}
        onCheckPlagiarism={vi.fn()}
        onApprove={vi.fn()}
        onReject={vi.fn()}
        onViewDetail={vi.fn()}
      />,
    );

    expect(screen.getAllByText('Khóa luận Tốt nghiệp CNTT').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Báo cáo Học máy Nâng cao').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Nguyễn Văn A').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Lê Thị B').length).toBeGreaterThan(0);
  });

  it('gọi onViewDetail khi click vào tên tài liệu', () => {
    const handleViewDetail = vi.fn();
    render(
      <ModerationQueueTable
        items={mockItems}
        onCheckPlagiarism={vi.fn()}
        onApprove={vi.fn()}
        onReject={vi.fn()}
        onViewDetail={handleViewDetail}
      />,
    );

    const titleButtons = screen.getAllByRole('button', { name: 'Khóa luận Tốt nghiệp CNTT' });
    fireEvent.click(titleButtons[0]);
    expect(handleViewDetail).toHaveBeenCalledWith('FIL_ROW_1');
  });

  it('truyền đúng trạng thái isCheckingPlagiarism theo checkingPlagiarismFileIds', () => {
    const checkingIds = new Set(['FIL_ROW_1']);
    render(
      <ModerationQueueTable
        items={mockItems}
        checkingPlagiarismFileIds={checkingIds}
        onCheckPlagiarism={vi.fn()}
        onApprove={vi.fn()}
        onReject={vi.fn()}
        onViewDetail={vi.fn()}
      />,
    );

    const scanButtons = screen.getAllByRole('button', {
      name: `Kích hoạt quét AI cho tài liệu ${mockItems[0].fileName}`,
    });
    expect(scanButtons[0]).toBeDisabled();
  });

  it('hiển thị chính xác tên người tải khi dữ liệu trả về dạng object uploader.fullName', () => {
    const itemWithUploaderDto: ModerationResourceItemResponse = {
      fileId: 'FIL_ROW_3',
      fileName: 'Nghiên cứu Deep Learning',
      fileTypeId: 1,
      fileTypeName: 'Khóa luận',
      uploader: {
        uid: 'user-123',
        fullName: 'Trần Văn Cao',
        email: 'caotran@gmail.com',
      },
      fileStatusId: 1,
      createdAt: '2026-09-29T08:30:00Z',
    };

    render(
      <ModerationQueueTable
        items={[itemWithUploaderDto]}
        onCheckPlagiarism={vi.fn()}
        onApprove={vi.fn()}
        onReject={vi.fn()}
        onViewDetail={vi.fn()}
      />,
    );

    expect(screen.getAllByText('Trần Văn Cao').length).toBeGreaterThan(0);
  });
});
