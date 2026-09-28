import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import axiosClient from '@/services/axiosClient';
import { APP_PATHS } from '@/constants/path';
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
    uid: 'test-user-id',
    userCode: 'SV2026001',
    fullName: 'Sinh viên Kiểm thử',
    email: 'sinhvien@test.com',
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

describe('sourceCodeRoutes integration', () => {
  beforeEach(() => {
    useAuthStore.setState(authenticatedState);
    vi.clearAllMocks();
  });

  afterEach(() => {
    useAuthStore.setState(unauthenticatedState);
  });

  it('nạp dữ liệu qua loader và hiển thị đầy đủ Header, Thống kê KPI, Bộ lọc và Danh sách dự án', async () => {
    vi.mocked(axiosClient.get).mockImplementation((url: string) => {
      if (url.includes('/api/Lookup/file-types')) {
        return Promise.resolve({
          data: [
            { id: '1', name: 'Báo cáo NCKH' },
            { id: '5', name: 'Mã nguồn' },
          ],
        });
      }
      if (url.includes('/api/Lookup/submajors')) {
        return Promise.resolve({
          data: [
            { id: 'CNTT_KTPM', name: 'Kỹ thuật phần mềm' },
            { id: 'CNTT_AI', name: 'Trí tuệ nhân tạo' },
          ],
        });
      }
      if (url.includes('/api/ResourcesSearch')) {
        return Promise.resolve({
          data: {
            items: [
              {
                fileId: 'FIL_INTEG_01',
                fileName: 'Hệ thống Quản lý Thư viện',
                fileDescription: 'Mã nguồn C# .NET và Angular',
                fileUrl: 'https://example.com/lib.zip',
                fileTypeId: 5,
                fileTypeName: 'Mã nguồn',
                subMajorCode: 'CNTT_KTPM',
                courseCode: 'IT3040',
                yearCompleted: 2026,
                githubLink: 'https://github.com/test/library-system',
                bannerUrl: null,
                fileStatusId: 2,
                fileStatusName: 'Đã duyệt',
                uploadUserId: 'USR_01',
                createdAt: '2026-09-20',
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
      initialEntries: [APP_PATHS.SOURCE_CODE],
    });

    render(<RouterProvider router={router} />);

    // Chờ loader nạp xong và component render
    const heading = await screen.findByRole('heading', { name: 'Kho Mã nguồn & Dự án mẫu' }, { timeout: 10000 });
    expect(heading).toBeInTheDocument();

    // Kiểm tra thống kê KPI
    const statsSection = screen.getByRole('region', { name: 'Thống kê kho mã nguồn' });
    expect(statsSection).toHaveTextContent('Tổng số dự án');
    expect(statsSection).toHaveTextContent('Có GitHub Repository');

    // Kiểm tra dự án được hiển thị trong danh sách
    expect(await screen.findByText('Hệ thống Quản lý Thư viện')).toBeInTheDocument();
    expect(screen.getByText('Mã nguồn C# .NET và Angular')).toBeInTheDocument();

    // Kiểm tra nút mở dialog đăng tải và mở dialog thành công
    const uploadButton = screen.getByRole('button', { name: 'Đăng tải mã nguồn mới' });
    expect(uploadButton).toBeInTheDocument();

    fireEvent.click(uploadButton);
    expect(await screen.findByRole('heading', { name: /Đăng tải Mã nguồn & Dự án mẫu/i })).toBeInTheDocument();
  }, 15000);

  it('hiển thị trạng thái rỗng khi backend trả về 0 kết quả', async () => {
    vi.mocked(axiosClient.get).mockImplementation((url: string) => {
      if (url.includes('/api/Lookup/file-types')) {
        return Promise.resolve({ data: [] });
      }
      if (url.includes('/api/Lookup/submajors')) {
        return Promise.resolve({ data: [] });
      }
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
      initialEntries: [APP_PATHS.SOURCE_CODE],
    });

    render(<RouterProvider router={router} />);

    expect(await screen.findByText('Không tìm thấy dự án mã nguồn nào', {}, { timeout: 10000 })).toBeInTheDocument();
  }, 15000);
});
