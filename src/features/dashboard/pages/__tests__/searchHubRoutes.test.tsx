import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { APP_PATHS } from '@/constants/path';
import { appRoutes } from '@/routes';
import axiosClient from '@/services/axiosClient';
import { useAuthStore } from '@/store/authStore';
import type { SearchResultItem } from '@/features/resources/types/search.types';

// Giả lập Axios toàn diện, đảm bảo không có API nào bị lọt
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

// Khối logic giả lập xử lý BẤT BẠI
const mockImplementation = (items: Partial<SearchResultItem>[]) => (url: string) => {
  const lowerUrl = url.toLowerCase();

  // 1. Nếu là gọi lấy danh mục, trả mảng rỗng (Tránh lỗi 500 từ Promise.all)
  if (
    lowerUrl.includes('sub-major') ||
    lowerUrl.includes('file-type') ||
    lowerUrl.includes('system') ||
    lowerUrl.includes('authors')
  ) {
    return Promise.resolve({ data: [] }); // Thêm auths vào đề phòng
  }

  // 2. Mặc định mọi request khác (như API Search) đều phải trả về data chuẩn!
  return Promise.resolve({
    data: {
      items,
      totalCount: items.length,
      totalPages: 1,
      currentPage: 1,
    },
  });
};

// Đánh chặn toàn bộ
const mockSearchApi = (items: Partial<SearchResultItem>[]) => {
  vi.mocked(axiosClient.get).mockImplementation(mockImplementation(items));
  vi.mocked(axiosClient.post).mockImplementation(mockImplementation(items));
};

describe('searchHubRoutes integration', () => {
  beforeEach(() => {
    useAuthStore.setState(authenticatedState);
    vi.clearAllMocks();
  });

  afterEach(() => {
    useAuthStore.setState(unauthenticatedState);
  });

  // Tăng max timeout lên 20000ms (20 giây) để CI chạy thoải mái
  it('nạp dữ liệu qua loader và hiển thị giao diện Tra cứu tài nguyên số', async () => {
    mockSearchApi([
      {
        fileId: 'FIL_SEARCH_001',
        fileName: 'Giáo trình Lập trình Hướng đối tượng',
        fileDescription: 'Tài liệu hướng đối tượng C# và .NET',
        fileUrl: 'https://example.com/oop.pdf',
        fileTypeName: 'Bài giảng',
        subMajorCode: 'Công nghệ Thông tin',
        yearCompleted: 2026,
        uploadBy: 'TS. Nguyễn Văn Hùng',
        createdAt: '2026-09-20T08:00:00Z',
        keywords: [],
      },
    ]);

    const router = createMemoryRouter(appRoutes, {
      initialEntries: [APP_PATHS.SEARCH],
    });

    render(<RouterProvider router={router} />);

    // Kiểm tra title
    const heading = await screen.findByRole('heading', { name: 'Trung tâm Tra cứu Tài nguyên Số' }, { timeout: 15000 });
    expect(heading).toBeInTheDocument();

    // Xác nhận tài liệu
    expect(await screen.findByText('Giáo trình Lập trình Hướng đối tượng', {}, { timeout: 15000 })).toBeInTheDocument();
    expect(screen.getByText('TS. Nguyễn Văn Hùng')).toBeInTheDocument();
  }, 20000);

  it('chuyển đổi tab Trợ lý AI và hiển thị gợi ý câu hỏi', async () => {
    mockSearchApi([]);

    const router = createMemoryRouter(appRoutes, {
      initialEntries: [APP_PATHS.SEARCH],
    });

    render(<RouterProvider router={router} />);

    await screen.findByRole('heading', { name: 'Trung tâm Tra cứu Tài nguyên Số' }, { timeout: 15000 });

    const aiTabBtn = screen.getByRole('button', { name: /Trợ lý AI/i });
    fireEvent.click(aiTabBtn);

    expect(await screen.findByText(/Hỏi đáp & Tra cứu Ngữ nghĩa cùng AI/i, {}, { timeout: 15000 })).toBeInTheDocument();
  }, 20000);

  it('chuyển đổi tab Tác giả & Giảng viên và hiển thị thông tin tác giả nạp từ tài nguyên', async () => {
    mockSearchApi([
      {
        fileId: 'FIL_SEARCH_002',
        fileName: 'Khóa luận Tốt nghiệp Trí tuệ Nhân tạo',
        fileDescription: 'Nghiên cứu thị giác máy tính',
        fileUrl: 'https://example.com/ai.pdf',
        fileTypeName: 'Khóa luận tốt nghiệp',
        subMajorCode: 'Trí tuệ Nhân tạo',
        yearCompleted: 2026,
        uploadBy: 'PGS. TS. Trần Minh Tuấn',
        createdAt: '2026-09-22T08:00:00Z',
        keywords: [],
      },
    ]);

    const router = createMemoryRouter(appRoutes, {
      initialEntries: [APP_PATHS.SEARCH],
    });

    render(<RouterProvider router={router} />);

    await screen.findByRole('heading', { name: 'Trung tâm Tra cứu Tài nguyên Số' }, { timeout: 15000 });

    const authorsTabBtn = screen.getByRole('button', { name: /Tác giả & Giảng viên/i });
    fireEvent.click(authorsTabBtn);

    expect(await screen.findByText('Danh bạ Tác giả & Giảng viên', {}, { timeout: 15000 })).toBeInTheDocument();
    expect(await screen.findByText('PGS. TS. Trần Minh Tuấn', {}, { timeout: 15000 })).toBeInTheDocument();
  }, 20000);
});
