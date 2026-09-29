import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { APP_PATHS } from '@/constants/path';
import { HomePage } from '../HomePage';
import type { HomeLoaderData } from '@/features/home/types/home.types';

describe('HomePage Integration', () => {
  const mockLoaderData: HomeLoaderData = {
    fileTypes: [
      { id: '1', name: 'Báo cáo NCKH' },
      { id: '2', name: 'Khóa luận tốt nghiệp' },
    ],
    featuredResources: [
      {
        fileId: 'FIL_001',
        fileName: 'Nghiên cứu thị giác máy tính',
        fileDescription: 'Đề tài ứng dụng trong nhận diện khuôn mặt',
        fileTypeName: 'Báo cáo NCKH',
        subMajorCode: 'CNTT_KTPM',
        yearCompleted: 2026,
        uploadBy: 'Nguyễn Văn A',
        keywords: ['Computer Vision', 'Deep Learning'],
      },
      {
        fileId: 'FIL_002',
        fileName: 'Hệ thống gợi ý học phần thông minh',
        fileDescription: 'Khóa luận sinh viên năm cuối',
        fileTypeName: 'Khóa luận tốt nghiệp',
        subMajorCode: 'CNTT_HTTT',
        yearCompleted: 2025,
        uploadBy: 'Trần Thị B',
        keywords: ['Recommender', 'AI'],
      },
    ],
    totalResources: 2,
  };

  it('renders all 4 sections with data from route loader', async () => {
    const router = createMemoryRouter(
      [
        {
          path: APP_PATHS.HOME,
          loader: () => mockLoaderData,
          element: <HomePage />,
        },
      ],
      { initialEntries: [APP_PATHS.HOME] },
    );

    render(<RouterProvider router={router} />);

    // 1. Hero Search
    expect(await screen.findByRole('heading', { name: 'Cổng Quản lý Tài nguyên Học liệu Số' })).toBeInTheDocument();
    expect(screen.getByRole('search')).toBeInTheDocument();

    // 2. Category Filter
    expect(screen.getByRole('tab', { name: 'Tất cả học liệu' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Báo cáo NCKH' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Khóa luận tốt nghiệp' })).toBeInTheDocument();

    // 3. Resource Grid
    expect(screen.getByText('Nghiên cứu thị giác máy tính')).toBeInTheDocument();
    expect(screen.getByText('Hệ thống gợi ý học phần thông minh')).toBeInTheDocument();
    expect(screen.getByText('2 tài liệu')).toBeInTheDocument();

    // 4. Quick Actions & Policy
    expect(screen.getByRole('heading', { name: 'Tính năng & Điều hướng nhanh' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Quy chuẩn tải lên & Kiểm duyệt học liệu' })).toBeInTheDocument();
  });

  it('filters resources when category tab is selected and resets on "Tất cả học liệu"', async () => {
    const router = createMemoryRouter(
      [
        {
          path: APP_PATHS.HOME,
          loader: () => mockLoaderData,
          element: <HomePage />,
        },
      ],
      { initialEntries: [APP_PATHS.HOME] },
    );

    render(<RouterProvider router={router} />);

    // Wait for initial render
    const nckhTab = await screen.findByRole('tab', { name: 'Báo cáo NCKH' });
    fireEvent.click(nckhTab);

    // Only "Nghiên cứu thị giác máy tính" should be visible
    expect(screen.getByText('Nghiên cứu thị giác máy tính')).toBeInTheDocument();
    expect(screen.queryByText('Hệ thống gợi ý học phần thông minh')).not.toBeInTheDocument();
    expect(screen.getByText('1 tài liệu')).toBeInTheDocument();

    // Reset to "Tất cả học liệu"
    const allTab = screen.getByRole('tab', { name: 'Tất cả học liệu' });
    fireEvent.click(allTab);

    expect(screen.getByText('Nghiên cứu thị giác máy tính')).toBeInTheDocument();
    expect(screen.getByText('Hệ thống gợi ý học phần thông minh')).toBeInTheDocument();
  });

  it('navigates to search hub when search is submitted', async () => {
    const router = createMemoryRouter(
      [
        {
          path: APP_PATHS.HOME,
          loader: () => mockLoaderData,
          element: <HomePage />,
        },
        {
          path: APP_PATHS.SEARCH,
          element: <div data-testid="search-hub-page">Trang tìm kiếm</div>,
        },
      ],
      { initialEntries: [APP_PATHS.HOME] },
    );

    render(<RouterProvider router={router} />);

    const searchInput = await screen.findByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'Deep Learning' } });

    const searchBtn = screen.getByRole('button', { name: /Tìm kiếm/i });
    fireEvent.click(searchBtn);

    expect(screen.getByTestId('search-hub-page')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(APP_PATHS.SEARCH);
    expect(router.state.location.search).toBe('?q=Deep%20Learning');
  });

  it('renders EmptyState when loader returns 0 resources', async () => {
    const emptyLoaderData: HomeLoaderData = {
      fileTypes: [],
      featuredResources: [],
      totalResources: 0,
    };

    const router = createMemoryRouter(
      [
        {
          path: APP_PATHS.HOME,
          loader: () => emptyLoaderData,
          element: <HomePage />,
        },
      ],
      { initialEntries: [APP_PATHS.HOME] },
    );

    render(<RouterProvider router={router} />);

    expect(await screen.findByText('Chưa có tài liệu học thuật nào')).toBeInTheDocument();
  });
});
