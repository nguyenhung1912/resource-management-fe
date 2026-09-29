import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { APP_PATHS } from '@/constants/path';
import { appRoutes } from '@/routes';
import axiosClient from '@/services/axiosClient';
import { useAuthStore } from '@/store/authStore';
import type { SearchResultItem } from '@/features/resources/types/search.types';

// Giả lập Axios
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

// Hàm chiến thuật: Trạm phát tín hiệu giả bao phủ toàn bộ các API mà searchLoader cần
const mockSearchApi = (items: Partial<SearchResultItem>[]) => {
  vi.mocked(axiosClient.get).mockImplementation((url: string) => {
    // 1. Giả lập API Tìm kiếm chính (Cập nhật đúng cấu trúc phân trang mới)
    if (url.includes('/api/ResourcesSearch')) {
      return Promise.resolve({
        data: {
          items,
          totalCount: items.length,
          totalPages: 1,
          currentPage: 1,
        },
      });
    }
    // 2. Giả lập các API Danh mục chạy ngầm trong Promise.all
    if (url.includes('/api/System/sub-majors') || url.includes('/api/System/file-types')) {
      return Promise.resolve({ data: [] });
    }
    return Promise.resolve({ data: [] });
  });
};

describe('searchHubRoutes integration', () => {
  beforeEach(() => {
    useAuthStore.setState(authenticatedState);
    vi.clearAllMocks();
  });

  afterEach(() => {
    useAuthStore.setState(unauthenticatedState);
  });

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

    // Chờ hệ thống nạp xong đạn và render thành công
    const heading = await screen.findByRole('heading', { name: 'Trung tâm Tra cứu Tài nguyên Số' }, { timeout: 10000 });
    expect(heading).toBeInTheDocument();

    // Xác nhận tài liệu đã xuất hiện trên radar
    expect(await screen.findByText('Giáo trình Lập trình Hướng đối tượng')).toBeInTheDocument();
    expect(screen.getByText('TS. Nguyễn Văn Hùng')).toBeInTheDocument();
  });

  it('chuyển đổi tab Trợ lý AI và hiển thị gợi ý câu hỏi', async () => {
    mockSearchApi([]); // Trạm AI không cần nạp trước tài liệu

    const router = createMemoryRouter(appRoutes, {
      initialEntries: [APP_PATHS.SEARCH],
    });

    render(<RouterProvider router={router} />);

    await screen.findByRole('heading', { name: 'Trung tâm Tra cứu Tài nguyên Số' }, { timeout: 10000 });

    const aiTabBtn = screen.getByRole('button', { name: /Trợ lý AI/i });
    fireEvent.click(aiTabBtn);

    expect(await screen.findByText(/Hỏi đáp & Tra cứu Ngữ nghĩa cùng AI/i)).toBeInTheDocument();
  });

  it('chuyển đổi tab Tác giả & Giảng viên và hiển thị thông tin tác giả nạp từ tài nguyên', async () => {
    // Cấp phát một tài liệu để thuật toán extractedAuthors của anh trích xuất
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

    await screen.findByRole('heading', { name: 'Trung tâm Tra cứu Tài nguyên Số' }, { timeout: 10000 });

    const authorsTabBtn = screen.getByRole('button', { name: /Tác giả & Giảng viên/i });
    fireEvent.click(authorsTabBtn);

    // Xác minh thuật toán trích xuất tác giả hoạt động chuẩn xác
    expect(await screen.findByText('Danh bạ Tác giả & Giảng viên')).toBeInTheDocument();
    expect(screen.getByText('PGS. TS. Trần Minh Tuấn')).toBeInTheDocument();
    expect(screen.getByText(/1 tài liệu/i)).toBeInTheDocument();
  });
});
