import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { APP_PATHS } from '@/constants/path';
import { appRoutes } from '@/routes';
import axiosClient from '@/services/axiosClient';
import { useAuthStore } from '@/store/authStore';

vi.mock('@/services/axiosClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
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

describe('searchHubRoutes integration', () => {
  beforeEach(() => {
    useAuthStore.setState(authenticatedState);
    vi.clearAllMocks();
  });

  afterEach(() => {
    useAuthStore.setState(unauthenticatedState);
  });

  it('nạp dữ liệu qua loader và hiển thị giao diện Tra cứu tài nguyên số', async () => {
    vi.mocked(axiosClient.get).mockImplementation((url: string) => {
      if (url.includes('/api/ResourcesSearch')) {
        return Promise.resolve({
          data: {
            items: [
              {
                fileId: 'FIL_SEARCH_001',
                fileName: 'Giáo trình Lập trình Hướng đối tượng',
                fileDescription: 'Tài liệu hướng đối tượng C# và .NET',
                fileUrl: 'https://example.com/oop.pdf',
                fileTypeId: 1,
                fileTypeName: 'Bài giảng',
                subMajorCode: 'Công nghệ Thông tin',
                yearCompleted: 2026,
                uploadBy: 'TS. Nguyễn Văn Hùng',
                fileSize: 2048576,
                createdAt: '2026-09-20T08:00:00Z',
              },
            ],
            totalCount: 1,
            page: 1,
            pageSize: 50,
          },
        });
      }
      return Promise.resolve({ data: [] });
    });

    const router = createMemoryRouter(appRoutes, {
      initialEntries: [APP_PATHS.SEARCH],
    });

    render(<RouterProvider router={router} />);

    // Kiểm tra tiêu đề trang
    const heading = await screen.findByRole('heading', { name: 'Trung tâm Tra cứu Tài nguyên Số' }, { timeout: 10000 });
    expect(heading).toBeInTheDocument();

    // Kiểm tra kết quả tài liệu nạp từ API
    expect(await screen.findByText('Giáo trình Lập trình Hướng đối tượng')).toBeInTheDocument();
    expect(screen.getByText('TS. Nguyễn Văn Hùng')).toBeInTheDocument();
  }, 15000);

  it('chuyển đổi tab Trợ lý AI và hiển thị gợi ý câu hỏi', async () => {
    vi.mocked(axiosClient.get).mockImplementation((url: string) => {
      if (url.includes('/api/ResourcesSearch')) {
        return Promise.resolve({
          data: { items: [], totalCount: 0, page: 1, pageSize: 50 },
        });
      }
      return Promise.resolve({ data: [] });
    });

    const router = createMemoryRouter(appRoutes, {
      initialEntries: [APP_PATHS.SEARCH],
    });

    render(<RouterProvider router={router} />);

    await screen.findByRole('heading', { name: 'Trung tâm Tra cứu Tài nguyên Số' }, { timeout: 10000 });

    const aiTabBtn = screen.getByRole('button', { name: /Trợ lý AI/i });
    fireEvent.click(aiTabBtn);

    expect(await screen.findByText(/Hỏi đáp & Tra cứu Ngữ nghĩa cùng AI/i)).toBeInTheDocument();
  }, 15000);

  it('chuyển đổi tab Tác giả & Giảng viên và hiển thị thông tin tác giả nạp từ tài nguyên', async () => {
    vi.mocked(axiosClient.get).mockImplementation((url: string) => {
      if (url.includes('/api/ResourcesSearch')) {
        return Promise.resolve({
          data: {
            items: [
              {
                fileId: 'FIL_SEARCH_002',
                fileName: 'Khóa luận Tốt nghiệp Trí tuệ Nhân tạo',
                fileDescription: 'Nghiên cứu thị giác máy tính',
                fileUrl: 'https://example.com/ai.pdf',
                fileTypeId: 2,
                fileTypeName: 'Khóa luận tốt nghiệp',
                subMajorCode: 'Trí tuệ Nhân tạo',
                yearCompleted: 2026,
                uploadBy: 'PGS. TS. Trần Minh Tuấn',
                fileSize: 4096000,
                createdAt: '2026-09-22T08:00:00Z',
              },
            ],
            totalCount: 1,
            page: 1,
            pageSize: 50,
          },
        });
      }
      return Promise.resolve({ data: [] });
    });

    const router = createMemoryRouter(appRoutes, {
      initialEntries: [APP_PATHS.SEARCH],
    });

    render(<RouterProvider router={router} />);

    await screen.findByRole('heading', { name: 'Trung tâm Tra cứu Tài nguyên Số' }, { timeout: 10000 });

    const authorsTabBtn = screen.getByRole('button', { name: /Tác giả & Giảng viên/i });
    fireEvent.click(authorsTabBtn);

    expect(await screen.findByText('Danh bạ Tác giả & Giảng viên')).toBeInTheDocument();
    expect(screen.getByText('PGS. TS. Trần Minh Tuấn')).toBeInTheDocument();
    expect(screen.getByText(/1 tài liệu đã đăng/i)).toBeInTheDocument();
  }, 15000);
});
