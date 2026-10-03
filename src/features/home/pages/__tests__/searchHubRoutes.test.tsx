import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { APP_PATHS } from '@/constants/path';
import { appRoutes } from '@/routes';
import { useAuthStore } from '@/store/authStore';
import { searchResources } from '@/services/searchService';
import { resourceService } from '@/services/resourceService';
import type { SearchResultItem } from '@/features/resources/types/search.types';

// 1. chặn trực tiếp tầng Dịch vụ (Services) thay vì Axios
vi.mock('@/services/searchService', () => ({
  searchResources: vi.fn(),
}));

vi.mock('@/services/resourceService', () => ({
  resourceService: {
    getSubMajors: vi.fn(),
    getFileTypes: vi.fn(),
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

// 2. Trạm phát tín hiệu giả nạp thẳng vào các hàm Dịch vụ
const mockSearchService = (items: Partial<SearchResultItem>[]) => {
  // Mock hàm tìm kiếm chính
  vi.mocked(searchResources).mockResolvedValue({
    items: items as SearchResultItem[],
    totalCount: items.length,
    totalPages: 1,
    currentPage: 1,
  });

  // Mock các hàm danh mục (luôn trả về mảng rỗng để không bị lỗi 500)
  vi.mocked(resourceService.getSubMajors).mockResolvedValue([]);
  vi.mocked(resourceService.getFileTypes).mockResolvedValue([]);
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
    mockSearchService([
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
      // Ép một URL có tham số tìm kiếm (q) để searchLoader kích hoạt hàm searchResources
      initialEntries: [`${APP_PATHS.SEARCH}?q=oop`],
    });

    render(<RouterProvider router={router} />);

    // Chờ tiêu đề xuất hiện
    const heading = await screen.findByRole('heading', { name: 'Trung tâm Tra cứu Tài nguyên Số' }, { timeout: 15000 });
    expect(heading).toBeInTheDocument();

    // Xác nhận tài liệu đã load
    expect(await screen.findByText('Giáo trình Lập trình Hướng đối tượng', {}, { timeout: 15000 })).toBeInTheDocument();
    expect(screen.getByText('TS. Nguyễn Văn Hùng')).toBeInTheDocument();
  }, 20000);

  it('chuyển đổi tab Trợ lý AI và hiển thị gợi ý câu hỏi', async () => {
    mockSearchService([]);

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
    mockSearchService([
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
      initialEntries: [`${APP_PATHS.SEARCH}?q=ai`], // Kích hoạt tìm kiếm
    });

    render(<RouterProvider router={router} />);

    await screen.findByRole('heading', { name: 'Trung tâm Tra cứu Tài nguyên Số' }, { timeout: 15000 });

    const authorsTabBtn = screen.getByRole('button', { name: /Tác giả & Giảng viên/i });
    fireEvent.click(authorsTabBtn);

    expect(await screen.findByText('Danh bạ Tác giả & Giảng viên', {}, { timeout: 15000 })).toBeInTheDocument();
    expect(await screen.findByText('PGS. TS. Trần Minh Tuấn', {}, { timeout: 15000 })).toBeInTheDocument();
  }, 20000);
});
