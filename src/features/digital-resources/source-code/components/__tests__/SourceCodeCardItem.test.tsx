import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SourceCodeCardItem } from '../SourceCodeCardItem';
import type { SourceCodeItem } from '../../types/source-code.types';

const mockItem: SourceCodeItem = {
  fileId: 'FIL_TEST_01',
  fileName: 'Hệ thống Quản lý Bệnh viện',
  fileDescription: 'Mã nguồn NodeJS và ReactJS phục vụ quản lý bệnh viện.',
  fileUrl: 'https://example.com/source.zip',
  fileTypeId: 5,
  fileTypeName: 'Mã nguồn',
  subMajorCode: 'CNTT_KTPM',
  courseCode: 'IT3040',
  yearCompleted: 2026,
  githubLink: 'https://github.com/hospital/management',
  bannerUrl: 'https://example.com/thumb.jpg',
  fileStatusId: 2,
  fileStatusName: 'Đã duyệt',
  uploadUserId: 'USR_01',
  createdAt: '2026-09-20T00:00:00Z',
};

describe('SourceCodeCardItem', () => {
  it('hiển thị đầy đủ thông tin tên dự án, mô tả, môn học và trạng thái', () => {
    render(<SourceCodeCardItem item={mockItem} onSelect={vi.fn()} onDownload={vi.fn()} />);

    expect(screen.getByText('Hệ thống Quản lý Bệnh viện')).toBeInTheDocument();
    expect(screen.getByText('Mã nguồn NodeJS và ReactJS phục vụ quản lý bệnh viện.')).toBeInTheDocument();
    expect(screen.getByText('CNTT_KTPM')).toBeInTheDocument();
    expect(screen.getByText('IT3040')).toBeInTheDocument();
    expect(screen.getByText('Năm 2026')).toBeInTheDocument();
    expect(screen.getByText('Đã duyệt')).toBeInTheDocument();
  });

  it('hiển thị liên kết GitHub an toàn với target="_blank" khi có link hợp lệ', () => {
    render(<SourceCodeCardItem item={mockItem} onSelect={vi.fn()} onDownload={vi.fn()} />);

    const githubLink = screen.getByRole('link', {
      name: 'Mở repository GitHub của Hệ thống Quản lý Bệnh viện',
    });
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute('href', 'https://github.com/hospital/management');
    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('gọi callback onSelect khi người dùng bấm nút Chi tiết hoặc tiêu đề', () => {
    const handleSelect = vi.fn();
    render(<SourceCodeCardItem item={mockItem} onSelect={handleSelect} onDownload={vi.fn()} />);

    const detailButton = screen.getByRole('button', {
      name: 'Xem chi tiết dự án Hệ thống Quản lý Bệnh viện',
    });
    fireEvent.click(detailButton);
    expect(handleSelect).toHaveBeenCalledWith('FIL_TEST_01');

    fireEvent.click(screen.getByText('Hệ thống Quản lý Bệnh viện'));
    expect(handleSelect).toHaveBeenCalledTimes(2);
  });

  it('gọi callback onDownload khi người dùng bấm nút Tải về', () => {
    const handleDownload = vi.fn();
    render(<SourceCodeCardItem item={mockItem} onSelect={vi.fn()} onDownload={handleDownload} />);

    const downloadButton = screen.getByRole('button', {
      name: 'Tải mã nguồn Hệ thống Quản lý Bệnh viện',
    });
    fireEvent.click(downloadButton);
    expect(handleDownload).toHaveBeenCalledWith('FIL_TEST_01', 'Hệ thống Quản lý Bệnh viện');
  });

  it('hiển thị banner mặc định khi không có bannerUrl và ẩn link GitHub khi không có repo', () => {
    const itemWithoutBanner: SourceCodeItem = {
      ...mockItem,
      fileId: 'FIL_TEST_02',
      bannerUrl: null,
      githubLink: null,
    };

    render(<SourceCodeCardItem item={itemWithoutBanner} onSelect={vi.fn()} onDownload={vi.fn()} />);

    expect(screen.getByText('Mã nguồn lưu trữ')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Mở repository GitHub/i })).not.toBeInTheDocument();
  });
});
