import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { LibraryResourceItem } from '../../types/all-resources.types';
import { LibraryCardGrid } from '../LibraryCardGrid';

describe('LibraryCardGrid', () => {
  const mockItems: LibraryResourceItem[] = [
    {
      fileId: 'FIL_01',
      fileName: 'Tài liệu 1',
      fileDescription: 'Mô tả 1',
      fileUrl: 'https://example.com/1.pdf',
      fileTypeId: 1,
      fileTypeName: 'Bài giảng',
      subMajorCode: 'CNTT',
      courseCode: 'IT101',
      yearCompleted: 2026,
      githubLink: null,
      fileSize: 1024,
      createdAt: '2026-09-20',
      uploadBy: 'GV A',
    },
    {
      fileId: 'FIL_02',
      fileName: 'Tài liệu 2',
      fileDescription: 'Mô tả 2',
      fileUrl: 'https://example.com/2.pdf',
      fileTypeId: 2,
      fileTypeName: 'Khóa luận',
      subMajorCode: 'CNTT',
      courseCode: 'IT102',
      yearCompleted: 2026,
      githubLink: null,
      fileSize: 2048,
      createdAt: '2026-09-20',
      uploadBy: 'GV B',
    },
  ];

  it('render đầy đủ danh sách các card trong lưới', () => {
    render(<LibraryCardGrid items={mockItems} onSelect={vi.fn()} onDownload={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Tài liệu 1' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Tài liệu 2' })).toBeInTheDocument();
    expect(screen.getByText('Bài giảng')).toBeInTheDocument();
    expect(screen.getByText('Khóa luận')).toBeInTheDocument();
  });
});
