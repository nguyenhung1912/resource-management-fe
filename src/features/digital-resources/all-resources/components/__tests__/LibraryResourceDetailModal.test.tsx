import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { ResourceDetailResponse } from '@/features/resources/types/resource.types';
import { LibraryResourceDetailModal } from '../LibraryResourceDetailModal';

describe('LibraryResourceDetailModal', () => {
  const mockDetail: ResourceDetailResponse = {
    fileId: 'FIL_MODAL_001',
    fileName: 'Nghiên cứu Kiến trúc Vi dịch vụ',
    fileDescription: 'Phân tích các mẫu thiết kế Microservices với Spring Boot và Kubernetes',
    fileUrl: 'https://example.com/ms.pdf',
    fileTypeId: 1,
    fileTypeName: 'Khóa luận tốt nghiệp',
    fileStatusId: 2,
    fileStatusName: 'Approved',
    majorId: 'CNTT',
    majorName: 'Công nghệ Thông tin',
    subMajorCode: 'CNTT_KTPM',
    subMajorName: 'Kỹ thuật phần mềm',
    courseCode: 'IT4020',
    courseName: 'Kiến trúc phần mềm',
    yearCompleted: 2026,
    uploadUserId: 'USR_01',
    uploadUserName: 'Trần Văn B',
    githubLink: 'https://github.com/example/microservices',
    bannerImage: 'https://example.com/banner-modal.jpg',
    fileSize: 3145728, // 3 MB
    createdAt: '2026-09-15T08:00:00Z',
    keywords: ['Microservices', 'Spring Boot', 'Kubernetes'],
    authorNames: ['Trần Văn B', 'Nguyễn Thị C'],
    authors: [
      { id: '1', fullName: 'Trần Văn B' },
      { id: '2', fullName: 'Nguyễn Thị C' },
    ],
  };

  it('không render gì khi isOpen là false', () => {
    const { container } = render(
      <MemoryRouter>
        <LibraryResourceDetailModal
          isOpen={false}
          isLoading={false}
          detail={null}
          onClose={vi.fn()}
          onDownload={vi.fn()}
        />
      </MemoryRouter>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('hiển thị trạng thái loading khi isLoading là true', () => {
    render(
      <MemoryRouter>
        <LibraryResourceDetailModal
          isOpen={true}
          isLoading={true}
          detail={null}
          onClose={vi.fn()}
          onDownload={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText(/đang nạp thông tin chi tiết tài liệu/i)).toBeInTheDocument();
  });

  it('hiển thị thông báo lỗi khi error có giá trị', () => {
    render(
      <MemoryRouter>
        <LibraryResourceDetailModal
          isOpen={true}
          isLoading={false}
          detail={null}
          error="Không thể kết nối đến máy chủ"
          onClose={vi.fn()}
          onDownload={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Không thể tải thông tin tài liệu')).toBeInTheDocument();
    expect(screen.getByText('Không thể kết nối đến máy chủ')).toBeInTheDocument();
  });

  it('render đầy đủ nội dung chi tiết tài liệu, metadata, tác giả, từ khóa và khung bình luận bên cạnh', () => {
    render(
      <MemoryRouter>
        <LibraryResourceDetailModal
          isOpen={true}
          isLoading={false}
          detail={mockDetail}
          onClose={vi.fn()}
          onDownload={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Nghiên cứu Kiến trúc Vi dịch vụ')).toBeInTheDocument();
    expect(
      screen.getByText('Phân tích các mẫu thiết kế Microservices với Spring Boot và Kubernetes'),
    ).toBeInTheDocument();
    expect(screen.getByText('Kỹ thuật phần mềm')).toBeInTheDocument();
    expect(screen.getByText('Kiến trúc phần mềm')).toBeInTheDocument();
    expect(screen.getByText('3.0 MB')).toBeInTheDocument();
    expect(screen.getAllByText('Trần Văn B').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Nguyễn Thị C')).toBeInTheDocument();
    expect(screen.getByText('Microservices')).toBeInTheDocument();
    expect(screen.getByText('Spring Boot')).toBeInTheDocument();
    expect(screen.getByText(/xem kho mã nguồn trên github/i)).toBeInTheDocument();

    // Khung bình luận bên cạnh
    expect(screen.getByText('Bình luận & Thảo luận')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /khu vực bình luận và thảo luận tài liệu/i })).toBeInTheDocument();
  });

  it('kích hoạt onClose khi nhấn nút Đóng', () => {
    const handleClose = vi.fn();
    render(
      <MemoryRouter>
        <LibraryResourceDetailModal
          isOpen={true}
          isLoading={false}
          detail={mockDetail}
          onClose={handleClose}
          onDownload={vi.fn()}
        />
      </MemoryRouter>,
    );

    const closeButtons = screen.getAllByRole('button', { name: 'Đóng' });
    fireEvent.click(closeButtons[0]);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('kích hoạt onDownload khi nhấn nút Tải xuống tài liệu', () => {
    const handleDownload = vi.fn();
    render(
      <MemoryRouter>
        <LibraryResourceDetailModal
          isOpen={true}
          isLoading={false}
          detail={mockDetail}
          onClose={vi.fn()}
          onDownload={handleDownload}
        />
      </MemoryRouter>,
    );

    const downloadButton = screen.getByRole('button', {
      name: /tải xuống tài liệu nghiên cứu kiến trúc vi dịch vụ/i,
    });
    fireEvent.click(downloadButton);
    expect(handleDownload).toHaveBeenCalledWith('FIL_MODAL_001', 'Nghiên cứu Kiến trúc Vi dịch vụ');
  });
});
