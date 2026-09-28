import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SourceCodeDetailModal } from '../SourceCodeDetailModal';
import type { SourceCodeDetail } from '../../types/source-code.types';

const mockDetail: SourceCodeDetail = {
  fileId: 'FIL_TEST_100',
  fileName: 'Nghiên cứu Thị giác Máy tính',
  fileDescription: 'Đề tài ứng dụng AI phát hiện biển báo giao thông.',
  fileUrl: 'https://example.com/vision.zip',
  fileTypeId: 5,
  fileTypeName: 'Mã nguồn',
  subMajorCode: 'CNTT_AI',
  subMajorName: 'Trí tuệ nhân tạo',
  majorName: 'Công nghệ thông tin',
  departmentName: 'Khoa CNTT',
  courseCode: 'IT4020',
  courseName: 'Thị giác máy tính',
  yearCompleted: 2026,
  githubLink: 'https://github.com/vision/traffic-signs',
  bannerUrl: 'https://example.com/banner.jpg',
  fileStatusId: 2,
  fileStatusName: 'Đã duyệt',
  uploadUserId: 'USR_099',
  uploadUserName: 'Trần Văn B',
  uploadUserEmail: 'b@example.com',
  createdAt: '2026-09-20T00:00:00Z',
  updatedAt: null,
  authors: [
    { id: 'AUTH_01', fullName: 'Trần Văn B' },
    { id: 'AUTH_02', fullName: 'Lê Thị C' },
  ],
  keywords: [
    { id: 1, keyword: 'YOLOv8' },
    { id: 2, keyword: 'OpenCV' },
  ],
  ratingSummary: {
    averageRating: 4.9,
    totalRatings: 28,
  },
};

describe('SourceCodeDetailModal', () => {
  it('không render khi isOpen = false', () => {
    render(
      <SourceCodeDetailModal
        isOpen={false}
        isLoading={false}
        detail={mockDetail}
        onClose={vi.fn()}
        onDownload={vi.fn()}
      />,
    );

    expect(screen.queryByText('Nghiên cứu Thị giác Máy tính')).not.toBeInTheDocument();
  });

  it('hiển thị trạng thái loading khi isLoading = true', () => {
    render(<SourceCodeDetailModal isOpen isLoading detail={null} onClose={vi.fn()} onDownload={vi.fn()} />);

    expect(screen.getByText('Đang tải thông tin chi tiết dự án...')).toBeInTheDocument();
  });

  it('hiển thị thông báo lỗi khi có lỗi xảy ra', () => {
    render(
      <SourceCodeDetailModal
        isOpen
        isLoading={false}
        detail={null}
        error="Lỗi kết nối máy chủ"
        onClose={vi.fn()}
        onDownload={vi.fn()}
      />,
    );

    expect(screen.getByText('Lỗi kết nối máy chủ')).toBeInTheDocument();
  });

  it('render đầy đủ thông tin chi tiết đề tài, tác giả, tags, và hộp thông tin GitHub', () => {
    render(
      <SourceCodeDetailModal isOpen isLoading={false} detail={mockDetail} onClose={vi.fn()} onDownload={vi.fn()} />,
    );

    expect(screen.getByText('Nghiên cứu Thị giác Máy tính')).toBeInTheDocument();
    expect(screen.getByText('Đề tài ứng dụng AI phát hiện biển báo giao thông.')).toBeInTheDocument();
    expect(screen.getByText('Khoa CNTT')).toBeInTheDocument();
    expect(screen.getByText('Trí tuệ nhân tạo')).toBeInTheDocument();
    expect(screen.getByText('Thị giác máy tính')).toBeInTheDocument();
    expect(screen.getAllByText('Trần Văn B')).toHaveLength(2);
    expect(screen.getByText('Lê Thị C')).toBeInTheDocument();
    expect(screen.getByText('#YOLOv8')).toBeInTheDocument();
    expect(screen.getByText('#OpenCV')).toBeInTheDocument();
    expect(screen.getByText('4.9')).toBeInTheDocument();
    expect(screen.getByText('(28 lượt đánh giá)')).toBeInTheDocument();
    expect(screen.getByText('https://github.com/vision/traffic-signs')).toBeInTheDocument();
  });

  it('gọi callback onClose khi bấm nút Đóng', () => {
    const handleClose = vi.fn();
    render(
      <SourceCodeDetailModal isOpen isLoading={false} detail={mockDetail} onClose={handleClose} onDownload={vi.fn()} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Đóng hộp thoại chi tiết' }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('gọi callback onDownload khi bấm nút Tải mã nguồn', () => {
    const handleDownload = vi.fn();
    render(
      <SourceCodeDetailModal
        isOpen
        isLoading={false}
        detail={mockDetail}
        onClose={vi.fn()}
        onDownload={handleDownload}
      />,
    );

    const downloadButton = screen.getByRole('button', {
      name: 'Tải xuống mã nguồn Nghiên cứu Thị giác Máy tính',
    });
    fireEvent.click(downloadButton);
    expect(handleDownload).toHaveBeenCalledWith('FIL_TEST_100', 'Nghiên cứu Thị giác Máy tính');
  });
});
