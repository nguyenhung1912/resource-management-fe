import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DocumentMetadataCard } from '../DocumentMetadataCard';
import type { ModerationResourceDetailResponse } from '../../types/moderation.types';

describe('DocumentMetadataCard', () => {
  const mockDocument: ModerationResourceDetailResponse = {
    fileId: 'FIL_META_001',
    fileName: 'Nghiên cứu về IoT trong Nông nghiệp',
    fileDescription: 'Báo cáo ứng dụng cảm biến độ ẩm và nhiệt độ...',
    fileUrl: 'https://example.com/files/iot.pdf',
    fileTypeId: 2,
    fileTypeName: 'Khóa luận tốt nghiệp',
    subMajorCode: 'CNTT_HTTT',
    subMajorName: 'Hệ thống thông tin',
    departmentName: 'Khoa Công nghệ thông tin',
    uploader: {
      uid: 'USR_SV001',
      fullName: 'Phạm Minh Tuấn',
      email: 'tuan.pham@student.edu.vn',
    },
    authors: [
      {
        authorId: 'USR_SV001',
        fullName: 'Phạm Minh Tuấn',
        email: 'tuan.pham@student.edu.vn',
        affiliation: 'Trường Đại học Quy Nhơn',
      },
      {
        authorId: 'USR_GV002',
        authorName: 'TS. Nguyễn Văn Hướng Dẫn',
        email: 'huongdan@university.edu.vn',
      },
    ],
    createdAt: '2026-09-10T08:15:00Z',
  };

  it('render đầy đủ khoa, chuyên ngành, loại tài liệu và mã định danh file', () => {
    render(<DocumentMetadataCard document={mockDocument} />);

    expect(screen.getByText('Khoa Công nghệ thông tin')).toBeInTheDocument();
    expect(screen.getByText(/Hệ thống thông tin/i)).toBeInTheDocument();
    expect(screen.getByText('(CNTT_HTTT)')).toBeInTheDocument();
    expect(screen.getByText('Khóa luận tốt nghiệp')).toBeInTheDocument();
    expect(screen.getByText('FIL_META_001')).toBeInTheDocument();
  });

  it('render thông tin người đăng tải với họ tên, email và uid', () => {
    render(<DocumentMetadataCard document={mockDocument} />);

    expect(screen.getAllByText('Phạm Minh Tuấn').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('tuan.pham@student.edu.vn').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('USR_SV001')).toBeInTheDocument();
  });

  it('render danh sách tác giả và thông tin chi tiết từng tác giả', () => {
    render(<DocumentMetadataCard document={mockDocument} />);

    expect(screen.getByText(/Danh sách tác giả \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText('TS. Nguyễn Văn Hướng Dẫn')).toBeInTheDocument();
    expect(screen.getByText('huongdan@university.edu.vn')).toBeInTheDocument();
    expect(screen.getByText('Trường Đại học Quy Nhơn')).toBeInTheDocument();
  });

  it('hiển thị thông báo khi danh sách tác giả trống', () => {
    const docWithoutAuthors: ModerationResourceDetailResponse = {
      ...mockDocument,
      authors: [],
    };

    render(<DocumentMetadataCard document={docWithoutAuthors} />);

    expect(screen.getByText('Chưa khai báo danh sách đồng tác giả.')).toBeInTheDocument();
  });

  it('render tóm tắt nội dung đề tài và fallback khi không có mô tả', () => {
    const { rerender } = render(<DocumentMetadataCard document={mockDocument} />);

    expect(screen.getByText(/Báo cáo ứng dụng cảm biến độ ẩm và nhiệt độ/i)).toBeInTheDocument();

    const docWithoutDesc: ModerationResourceDetailResponse = {
      ...mockDocument,
      fileDescription: '',
    };

    rerender(<DocumentMetadataCard document={docWithoutDesc} />);
    expect(screen.getByText('Tài liệu không có nội dung mô tả tóm tắt đính kèm.')).toBeInTheDocument();
  });
});
