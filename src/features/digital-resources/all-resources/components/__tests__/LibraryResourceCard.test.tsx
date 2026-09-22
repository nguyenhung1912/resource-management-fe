import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { LibraryResourceItem } from '../../types/all-resources.types';
import { LibraryResourceCard } from '../LibraryResourceCard';

describe('LibraryResourceCard', () => {
  const mockItem: LibraryResourceItem = {
    fileId: 'FIL_001',
    fileName: 'Nghiên cứu Học sâu trong Y tế',
    fileDescription: 'Báo cáo nghiên cứu ứng dụng CNN trong chẩn đoán hình ảnh',
    fileUrl: 'https://example.com/file.pdf',
    fileTypeId: 1,
    fileTypeName: 'Khóa luận tốt nghiệp',
    subMajorCode: 'CNTT_KTPM',
    courseCode: 'IT4010',
    yearCompleted: 2026,
    githubLink: null,
    bannerUrl: 'https://example.com/banner.jpg',
    fileSize: 2097152, // 2 MB
    createdAt: '2026-09-20T10:00:00Z',
    uploadBy: 'Nguyễn Văn A',
  };

  it('render đầy đủ thông tin tài liệu, ảnh bìa, badge thể loại và metadata', () => {
    render(<LibraryResourceCard item={mockItem} onSelect={vi.fn()} onDownload={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Nghiên cứu Học sâu trong Y tế' })).toBeInTheDocument();
    expect(screen.getByText('Báo cáo nghiên cứu ứng dụng CNN trong chẩn đoán hình ảnh')).toBeInTheDocument();
    expect(screen.getByText('Khóa luận tốt nghiệp')).toBeInTheDocument();
    expect(screen.getByText('2026')).toBeInTheDocument();
    expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
    expect(screen.getByText('CNTT_KTPM')).toBeInTheDocument();
    expect(screen.getByText('IT4010')).toBeInTheDocument();
    expect(screen.getByText('2.0 MB')).toBeInTheDocument();

    const bannerImg = screen.getByRole('img', { name: 'Nghiên cứu Học sâu trong Y tế' });
    expect(bannerImg).toHaveAttribute('src', 'https://example.com/banner.jpg');
  });

  it('hiển thị bìa fallback khi không có banner', () => {
    const itemWithoutBanner: LibraryResourceItem = {
      ...mockItem,
      bannerUrl: null,
      bannerImage: null,
    };

    render(<LibraryResourceCard item={itemWithoutBanner} onSelect={vi.fn()} onDownload={vi.fn()} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('Thư viện QNU')).toBeInTheDocument();
  });

  it('kích hoạt onSelect khi nhấn nút Chi tiết hoặc tiêu đề', () => {
    const handleSelect = vi.fn();
    render(<LibraryResourceCard item={mockItem} onSelect={handleSelect} onDownload={vi.fn()} />);

    const detailButton = screen.getByRole('button', { name: /xem chi tiết tài liệu/i });
    fireEvent.click(detailButton);
    expect(handleSelect).toHaveBeenCalledWith('FIL_001');

    const titleButton = screen.getByRole('button', { name: 'Nghiên cứu Học sâu trong Y tế' });
    fireEvent.click(titleButton);
    expect(handleSelect).toHaveBeenCalledWith('FIL_001');
  });

  it('kích hoạt onDownload khi nhấn nút Tải về', () => {
    const handleDownload = vi.fn();
    render(<LibraryResourceCard item={mockItem} onSelect={vi.fn()} onDownload={handleDownload} />);

    const downloadButton = screen.getByRole('button', { name: /tải xuống tài liệu/i });
    fireEvent.click(downloadButton);
    expect(handleDownload).toHaveBeenCalledWith('FIL_001', 'Nghiên cứu Học sâu trong Y tế');
  });
});
