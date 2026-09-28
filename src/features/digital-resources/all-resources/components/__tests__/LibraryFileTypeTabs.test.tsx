import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { LookupItem } from '../../types/all-resources.types';
import { LibraryFileTypeTabs } from '../LibraryFileTypeTabs';

describe('LibraryFileTypeTabs', () => {
  const mockFileTypes: LookupItem[] = [
    { id: '1', name: 'Bài giảng & Giáo trình' },
    { id: '2', name: 'Khóa luận tốt nghiệp' },
    { id: '3', name: 'Báo cáo môn học' },
    { id: '4', name: 'Kho mã nguồn' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('render tab Tất cả học liệu và tất cả các thể loại động', () => {
    render(<LibraryFileTypeTabs fileTypes={mockFileTypes} activeFileTypeId={undefined} onSelectFileType={vi.fn()} />);

    expect(screen.getByRole('tab', { name: /tất cả học liệu/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /bài giảng & giáo trình/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /khóa luận tốt nghiệp/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /báo cáo môn học/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /kho mã nguồn/i })).toBeInTheDocument();
  });

  it('đánh dấu aria-selected="true" cho tab Tất cả khi activeFileTypeId undefined', () => {
    render(<LibraryFileTypeTabs fileTypes={mockFileTypes} activeFileTypeId={undefined} onSelectFileType={vi.fn()} />);

    const allTab = screen.getByRole('tab', { name: /tất cả học liệu/i });
    expect(allTab).toHaveAttribute('aria-selected', 'true');

    const lectureTab = screen.getByRole('tab', { name: /bài giảng & giáo trình/i });
    expect(lectureTab).toHaveAttribute('aria-selected', 'false');
  });

  it('đánh dấu tab tương ứng khi activeFileTypeId được chọn', () => {
    render(<LibraryFileTypeTabs fileTypes={mockFileTypes} activeFileTypeId={2} onSelectFileType={vi.fn()} />);

    const thesisTab = screen.getByRole('tab', { name: /khóa luận tốt nghiệp/i });
    expect(thesisTab).toHaveAttribute('aria-selected', 'true');

    const allTab = screen.getByRole('tab', { name: /tất cả học liệu/i });
    expect(allTab).toHaveAttribute('aria-selected', 'false');
  });

  it('kích hoạt onSelectFileType khi người dùng click tab', () => {
    const handleSelect = vi.fn();
    render(
      <LibraryFileTypeTabs fileTypes={mockFileTypes} activeFileTypeId={undefined} onSelectFileType={handleSelect} />,
    );

    const thesisTab = screen.getByRole('tab', { name: /khóa luận tốt nghiệp/i });
    fireEvent.click(thesisTab);
    expect(handleSelect).toHaveBeenCalledWith(2);

    const allTab = screen.getByRole('tab', { name: /tất cả học liệu/i });
    fireEvent.click(allTab);
    expect(handleSelect).toHaveBeenCalledWith(undefined);
  });

  it('hỗ trợ các nút cuộn ngang khi có nội dung bị tràn', () => {
    const { container } = render(
      <LibraryFileTypeTabs fileTypes={mockFileTypes} activeFileTypeId={undefined} onSelectFileType={vi.fn()} />,
    );

    const nav = container.querySelector('nav');
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveClass('overflow-x-auto');
  });
});
