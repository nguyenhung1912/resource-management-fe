import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { RecommendedResourceItem } from '../../types/all-resources.types';
import { LibraryFeaturedShelf } from '../LibraryFeaturedShelf';

describe('LibraryFeaturedShelf', () => {
  const mockItems: RecommendedResourceItem[] = [
    {
      fileId: 'FIL_REC_01',
      fileName: 'Hệ thống Khuyến nghị Tài liệu',
      fileTypeName: 'Khóa luận tốt nghiệp',
      subMajorCode: 'CNTT_KTPM',
      courseName: 'Trí tuệ nhân tạo',
      bannerUrl: 'https://example.com/banner1.jpg',
      averageScore: 4.9,
      totalReviews: 28,
      createdAt: '2026-09-20T00:00:00Z',
    },
    {
      fileId: 'FIL_REC_02',
      fileName: 'Giáo trình Lập trình Hướng đối tượng',
      fileTypeName: 'Bài giảng',
      subMajorCode: 'CNTT_KTPM',
      bannerUrl: null,
      averageScore: 4.7,
      totalReviews: 15,
      createdAt: '2026-09-18T00:00:00Z',
    },
  ];

  it('không render gì khi danh sách gợi ý rỗng hoặc undefined', () => {
    const { container: containerEmpty } = render(<LibraryFeaturedShelf items={[]} onSelect={vi.fn()} />);
    expect(containerEmpty).toBeEmptyDOMElement();

    const { container: containerNull } = render(
      <LibraryFeaturedShelf items={null as unknown as RecommendedResourceItem[]} onSelect={vi.fn()} />,
    );
    expect(containerNull).toBeEmptyDOMElement();
  });

  it('render đầy đủ tiêu đề phần gợi ý và các card tài liệu', () => {
    render(<LibraryFeaturedShelf items={mockItems} onSelect={vi.fn()} />);

    expect(screen.getByText('Tài liệu Nổi bật & Gợi ý cho bạn')).toBeInTheDocument();
    expect(screen.getByText('Hệ thống Khuyến nghị Tài liệu')).toBeInTheDocument();
    expect(screen.getByText('Giáo trình Lập trình Hướng đối tượng')).toBeInTheDocument();
    expect(screen.getByText('4.9')).toBeInTheDocument();
    expect(screen.getByText('28 đánh giá')).toBeInTheDocument();
    expect(screen.getByText('Khóa luận tốt nghiệp')).toBeInTheDocument();
  });

  it('kích hoạt onSelect khi nhấn nút Xem nhanh hoặc tiêu đề tài liệu', () => {
    const handleSelect = vi.fn();
    render(<LibraryFeaturedShelf items={mockItems} onSelect={handleSelect} />);

    const quickViewButtons = screen.getAllByRole('button', { name: /xem chi tiết tài liệu/i });
    fireEvent.click(quickViewButtons[0]);

    expect(handleSelect).toHaveBeenCalledWith('FIL_REC_01');

    const titleButton = screen.getByRole('button', { name: 'Giáo trình Lập trình Hướng đối tượng' });
    fireEvent.click(titleButton);

    expect(handleSelect).toHaveBeenCalledWith('FIL_REC_02');
  });

  it('hỗ trợ điều hướng bàn phím Enter trên tiêu đề', () => {
    const handleSelect = vi.fn();
    render(<LibraryFeaturedShelf items={mockItems} onSelect={handleSelect} />);

    const titleButton = screen.getByRole('button', { name: 'Hệ thống Khuyến nghị Tài liệu' });
    fireEvent.keyDown(titleButton, { key: 'Enter' });

    expect(handleSelect).toHaveBeenCalledWith('FIL_REC_01');
  });
});
