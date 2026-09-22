import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import axiosClient from '@/services/axiosClient';
import { APP_PATHS } from '@/constants/path';
import { resetLibraryLookupCache } from '@/features/digital-resources/all-resources/pages/allResourcesLoader';
import { appRoutes } from '@/routes';
import { useAuthStore } from '@/store/authStore';

vi.mock('@/services/axiosClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const authenticatedState = {
  user: {
    uid: 'test-student-id',
    userCode: 'SV2026002',
    fullName: 'Sinh viên QNU',
    email: 'sinhvien@qnu.edu.vn',
    roleId: 1,
    role: 'Student',
  },
  token: 'valid-test-token',
  expiration: '2099-12-31T23:59:59Z',
  isAuthenticated: true,
  isLoading: false,
} satisfies Partial<ReturnType<typeof useAuthStore.getState>>;

const unauthenticatedState = {
  user: null,
  token: null,
  expiration: null,
  isAuthenticated: false,
  isLoading: false,
} satisfies Partial<ReturnType<typeof useAuthStore.getState>>;

describe('allResourcesRoutes integration', () => {
  beforeEach(() => {
    useAuthStore.setState(authenticatedState);
    resetLibraryLookupCache();
    vi.clearAllMocks();
  });

  afterEach(() => {
    useAuthStore.setState(unauthenticatedState);
  });

  it('nạp dữ liệu qua loader và hiển thị Digital Library UI khi truy cập APP_PATHS.ALL_RESOURCES', async () => {
    vi.mocked(axiosClient.get).mockImplementation((url: string) => {
      if (url.includes('/api/Lookup/file-types')) {
        return Promise.resolve({
          data: [
            { id: '1', name: 'Bài giảng' },
            { id: '2', name: 'Khóa luận' },
          ],
        });
      }
      if (url.includes('/api/Lookup/submajors')) {
        return Promise.resolve({
          data: [{ id: 'CNTT_KTPM', name: 'Kỹ thuật phần mềm' }],
        });
      }
      if (url.includes('/api/Lookup/file-statuses')) {
        return Promise.resolve({
          data: [{ id: '2', name: 'Đã duyệt' }],
        });
      }
      if (url.includes('/api/Recommendation')) {
        return Promise.resolve({
          data: [
            {
              fileId: 'REC_INTEG_01',
              fileName: 'Hệ thống Khuyến nghị Học tập',
              courseName: 'Trí tuệ nhân tạo',
              averageScore: 4.8,
              totalReviews: 8,
            },
          ],
        });
      }
      if (url.includes('/api/ResourcesSearch')) {
        return Promise.resolve({
          data: {
            items: [
              {
                fileId: 'FIL_INTEG_001',
                fileName: 'Tài liệu Thiết kế Kiến trúc Hệ thống',
                fileDescription: 'Hướng dẫn thiết kế Clean Architecture',
                fileUrl: 'https://example.com/arch.pdf',
                fileTypeId: 1,
                fileTypeName: 'Bài giảng',
                subMajorCode: 'CNTT_KTPM',
                yearCompleted: 2026,
                fileSize: 5242880,
                createdAt: '2026-09-21T08:00:00Z',
              },
            ],
            totalCount: 1,
            page: 1,
            pageSize: 12,
          },
        });
      }
      return Promise.resolve({ data: [] });
    });

    const router = createMemoryRouter(appRoutes, {
      initialEntries: [APP_PATHS.ALL_RESOURCES],
    });

    render(<RouterProvider router={router} />);

    // Kiểm tra tiêu đề trang Thư viện số
    const heading = await screen.findByRole('heading', { name: 'Thư viện Tài nguyên Số' }, { timeout: 10000 });
    expect(heading).toBeInTheDocument();

    // Kiểm tra kệ đề xuất AI
    expect(await screen.findByText('Hệ thống Khuyến nghị Học tập')).toBeInTheDocument();

    // Kiểm tra tài liệu hiển thị trong kệ sách
    expect(await screen.findByText('Tài liệu Thiết kế Kiến trúc Hệ thống')).toBeInTheDocument();
  }, 15000);

  it('hiển thị trạng thái kệ sách rỗng khi không có tài nguyên nào', async () => {
    vi.mocked(axiosClient.get).mockImplementation((url: string) => {
      if (url.includes('/api/ResourcesSearch')) {
        return Promise.resolve({
          data: {
            items: [],
            totalCount: 0,
            page: 1,
            pageSize: 12,
          },
        });
      }
      return Promise.resolve({ data: [] });
    });

    const router = createMemoryRouter(appRoutes, {
      initialEntries: [APP_PATHS.ALL_RESOURCES],
    });

    render(<RouterProvider router={router} />);

    expect(
      await screen.findByText('Không tìm thấy tài liệu trong thư viện', {}, { timeout: 10000 }),
    ).toBeInTheDocument();
  }, 15000);

  it('đảm bảo APP_PATHS.SEARCH vẫn dùng SearchHubPage độc lập không bị ảnh hưởng', async () => {
    const router = createMemoryRouter(appRoutes, {
      initialEntries: [APP_PATHS.SEARCH],
    });

    render(<RouterProvider router={router} />);

    expect(
      await screen.findByRole('heading', { name: 'Trung tâm Tra cứu Tài nguyên Số' }, { timeout: 10000 }),
    ).toBeInTheDocument();
  }, 15000);
});
