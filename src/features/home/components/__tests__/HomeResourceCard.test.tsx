import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HomeResourceCard } from '../HomeResourceCard';
import type { SearchResultItem } from '@/features/home/types/home.types';

describe('HomeResourceCard', () => {
  const mockItem: SearchResultItem = {
    fileId: 'FIL_123',
    fileName: 'Xây dựng hệ thống khuyến nghị tài liệu NCKH',
    fileDescription: 'Đề tài tốt nghiệp chuyên sâu ứng dụng mô hình học máy',
    fileUrl: 'https://storage.qnu.edu.vn/files/nckh123.pdf',
    fileTypeName: 'Khóa luận tốt nghiệp',
    subMajorCode: 'CNTT_KTPM',
    yearCompleted: 2026,
    uploadBy: 'Trần Thị B',
    createdAt: '2026-04-10T10:00:00Z',
    keywords: ['Recommendation', 'Machine Learning'],
  };

  it('renders title, description, file type, author, year, and keywords', () => {
    render(<HomeResourceCard item={mockItem} />);

    expect(screen.getByRole('heading', { name: 'Xây dựng hệ thống khuyến nghị tài liệu NCKH' })).toBeInTheDocument();
    expect(screen.getByText('Đề tài tốt nghiệp chuyên sâu ứng dụng mô hình học máy')).toBeInTheDocument();
    expect(screen.getByText('Khóa luận tốt nghiệp')).toBeInTheDocument();
    expect(screen.getByText('Trần Thị B')).toBeInTheDocument();
    expect(screen.getByText('2026')).toBeInTheDocument();
    expect(screen.getByText('CNTT_KTPM')).toBeInTheDocument();
    expect(screen.getByText('#Recommendation')).toBeInTheDocument();
    expect(screen.getByText('#Machine Learning')).toBeInTheDocument();
  });

  it('renders fallback labels when optional fields are missing', () => {
    const fallbackItem: SearchResultItem = {
      fileId: 'FIL_EMPTY',
      fileName: '',
      fileDescription: null,
      fileUrl: null,
      fileTypeName: null,
      subMajorCode: null,
      yearCompleted: null,
      uploadBy: null,
    };

    render(<HomeResourceCard item={fallbackItem} />);

    expect(screen.getByRole('heading', { name: 'Tài liệu không tên' })).toBeInTheDocument();
    expect(screen.getByText('Tài liệu học thuật')).toBeInTheDocument();
    expect(screen.getByText('Tác giả ẩn danh')).toBeInTheDocument();
  });
});
