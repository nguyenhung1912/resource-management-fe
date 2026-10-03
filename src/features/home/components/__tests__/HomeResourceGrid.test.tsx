import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { HomeResourceGrid } from '../HomeResourceGrid';
import { APP_PATHS } from '@/constants/path';
import type { SearchResultItem } from '@/features/home/types/home.types';

describe('HomeResourceGrid', () => {
  const mockResources: SearchResultItem[] = [
    {
      fileId: 'FIL_01',
      fileName: 'Bài giảng Lập trình Web nâng cao',
      fileTypeName: 'Giáo trình / Bài giảng',
      uploadBy: 'GV. Lê Văn C',
      yearCompleted: 2026,
    },
    {
      fileId: 'FIL_02',
      fileName: 'Báo cáo NCKH An toàn thông tin',
      fileTypeName: 'Báo cáo NCKH',
      uploadBy: 'SV. Phạm D',
      yearCompleted: 2025,
    },
  ];

  it('renders section header, total count, explore link, and resource cards when items exist', () => {
    render(
      <MemoryRouter>
        <HomeResourceGrid resources={mockResources} totalCount={2} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Học liệu & Tài nguyên Mới nhất' })).toBeInTheDocument();
    expect(screen.getByText('2 tài liệu')).toBeInTheDocument();

    const exploreLink = screen.getByRole('link', { name: /Khám phá toàn bộ kho học liệu/i });
    expect(exploreLink).toHaveAttribute('href', APP_PATHS.ALL_RESOURCES);

    expect(screen.getByText('Bài giảng Lập trình Web nâng cao')).toBeInTheDocument();
    expect(screen.getByText('Báo cáo NCKH An toàn thông tin')).toBeInTheDocument();
  });

  it('renders EmptyState when resources array is empty', () => {
    render(
      <MemoryRouter>
        <HomeResourceGrid resources={[]} totalCount={0} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Chưa có tài liệu học thuật nào')).toBeInTheDocument();
    expect(screen.getByText(/Hiện chưa có tài liệu nào trong danh mục hoặc trạng thái này/i)).toBeInTheDocument();
  });
});
