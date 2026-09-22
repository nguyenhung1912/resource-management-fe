import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { LibraryResourceItem } from '../../types/all-resources.types';
import { LibraryCatalogTable } from '../LibraryCatalogTable';

describe('LibraryCatalogTable', () => {
  const mockItems: LibraryResourceItem[] = [
    {
      fileId: 'FIL_TAB_01',
      fileName: 'Giáo trình Hệ thống Thông tin',
      fileDescription: 'Mô tả tóm tắt học phần HTTT',
      fileUrl: 'https://example.com/httt.pdf',
      fileTypeId: 1,
      fileTypeName: 'Giáo trình',
      subMajorCode: 'CNTT_HTTT',
      courseCode: 'IT3030',
      yearCompleted: 2026,
      githubLink: null,
      fileSize: 1048576,
      createdAt: '2026-09-20T10:30:00Z',
      uploadBy: 'TS. Lê Thị C',
    },
  ];

  it('render đầy đủ cấu trúc bảng danh mục và hàng dữ liệu', () => {
    render(<LibraryCatalogTable items={mockItems} onSelect={vi.fn()} onDownload={vi.fn()} />);

    expect(screen.getByRole('columnheader', { name: /tài liệu/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /thể loại/i })).toBeInTheDocument();
    expect(screen.getByText('Giáo trình Hệ thống Thông tin')).toBeInTheDocument();
    expect(screen.getByText('Giáo trình')).toBeInTheDocument();
    expect(screen.getByText('CNTT_HTTT')).toBeInTheDocument();
    expect(screen.getByText('IT3030')).toBeInTheDocument();
    expect(screen.getByText('TS. Lê Thị C')).toBeInTheDocument();
    expect(screen.getByText('Năm: 2026')).toBeInTheDocument();
  });

  it('kích hoạt onSelect và onDownload khi click nút thao tác', () => {
    const handleSelect = vi.fn();
    const handleDownload = vi.fn();

    render(<LibraryCatalogTable items={mockItems} onSelect={handleSelect} onDownload={handleDownload} />);

    const viewButton = screen.getByRole('button', { name: /xem chi tiết/i });
    fireEvent.click(viewButton);
    expect(handleSelect).toHaveBeenCalledWith('FIL_TAB_01');

    const downloadButton = screen.getByRole('button', { name: /tải xuống/i });
    fireEvent.click(downloadButton);
    expect(handleDownload).toHaveBeenCalledWith('FIL_TAB_01', 'Giáo trình Hệ thống Thông tin');
  });
});
